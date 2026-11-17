
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
    query
      .mockResolvedValueOnce({
        rows: [
          {
            average: '145.5',
            low: 110,
            high: 180,
            count: 5,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            date: '2026-10-01',
            average: '140.0',
            low: 110,
            high: 170,
            count: 2,
          },
          {
            date: '2026-10-03',
            average: '151.0',
            low: 130,
            high: 172,
            count: 3,
          },
        ],
      });

    const report = await getMonthToDateReport(
      'user-123',
      '2026-10-15'
    );

    expect(query).toHaveBeenCalledTimes(2);

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      ['user-123', '2026-10-01', '2026-10-15']
    );

    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      ['user-123', '2026-10-01', '2026-10-15']
    );

    expect(report.start_date).toBe('2026-10-01');
    expect(report.end_date).toBe('2026-10-15');
    expect(report.average).toBe(145.5);
    expect(report.low).toBe(110);
    expect(report.high).toBe(180);
    expect(report.count).toBe(5);

    expect(report.daily_trends).toHaveLength(15);

    expect(report.daily_trends[0]).toEqual({
      date: '2026-10-01',
      average: 140,
      low: 110,
      high: 170,
      count: 2,
    });

    expect(report.daily_trends[1]).toEqual({
      date: '2026-10-02',
      average: null,
      low: null,
      high: null,
      count: 0,
    });

    expect(report.daily_trends[2]).toEqual({
      date: '2026-10-03',
      average: 151,
      low: 130,
      high: 172,
      count: 3,
    });
  });

  it('defaults to India-local today when no date is supplied', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            average: '150.0',
            low: 120,
            high: 180,
            count: 3,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            date: '2026-11-17',
            average: '150.0',
            low: 120,
            high: 180,
            count: 3,
          },
        ],
      });

    const report = await getMonthToDateReport('user-123');

    expect(query).toHaveBeenCalledTimes(2);

    expect(report.start_date).toBe('2026-11-01');
    expect(report.end_date).toBe('2026-11-17');
    expect(report.daily_trends).toHaveLength(17);
    expect(report.daily_trends[16].date).toBe('2026-11-17');
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
