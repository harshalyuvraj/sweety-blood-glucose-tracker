
import { query } from '../../db/query.js';

// Retrieve aggregate statistics for the admin dashboard.
export const getDashboardStats = async () => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*)::INTEGER
        FROM users) AS total_users,

       (SELECT COUNT(*)::INTEGER
        FROM users
        WHERE last_active_at >= NOW() - INTERVAL '7 days')
        AS active_users,

       (SELECT COUNT(*)::INTEGER
        FROM users
        WHERE created_at >= NOW() - INTERVAL '7 days')
        AS new_registrations`
  );

  return result.rows[0];
};

// Retrieve the latest registered users.
export const getRecentUsers = async () => {
  const result = await query(
    `SELECT
       id,
       name,
       email,
       created_at,
       last_active_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 10`
  );

  return result.rows;
};

// Retrieve recent activity without exposing health information.
export const getRecentActivity = async () => {
  const result = await query(
    `SELECT
       activity_logs.id,
       activity_logs.event_type,
       activity_logs.created_at,
       users.name AS user_name,
       users.email AS user_email
     FROM activity_logs
     LEFT JOIN users
       ON users.id = activity_logs.user_id
     ORDER BY activity_logs.created_at DESC
     LIMIT 20`
  );

  return result.rows;
};
