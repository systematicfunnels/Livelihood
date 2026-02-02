const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getWorkers: () => ipcRenderer.invoke('get-workers'),
  addWorker: (name, phone) => ipcRenderer.invoke('add-worker', { name, phone }),
  getJobs: () => ipcRenderer.invoke('get-jobs'),
  addJob: (job) => ipcRenderer.invoke('add-job', job),
  closeJob: (job_id) => ipcRenderer.invoke('close-job', { job_id }),
  previewPayouts: (job_id) => ipcRenderer.invoke('preview-payouts', { job_id }),
  assignWorkerToJob: (job_id, worker_id) => ipcRenderer.invoke('assign-worker-to-job', { job_id, worker_id }),
  getLedger: () => ipcRenderer.invoke('get-ledger'),
  addLedgerEntry: (entry) => ipcRenderer.invoke('add-ledger-entry', entry),
  exportLedgerCSV: () => ipcRenderer.invoke('export-ledger-csv'),
});
