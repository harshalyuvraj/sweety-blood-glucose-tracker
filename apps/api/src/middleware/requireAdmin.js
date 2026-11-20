
import { query } from '../db/query.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user || !user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Administrator access required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to verify administrator access.',
    });
  }
};
