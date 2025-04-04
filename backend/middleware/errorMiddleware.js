/**
 * Error handling middleware
 * Provides consistent error responses across the API
 */

const errorHandler = (err, req, res, next) => {
  // Log error for internal monitoring
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    // Add error code for client-side handling
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      // Include validation errors if they exist
      validationErrors: err.validationErrors || null,
    }
  });
};

module.exports = { errorHandler };