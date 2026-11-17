
import { query } from '../../db/query.js';

// Get today's date using the India timezone.
const getIndiaToday = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const validateReportDate = (date) => {
  if (date > getIndiaToday()) {
    const error = new Error('Report date cannot be in the future.');
    error.statusCode = 400;
    throw error;
  }
};

// Calculate summary statistics for a user's readings in a date range.
const getSummary = async (userId, startDate, endDate) => {
  const result = await query(
    `SELECT
       ROUND(AVG(value), 1) AS average,
       MIN(value) AS low,
       MAX(value) AS high,
       COUNT(*)::INTEGER AS count
     FROM readings
     WHERE user_id = $1
       AND reading_date >= $2
       AND reading_date <= $3`,
    [userId, startDate, endDate]
  );

  const row = result.rows[0];

  return {
    high: row.high,
    low: row.low,
    average: row.average === null ? null : Number(row.average),
    count: row.count,
  };
};

// Retrieve daily statistics for a user's readings in a date range.
const getDailyTrends = async (userId, startDate, endDate) => {
  const result = await query(
    `SELECT
       TO_CHAR(reading_date, 'YYYY-MM-DD') AS date,
       ROUND(AVG(value), 1) AS average,
       MIN(value) AS low,
       MAX(value) AS high,
       COUNT(*)::INTEGER AS count
     FROM readings
     WHERE user_id = $1
       AND reading_date >= $2
       AND reading_date <= $3
     GROUP BY reading_date
     ORDER BY reading_date ASC`,
    [userId, startDate, endDate]
  );

  const trendsByDate = new Map(
    result.rows.map((row) => [
      row.date,
      {
        average: row.average === null ? null : Number(row.average),
        low: row.low,
        high: row.high,
        count: row.count,
      },
    ])
  );

  const dailyTrends = [];
  const currentDate = new Date(`${startDate}T00:00:00.000Z`);
  const lastDate = new Date(`${endDate}T00:00:00.000Z`);

  while (currentDate <= lastDate) {
    const date = currentDate.toISOString().slice(0, 10);

    dailyTrends.push({
      date,
      ...(trendsByDate.get(date) || {
        average: null,
        low: null,
        high: null,
        count: 0,
      }),
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dailyTrends;
};

// Daily report with individual reading slots.
export const getDailyReport = async (userId, date = getIndiaToday()) => {
  validateReportDate(date);

  const [summary, readingsResult] = await Promise.all([
    getSummary(userId, date, date),
    query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         slot,
         value
       FROM readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY
         CASE slot
           WHEN 'morning' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END ASC`,
      [userId, date]
    ),
  ]);

  return {
    date,
    ...summary,
    readings: readingsResult.rows,
  };
};

// Month-to-date report, from the first day of the selected month to the selected date.
export const getMonthToDateReport = async (
  userId,
  date = getIndiaToday()
) => {
  validateReportDate(date);

  const startDate = `${date.slice(0, 7)}-01`;

  const [summary, dailyTrends] = await Promise.all([
    getSummary(userId, startDate, date),
    getDailyTrends(userId, startDate, date),
  ]);

  return {
    start_date: startDate,
    end_date: date,
    ...summary,
    daily_trends: dailyTrends,
  };
};

// Previous calendar month report.
export const getPreviousMonthReport = async (userId) => {
  const today = getIndiaToday();

  const [year, month] = today.split('-').map(Number);

  const previousMonthDate = new Date(Date.UTC(year, month - 2, 1));

  const previousYear = previousMonthDate.getUTCFullYear();
  const previousMonth = String(
    previousMonthDate.getUTCMonth() + 1
  ).padStart(2, '0');

  const lastDay = new Date(
    Date.UTC(previousYear, previousMonthDate.getUTCMonth() + 1, 0)
  ).getUTCDate();

  const startDate = `${previousYear}-${previousMonth}-01`;
  const endDate = `${previousYear}-${previousMonth}-${String(lastDay).padStart(2, '0')}`;

  const summary = await getSummary(userId, startDate, endDate);

  return {
    start_date: startDate,
    end_date: endDate,
    ...summary,
  };
};
