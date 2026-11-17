import { describe, it, expect } from 'vitest';
import {
  createReadingSchema,
  updateReadingSchema,
  getReadingsQuerySchema,
  READING_SLOTS,
} from './readings.validation.js';

const validReading = {
  reading_date: '2026-11-17',
  slot: 'morning',
  value: 120,
};

describe('Reading validation', () => {
  it('accepts a valid glucose reading', () => {
    const result = createReadingSchema.safeParse(validReading);

    expect(result.success).toBe(true);
  });

  it('accepts all four reading slots', () => {
    READING_SLOTS.forEach((slot) => {
      const result = createReadingSchema.safeParse({
        ...validReading,
        slot,
      });

      expect(result.success).toBe(true);
    });
  });

  it('rejects an invalid reading slot', () => {
    const result = createReadingSchema.safeParse({
      ...validReading,
      slot: 'midnight',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid date', () => {
    const result = createReadingSchema.safeParse({
      ...validReading,
      reading_date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a glucose value below 40', () => {
    const result = createReadingSchema.safeParse({
      ...validReading,
      value: 39,
    });

    expect(result.success).toBe(false);
  });

  it('rejects a glucose value above 600', () => {
    const result = createReadingSchema.safeParse({
      ...validReading,
      value: 601,
    });

    expect(result.success).toBe(false);
  });

  it('rejects decimal glucose values', () => {
    const result = createReadingSchema.safeParse({
      ...validReading,
      value: 120.5,
    });

    expect(result.success).toBe(false);
  });

  it('rejects non-numeric glucose values', () => {
    const result = createReadingSchema.safeParse({
      ...validReading,
      value: '120',
    });

    expect(result.success).toBe(false);
  });

  it('also validates updates using the same rules', () => {
    const result = updateReadingSchema.safeParse(validReading);

    expect(result.success).toBe(true);
  });
});

describe('Get readings query validation', () => {
  it('uses default pagination values when parameters are omitted', () => {
    expect(getReadingsQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 20,
    });
  });

  it('converts string query parameters into numbers', () => {
    expect(
      getReadingsQuerySchema.parse({
        page: '2',
        limit: '10',
      }),
    ).toEqual({
      page: 2,
      limit: 10,
    });
  });

  it.each(['0', '-1', '1.5', 'invalid'])(
    'rejects an invalid page value: %s',
    (page) => {
      expect(
        getReadingsQuerySchema.safeParse({ page }).success,
      ).toBe(false);
    },
  );

  it.each(['0', '101', '1.5', 'invalid'])(
    'rejects an invalid limit value: %s',
    (limit) => {
      expect(
        getReadingsQuerySchema.safeParse({ limit }).success,
      ).toBe(false);
    },
  );
});