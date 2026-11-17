
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Droplets,
} from 'lucide-react';

const summaryCards = [
  {
    title: "Today's Average",
    value: '--',
    unit: 'mg/dL',
    description: 'Average glucose level',
    icon: Activity,
    iconStyle: 'bg-brand-50 text-brand-700',
  },
  {
    title: 'Highest Reading',
    value: '--',
    unit: 'mg/dL',
    description: "Today's highest level",
    icon: TrendingUp,
    iconStyle: 'bg-rose-50 text-rose-600',
  },
  {
    title: 'Lowest Reading',
    value: '--',
    unit: 'mg/dL',
    description: "Today's lowest level",
    icon: TrendingDown,
    iconStyle: 'bg-sky-50 text-sky-600',
  },
  {
    title: 'Total Readings',
    value: '0',
    unit: 'readings',
    description: 'Recorded today',
    icon: Droplets,
    iconStyle: 'bg-violet-50 text-violet-600',
  },
];

function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your blood glucose levels and daily activity.
        </p>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
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

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
                <span className="text-sm text-slate-500">
                  {card.unit}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {card.description}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default DashboardPage;
