
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db/query.js', () => ({
  query: vi.fn(),
}));

import { query } from '../../db/query.js';
import { getReadings } from './readings.service.js';

describe('getReadings', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retrieves the requested page of readings', async () => {
    const mockReadings = [
      {
        id: 'reading-1',
        reading_date: '2026-11-17',
        slot: 'morning',
        value: 120,
      },
    ];

    query
      .mockResolvedValueOnce({ rows: mockReadings })
      .mockResolvedValueOnce({ rows: [{ total: 45 }] });

    const result = await getReadings(userId, {
      page: 2,
      limit: 20,
    });

    expect(result.readings).toEqual(mockReadings);

    expect(result.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it('calculates the correct SQL limit and offset', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 45 }] });

    await getReadings(userId, {
      page: 3,
      limit: 10,
    });

    expect(query).toHaveBeenCalledTimes(2);

    expect(query.mock.calls[0][1]).toEqual([
      userId,
      10,
      20,
    ]);
  });

  it('uses default pagination values when options are omitted', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    const result = await getReadings(userId);

    expect(query.mock.calls[0][1]).toEqual([
      userId,
      20,
      0,
    ]);

    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it('scopes both database queries to the authenticated user', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    await getReadings(userId);

    expect(query.mock.calls[0][0]).toContain('WHERE user_id = $1');
    expect(query.mock.calls[1][0]).toContain('WHERE user_id = $1');

    expect(query.mock.calls[0][1][0]).toBe(userId);
    expect(query.mock.calls[1][1][0]).toBe(userId);
  });

  it('returns an empty page when the requested page has no readings', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 5 }] });

    const result = await getReadings(userId, {
      page: 3,
      limit: 2,
    });

    expect(result.readings).toEqual([]);

    expect(result.pagination).toEqual({
      page: 3,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });
});
