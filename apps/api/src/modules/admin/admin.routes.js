
import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';

import {
  dashboardStats,
  recentUsers,
  recentActivity,
} from './admin.controller.js';

const router = Router();

// Every admin endpoint requires authentication and admin privileges.
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', dashboardStats);
router.get('/users', recentUsers);
router.get('/activity', recentActivity);

export default router;
