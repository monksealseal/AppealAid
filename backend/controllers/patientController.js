const asyncHandler = require('../utils/asyncHandler');
const patientService = require('../services/patientService');
const Appeal = require('../models/appealModel');
const Document = require('../models/documentModel');

// @desc    Verify patient insurance eligibility
// @route   POST /api/patient/verify-eligibility
// @access  Private
const verifyEligibility = asyncHandler(async (req, res) => {
  const { patientInfo, serviceInfo } = req.body;

  if (!patientInfo || !serviceInfo) {
    res.status(400);
    throw new Error('Patient information and service information are required');
  }

  const eligibilityResult = await patientService.verifyEligibility(patientInfo, serviceInfo);

  if (!eligibilityResult.success) {
    res.status(400);
    throw new Error(eligibilityResult.error || 'Failed to verify eligibility');
  }

  res.json(eligibilityResult);
});

// @desc    Estimate patient cost for a service
// @route   POST /api/patient/estimate-cost
// @access  Private
const estimatePatientCost = asyncHandler(async (req, res) => {
  const { eligibilityData, serviceInfo, appealInfo } = req.body;

  if (!eligibilityData || !serviceInfo) {
    res.status(400);
    throw new Error('Eligibility data and service information are required');
  }

  const costEstimate = await patientService.estimatePatientCost(
    eligibilityData, 
    serviceInfo, 
    appealInfo || null
  );

  if (!costEstimate.success) {
    res.status(400);
    throw new Error(costEstimate.error || 'Failed to generate cost estimate');
  }

  res.json(costEstimate);
});

// @desc    Record patient consent for an appeal
// @route   POST /api/patient/appeals/:id/consent
// @access  Private
const recordPatientConsent = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const consentInfo = req.body;

  if (!consentInfo || !consentInfo.consentObtained || !consentInfo.consentMethod) {
    res.status(400);
    throw new Error('Consent information is required');
  }

  // Check if appeal exists and belongs to the user
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }

  const consentResult = await patientService.recordPatientConsent(appealId, consentInfo);

  if (!consentResult.success) {
    res.status(400);
    throw new Error(consentResult.error || 'Failed to record patient consent');
  }

  res.json({
    success: true,
    consentId: consentResult.consentId,
    consentDate: consentResult.consentDate,
    expirationDate: consentResult.expirationDate,
    message: 'Patient consent recorded successfully'
  });
});

// @desc    Get patient-friendly status update for an appeal
// @route   GET /api/patient/appeals/:id/status
// @access  Private
const getPatientStatusUpdate = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const { language = 'English' } = req.query;

  // Check if appeal exists and belongs to the user
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }

  const statusResult = await patientService.generatePatientStatusUpdate(appealId, language);

  if (!statusResult.success) {
    res.status(400);
    throw new Error(statusResult.error || 'Failed to generate patient status update');
  }

  res.json(statusResult);
});

// @desc    Get patient appeal summary with cost impact
// @route   GET /api/patient/appeals/:id/cost-impact
// @access  Private
const getAppealCostImpact = asyncHandler(async (req, res) => {
  const appealId = req.params.id;

  // Find the appeal
  const appeal = await Appeal.findById(appealId).populate('relatedDocument');
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }

  // Get appeal cost impact data
  const document = appeal.relatedDocument;
  const extractedData = document ? document.extractedData || {} : {};
  
  // Get current patient responsibility
  const currentPatientResponsibility = extractedData.patientResponsibility || appeal.denialInfo.deniedAmount || 0;
  
  // Calculate potential savings based on appeal type and status
  const appealType = appeal.appealType;
  let successProbability = appeal.aiConfidence || 0.6;
  
  // If appeal is already approved, set success to 100%
  if (appeal.status === 'approved') {
    successProbability = 1.0;
  } else if (appeal.status === 'denied') {
    successProbability = 0;
  }
  
  // Get recovery percentage based on appeal type
  let recoveryRate;
  switch (appealType) {
    case 'medicalNecessity':
      recoveryRate = 0.7;
      break;
    case 'codingError':
      recoveryRate = 0.9;
      break;
    case 'outOfNetwork':
      recoveryRate = 0.6;
      break;
    case 'priorAuthorization':
      recoveryRate = 0.5;
      break;
    case 'clinicalTrial':
      recoveryRate = 0.75;
      break;
    default:
      recoveryRate = 0.65;
  }
  
  // Calculate potential patient savings
  const potentialRecovery = Math.round(currentPatientResponsibility * recoveryRate);
  const expectedSavings = Math.round(potentialRecovery * successProbability);
  
  // Get timeline estimates
  const estimatedResolutionDays = getEstimatedResolutionDays(appeal);
  
  // Prepare response
  const costImpact = {
    appealId: appeal._id,
    appealStatus: appeal.status,
    appealType: appeal.appealType,
    currentPatientResponsibility: currentPatientResponsibility,
    potentialSavings: {
      bestCaseScenario: potentialRecovery,
      expectedValue: expectedSavings,
      successProbability: successProbability,
      recoveryRate: recoveryRate
    },
    timeline: {
      submissionDate: appeal.submissionDetails?.submittedDate || null,
      estimatedResolutionDays: estimatedResolutionDays,
      estimatedResolutionDate: appeal.submissionDetails?.submittedDate ? 
        new Date(new Date(appeal.submissionDetails.submittedDate).getTime() + estimatedResolutionDays * 86400000) : null
    },
    patientActions: getPatientActionsForCostImpact(appeal)
  };

  res.json({
    success: true,
    data: costImpact
  });
});

// Helper function to estimate resolution days
const getEstimatedResolutionDays = (appeal) => {
  // If already resolved, return actual days
  if (appeal.status === 'approved' || appeal.status === 'denied') {
    if (appeal.submissionDetails?.submittedDate && appeal.outcomeDetails?.responseDate) {
      return Math.round((new Date(appeal.outcomeDetails.responseDate) - new Date(appeal.submissionDetails.submittedDate)) / (1000 * 60 * 60 * 24));
    }
  }
  
  // Otherwise estimate based on appeal type
  switch (appeal.appealType) {
    case 'medicalNecessity':
      return 45;
    case 'codingError':
      return 30;
    case 'outOfNetwork':
      return 60;
    case 'priorAuthorization':
      return 45;
    case 'urgencyOverride':
      return 15;
    case 'clinicalTrial':
      return 60;
    default:
      return 45;
  }
};

// Helper function to get patient actions for cost impact
const getPatientActionsForCostImpact = (appeal) => {
  const actions = [];
  
  switch (appeal.status) {
    case 'draft':
    case 'generated':
    case 'pending':
      actions.push('Confirm all necessary documentation has been provided');
      break;
    case 'submitted':
      actions.push('No action needed at this time');
      actions.push('Check back for updates on your appeal status');
      break;
    case 'approved':
      actions.push('Contact your provider to confirm how the approved amount will be applied to your bill');
      actions.push('Check your explanation of benefits when received');
      break;
    case 'denied':
      actions.push('Contact your provider to discuss next level appeal options');
      actions.push('Review alternative payment options if needed');
      break;
    default:
      actions.push('Contact your provider with any questions about your appeal');
  }
  
  return actions;
};

module.exports = {
  verifyEligibility,
  estimatePatientCost,
  recordPatientConsent,
  getPatientStatusUpdate,
  getAppealCostImpact
};