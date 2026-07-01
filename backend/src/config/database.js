const { Pool } = require('pg');
require('dotenv').config();

// Create connection config object
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'task_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'change_me',
  // Keep pool connection timeouts short so failure is detected quickly
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 10
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getPool: () => pool
};
