
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock('../../db/query.js', () => ({
  query: vi.fn(),
}));

vi.mock('../activity/activity.service.js', () => ({
  logActivity: vi.fn(),
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../db/query.js';
import { logActivity } from '../activity/activity.service.js';

import {
  registerUser,
  loginUser,
} from './auth.service.js';

describe('Authentication service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';

    jwt.sign.mockReturnValue('test-token');
    logActivity.mockResolvedValue(undefined);
  });

  describe('registerUser', () => {
    it('registers a new user with admin privileges disabled', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [{
            id: 'user-123',
            name: 'Harshal',
            email: 'harshal@example.com',
            created_at: new Date(),
            is_admin: false,
          }],
        });

      bcrypt.hash.mockResolvedValue('hashed-password');

      const result = await registerUser({
        name: 'Harshal',
        email: 'harshal@example.com',
        password: 'password123',
      });

      expect(result.user.is_admin).toBe(false);
      expect(result.token).toBe('test-token');

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'password123',
        12
      );

      expect(logActivity).toHaveBeenCalledWith(
        'user-123',
        'user_registered'
      );
    });

    it('rejects an already registered email', async () => {
      query.mockResolvedValueOnce({
        rows: [{ id: 'existing-user' }],
      });

      await expect(
        registerUser({
          name: 'Harshal',
          email: 'harshal@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('authenticates a user and returns admin status', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          name: 'Harshal',
          email: 'harshal@example.com',
          password_hash: 'hashed-password',
          created_at: new Date(),
          is_admin: true,
        }],
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await loginUser({
        email: 'harshal@example.com',
        password: 'password123',
      });

      expect(result.user.is_admin).toBe(true);
      expect(result.user.password_hash).toBeUndefined();
      expect(result.token).toBe('test-token');

      expect(logActivity).toHaveBeenCalledWith(
        'user-123',
        'user_logged_in'
      );
    });

    it('rejects an incorrect password', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          password_hash: 'hashed-password',
        }],
      });

      bcrypt.compare.mockResolvedValue(false);

      await expect(
        loginUser({
          email: 'harshal@example.com',
          password: 'wrong-password',
        })
      ).rejects.toMatchObject({
        statusCode: 401,
      });

      expect(logActivity).not.toHaveBeenCalled();
    });

    it('rejects an unknown email', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await expect(
        loginUser({
          email: 'unknown@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        statusCode: 401,
      });

      expect(logActivity).not.toHaveBeenCalled();
    });
  });
});
