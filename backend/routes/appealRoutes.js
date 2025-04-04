const express = require('express');
const {
  generateAppeal,
  getAppeals,
  getAppealById,
  updateAppeal,
  submitAppeal,
  recordOutcome,
  getTemplates,
  analyzeAppealPotential,
  generateAppealLetter,
  analyzeClaimWithAI,
  getFollowUpPlan,
  getSubmissionChecklist,
  getInsurerRequirements,
  getAppealsStats,
  createProviderReview,
  updateProviderReview,
  getProviderReview
} = process.env.USE_MOCK_DB === 'true' 
    ? require('../controllers/mockAppealController')
    : require('../controllers/appealController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.route('/')
  .post(protect, generateAppeal)
  .get(protect, getAppeals);

router.route('/templates')
  .get(protect, getTemplates);

router.route('/analyze')
  .post(protect, analyzeAppealPotential);
  
router.route('/generate-letter')
  .post(protect, generateAppealLetter);

// New endpoint for AI analysis with Claude
router.route('/analyze-with-ai')
  .post(protect, analyzeClaimWithAI);
  
// Provider review endpoints
router.route('/:id/provider-review')
  .post(protect, createProviderReview)
  .put(protect, updateProviderReview)
  .get(protect, getProviderReview);
  
// Stats endpoint
router.route('/stats')
  .get(protect, getAppealsStats);
  
router.route('/:id')
  .get(protect, getAppealById)
  .put(protect, updateAppeal);

router.route('/:id/submit')
  .put(protect, submitAppeal);

router.route('/:id/outcome')
  .put(protect, recordOutcome);

router.route('/:id/follow-up-plan')
  .get(protect, getFollowUpPlan);

router.route('/:id/submission-checklist')
  .get(protect, getSubmissionChecklist);

router.route('/insurer-requirements')
  .get(protect, getInsurerRequirements);

module.exports = router;