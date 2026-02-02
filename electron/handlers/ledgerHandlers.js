import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import db from '../db.js';

export function setupLedgerHandlers() {
  ipcMain.handle('get-ledger', () => {
    return db.prepare(`
      SELECT l.*, w.name as worker_name, w.worker_id 
      FROM ledger l 
      JOIN workers w ON l.worker_id = w.worker_id 
      ORDER BY l.timestamp DESC
    `).all();
  });

  ipcMain.handle('add-ledger-entry', (event, { worker_id, amount, type }) => {
    if (!worker_id) throw new Error('Worker ID is required');
    if (typeof amount !== 'number' || isNaN(amount)) throw new Error('Invalid amount');
    if (!['payout', 'guarantee_topup', 'adjustment'].includes(type)) {
      throw new Error('Invalid transaction type');
    }

    const id = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const stmt = db.prepare('INSERT INTO ledger (id, worker_id, amount, type) VALUES (?, ?, ?, ?)');
    return stmt.run(id, worker_id, amount, type);
  });

  ipcMain.handle('export-ledger-csv', async (event) => {
    const entries = db.prepare(`
      SELECT l.id, l.timestamp, w.name as worker_name, w.worker_id, l.type, l.amount 
      FROM ledger l 
      JOIN workers w ON l.worker_id = w.worker_id 
      ORDER BY l.timestamp DESC
    `).all();

    if (entries.length === 0) return { success: false, error: 'No data to export' };

    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Ledger',
      defaultPath: `ledger-export-${new Date().toISOString().split('T')[0]}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (!filePath) return { success: false, cancelled: true };

    const headers = ['TXN ID', 'Timestamp', 'Worker Name', 'Worker ID', 'Type', 'Amount'];
    const rows = entries.map(e => [
      e.id,
      e.timestamp,
      e.worker_name,
      e.worker_id,
      e.type,
      e.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    try {
      fs.writeFileSync(filePath, csvContent);
      return { success: true, filePath };
    } catch (err) {
      console.error('Failed to write CSV:', err);
      return { success: false, error: err.message };
    }
  });
}
