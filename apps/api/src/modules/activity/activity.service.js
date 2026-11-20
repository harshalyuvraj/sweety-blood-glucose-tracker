
import { query } from '../../db/query.js';

// Record a meaningful user activity event.
//
// Activity logging must never interrupt the main application operation.
// We intentionally store no glucose values or other health information.
export const logActivity = async (userId, eventType) => {
  try {
    await query(
      `WITH activity AS (
         INSERT INTO activity_logs (user_id, event_type)
         VALUES ($1, $2)
         RETURNING user_id
       )
       UPDATE users
       SET last_active_at = NOW()
       WHERE id IN (SELECT user_id FROM activity)`,
      [userId, eventType]
    );
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};
