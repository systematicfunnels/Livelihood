import { useState, useEffect } from 'react';

export interface LedgerEntry {
  id: string;
  worker_id: string;
  worker_name: string;
  amount: number;
  type: 'payout' | 'guarantee_topup';
  timestamp: string;
}

export function useLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      // @ts-expect-error - electronAPI is injected via preload script
      const data = await window.electronAPI.getLedger();
      setEntries(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
      setError('Failed to load ledger entries.');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (worker_id: string, amount: number, type: LedgerEntry['type']) => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      await window.electronAPI.addLedgerEntry({ worker_id, amount, type });
      await fetchLedger();
      return true;
    } catch (err) {
      console.error('Failed to add ledger entry:', err);
      setError('Failed to record transaction.');
      return false;
    }
  };

  const exportCSV = async () => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      const result = await window.electronAPI.exportLedgerCSV();
      if (result.success) {
        return true;
      } else {
        console.error('Export failed:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Failed to export CSV:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return { entries, loading, error, fetchLedger, addEntry, exportCSV };
}
