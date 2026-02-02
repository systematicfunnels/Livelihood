import { useState } from 'react';
import { useWorkers } from '../../../hooks/useWorkers';
import Button from '../../shared/Button';
import Badge from '../../shared/Badge';
import Input from '../../shared/Input';
import { Search, UserPlus } from 'lucide-react';

const WorkerRegistry = () => {
  const { workers, loading, addWorker } = useWorkers();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await addWorker(name, phone);
    setIsSubmitting(false);
    if (success) {
      setName('');
      setPhone('');
      setShowForm(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <header className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Registry</h2>
          <p className="text-slate-500 text-sm mt-1">Manage enrollments and worker profiles</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Enroll New Worker
            </>
          )}
        </Button>
      </header>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">New Worker Enrollment</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-span-5">
              <Input
                label="Phone Number"
                placeholder="e.g. +1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 flex items-end">
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Register
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
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" disabled>Export CSV</Button>
            <Button variant="secondary" size="sm" disabled>Filter</Button>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider w-32">Worker ID</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Enrolled On</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No workers found. Enroll your first worker to get started.
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs uppercase">{worker.worker_id}</td>
                  <td className="px-6 py-3 text-slate-900 font-medium">{worker.name}</td>
                  <td className="px-6 py-3 text-slate-600">{worker.phone}</td>
                  <td className="px-6 py-3 text-slate-500">{new Date(worker.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <Badge variant={worker.status === 'active' ? 'success' : 'neutral'}>
                      {worker.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
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

export default WorkerRegistry;
