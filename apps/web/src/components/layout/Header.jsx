import { Bell, CalendarDays, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome to Sweety
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Here's an overview of your blood glucose health.
        </p>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
          <CalendarDays size={17} />
          <span>{today}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User and logout */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
            {initial}
          </div>

          <span className="hidden text-sm font-medium text-slate-700 md:block">
            {user?.name || 'My Account'}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;