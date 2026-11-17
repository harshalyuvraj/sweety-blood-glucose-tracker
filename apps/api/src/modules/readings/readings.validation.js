
import { z } from 'zod';

export const READING_SLOTS = [
  'morning',
  'after_breakfast',
  'after_lunch',
  'after_dinner',
];

export const createReadingSchema = z.object({
  reading_date: z.iso.date({
    error: 'Please provide a valid reading date.',
  }),

  slot: z.enum(READING_SLOTS, {
    error: 'Please select a valid reading slot.',
  }),

  value: z.number({
    error: 'Glucose value must be a number.',
  })
    .int('Glucose value must be a whole number.')
    .min(40, 'Glucose value must be at least 40 mg/dL.')
    .max(600, 'Glucose value cannot exceed 600 mg/dL.'),
});

export const updateReadingSchema = createReadingSchema;

// Validate pagination query parameters for GET /readings.
export const getReadingsQuerySchema = z.object({
  page: z.coerce.number()
    .int('Page must be a whole number.')
    .min(1, 'Page must be at least 1.')
    .default(1),

  limit: z.coerce.number()
    .int('Limit must be a whole number.')
    .min(1, 'Limit must be at least 1.')
    .max(100, 'Limit cannot exceed 100.')
    .default(20),
});
