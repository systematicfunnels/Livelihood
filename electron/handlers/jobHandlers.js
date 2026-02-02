import { ipcMain } from 'electron';
import db from '../db.js';

export function setupJobHandlers() {
  ipcMain.handle('get-jobs', () => {
    return db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
  });

  ipcMain.handle('add-job', (event, { title, description, base_pay, guarantee_amount }) => {
    if (!title || title.trim() === '') throw new Error('Job title is required');
    if (typeof base_pay !== 'number' || base_pay < 0) throw new Error('Invalid base pay');
    if (guarantee_amount && (typeof guarantee_amount !== 'number' || guarantee_amount < 0)) {
      throw new Error('Invalid guarantee amount');
    }

    const job_id = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const stmt = db.prepare('INSERT INTO jobs (job_id, title, description, base_pay, guarantee_amount) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(job_id, title, description, base_pay, guarantee_amount || 0);
  });

  // INCOME GUARANTEE ENGINE
  // Calculates top-ups based on (Guarantee - Actual Earnings)
  ipcMain.handle('preview-payouts', (event, { job_id }) => {
    const job = db.prepare('SELECT * FROM jobs WHERE job_id = ?').get(job_id);
    if (!job) throw new Error('Job not found');

    const assignments = db.prepare(`
      SELECT ja.*, w.name as worker_name 
      FROM job_assignments ja
      JOIN workers w ON ja.worker_id = w.worker_id
      WHERE ja.job_id = ?
    `).all(job_id);

    return assignments.map(a => {
      const actual = a.actual_earnings || job.base_pay; // Default to base_pay if no specific earnings logged
      const guarantee = job.guarantee_amount || 0;
      const topup = Math.max(0, guarantee - actual);
      return {
        worker_id: a.worker_id,
        worker_name: a.worker_name,
        actual_earnings: actual,
        guarantee_amount: guarantee,
        topup_amount: topup,
        total_payout: actual + topup
      };
    });
  });

  ipcMain.handle('close-job', (event, { job_id }) => {
    const transaction = db.transaction(() => {
      // 1. Get job details
      const job = db.prepare('SELECT * FROM jobs WHERE job_id = ?').get(job_id);
      if (!job) throw new Error('Job not found');
      if (job.status === 'completed') throw new Error('Job is already completed');

      // 2. Get all assignments for this job
      const assignments = db.prepare('SELECT * FROM job_assignments WHERE job_id = ?').all(job_id);

      for (const assignment of assignments) {
        const actual = assignment.actual_earnings || job.base_pay;
        const guarantee = job.guarantee_amount || 0;
        const topup = Math.max(0, guarantee - actual);

        // 3. Update assignment with final numbers
        db.prepare(`
          UPDATE job_assignments 
          SET actual_earnings = ?, guarantee_topup = ?, status = 'completed' 
          WHERE id = ?
        `).run(actual, topup, assignment.id);

        // 4. Create Ledger Entries
        // Base Payout
        const payoutId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
        db.prepare('INSERT INTO ledger (id, worker_id, amount, type) VALUES (?, ?, ?, ?)')
          .run(payoutId, assignment.worker_id, actual, 'payout');

        // Top-up if applicable
        if (topup > 0) {
          const topupId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
          db.prepare('INSERT INTO ledger (id, worker_id, amount, type) VALUES (?, ?, ?, ?)')
            .run(topupId, assignment.worker_id, topup, 'guarantee_topup');
        }
      }

      // 5. Mark job as completed
      db.prepare("UPDATE jobs SET status = 'completed' WHERE job_id = ?").run(job_id);
    });

    return transaction();
  });

  ipcMain.handle('assign-worker-to-job', (event, { job_id, worker_id }) => {
    const exists = db.prepare('SELECT 1 FROM job_assignments WHERE job_id = ? AND worker_id = ?').get(job_id, worker_id);
    if (exists) throw new Error('Worker already assigned to this job');

    const stmt = db.prepare('INSERT INTO job_assignments (job_id, worker_id) VALUES (?, ?)');
    return stmt.run(job_id, worker_id);
  });
}
