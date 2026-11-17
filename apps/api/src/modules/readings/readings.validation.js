
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
