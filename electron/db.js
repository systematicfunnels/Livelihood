import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = app.isPackaged 
  ? path.join(app.getPath('userData'), 'livelihood.db')
  : path.join(process.cwd(), 'livelihood.db');

const db = new Database(dbPath);

// Initialize tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      base_pay REAL NOT NULL,
      guarantee_amount REAL DEFAULT 0, -- Minimum guarantee for this job
      status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      worker_id TEXT NOT NULL,
      actual_earnings REAL DEFAULT 0,
      guarantee_topup REAL DEFAULT 0,
      status TEXT DEFAULT 'assigned', -- 'assigned', 'completed', 'paid'
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(job_id),
      FOREIGN KEY(worker_id) REFERENCES workers(worker_id)
    );

    CREATE TABLE IF NOT EXISTS ledger (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL, -- 'payout', 'guarantee_topup'
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(worker_id) REFERENCES workers(worker_id)
    );
  `);
}

export default db;
