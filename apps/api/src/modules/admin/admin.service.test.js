
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db/query.js', () => ({
  query: vi.fn(),
}));

import { query } from '../../db/query.js';

import {
  getDashboardStats,
  getRecentUsers,
  getRecentActivity,
} from './admin.service.js';

describe('Admin service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retrieves dashboard statistics', async () => {
    const stats = {
      total_users: 25,
      active_users: 12,
      new_registrations: 5,
    };

    query.mockResolvedValueOnce({ rows: [stats] });

    const result = await getDashboardStats();

    expect(result).toEqual(stats);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0][0]).toContain('INTERVAL \'7 days\'');
  });

  it('retrieves the 10 most recent users', async () => {
    const users = [
      {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
    ];

    query.mockResolvedValueOnce({ rows: users });

    const result = await getRecentUsers();

    expect(result).toEqual(users);
    expect(query.mock.calls[0][0]).toContain('LIMIT 10');
    expect(query.mock.calls[0][0]).toContain('ORDER BY created_at DESC');
  });

  it('retrieves recent activity without reading values', async () => {
    const activities = [
      {
        id: 'activity-1',
        event_type: 'user_logged_in',
        user_name: 'Test User',
        user_email: 'test@example.com',
      },
    ];

    query.mockResolvedValueOnce({ rows: activities });

    const result = await getRecentActivity();

    expect(result).toEqual(activities);
    expect(query.mock.calls[0][0]).toContain('LEFT JOIN users');
    expect(query.mock.calls[0][0]).toContain('LIMIT 20');
    expect(query.mock.calls[0][0]).not.toContain('readings.value');
  });
});
