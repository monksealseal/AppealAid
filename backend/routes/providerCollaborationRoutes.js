/**
 * Provider Collaboration Routes
 * 
 * API routes for provider collaboration features
 */

const express = require('express');
const router = express.Router();
const providerCollaborationController = require('../controllers/providerCollaborationController');
const { upload } = require('../middleware/upload');
const { authenticate, restrictTo } = require('../middleware/auth');

// Routes requiring authentication
router.use(authenticate);

// Create a collaboration request
router.post(
  '/request',
  restrictTo('admin', 'staff'),
  providerCollaborationController.createCollaborationRequest
);

// Get collaboration requests for an appeal
router.get(
  '/requests/:appealId',
  providerCollaborationController.getCollaborationRequests
);

// Fetch clinical data from EHR system
router.post(
  '/ehr-data',
  restrictTo('admin', 'staff'),
  providerCollaborationController.fetchEHRData
);

// Generate clinical summary for appeal
router.post(
  '/clinical-summary',
  restrictTo('admin', 'staff'),
  providerCollaborationController.generateClinicalSummary
);

// Public routes (with special tokens) - no authentication required

// Access provider secure portal with token
router.get(
  '/access/:token',
  providerCollaborationController.getProviderAccessData
);

// Submit provider documentation - no auth, uses secure token in form submission
router.post(
  '/submit',
  upload.array('documents', 10), // Allow up to 10 files
  providerCollaborationController.processProviderSubmission
);

module.exports = router;