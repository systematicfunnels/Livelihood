import { NavLink } from 'react-router-dom';
import { Users, Briefcase, Landmark, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/workers', icon: Users, label: 'Workers' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/ledger', icon: Landmark, label: 'Ledger' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">Livelihood</h1>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Admin Console • POC</p>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-none ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Status</p>
          <div className="flex items-center mt-2 space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-xs text-slate-300 font-medium">Local DB Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
