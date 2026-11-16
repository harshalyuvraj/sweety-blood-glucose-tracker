import 'dotenv/config';
import app from './app.js';
import { closePool } from './db/query.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Sweety API running on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await closePool();
    console.log('HTTP server and database pool closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
