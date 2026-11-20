
import {
  getDashboardStats,
  getRecentUsers,
  getRecentActivity,
} from './admin.service.js';

// GET /api/admin/stats
export const dashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to retrieve dashboard statistics.');
  }
};

// GET /api/admin/users
export const recentUsers = async (req, res) => {
  try {
    const users = await getRecentUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to retrieve recent users.');
  }
};

// GET /api/admin/activity
export const recentActivity = async (req, res) => {
  try {
    const activity = await getRecentActivity();

    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to retrieve recent activity.');
  }
};

// Centralized error response handling.
const handleError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
  });
};
