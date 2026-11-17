
import { NavLink } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  FileBarChart,
  HeartPulse,
  UserRound,
} from 'lucide-react';

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Readings',
    path: '/readings',
    icon: Activity,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: FileBarChart,
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
          <HeartPulse size={23} strokeWidth={2.2} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sweety
          </h1>
          <p className="text-xs text-slate-500">
            Blood Glucose Tracker
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-8">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {navigationItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={19} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800">
            <UserRound size={20} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              My Account
            </p>
            <p className="text-xs text-slate-500">
              Personal Health
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
