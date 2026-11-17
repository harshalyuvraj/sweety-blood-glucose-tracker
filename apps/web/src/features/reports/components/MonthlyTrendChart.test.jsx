
import { describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import MonthlyTrendChart from './MonthlyTrendChart.jsx';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock Recharts so these tests focus on our component's behaviour,
// rather than browser-specific chart rendering.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }) => (
    <div data-testid="line-chart" data-chart-points={data.length}>
      {children}
    </div>
  ),
  Line: (props) => (
    <div
      data-testid="chart-line"
      data-connect-nulls={String(props.connectNulls)}
      data-data-key={props.dataKey}
    />
  ),
  XAxis: ({ dataKey }) => <div data-testid="x-axis">{dataKey}</div>,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="chart-tooltip" />,
}));

describe('MonthlyTrendChart', () => {
  it('renders the chart heading and description', () => {
    render(<MonthlyTrendChart data={[]} />);

    expect(screen.getByText('Monthly Glucose Trend')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Daily average glucose levels throughout the selected month.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an empty state when there are no readings', () => {
    render(<MonthlyTrendChart data={[]} />);

    expect(
      screen.getByText('No readings available for this period.'),
    ).toBeInTheDocument();

    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders the chart when readings are available', () => {
    const data = [
      {
        date: '2026-11-01',
        average: 130,
        low: 120,
        high: 140,
        count: 2,
      },
      {
        date: '2026-11-02',
        average: null,
        low: null,
        high: null,
        count: 0,
      },
      {
        date: '2026-11-03',
        average: 150,
        low: 135,
        high: 165,
        count: 3,
      },
    ];

    render(<MonthlyTrendChart data={data} />);

    expect(screen.getByTestId('line-chart')).toHaveAttribute(
      'data-chart-points',
      '3',
    );

    expect(screen.getByTestId('chart-line')).toHaveAttribute(
      'data-data-key',
      'average',
    );

    expect(screen.getByTestId('chart-line')).toHaveAttribute(
      'data-connect-nulls',
      'false',
    );
  });

  it('shows the empty state when all dates have zero readings', () => {
    const data = [
      {
        date: '2026-11-01',
        average: null,
        low: null,
        high: null,
        count: 0,
      },
      {
        date: '2026-11-02',
        average: null,
        low: null,
        high: null,
        count: 0,
      },
    ];

    render(<MonthlyTrendChart data={data} />);

    expect(
      screen.getByText('No readings available for this period.'),
    ).toBeInTheDocument();
  });
});
