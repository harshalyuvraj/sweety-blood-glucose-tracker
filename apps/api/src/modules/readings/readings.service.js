
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

// Prevent readings from being recorded for future dates.
const validateReadingDate = (readingDate) => {
  const today = getIndiaToday();

  if (readingDate > today) {
    const error = new Error('Reading date cannot be in the future.');
    error.statusCode = 400;
    throw error;
  }
};

// Convert PostgreSQL constraint errors into API errors.
const handleDatabaseError = (error) => {
  if (error.code === '23505') {
    const conflictError = new Error(
      'A reading already exists for this time slot and date.'
    );
    conflictError.statusCode = 409;
    throw conflictError;
  }

  if (error.code === '23514') {
    const validationError = new Error(
      'The reading contains an invalid value or time slot.'
    );
    validationError.statusCode = 400;
    throw validationError;
  }

  throw error;
};

// Create a glucose reading.
export const createReading = async (userId, readingData) => {
  validateReadingDate(readingData.reading_date);

  try {
    const result = await query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         slot,
         value,
         created_at,
         updated_at`,
      [
        userId,
        readingData.reading_date,
        readingData.slot,
        readingData.value,
      ]
    );

    return result.rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

// Retrieve a paginated list of readings belonging to a user.
export const getReadings = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  const [readingsResult, countResult] = await Promise.all([
    query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         slot,
         value,
         created_at,
         updated_at
       FROM readings
       WHERE user_id = $1
       ORDER BY reading_date DESC,
                CASE slot
                  WHEN 'morning' THEN 1
                  WHEN 'after_breakfast' THEN 2
                  WHEN 'after_lunch' THEN 3
                  WHEN 'after_dinner' THEN 4
                END ASC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),

    query(
      `SELECT COUNT(*)::INTEGER AS total
       FROM readings
       WHERE user_id = $1`,
      [userId]
    ),
  ]);

  const total = countResult.rows[0].total;

  return {
    readings: readingsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Retrieve a single reading belonging to a user.
export const getReadingById = async (userId, readingId) => {
  const result = await query(
    `SELECT
       id,
       TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
       slot,
       value,
       created_at,
       updated_at
     FROM readings
     WHERE id = $1 AND user_id = $2`,
    [readingId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Reading not found.');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// Update an existing reading.
export const updateReading = async (userId, readingId, readingData) => {
  validateReadingDate(readingData.reading_date);

  try {
    const result = await query(
      `UPDATE readings
       SET reading_date = $1,
           slot = $2,
           value = $3,
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         slot,
         value,
         created_at,
         updated_at`,
      [
        readingData.reading_date,
        readingData.slot,
        readingData.value,
        readingId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      const error = new Error('Reading not found.');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

// Delete a reading belonging to a user.
export const deleteReading = async (userId, readingId) => {
  const result = await query(
    `DELETE FROM readings
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [readingId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Reading not found.');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};
