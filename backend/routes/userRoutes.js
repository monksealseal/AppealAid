const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getConsentStatus,
  updateConsentStatus
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Public routes with rate limiting
router.post('/', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/consent')
  .get(protect, getConsentStatus)
  .put(protect, updateConsentStatus);

module.exports = router;