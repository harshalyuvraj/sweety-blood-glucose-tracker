
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { query } from './db/query.js';
import authRoutes from './modules/auth/auth.routes.js';
import readingsRoutes from './modules/readings/readings.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW() AS database_time');

    return res.status(200).json({
      success: true,
      message: 'Sweety API and database are running.',
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed.',
    });
  }
});

export default app;
