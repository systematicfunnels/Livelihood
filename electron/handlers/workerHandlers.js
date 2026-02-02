import { ipcMain } from 'electron';
import db from '../db.js';

export function setupWorkerHandlers() {
  ipcMain.handle('get-workers', () => {
    return db.prepare('SELECT * FROM workers ORDER BY created_at DESC').all();
  });

  ipcMain.handle('add-worker', (event, { name, phone }) => {
    if (!name || name.trim() === '') {
      throw new Error('Worker name is required');
    }
    // Basic phone validation (10-15 digits)
    if (phone && !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
      throw new Error('Invalid phone number format');
    }

    const worker_id = `WRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const stmt = db.prepare('INSERT INTO workers (worker_id, name, phone) VALUES (?, ?, ?)');
    try {
      return stmt.run(worker_id, name, phone);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Worker ID collision. Please try again.');
      }
      throw err;
    }
  });
}
