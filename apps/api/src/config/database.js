import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import pg from 'pg';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(currentDir, '../../../../.env');

dotenv.config({ path: envPath });

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  ...(process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'sweety',
        user: process.env.DB_USER || 'sweety_user',
        password: process.env.DB_PASSWORD,
      }),

  ...(isProduction ? { ssl: { rejectUnauthorized: false } } : {}),

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export default pool;
