/**
 * Peer Review Routes
 * 
 * API routes for peer-to-peer review features
 */

const express = require('express');
const router = express.Router();
const peerReviewController = require('../controllers/peerReviewController');
const { authenticate, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create a new peer-to-peer review
router.post(
  '/',
  restrictTo('admin', 'staff'),
  peerReviewController.createPeerReview
);

// Update a peer-to-peer review
router.put(
  '/:id',
  restrictTo('admin', 'staff'),
  peerReviewController.updatePeerReview
);

// Get a peer-to-peer review by ID
router.get(
  '/:id',
  peerReviewController.getPeerReviewById
);

// Get peer-to-peer reviews for an appeal
router.get(
  '/appeal/:appealId',
  peerReviewController.getPeerReviewsForAppeal
);

// Generate discussion points
router.post(
  '/discussion-points',
  restrictTo('admin', 'staff'),
  peerReviewController.generateDiscussionPoints
);

// Cancel a peer-to-peer review
router.post(
  '/:id/cancel',
  restrictTo('admin', 'staff'),
  peerReviewController.cancelPeerReview
);

// Search for peer-to-peer reviews
router.get(
  '/search',
  restrictTo('admin', 'staff'),
  peerReviewController.searchPeerReviews
);

module.exports = router;