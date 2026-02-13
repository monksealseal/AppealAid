const express = require('express');
const router = express.Router();
const {
  getMySubscription,
  getPlans,
  createCheckout,
  handleWebhook,
  cancelSubscription,
  getUsage,
} = require('../controllers/subscriptionController');

// Auth middleware - use whichever is available
let authMiddleware;
try {
  const { protect } = require('../middleware/authMiddleware');
  authMiddleware = protect;
} catch (e) {
  const { authenticate } = require('../middleware/auth');
  authMiddleware = authenticate;
}

// Public routes
router.get('/plans', getPlans);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.get('/me', authMiddleware, getMySubscription);
router.post('/checkout', authMiddleware, createCheckout);
router.post('/cancel', authMiddleware, cancelSubscription);
router.get('/usage', authMiddleware, getUsage);

module.exports = router;
