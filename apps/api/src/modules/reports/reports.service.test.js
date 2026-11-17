
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

vi.mock('../../db/query.js', () => ({
  query: vi.fn(),
}));

import { query } from '../../db/query.js';
import { getMonthToDateReport } from './reports.service.js';

describe('Month-to-date report service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-17T12:00:00+05:30'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates the report from the first day to the selected date', async () => {
    query.mockResolvedValue({
      rows: [
        {
          average: '145.5',
          low: 110,
          high: 180,
          count: 5,
        },
      ],
    });

    const report = await getMonthToDateReport(
      'user-123',
      '2026-10-15'
    );

    expect(query).toHaveBeenCalledOnce();

    expect(query).toHaveBeenCalledWith(
      expect.any(String),
      ['user-123', '2026-10-01', '2026-10-15']
    );

    expect(report).toEqual({
      start_date: '2026-10-01',
      end_date: '2026-10-15',
      average: 145.5,
      low: 110,
      high: 180,
      count: 5,
    });
  });

  it('defaults to India-local today when no date is supplied', async () => {
    query.mockResolvedValue({
      rows: [
        {
          average: '150.0',
          low: 120,
          high: 180,
          count: 3,
        },
      ],
    });

    const report = await getMonthToDateReport('user-123');

    expect(query).toHaveBeenCalledWith(
      expect.any(String),
      ['user-123', '2026-11-01', '2026-11-17']
    );

    expect(report.start_date).toBe('2026-11-01');
    expect(report.end_date).toBe('2026-11-17');
  });

  it('rejects a future selected date', async () => {
    await expect(
      getMonthToDateReport('user-123', '2026-11-18')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Report date cannot be in the future.',
    });

    expect(query).not.toHaveBeenCalled();
  });
});
