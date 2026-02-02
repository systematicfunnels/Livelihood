import { useState, useEffect } from 'react';

export interface Worker {
  id: number;
  name: string;
  worker_id: string;
  phone: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      // @ts-expect-error - electronAPI is injected via preload script
      const data = await window.electronAPI.getWorkers();
      setWorkers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setError('Failed to load workers from local database.');
    } finally {
      setLoading(false);
    }
  };

  const addWorker = async (name: string, phone: string) => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      await window.electronAPI.addWorker(name, phone);
      await fetchWorkers();
      return true;
    } catch (err) {
      console.error('Failed to add worker:', err);
      setError('Failed to enroll new worker.');
      return false;
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  return { workers, loading, error, fetchWorkers, addWorker };
}
