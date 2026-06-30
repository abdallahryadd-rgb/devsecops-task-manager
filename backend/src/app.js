const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Use Helmet for security headers (SQL injection / XSS / clickjacking protection)
app.use(helmet());

// Configure CORS using environment variable or local default
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting to prevent DoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' })); // Restrict payload size to prevent resource exhaustion

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

// Unknown routes handler
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
