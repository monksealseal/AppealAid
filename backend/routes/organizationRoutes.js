const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  inviteMember,
  removeMember,
} = require('../controllers/organizationController');

// Auth middleware
let authMiddleware;
try {
  const { protect } = require('../middleware/authMiddleware');
  authMiddleware = protect;
} catch (e) {
  const { authenticate } = require('../middleware/auth');
  authMiddleware = authenticate;
}

router.route('/')
  .get(authMiddleware, getMyOrganizations)
  .post(authMiddleware, createOrganization);

router.route('/:id')
  .get(authMiddleware, getOrganization)
  .put(authMiddleware, updateOrganization);

router.route('/:id/members')
  .post(authMiddleware, inviteMember);

router.route('/:id/members/:userId')
  .delete(authMiddleware, removeMember);

module.exports = router;
