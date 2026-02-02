import { useWorkers } from '../hooks/useWorkers';
import { useJobs } from '../hooks/useJobs';
import { useLedger } from '../hooks/useLedger';

const Dashboard = () => {
  const { workers } = useWorkers();
  const { jobs } = useJobs();
  const { entries } = useLedger();

  // Calculate Stats
  const totalWorkers = workers.length;
  const activeJobs = jobs.filter(j => j.status === 'open').length;
  
  // Calculate Total Disbursed from Ledger
  const totalDisbursed = entries
    .filter(e => e.type === 'payout' || e.type === 'guarantee_topup')
    .reduce((sum, e) => sum + e.amount, 0);

  // Estimate Pending Payouts (Base pay of all open jobs)
  const pendingPayouts = jobs
    .filter(j => j.status === 'open')
    .reduce((sum, j) => sum + j.base_pay, 0);

  // Get Recent Activity (Combine latest workers and ledger entries)
  const recentActivity = [
    ...workers.map(w => ({
      id: w.id,
      timestamp: w.created_at,
      action: `Worker Enrollment: ${w.worker_id}`,
      user: 'admin@org.org',
      status: 'Confirmed'
    })),
    ...entries.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      action: `Payout: ${e.worker_id}`,
      user: 'system',
      status: 'Processed'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 5);

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
        <p className="text-slate-500 text-sm mt-1">Operational status and key metrics</p>
      </header>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {[
          { label: 'Total Workers', value: totalWorkers.toLocaleString(), change: 'Live', trend: 'neutral' },
          { label: 'Active Jobs', value: activeJobs.toString(), change: 'Real-time', trend: 'neutral' },
          { label: 'Projected Payouts', value: `$${pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'Estimated', trend: 'neutral' },
          { label: 'Total Disbursed', value: `$${totalDisbursed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'YTD', trend: 'up' },
        ].map((stat) => (
          <div key={stat.label} className="col-span-3 bg-white p-5 rounded border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 
                stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 text-sm">Recent Activity</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider w-40">Timestamp</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">User</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No recent activity recorded.</td>
                </tr>
              ) : (
                recentActivity.map((activity, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-3 text-slate-900 font-medium">{activity.action}</td>
                    <td className="px-6 py-3 text-slate-600">{activity.user}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-white rounded border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                + Enroll New Worker
              </button>
              <button className="w-full text-left px-4 py-3 bg-white text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200">
                $ Process Pending Payouts
              </button>
              <button className="w-full text-left px-4 py-3 bg-white text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200">
                # Generate Audit Report
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 rounded border border-yellow-200 p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">System Notice</h4>
            <p className="text-xs text-yellow-700 leading-relaxed">
              Scheduled maintenance window tonight at 02:00 AM UTC. Please ensure all local queues are synced before end of shift.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
