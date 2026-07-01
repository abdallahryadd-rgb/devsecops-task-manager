const app = require('./app');
const { getPool } = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown sequence
const gracefulShutdown = (signal) => {
  console.info(`Received ${signal}. Initiating graceful shutdown...`);
  
  server.close(async () => {
    console.info('HTTP server closed.');
    
    try {
      const pool = getPool();
      await pool.end();
      console.info('PostgreSQL connection pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing PostgreSQL pool:', err.message);
      process.exit(1);
    }
  });

  // Fallback timeout to force shutdown after 10s
  setTimeout(() => {
    console.error('Forceful shutdown triggered after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
