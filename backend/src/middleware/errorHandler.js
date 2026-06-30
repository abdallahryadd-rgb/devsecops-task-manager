module.exports = (err, req, res, next) => {
  // Log the detailed error internally
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500
  });

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  // Safe messaging for database / connection errors
  if (status === 500) {
    response.message = 'An unexpected server error occurred. Please try again later.';
  }

  if (err.errors) {
    response.errors = err.errors;
  }

  // Debugging stack info for non-production environments
  if (!isProduction && status === 500) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
