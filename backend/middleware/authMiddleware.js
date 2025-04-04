const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token in the Authorization header
 */
const protect = asyncHandler(async (req, res, next) => {
  // When in mock mode, bypass authentication
  if (process.env.USE_MOCK_DB === 'true') {
    req.user = {
      id: 'mock-user-id',
      email: 'mock-user@example.com',
      role: 'admin'
    };
    return next();
  }

  let token;

  // Check if Authorization header exists and follows Bearer token format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user from payload to request object
      // In a real implementation, we would fetch the user from the database
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    // Check if user's role is included in the allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized for this action');
    }

    next();
  };
};

module.exports = { protect, authorize };