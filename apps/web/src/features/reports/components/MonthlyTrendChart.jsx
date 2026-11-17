
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function formatChartDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatTooltipDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const reading = payload[0].payload;

  if (reading.count === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="text-sm font-semibold text-slate-800">
          {formatTooltipDate(label)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          No readings recorded
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-slate-800">
        {formatTooltipDate(label)}
      </p>

      <div className="space-y-1 text-sm">
        <p className="text-emerald-700">
          Average: <strong>{reading.average} mg/dL</strong>
        </p>
        <p className="text-rose-600">
          Highest: <strong>{reading.high} mg/dL</strong>
        </p>
        <p className="text-sky-600">
          Lowest: <strong>{reading.low} mg/dL</strong>
        </p>
        <p className="text-slate-500">
          Readings: {reading.count}
        </p>
      </div>
    </div>
  );
}

function MonthlyTrendChart({ data = [] }) {
  const hasReadings = data.some((item) => item.count > 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-slate-900">
          Monthly Glucose Trend
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Daily average glucose levels throughout the selected month.
        </p>
      </div>

      {!hasReadings ? (
        <div className="flex min-h-64 items-center justify-center text-center text-sm text-slate-500">
          No readings available for this period.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />

              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                width={55}
                label={{
                  value: 'mg/dL',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#64748B', fontSize: 11 },
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#94A3B8', strokeDasharray: '4 4' }}
              />

              <Line
                type="monotone"
                dataKey="average"
                name="Daily Average"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Missing dates are shown as gaps. Values represent recorded measurements,
        not medical targets.
      </p>
    </section>
  );
}

export default MonthlyTrendChart;
