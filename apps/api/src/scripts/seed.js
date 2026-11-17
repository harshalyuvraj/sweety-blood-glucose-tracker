
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const DEMO_NAME = process.env.SEED_DEMO_NAME || 'Sweety Demo';
const DEMO_EMAIL = (
  process.env.SEED_DEMO_EMAIL || 'demo@sweety.app'
).trim().toLowerCase();

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD;

async function seed() {
  if (!DEMO_PASSWORD || DEMO_PASSWORD.length < 8) {
    throw new Error(
      'SEED_DEMO_PASSWORD must be provided and contain at least 8 characters.',
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    const userResult = await client.query(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        RETURNING id
      `,
      [DEMO_NAME, DEMO_EMAIL, passwordHash],
    );

    let userId;

    if (userResult.rowCount > 0) {
      userId = userResult.rows[0].id;
      console.log('Created demo user.');
    } else {
      const existingUser = await client.query(
        `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
        `,
        [DEMO_EMAIL],
      );

      if (existingUser.rowCount === 0) {
        throw new Error('Unable to find or create the demo user.');
      }

      userId = existingUser.rows[0].id;
      console.log('Demo user already exists. Keeping existing account.');
    }

    const readingsResult = await client.query(
      `
        WITH local_dates AS (
          SELECT
            (NOW() AT TIME ZONE 'Asia/Kolkata')::date AS today
        ),
        date_ranges AS (
          SELECT
            today,
            DATE_TRUNC('month', today)::date AS month_start,
            (
              DATE_TRUNC('month', today) - INTERVAL '1 month'
            )::date AS previous_month_start,
            (
              DATE_TRUNC('month', today) - INTERVAL '1 day'
            )::date AS previous_month_end
          FROM local_dates
        ),
        seed_readings (reading_date, slot, value) AS (
          SELECT previous_month_start, 'morning', 118
          FROM date_ranges

          UNION ALL

          SELECT previous_month_end, 'after_dinner', 164
          FROM date_ranges

          UNION ALL

          SELECT month_start, 'morning', 126
          FROM date_ranges

          UNION ALL

          SELECT today, 'morning', 132
          FROM date_ranges

          UNION ALL

          SELECT today, 'after_breakfast', 145
          FROM date_ranges

          UNION ALL

          SELECT today, 'after_lunch', 138
          FROM date_ranges
        )
        INSERT INTO readings (
          user_id,
          reading_date,
          slot,
          value
        )
        SELECT $1, reading_date, slot, value
        FROM seed_readings
        ON CONFLICT (user_id, reading_date, slot) DO NOTHING
        RETURNING id
      `,
      [userId],
    );

    await client.query('COMMIT');

    console.log('Database seeding completed successfully.');
    console.log(`Demo email: ${DEMO_EMAIL}`);
    console.log(`New readings inserted: ${readingsResult.rowCount}`);
    console.log('Existing readings were preserved.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(async (error) => {
  console.error('Database seeding failed:', error.message);
  await pool.end();
  process.exitCode = 1;
});
