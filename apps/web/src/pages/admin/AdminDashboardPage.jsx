
import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Activity,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../features/admin/adminService.js';

const summaryCards = [
  {
    key: 'total_users',
    title: 'Total Registrations',
    description: 'All registered accounts',
    icon: Users,
    iconStyle: 'bg-brand-50 text-brand-700',
  },
  {
    key: 'active_users',
    title: 'Active Users',
    description: 'Active in the last 7 days',
    icon: UserCheck,
    iconStyle: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'new_registrations',
    title: 'New Registrations',
    description: 'Registered in the last 7 days',
    icon: UserPlus,
    iconStyle: 'bg-violet-50 text-violet-600',
  },
];

const activityLabels = {
  user_registered: 'Created an account',
  user_logged_in: 'Logged in',
  reading_created: 'Added a reading',
  reading_updated: 'Updated a reading',
  reading_deleted: 'Deleted a reading',
  report_viewed: 'Viewed a report',
};

function formatDate(date) {
  if (!date) return 'Never';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAdminDashboard() {
      try {
        setIsLoading(true);
        setError('');

        const [statsData, usersData, activityData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentUsers(),
          adminService.getRecentActivity(),
        ]);

        setStats(statsData);
        setRecentUsers(usersData);
        setRecentActivity(activityData);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Unable to load admin dashboard data. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminDashboard();
  }, []);

  const cards = summaryCards.map((card) => ({
    ...card,
    value: isLoading ? '...' : (stats?.[card.key] ?? 0),
  }));

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor registered accounts and application activity.
            </p>
          </div>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <div className={`rounded-xl p-2.5 ${card.iconStyle}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-5">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {card.description}
              </p>
            </article>
          );
        })}
      </section>

      {/* Recent registrations */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Registrations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The latest accounts created on Sweety.
            </p>
          </div>

          <Users size={21} className="text-slate-400" />
        </div>

        {isLoading ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            Loading registered users...
          </p>
        ) : recentUsers.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            No registered users yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Registered</th>
                  <th className="px-6 py-4 font-semibold">Last Active</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {user.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDate(user.last_active_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Meaningful actions performed by registered users.
            </p>
          </div>

          <Activity size={21} className="text-slate-400" />
        </div>

        {isLoading ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            Loading recent activity...
          </p>
        ) : recentActivity.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            No activity recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 px-6 py-4"
              >
                <div className="mt-1 rounded-lg bg-brand-50 p-2 text-brand-700">
                  <Clock size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {item.user_name || 'Deleted user'}
                    <span className="font-normal text-slate-500">
                      {' '}
                      {activityLabels[item.event_type] || 'Performed an action'}
                    </span>
                  </p>

                  {item.user_email && (
                    <p className="mt-1 text-xs text-slate-400">
                      {item.user_email}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboardPage;
