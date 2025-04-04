const asyncHandler = require('../utils/asyncHandler');
const Appeal = require('../models/appealModel');
const Document = require('../models/documentModel');
const Template = require('../models/templateModel');
const appealService = require('../services/appealService');
const aiService = require('../services/aiService');

// @desc    Generate a new appeal based on a document
// @route   POST /api/appeals
// @access  Private
const generateAppeal = asyncHandler(async (req, res) => {
  const { 
    documentId, 
    title, 
    description, 
    denialReason, 
    additionalDetails,
    attachments,
    templateId,
    letter 
  } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error('Document ID is required');
  }

  // Fetch the document to get denial information
  const document = await Document.findById(documentId);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this document');
  }
  
  // If document is still processing, return an error
  if (document.status === 'processing') {
    res.status(400);
    throw new Error('Document is still being processed. Please try again later.');
  }
  
  // If document processing failed, return an error
  if (document.status === 'failed') {
    res.status(400);
    throw new Error('Document processing failed. Please upload the document again.');
  }
  
  // Use provided letter or generate one using appealService
  let appealContent = letter;
  let appealTemplate = templateId || 'default';
  let appealResult;
  
  if (!appealContent) {
    // Generate the appeal using the enhanced appealService
    // Use enhanced denial detection and categorization from document processing
    appealResult = await appealService.generateLetterContent(document, appealTemplate);
    appealContent = appealResult.appealContent;
    appealTemplate = appealResult.appealTemplate;
  }
  
  // Extract the denial info from document if not explicitly provided
  const extractedData = document.extractedData || {};
  const deniedAmount = extractedData.billedAmount && extractedData.allowedAmount ? 
    extractedData.billedAmount - extractedData.allowedAmount : 0;
  
  // Use AI-detected denial type if available
  let appealType = appealResult ? appealResult.appealType : 'medicalNecessity';
  
  // If we have enhanced denial detection data, use it
  if (extractedData.denialInfo && extractedData.denialInfo.denialType) {
    // Map the categorized denial type to appeal type
    const typeMap = {
      'medicalNecessity': 'medicalNecessity',
      'priorAuthorization': 'priorAuthorization',
      'networkStatus': 'outOfNetwork',
      'experimentalTreatment': 'experimentalTreatment',
      'codingError': 'codingError',
      'notCovered': 'notCovered',
      'preAuthConflict': 'preAuthConflict',
      'urgencyOverride': 'urgencyOverride'
    };
    
    appealType = typeMap[extractedData.denialInfo.denialType] || appealType;
  }
  
  // Create a new appeal with enhanced data
  const appeal = new Appeal({
    user: req.user.id,
    relatedDocument: documentId,
    title: title || `Appeal for ${extractedData.claimNumber || document.fileName}`,
    description: description || (extractedData.denialReason ? `Denial reason: ${extractedData.denialReason}` : ''),
    appealType: appealType,
    denialInfo: {
      denialReason: denialReason || 
                    (extractedData.denialInfo && extractedData.denialInfo.denialReason) || 
                    extractedData.denialReason || 
                    'Not specified',
      denialCode: (extractedData.denialInfo && extractedData.denialInfo.denialCode) || 
                  extractedData.denialCode,
      serviceDate: extractedData.serviceDate,
      claimNumber: extractedData.claimNumber,
      deniedAmount: deniedAmount
    },
    appealTemplate: appealTemplate,
    appealContent: appealContent,
    additionalDetails: additionalDetails || '',
    status: 'generated',
    aiConfidence: extractedData.appealPotential ? 
                  extractedData.appealPotential.successProbability : 
                  (appealResult ? appealResult.aiConfidence : 0.7),
    supportingDocuments: attachments || [],
    timeline: [
      {
        date: new Date(),
        status: 'generated',
        description: 'Appeal letter generated'
      }
    ]
  });
  
  // Add enhanced appeal metadata
  
  // If we have AI-suggested evidence from document processing, use it
  if (extractedData.denialInfo && extractedData.denialInfo.suggestedNextSteps && 
      extractedData.denialInfo.suggestedNextSteps.length > 0) {
    appeal.aiSuggestions = extractedData.denialInfo.suggestedNextSteps;
  } 
  // Otherwise use any suggested evidence from the appeal generation
  else if (appealResult && appealResult.suggestedEvidence) {
    appeal.aiSuggestions = appealResult.suggestedEvidence;
  }
  
  // Add deadline warning to timeline if available from document processing
  if (extractedData.deadlineWarning) {
    appeal.timeline.push({
      date: new Date(),
      status: 'warning',
      description: extractedData.deadlineWarning.message
    });
  }
  // Or use deadline warning from appeal generation if available
  else if (appealResult && appealResult.deadlineWarning) {
    appeal.timeline.push({
      date: new Date(),
      status: 'warning',
      description: appealResult.deadlineWarning.message
    });
  }
  
  // Add appeal potential factors if available
  if (extractedData.appealPotential && extractedData.appealPotential.factors) {
    const factorNotes = extractedData.appealPotential.factors
      .filter(factor => factor.impact === 'positive')
      .map(factor => factor.description);
    
    if (factorNotes.length > 0) {
      appeal.reviewNotes = factorNotes.map(note => ({
        note: note,
        addedBy: req.user.id,
        addedAt: new Date()
      }));
    }
  }

  // Save the appeal to the database
  const savedAppeal = await appeal.save();
  
  // Mark the document as having an appeal
  document.appealStatus = {
    hasAppeal: true,
    appealId: savedAppeal._id,
    appealCreatedAt: new Date()
  };
  await document.save();
  
  // Prepare response
  const response = {
    id: savedAppeal._id,
    title: savedAppeal.title,
    appealType: savedAppeal.appealType,
    status: savedAppeal.status,
    aiConfidence: savedAppeal.aiConfidence,
    createdAt: savedAppeal.createdAt,
    message: 'Appeal created successfully'
  };
  
  // Include deadline warning if present from either source
  if (extractedData.deadlineWarning) {
    response.deadlineWarning = {
      daysRemaining: extractedData.deadlineWarning.daysRemaining,
      urgencyLevel: extractedData.deadlineWarning.urgencyLevel,
      message: extractedData.deadlineWarning.message
    };
  } else if (appealResult && appealResult.deadlineWarning) {
    response.deadlineWarning = appealResult.deadlineWarning;
  }
  
  // Include AI suggestions / recommended evidence
  if (appeal.aiSuggestions && appeal.aiSuggestions.length > 0) {
    response.suggestedEvidence = appeal.aiSuggestions;
  }
  
  // Include relevant medical codes if present
  if (appealResult && appealResult.relevantCodes) {
    response.relevantCodes = appealResult.relevantCodes;
  } else if (extractedData.diagnosisCodes || extractedData.procedureCodes) {
    response.relevantCodes = {
      diagnosisCodes: extractedData.diagnosisCodes || [],
      procedureCodes: extractedData.procedureCodes || []
    };
  }
  
  // Include success probability if available
  if (extractedData.appealPotential && extractedData.appealPotential.successProbability) {
    response.successProbability = extractedData.appealPotential.successProbability;
    
    // Include top impact factors
    if (extractedData.appealPotential.factors) {
      response.impactFactors = extractedData.appealPotential.factors.slice(0, 3);
    }
  }
  
  // Include submission recommendations based on insurer portal info if available
  if (extractedData.insurerPortalInfo) {
    response.submissionRecommendations = {
      insurer: extractedData.insurerPortalInfo.name,
      portalUrl: extractedData.insurerPortalInfo.appealPortalUrl,
      recommendedMethod: extractedData.insurerPortalInfo.appealFormats[0],
      timeframe: extractedData.insurerPortalInfo.appealTimeframes.standard,
      portalLocation: extractedData.insurerPortalInfo.appealFormLocation
    };
  }
  
  res.status(201).json(response);
});

// @desc    Get all appeals for the authenticated user
// @route   GET /api/appeals
// @access  Private
const getAppeals = asyncHandler(async (req, res) => {
  // Get all appeals for the current user that aren't deleted
  const appeals = await Appeal.find({ 
    user: req.user.id,
    isDeleted: false
  }).populate('relatedDocument', 'fileName documentType fileUrl status extractedData.claimNumber extractedData.serviceDate extractedData.insuranceCarrier');

  res.json(appeals);
});

// @desc    Get a specific appeal by ID
// @route   GET /api/appeals/:id
// @access  Private
const getAppealById = asyncHandler(async (req, res) => {
  const appealId = req.params.id;

  // Find the appeal and populate related document
  const appeal = await Appeal.findById(appealId)
    .populate('relatedDocument', 'fileName documentType fileUrl status extractedData')
    .populate('supportingDocuments', 'fileName documentType fileUrl');

  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }

  // Check if the appeal belongs to the current user
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to view this appeal');
  }
  
  // If the appeal is deleted, don't return it
  if (appeal.isDeleted) {
    res.status(404);
    throw new Error('Appeal not found');
  }

  res.json(appeal);
});

// @desc    Update an appeal
// @route   PUT /api/appeals/:id
// @access  Private
const updateAppeal = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const { appealContent, customizations, additionalDetails, title, description } = req.body;
  
  // Find the appeal
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  // Check if the appeal belongs to the current user
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this appeal');
  }
  
  // If the appeal is deleted, don't allow updates
  if (appeal.isDeleted) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  // Update appeal fields
  if (appealContent) {
    appeal.appealContent = appealContent;
  }
  
  if (title) {
    appeal.title = title;
  }
  
  if (description) {
    appeal.description = description;
  }
  
  if (additionalDetails) {
    appeal.additionalDetails = additionalDetails;
  }
  
  if (customizations) {
    appeal.customizations = customizations;
  }
  
  // Add timeline entry for the update
  appeal.timeline.push({
    date: new Date(),
    status: 'updated',
    description: 'Appeal content updated'
  });
  
  // Save the updated appeal
  const updatedAppeal = await appeal.save();

  res.json({
    _id: updatedAppeal._id,
    status: updatedAppeal.status,
    message: 'Appeal updated successfully'
  });
});

// @desc    Mark an appeal as submitted
// @route   PUT /api/appeals/:id/submit
// @access  Private
const submitAppeal = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const { 
    method: submissionMethod, 
    address, 
    faxNumber, 
    email, 
    portalLink, 
    trackingInfo 
  } = req.body;

  if (!submissionMethod) {
    res.status(400);
    throw new Error('Submission method is required');
  }

  // Find the appeal by ID
  const appeal = await Appeal.findById(appealId);

  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }

  // Check if the appeal belongs to the current user
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to submit this appeal');
  }
  
  // If the appeal is deleted, don't allow submission
  if (appeal.isDeleted) {
    res.status(404);
    throw new Error('Appeal not found');
  }

  // Update the appeal with submission details
  appeal.status = 'submitted';
  appeal.submissionDetails = {
    submittedDate: new Date(),
    submissionMethod,
    trackingInfo: trackingInfo || ''
  };

  // Store additional submission-specific information based on method
  switch (submissionMethod) {
    case 'mail':
      appeal.submissionDetails.address = address;
      break;
    case 'fax':
      appeal.submissionDetails.faxNumber = faxNumber;
      break;
    case 'email':
      appeal.submissionDetails.email = email;
      break;
    case 'portal':
      appeal.submissionDetails.portalLink = portalLink;
      break;
  }

  // Add a timeline event
  if (!appeal.timeline) {
    appeal.timeline = [];
  }
  
  appeal.timeline.push({
    date: new Date(),
    status: 'submitted',
    description: `Appeal submitted via ${submissionMethod}`
  });

  // Save the updated appeal
  const updatedAppeal = await appeal.save();

  res.json({
    _id: updatedAppeal._id,
    status: updatedAppeal.status,
    submissionDetails: updatedAppeal.submissionDetails,
    message: 'Appeal marked as submitted'
  });
});

// @desc    Record the outcome of an appeal
// @route   PUT /api/appeals/:id/outcome
// @access  Private
const recordOutcome = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const { decision, responseDate, recoveredAmount, notes } = req.body;

  if (!decision) {
    res.status(400);
    throw new Error('Decision is required');
  }
  
  // Find the appeal
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  // Check if the appeal belongs to the current user
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this appeal');
  }
  
  // If the appeal is deleted, don't allow updates
  if (appeal.isDeleted) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  // Update the appeal status based on decision
  appeal.status = decision === 'approved' || decision === 'partiallyApproved' ? 'approved' : 'denied';
  
  // Record the outcome details
  appeal.outcomeDetails = {
    responseDate: responseDate ? new Date(responseDate) : new Date(),
    decision,
    recoveredAmount: recoveredAmount || 0,
    notes: notes || ''
  };
  
  // Add a timeline event
  appeal.timeline.push({
    date: new Date(),
    status: decision,
    description: `Appeal ${decision}: ${notes || 'No additional notes'}`
  });
  
  // Save the updated appeal
  const updatedAppeal = await appeal.save();

  res.json({
    _id: updatedAppeal._id,
    status: updatedAppeal.status,
    outcomeDetails: updatedAppeal.outcomeDetails,
    message: 'Appeal outcome recorded'
  });
});

// @desc    Get appeal templates
// @route   GET /api/appeals/templates
// @access  Private
const getTemplates = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // In a real implementation, we would query the database for templates
  // For now, we'll simulate the response with sample data
  const templates = [
    {
      _id: '1234567890',
      name: 'Standard Medical Necessity Appeal',
      description: 'A general purpose template for appealing denials based on medical necessity',
      category: 'medicalNecessity',
      templateId: 'medical_necessity_standard',
      effectivenessScore: 85,
      successRate: 72
    },
    {
      _id: '0987654321',
      name: 'Prior Authorization Appeal',
      description: 'Template for appealing denials due to lack of prior authorization',
      category: 'priorAuthorization',
      templateId: 'prior_authorization_standard',
      effectivenessScore: 78,
      successRate: 65
    },
    {
      _id: '5678901234',
      name: 'Out-of-Network Coverage Appeal',
      description: 'Template for appealing out-of-network coverage denials',
      category: 'outOfNetwork',
      templateId: 'out_of_network_standard',
      effectivenessScore: 70,
      successRate: 58
    },
    {
      _id: '2468013579',
      name: 'Coding Error Appeal',
      description: 'Template for appealing denials due to coding or billing errors',
      category: 'codingError',
      templateId: 'coding_error_standard',
      effectivenessScore: 88,
      successRate: 85
    },
    {
      _id: '1357924680',
      name: 'Pre-Authorization Conflict Appeal',
      description: 'Template for resolving pre-authorization conflicts when a better coverage option exists',
      category: 'preAuthConflict',
      templateId: 'pre_auth_conflict_standard',
      effectivenessScore: 75,
      successRate: 62
    },
    {
      _id: '8642097531',
      name: 'Urgent Medical Override Request',
      description: 'Template for requesting urgent override of administrative barriers for time-sensitive medical conditions',
      category: 'urgencyOverride',
      templateId: 'urgency_override_standard',
      effectivenessScore: 82,
      successRate: 70
    }
  ];

  // Filter by category if provided
  const filteredTemplates = category 
    ? templates.filter(t => t.category === category) 
    : templates;

  res.json(filteredTemplates);
});

// @desc    Analyze a document for appeal potential
// @route   POST /api/appeals/analyze
// @access  Private
const analyzeAppealPotential = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error('Document ID is required');
  }

  // Fetch the document
  const document = await Document.findById(documentId);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this document');
  }
  
  // If document is still processing, return an error
  if (document.status === 'processing') {
    res.status(400);
    throw new Error('Document is still being processed. Please try again later.');
  }
  
  // If document processing failed, return an error
  if (document.status === 'failed') {
    res.status(400);
    throw new Error('Document processing failed. Please upload the document again.');
  }

  // Generate the appeal analysis
  const extractedData = document.extractedData || {};
  const deniedAmount = extractedData.billedAmount && extractedData.allowedAmount ? 
    extractedData.billedAmount - extractedData.allowedAmount : 0;
  
  // Identify appeal strategy
  const appealStrategy = appealService.identifyAppealStrategy(
    extractedData.denialReason, 
    extractedData.denialCode
  );
  
  // Prepare data for success prediction
  const appealData = {
    appealType: appealStrategy.appealType,
    insuranceCarrier: extractedData.insuranceCarrier,
    deniedAmount: deniedAmount,
    diagnosisCodes: extractedData.diagnosisCodes,
    procedureCodes: extractedData.procedureCodes,
    dataCompleteness: calculateDataCompleteness(extractedData)
  };
  
  // Predict appeal success
  const successPrediction = appealService.predictAppealSuccess(appealData);
  
  // Generate appeal deadline warning if needed
  let deadlineWarning = null;
  if (extractedData.appealDeadline) {
    const now = new Date();
    const deadline = new Date(extractedData.appealDeadline);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      deadlineWarning = {
        type: 'expired',
        message: 'The appeal deadline has already passed. The insurance company may reject this appeal due to timeliness.',
        daysRemaining: daysRemaining
      };
    } else if (daysRemaining <= 3) {
      deadlineWarning = {
        type: 'urgent',
        message: `Urgent: Only ${daysRemaining} day(s) remaining to submit this appeal. Submit immediately.`,
        daysRemaining: daysRemaining
      };
    } else if (daysRemaining <= 7) {
      deadlineWarning = {
        type: 'warning',
        message: `Warning: Only ${daysRemaining} days remaining to submit this appeal.`,
        daysRemaining: daysRemaining
      };
    }
  }
  
  res.json({
    documentId: document._id,
    documentType: document.documentType,
    appealType: appealStrategy.appealType,
    appealTemplate: appealStrategy.templateId,
    suggestedEvidence: appealStrategy.suggestedEvidence,
    successProbability: successPrediction.successProbability,
    factors: successPrediction.factors,
    recommendedActions: successPrediction.recommendedActions,
    recommendedAction: successPrediction.recommendedAction,
    deadlineWarning,
    extractedKeyFields: {
      claimNumber: extractedData.claimNumber,
      denialReason: extractedData.denialReason,
      denialCode: extractedData.denialCode,
      serviceDate: extractedData.serviceDate,
      billedAmount: extractedData.billedAmount,
      allowedAmount: extractedData.allowedAmount,
      patientResponsibility: extractedData.patientResponsibility,
      appealDeadline: extractedData.appealDeadline
    }
  });
});

// Helper function to calculate data completeness
const calculateDataCompleteness = (extractedData) => {
  const criticalFields = ['claimNumber', 'serviceDate', 'denialReason', 'denialCode'];
  const supportingFields = ['patientName', 'memberId', 'serviceDescription', 'procedureCodes', 'diagnosisCodes'];
  
  const allFields = [...criticalFields, ...supportingFields];
  
  const presentFields = allFields.filter(field => {
    if (Array.isArray(extractedData[field])) {
      return extractedData[field].length > 0;
    }
    return extractedData[field];
  });
  
  return presentFields.length / allFields.length;
};

// @desc    Generate an appeal letter in real-time with AI enhancement
// @route   POST /api/appeals/generate-letter
// @access  Private
const generateAppealLetter = asyncHandler(async (req, res) => {
  const { documentId, templateId, customPrompt } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error('Document ID is required');
  }

  // Fetch the document with extracted data
  const document = await Document.findById(documentId);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this document');
  }
  
  // If document is still processing, return an error
  if (document.status === 'processing') {
    res.status(400);
    throw new Error('Document is still being processed. Please try again later.');
  }
  
  // If document processing failed, return an error
  if (document.status === 'failed') {
    res.status(400);
    throw new Error('Document processing failed. Please upload the document again.');
  }

  // Generate the appeal letter using the enhanced AI service
  const appealResult = await appealService.generateLetterContent(document, templateId);
  
  // Get additional AI analysis for the appeal
  const aiAnalysis = await aiService.analyzeAppealData({
    ...document.extractedData,
    appealType: appealResult.appealType
  });
  
  // Enhance the response with AI insights
  const enhancedResponse = {
    ...appealResult,
    aiAnalysis,
    customizations: {
      prompt: customPrompt || null,
      userEditable: true
    }
  };

  res.json(enhancedResponse);
});

// @desc    Generate a follow-up plan for a submitted appeal
// @route   GET /api/appeals/:id/follow-up-plan
// @access  Private
const getFollowUpPlan = asyncHandler(async (req, res) => {
  const appealId = req.params.id;

  // Find the appeal by ID
  const appeal = await Appeal.findById(appealId);

  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }

  // Check if the appeal belongs to the current user
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }

  // If appeal is not submitted, return error
  if (appeal.status !== 'submitted') {
    res.status(400);
    throw new Error('Follow-up plan is only available for submitted appeals');
  }

  // Generate follow-up plan
  const followUpPlan = await appealService.generateFollowUpPlan(appeal);

  res.json({
    appealId: appeal._id,
    followUpPlan,
    message: 'Follow-up plan generated successfully'
  });
});

// @desc    Get submission requirements checklist for an appeal
// @route   GET /api/appeals/:id/submission-checklist
// @access  Private
const getSubmissionChecklist = asyncHandler(async (req, res) => {
  const appealId = req.params.id;

  // Find the appeal by ID
  const appeal = await Appeal.findById(appealId).populate('relatedDocument');

  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }

  // Check if the appeal belongs to the current user
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }

  // Generate submission checklist
  const checklist = await appealService.generateSubmissionChecklist(appealId);

  res.json(checklist);
});

// @desc    Get insurer-specific appeal requirements
// @route   GET /api/appeals/insurer-requirements
// @access  Private
const getInsurerRequirements = asyncHandler(async (req, res) => {
  const { insurer } = req.query;

  if (!insurer) {
    res.status(400);
    throw new Error('Insurer name is required');
  }

  // Get requirements
  const requirements = await appealService.getSubmissionRequirements({
    relatedDocument: {
      extractedData: {
        insuranceCarrier: insurer
      }
    }
  });

  res.json(requirements);
});

// @desc    Get appeals statistics and metrics
// @route   GET /api/appeals/stats
// @access  Private
const getAppealsStats = asyncHandler(async (req, res) => {
  // Get all appeals for current user
  const appeals = await Appeal.find({ 
    user: req.user.id,
    isDeleted: false
  });

  // Count appeals by status
  const statusCounts = appeals.reduce((acc, appeal) => {
    acc[appeal.status] = (acc[appeal.status] || 0) + 1;
    return acc;
  }, {});

  // Count appeals by type
  const typeCounts = appeals.reduce((acc, appeal) => {
    acc[appeal.appealType] = (acc[appeal.appealType] || 0) + 1;
    return acc;
  }, {});

  // Calculate success rate (approved / (approved + denied))
  const approvedCount = statusCounts.approved || 0;
  const deniedCount = statusCounts.denied || 0;
  const successRate = deniedCount + approvedCount > 0 
    ? approvedCount / (approvedCount + deniedCount) 
    : 0;

  // Calculate total recovered amount
  const totalRecovered = appeals.reduce((sum, appeal) => {
    return sum + (appeal.outcomeDetails && appeal.outcomeDetails.recoveredAmount || 0);
  }, 0);

  // Get appeals pending response
  const pendingAppeals = appeals.filter(appeal => appeal.status === 'submitted').length;

  // Calculate average time to resolution
  const resolvedAppeals = appeals.filter(appeal => 
    appeal.status === 'approved' || appeal.status === 'denied'
  );

  let avgTimeToResolution = 0;
  if (resolvedAppeals.length > 0) {
    const totalDays = resolvedAppeals.reduce((sum, appeal) => {
      const submissionDate = appeal.submissionDetails && appeal.submissionDetails.submittedDate;
      const responseDate = appeal.outcomeDetails && appeal.outcomeDetails.responseDate;
      
      if (submissionDate && responseDate) {
        const days = Math.ceil((new Date(responseDate) - new Date(submissionDate)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);

    avgTimeToResolution = totalDays / resolvedAppeals.length;
  }

  res.json({
    totalAppeals: appeals.length,
    statusCounts,
    typeCounts,
    successRate,
    totalRecovered,
    pendingAppeals,
    avgTimeToResolution,
    lastUpdated: new Date()
  });
});

// @desc    Analyze a claim with AI (Claude) to generate appeal and analysis
// @route   POST /api/appeals/analyze-with-ai
// @access  Private
const analyzeClaimWithAI = asyncHandler(async (req, res) => {
  const { documentId, apiKey, model = 'claude' } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error('Document ID is required');
  }

  // Fetch the document
  const document = await Document.findById(documentId);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this document');
  }
  
  // If document is still processing, return an error
  if (document.status === 'processing') {
    res.status(400);
    throw new Error('Document is still being processed. Please try again later.');
  }
  
  // If document processing failed, return an error
  if (document.status === 'failed') {
    res.status(400);
    throw new Error('Document processing failed. Please upload the document again.');
  }

  // Extract document data for AI analysis
  const { extractedData } = document;
  
  // Prepare data for AI service
  const aiData = {
    denialReason: extractedData?.denialReason || '',
    serviceDescription: extractedData?.serviceDescription || '',
    diagnosisCodes: extractedData?.diagnosisCodes || [],
    procedureCodes: extractedData?.procedureCodes || [],
    claimNumber: extractedData?.claimNumber || '',
    serviceDate: extractedData?.serviceDate || '',
    patientInfo: {
      name: extractedData?.patientName || '',
      insuranceId: extractedData?.memberId || '',
      dateOfBirth: extractedData?.patientDOB || ''
    },
    insuranceCarrier: extractedData?.insuranceCarrier || '',
    additionalContext: `Extracted from document type: ${document.documentType}. 
    ${extractedData?.billedAmount ? `Billed amount: $${extractedData.billedAmount}. ` : ''}
    ${extractedData?.allowedAmount ? `Allowed amount: $${extractedData.allowedAmount}. ` : ''}
    ${extractedData?.providerName ? `Provider: ${extractedData.providerName}. ` : ''}`
  };

  let aiResult;
  
  // Choose AI model based on input
  if (model === 'claude' && apiKey) {
    // Generate with Claude API
    aiResult = await aiService.generateAppealWithClaude(aiData, apiKey);
  } else {
    // Generate with default system AI
    aiResult = await aiService.generateAppealWithDefaultAI(aiData);
  }
  
  if (!aiResult.success) {
    res.status(400);
    throw new Error(`Failed to generate AI analysis: ${aiResult.error}`);
  }
  
  // Get additional denial analysis
  const denialAnalysis = await aiService.analyzeDenial({
    ...aiData,
    documentType: document.documentType
  });
  
  // Combine results and return
  res.json({
    success: true,
    model: aiResult.model,
    appealContent: aiResult.appealContent,
    aiAnalysis: aiResult.aiAnalysis,
    aiConfidence: aiResult.aiConfidence,
    denialAnalysis,
    documentMetadata: {
      id: document._id,
      type: document.documentType,
      name: document.fileName,
      extractedData: {
        claimNumber: extractedData?.claimNumber,
        serviceDate: extractedData?.serviceDate,
        denialReason: extractedData?.denialReason,
        insuranceCarrier: extractedData?.insuranceCarrier,
        billedAmount: extractedData?.billedAmount,
        allowedAmount: extractedData?.allowedAmount
      }
    }
  });
});

// @desc    Create a provider review for an appeal
// @route   POST /api/appeals/:id/provider-review
// @access  Private
const createProviderReview = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const { 
    reviewerName, 
    reviewerCredentials, 
    medicalOpinion, 
    recommendedChanges, 
    suggestedReferences,
    clinicalJustification,
    additionalNotes
  } = req.body;

  if (!reviewerName || !medicalOpinion) {
    res.status(400);
    throw new Error('Reviewer name and medical opinion are required');
  }

  // Find the appeal
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }
  
  // Create provider review
  appeal.providerReview = {
    reviewerName,
    reviewerCredentials: reviewerCredentials || '',
    reviewDate: new Date(),
    medicalOpinion,
    recommendedChanges: recommendedChanges || [],
    suggestedReferences: suggestedReferences || [],
    clinicalJustification: clinicalJustification || '',
    additionalNotes: additionalNotes || '',
    status: 'added'
  };
  
  // Add timeline entry
  appeal.timeline.push({
    date: new Date(),
    status: 'provider_review_added',
    description: `Provider review added by ${reviewerName}`
  });
  
  // Save the updated appeal
  const updatedAppeal = await appeal.save();
  
  res.json({
    success: true,
    providerReview: updatedAppeal.providerReview,
    message: 'Provider review added successfully'
  });
});

// @desc    Update a provider review for an appeal
// @route   PUT /api/appeals/:id/provider-review
// @access  Private
const updateProviderReview = asyncHandler(async (req, res) => {
  const appealId = req.params.id;
  const { 
    reviewerName, 
    reviewerCredentials, 
    medicalOpinion, 
    recommendedChanges, 
    suggestedReferences,
    clinicalJustification,
    additionalNotes,
    status
  } = req.body;

  // Find the appeal
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }
  
  // Check if provider review exists
  if (!appeal.providerReview) {
    res.status(404);
    throw new Error('Provider review not found');
  }
  
  // Update provider review fields
  if (reviewerName) appeal.providerReview.reviewerName = reviewerName;
  if (reviewerCredentials !== undefined) appeal.providerReview.reviewerCredentials = reviewerCredentials;
  if (medicalOpinion) appeal.providerReview.medicalOpinion = medicalOpinion;
  if (recommendedChanges) appeal.providerReview.recommendedChanges = recommendedChanges;
  if (suggestedReferences) appeal.providerReview.suggestedReferences = suggestedReferences;
  if (clinicalJustification !== undefined) appeal.providerReview.clinicalJustification = clinicalJustification;
  if (additionalNotes !== undefined) appeal.providerReview.additionalNotes = additionalNotes;
  if (status) appeal.providerReview.status = status;
  
  appeal.providerReview.lastUpdated = new Date();
  
  // Add timeline entry
  appeal.timeline.push({
    date: new Date(),
    status: 'provider_review_updated',
    description: `Provider review updated by ${reviewerName || appeal.providerReview.reviewerName}`
  });
  
  // Save the updated appeal
  const updatedAppeal = await appeal.save();
  
  res.json({
    success: true,
    providerReview: updatedAppeal.providerReview,
    message: 'Provider review updated successfully'
  });
});

// @desc    Get provider review for an appeal
// @route   GET /api/appeals/:id/provider-review
// @access  Private
const getProviderReview = asyncHandler(async (req, res) => {
  const appealId = req.params.id;

  // Find the appeal
  const appeal = await Appeal.findById(appealId);
  
  if (!appeal) {
    res.status(404);
    throw new Error('Appeal not found');
  }
  
  if (appeal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this appeal');
  }
  
  // Check if provider review exists
  if (!appeal.providerReview) {
    res.status(404);
    throw new Error('Provider review not found');
  }
  
  // Return the provider review
  res.json({
    appealId: appeal._id,
    providerReview: appeal.providerReview,
    appealStatus: appeal.status,
    appealType: appeal.appealType
  });
});

module.exports = {
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
};