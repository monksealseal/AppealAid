/**
 * Async handler to eliminate try-catch blocks in controllers
 * Wraps async functions to catch errors and pass them to the error middleware
 * 
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;