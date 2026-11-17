
import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  dailyReport,
  monthToDateReport,
  previousMonthReport,
} from './reports.controller.js';
import { validate } from '../../middleware/validate.js';
import { dailyReportSchema } from './reports.validation.js';

const router = Router();

// All report endpoints require authentication.
router.use(authenticate);

router.get('/daily', validate(dailyReportSchema, 'query'), dailyReport);
router.get('/month-to-date', monthToDateReport);
router.get('/previous-month', previousMonthReport);

export default router;
