import Sidebar from './components/Sidebar';
import WorkerRegistry from './components/features/registry/WorkerRegistry';
import JobManagement from './components/features/jobs/JobManagement';
import Ledger from './components/features/audit/Ledger';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<WorkerRegistry />} />
            <Route path="/jobs" element={<JobManagement />} />
            <Route path="/ledger" element={<Ledger />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
