const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// Routes are protected by auth middleware
router.use(protect);

// Eligibility and cost estimation
router.post('/verify-eligibility', patientController.verifyEligibility);
router.post('/estimate-cost', patientController.estimatePatientCost);

// Appeal-specific patient routes
router.post('/appeals/:id/consent', patientController.recordPatientConsent);
router.get('/appeals/:id/status', patientController.getPatientStatusUpdate);
router.get('/appeals/:id/cost-impact', patientController.getAppealCostImpact);

module.exports = router;