import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { query } from './db/query.js';
import authRoutes from './modules/auth/auth.routes.js';
import { authenticate } from './middleware/authenticate.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

// Temporary endpoint to test JWT authentication
app.get('/api/auth/test-protected', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    userId: req.user.id,
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await query(
      'SELECT NOW() AS database_time'
    );

    res.status(200).json({
      success: true,
      message: 'Sweety API is running',
      database: 'connected',
      timestamp: result.rows[0].database_time,
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
    });
  }
});

export default app;
