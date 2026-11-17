import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
} from './auth.validation.js';

describe('Registration validation', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      name: 'Harshal',
      email: 'harshal@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('trims the name and converts email to lowercase', () => {
    const result = registerSchema.safeParse({
      name: ' Harshal ',
      email: 'HARSHAL@EXAMPLE.COM',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Harshal');
    expect(result.data.email).toBe('harshal@example.com');
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Harshal',
      email: 'invalid-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Harshal',
      email: 'harshal@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects passwords exceeding 72 UTF-8 bytes', () => {
    const result = registerSchema.safeParse({
      name: 'Harshal',
      email: 'harshal@example.com',
      password: 'a'.repeat(73),
    });

    expect(result.success).toBe(false);
  });
});

describe('Login validation', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'harshal@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('converts email to lowercase', () => {
    const result = loginSchema.safeParse({
      email: 'HARSHAL@EXAMPLE.COM',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('harshal@example.com');
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'harshal@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});