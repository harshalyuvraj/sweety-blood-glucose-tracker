
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/query.js', () => ({
  query: vi.fn(),
}));

import { query } from '../db/query.js';
import { requireAdmin } from './requireAdmin.js';

describe('requireAdmin', () => {
  const req = {
    user: { id: 'user-123' },
  };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('allows an administrator', async () => {
    query.mockResolvedValueOnce({
      rows: [{ is_admin: true }],
    });

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a regular user', async () => {
    query.mockResolvedValueOnce({
      rows: [{ is_admin: false }],
    });

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Administrator access required.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a user who no longer exists', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('fails closed when the database query fails', async () => {
    query.mockRejectedValueOnce(new Error('Database unavailable'));

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});
