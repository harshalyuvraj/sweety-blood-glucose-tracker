
import {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} from './reports.service.js';

import { logActivity } from '../activity/activity.service.js';

const handleError = (res, error) => {
  console.error('Reports error:', error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode
      ? error.message
      : 'An unexpected error occurred while generating the report.',
  });
};

export const dailyReport = async (req, res) => {
  try {
    const report = await getDailyReport(
      req.user.id,
      req.validated.query.date
    );

    await logActivity(req.user.id, 'report_viewed');

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const monthToDateReport = async (req, res) => {
  try {
    const report = await getMonthToDateReport(
      req.user.id,
      req.validated.query.date
    );

    await logActivity(req.user.id, 'report_viewed');

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const previousMonthReport = async (req, res) => {
  try {
    const report = await getPreviousMonthReport(req.user.id);

    await logActivity(req.user.id, 'report_viewed');

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
