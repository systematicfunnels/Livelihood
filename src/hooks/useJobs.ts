import { useState, useEffect } from 'react';

export interface Job {
  id: number;
  job_id: string;
  title: string;
  description: string;
  base_pay: number;
  guarantee_amount: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // @ts-expect-error - electronAPI is injected via preload script
      const data = await window.electronAPI.getJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs from local database.');
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (title: string, description: string, base_pay: number, guarantee_amount: number) => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      await window.electronAPI.addJob({ title, description, base_pay, guarantee_amount });
      await fetchJobs();
      return true;
    } catch (err) {
      console.error('Failed to add job:', err);
      setError('Failed to create new job.');
      return false;
    }
  };

  const closeJob = async (job_id: string) => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      await window.electronAPI.closeJob(job_id);
      await fetchJobs();
      return true;
    } catch (err) {
      console.error('Failed to close job:', err);
      setError('Failed to finalize job and process payouts.');
      return false;
    }
  };

  const previewPayouts = async (job_id: string) => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      return await window.electronAPI.previewPayouts(job_id);
    } catch (err) {
      console.error('Failed to preview payouts:', err);
      return [];
    }
  };

  const assignWorker = async (job_id: string, worker_id: string) => {
    try {
      // @ts-expect-error - electronAPI is injected via preload script
      await window.electronAPI.assignWorkerToJob(job_id, worker_id);
      return true;
    } catch (err) {
      console.error('Failed to assign worker:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return { jobs, loading, error, fetchJobs, addJob, closeJob, previewPayouts, assignWorker };
}
