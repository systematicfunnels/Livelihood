import { useState } from 'react';
import { useJobs } from '../../../hooks/useJobs';
import { useWorkers } from '../../../hooks/useWorkers';
import Button from '../../shared/Button';
import Badge from '../../shared/Badge';
import Input from '../../shared/Input';
import { Search, Briefcase, UserPlus, X } from 'lucide-react';

interface PayoutPreview {
  worker_id: string;
  worker_name: string;
  actual_earnings: number;
  guarantee_amount: number;
  topup_amount: number;
  total_payout: number;
}

const JobManagement = () => {
  const { jobs, loading, addJob, closeJob, previewPayouts, assignWorker } = useJobs();
  const { workers } = useWorkers();
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null);
  const [payoutPreview, setPayoutPreview] = useState<PayoutPreview[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePay, setBasePay] = useState('');
  const [guarantee, setGuarantee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await addJob(
      title, 
      description, 
      parseFloat(basePay), 
      parseFloat(guarantee) || 0
    );
    setIsSubmitting(false);
    if (success) {
      setTitle('');
      setDescription('');
      setBasePay('');
      setGuarantee('');
      setShowForm(false);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    // 1. Fetch preview data
    const preview = await previewPayouts(jobId);
    setPayoutPreview(preview);
    setShowPreviewModal(jobId);
  };

  const confirmCloseJob = async () => {
    if (!showPreviewModal) return;
    await closeJob(showPreviewModal);
    setShowPreviewModal(null);
    setPayoutPreview([]);
  };

  const handleAssignWorker = async (workerId: string) => {
    if (!showAssignModal) return;
    const success = await assignWorker(showAssignModal, workerId);
    if (success) {
      setShowAssignModal(null);
      alert('Worker assigned successfully');
    } else {
      alert('Failed to assign worker. They might already be assigned.');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Assign Worker to Job</h3>
              <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {workers.length === 0 ? (
                  <p className="text-center text-slate-500 py-4 text-sm font-sans">No workers found. Enroll workers first.</p>
                ) : (
                  workers.map(worker => (
                    <div 
                      key={worker.id} 
                      className="flex items-center justify-between p-3 border border-slate-100 rounded hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
                      onClick={() => handleAssignWorker(worker.worker_id)}
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{worker.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{worker.worker_id}</div>
                      </div>
                      <UserPlus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Confirm Payouts & Close Job</h3>
              <button onClick={() => setShowPreviewModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-2 font-medium text-slate-500 text-xs uppercase">Worker</th>
                      <th className="px-6 py-2 font-medium text-slate-500 text-xs uppercase text-right">Actual</th>
                      <th className="px-6 py-2 font-medium text-slate-500 text-xs uppercase text-right">Guarantee</th>
                      <th className="px-6 py-2 font-medium text-slate-500 text-xs uppercase text-right text-blue-600">Top-up</th>
                      <th className="px-6 py-2 font-medium text-slate-500 text-xs uppercase text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payoutPreview.map((p, i) => (
                      <tr key={i}>
                        <td className="px-6 py-3 font-medium text-slate-900">{p.worker_name}</td>
                        <td className="px-6 py-3 text-right text-slate-600">${p.actual_earnings.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right text-slate-600">${p.guarantee_amount.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right text-blue-600 font-medium">
                          {p.topup_amount > 0 ? `+${p.topup_amount.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-slate-900">${p.total_payout.toFixed(2)}</td>
                      </tr>
                    ))}
                    {payoutPreview.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                          No workers assigned to this job yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 font-bold text-slate-900 text-right">Total Payout:</td>
                      <td colSpan={2} className="px-6 py-3 font-bold text-slate-900 text-right">
                        ${payoutPreview.reduce((sum, p) => sum + p.total_payout, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowPreviewModal(null)}>Cancel</Button>
              <Button onClick={confirmCloseJob}>Confirm & Process Payouts</Button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Job Management</h2>
          <p className="text-slate-500 text-sm mt-1">Create and track high-density work opportunities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : (
            <>
              <Briefcase className="w-4 h-4 mr-2" />
              Create New Job
            </>
          )}
        </Button>
      </header>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Create New Opportunity</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-6">
                <Input
                  label="Job Title"
                  placeholder="e.g. Data Labeling - Set A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Base Pay (USD)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={basePay}
                  onChange={(e) => setBasePay(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Min. Guarantee (USD)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={guarantee}
                  onChange={(e) => setGuarantee(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                placeholder="Describe the tasks and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Publish Job
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider w-32">Job ID</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Base Pay</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Guarantee</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-lg font-medium text-slate-900">No jobs found</p>
                  <p className="text-sm">Create your first job opportunity above</p>
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{job.job_id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-slate-500 text-xs truncate max-w-[200px]">{job.description}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">${job.base_pay.toFixed(2)}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {job.guarantee_amount > 0 ? (
                      <span className="text-blue-600 font-medium">${job.guarantee_amount.toFixed(2)}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant={
                        job.status === 'open' ? 'success' :
                        job.status === 'completed' ? 'neutral' : 'warning'
                      }>
                        {job.status}
                      </Badge>
                      {job.status === 'open' && (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(job.job_id)}>
                            Assign
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleCloseJob(job.job_id)}>
                            Close
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobManagement;
