
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db/query.js', () => ({
  query: vi.fn(),
}));

import { query } from '../../db/query.js';
import { logActivity } from './activity.service.js';

describe('logActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('records an activity event and updates last active time', async () => {
    query.mockResolvedValue({ rowCount: 1 });

    await logActivity('user-123', 'user_logged_in');

    expect(query).toHaveBeenCalledOnce();

    expect(query.mock.calls[0][0]).toContain(
      'INSERT INTO activity_logs'
    );

    expect(query.mock.calls[0][0]).toContain(
      'UPDATE users'
    );

    expect(query.mock.calls[0][1]).toEqual([
      'user-123',
      'user_logged_in',
    ]);
  });

  it('does not throw when activity logging fails', async () => {
    query.mockRejectedValue(new Error('Database unavailable'));

    await expect(
      logActivity('user-123', 'user_logged_in')
    ).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalledOnce();
  });
});
