import { useEffect, useState } from 'react';
import { CalendarDays, Activity, TrendingUp, TrendingDown, Droplets } from 'lucide-react';
import { reportsService } from '../../features/reports/reportsService.js';
import MonthlyTrendChart from '../../features/reports/components/MonthlyTrendChart.jsx';

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'monthToDate', label: 'Month to Date' },
  { value: 'previousMonth', label: 'Previous Month' },
];

const getToday = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '--';

  const [year, month, day] = dateString.split('-').map(Number);

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(year, month - 1, day));
};

const SLOT_LABELS = {
  morning: 'Morning',
  after_breakfast: 'After Breakfast',
  after_lunch: 'After Lunch',
  after_dinner: 'After Dinner',
};

function ReportCard({
  title,
  value,
  icon: Icon,
  iconStyle,
  description,
  isCount,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${iconStyle}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value ?? '--'}
        </span>
        <span className="text-sm text-slate-500">
          {isCount ? 'readings' : 'mg/dL'}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-400">{description}</p>
    </article>
  );
}

function ReportsPage() {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function fetchReport() {
      try {
        setIsLoading(true);
        setError('');

        let data;

        if (reportType === 'daily') {
          data = await reportsService.getDaily(selectedDate);
        } else if (reportType === 'monthToDate') {
          data = await reportsService.getMonthToDate(selectedDate);
        } else {
          data = await reportsService.getPreviousMonth();
        }

        if (isActive) {
          setReport(data);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err.response?.data?.message ||
              'Unable to load the report. Please try again.',
          );
          setReport(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      isActive = false;
    };
  }, [reportType, selectedDate]);

  const summaryCards = [
    {
      title: 'Average Glucose',
      value: report?.average,
      icon: Activity,
      iconStyle: 'bg-brand-50 text-brand-700',
      description: 'Average glucose level',
    },
    {
      title: 'Highest Reading',
      value: report?.high,
      icon: TrendingUp,
      iconStyle: 'bg-rose-50 text-rose-600',
      description: 'Highest recorded level',
    },
    {
      title: 'Lowest Reading',
      value: report?.low,
      icon: TrendingDown,
      iconStyle: 'bg-sky-50 text-sky-600',
      description: 'Lowest recorded level',
    },
    {
      title: 'Total Readings',
      value: report?.count ?? 0,
      icon: Droplets,
      iconStyle: 'bg-violet-50 text-violet-600',
      description: 'Measurements recorded',
      isCount: true,
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Glucose Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review your blood glucose statistics over different periods.
        </p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setReportType(type.value)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                reportType === type.value
                  ? 'bg-brand-700 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {(reportType === 'daily' || reportType === 'monthToDate') && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <CalendarDays size={18} className="text-slate-500" />
            <input
              type="date"
              max={getToday()}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none"
              aria-label="Select report date"
            />
          </div>
        )}
      </section>

      {report && (
        <p className="text-sm text-slate-500">
          Report period:{' '}
          <span className="font-medium text-slate-700">
            {formatDate(report.start_date || report.date)}
            {report.end_date && ` – ${formatDate(report.end_date)}`}
          </span>
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading report...
        </div>
      ) : error ? null : (
        <>
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <ReportCard
                key={card.title}
                {...card}
                value={
                  card.isCount
                    ? card.value
                    : card.value === null || card.value === undefined
                      ? '--'
                      : card.value
                }
              />
            ))}
          </section>

          {reportType === 'monthToDate' && (
            <MonthlyTrendChart data={report.daily_trends || []} />
          )}

          {reportType === 'daily' && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Daily Readings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Individual measurements recorded on this date.
                </p>
              </div>

              {!report.readings?.length ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  No readings recorded for this date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">Time Slot</th>
                        <th className="px-6 py-4 font-medium">Glucose Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.readings.map((reading) => (
                        <tr key={reading.id}>
                          <td className="px-6 py-4 text-slate-600">
                            {SLOT_LABELS[reading.slot] || reading.slot}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {reading.value} mg/dL
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default ReportsPage;