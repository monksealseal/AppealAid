/**
 * Response Routes
 * 
 * API routes for insurance response processing
 */

const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { upload } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// Authenticate all routes
router.use(authenticate);

// Process an uploaded response document
router.post(
  '/process',
  upload.single('document'),
  responseController.processResponseDocument
);

// Record a manual response
router.post(
  '/manual',
  responseController.recordManualResponse
);

// Check if document is an insurance response
router.post(
  '/check-document',
  upload.single('document'),
  responseController.checkResponseDocument
);

// Match a response to an existing appeal
router.post(
  '/match',
  responseController.matchResponseToAppeal
);

// Get next steps based on a decision
router.get(
  '/next-steps',
  responseController.getNextSteps
);

// Get a list of recently processed responses
router.get(
  '/',
  responseController.getRecentResponses
);

module.exports = router;