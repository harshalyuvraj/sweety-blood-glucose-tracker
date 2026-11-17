
import { z } from 'zod';

export const dailyReportSchema = z.object({
  date: z.iso.date({
    error: 'Please provide a valid date in YYYY-MM-DD format.',
  }).optional(),
});
