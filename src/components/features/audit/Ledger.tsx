import { useLedger } from '../../../hooks/useLedger';
import Badge from '../../shared/Badge';
import { Search, ShieldCheck, FileText, Download } from 'lucide-react';
import Button from '../../shared/Button';

const Ledger = () => {
  const { entries, loading, exportCSV } = useLedger();

  const handleExport = async () => {
    const success = await exportCSV();
    if (success) {
      alert('Ledger exported successfully!');
    } else {
      alert('Failed to export ledger.');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <header className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Immutable Ledger</h2>
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-slate-500 text-sm mt-1">Audit-ready transaction history and payment logs</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            Audit Report
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by TXN ID or Worker..."
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium italic">
            Entries are cryptographically signed and permanent
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider w-40">TXN ID</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Worker</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-slate-400 text-xs uppercase tracking-tighter">{entry.id}</td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-slate-900 font-sans font-medium">{entry.worker_name}</div>
                    <div className="text-[10px] text-slate-400">{entry.worker_id}</div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={entry.type === 'payout' ? 'success' : 'blue'}>
                      {entry.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className={`px-6 py-3 text-right font-bold ${entry.type === 'payout' ? 'text-slate-900' : 'text-blue-600'}`}>
                    ${entry.amount.toFixed(2)}
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

export default Ledger;
