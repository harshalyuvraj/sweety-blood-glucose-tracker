import { describe, it, expect } from 'vitest';
import { dailyReportSchema } from './reports.validation.js';

describe('Daily report validation', () => {
  it('accepts a valid date', () => {
    const result = dailyReportSchema.safeParse({
      date: '2026-11-17',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a request without a date', () => {
    const result = dailyReportSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('rejects an invalid date format', () => {
    const result = dailyReportSchema.safeParse({
      date: '17-11-2026',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an impossible calendar date', () => {
    const result = dailyReportSchema.safeParse({
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty date string', () => {
    const result = dailyReportSchema.safeParse({
      date: '',
    });

    expect(result.success).toBe(false);
  });
});