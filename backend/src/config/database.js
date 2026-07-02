const { Pool } = require('pg');
require('dotenv').config();

// Create connection config object
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 10
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'task_manager',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'change_me',
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
