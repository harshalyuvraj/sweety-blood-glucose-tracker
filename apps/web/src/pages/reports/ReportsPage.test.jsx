
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsPage from './ReportsPage.jsx';

const { reportsServiceMock } = vi.hoisted(() => ({
  reportsServiceMock: {
    getDaily: vi.fn(),
    getMonthToDate: vi.fn(),
    getPreviousMonth: vi.fn(),
  },
}));

vi.mock('../../features/reports/reportsService.js', () => ({
  reportsService: reportsServiceMock,
}));

afterEach(() => {
  cleanup();
});

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    reportsServiceMock.getDaily.mockResolvedValue({
      date: '2026-11-17',
      average: 150,
      high: 150,
      low: 150,
      count: 1,
      readings: [
        {
          id: 'reading-1',
          slot: 'after_breakfast',
          value: 150,
        },
      ],
    });

    reportsServiceMock.getMonthToDate.mockResolvedValue({
      start_date: '2026-11-01',
      end_date: '2026-11-17',
      average: 145.5,
      high: 180,
      low: 110,
      count: 5,
    });

    reportsServiceMock.getPreviousMonth.mockResolvedValue({
      start_date: '2026-10-01',
      end_date: '2026-10-31',
      average: 135,
      high: 170,
      low: 100,
      count: 8,
    });
  });

  it('renders the daily report and its readings', async () => {
    render(<ReportsPage />);

    expect(
      await screen.findByRole('heading', { name: /glucose reports/i }),
    ).toBeInTheDocument();

    expect(await screen.findByText('Daily Readings')).toBeInTheDocument();

    expect(screen.getByText('After Breakfast')).toBeInTheDocument();
    expect(screen.getByText('150 mg/dL')).toBeInTheDocument();

    expect(reportsServiceMock.getDaily).toHaveBeenCalled();
  });

  it('loads the month-to-date report when selected', async () => {
    const user = userEvent.setup();

    render(<ReportsPage />);

    await screen.findByText('Daily Readings');

    await user.click(
      screen.getByRole('button', { name: /month to date/i }),
    );

    expect(
      await screen.findByText('145.5'),
    ).toBeInTheDocument();

    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText('110')).toBeInTheDocument();

    expect(reportsServiceMock.getMonthToDate).toHaveBeenCalledOnce();
    expect(screen.queryByText('Daily Readings')).not.toBeInTheDocument();
  });

  it('loads the previous-month report when selected', async () => {
    const user = userEvent.setup();

    render(<ReportsPage />);

    await screen.findByText('Daily Readings');

    await user.click(
      screen.getByRole('button', { name: /previous month/i }),
    );

    expect(await screen.findByText('135')).toBeInTheDocument();

    expect(screen.getByText('170')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    expect(reportsServiceMock.getPreviousMonth).toHaveBeenCalledOnce();
    expect(screen.queryByText('Daily Readings')).not.toBeInTheDocument();
  });

  it('displays an empty-state message when there are no daily readings', async () => {
    reportsServiceMock.getDaily.mockResolvedValue({
      date: '2026-11-17',
      average: null,
      high: null,
      low: null,
      count: 0,
      readings: [],
    });

    render(<ReportsPage />);

    expect(
      await screen.findByText(/no readings recorded for this date/i),
    ).toBeInTheDocument();

    expect(screen.getAllByText('--')).toHaveLength(3);
  });

  it('displays an error when the report request fails', async () => {
    reportsServiceMock.getDaily.mockRejectedValue({
      response: {
        data: {
          message: 'Unable to fetch report data.',
        },
      },
    });

    render(<ReportsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to fetch report data.',
    );
  });
});
