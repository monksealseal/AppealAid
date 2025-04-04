/**
 * Response Controller
 * 
 * Handles API endpoints for insurance response processing
 */

const path = require('path');
const fs = require('fs');
const responseProcessor = require('../services/responseProcessorService');
const Appeal = require('../models/appealModel');
const logger = require('../utils/logger');
const { uploadDocument } = require('../services/documentService');

/**
 * Process an uploaded response document
 * 
 * @route POST /api/responses/process
 * @param {Object} req.file - Uploaded file from multer middleware
 * @param {String} req.body.patientId - Optional patient ID to help with matching
 * @returns {Object} Processing result
 */
exports.processResponseDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file uploaded'
      });
    }
    
    // Save document to storage and get document object
    const document = await uploadDocument(req.file, {
      documentType: 'insurance_response',
      patientId: req.body.patientId || null,
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
    
    // Process the response document
    const result = await responseProcessor.processResponseDocument(document);
    
    // Return appropriate response based on processing result
    if (result.success) {
      return res.status(200).json(result);
    } else if (result.isResponse && !result.hasMatch) {
      // It's a response but couldn't match to an appeal
      return res.status(200).json({
        ...result,
        message: 'Document is an insurance response but could not be matched to an existing appeal'
      });
    } else if (!result.isResponse) {
      // Not identified as a response document
      return res.status(200).json({
        ...result,
        message: 'Document does not appear to be an insurance response'
      });
    } else {
      // Other processing error
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error processing response document:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing response document',
      error: error.message
    });
  }
};

/**
 * Record a manual response for an appeal
 * 
 * @route POST /api/responses/manual
 * @param {String} req.body.appealId - Optional appeal ID
 * @param {String} req.body.decision - Decision (approved, denied, partiallyApproved)
 * @param {Object} req.body - Additional response data
 * @returns {Object} Processing result
 */
exports.recordManualResponse = async (req, res) => {
  try {
    const { appealId, ...responseData } = req.body;
    
    // Validate required fields
    if (!responseData.decision) {
      return res.status(400).json({
        success: false,
        message: 'Decision is required (approved, denied, partiallyApproved)'
      });
    }
    
    // Process manual response
    const result = await responseProcessor.recordManualResponse(responseData, appealId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error recording manual response:', error);
    return res.status(500).json({
      success: false,
      message: 'Error recording manual response',
      error: error.message
    });
  }
};

/**
 * Check if document is an insurance response
 * 
 * @route POST /api/responses/check-document
 * @param {Object} req.file - Uploaded file from multer middleware
 * @returns {Object} Check result
 */
exports.checkResponseDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file uploaded'
      });
    }
    
    // Save document temporarily and get document object
    const document = await uploadDocument(req.file, {
      documentType: 'temp',
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
    
    // Check if document is a response
    const result = await responseProcessor.isResponseDocument(document);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error checking response document:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking response document',
      error: error.message
    });
  }
};

/**
 * Match a response to an existing appeal
 * 
 * @route POST /api/responses/match
 * @param {String} req.body.documentId - Document ID of previously uploaded response
 * @param {String} req.body.appealId - Optional appeal ID to force match
 * @returns {Object} Match result
 */
exports.matchResponseToAppeal = async (req, res) => {
  try {
    const { documentId, appealId } = req.body;
    
    // Validate required fields
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    // If appeal ID is provided, validate it exists
    let matchedAppeal = null;
    if (appealId) {
      matchedAppeal = await Appeal.findById(appealId);
      if (!matchedAppeal) {
        return res.status(404).json({
          success: false,
          message: `No appeal found with ID ${appealId}`
        });
      }
    }
    
    // Get the document
    // Note: In a real implementation, you'd retrieve the document from storage
    // Here, we assume a document service that can fetch by ID
    const document = await getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: `Document with ID ${documentId} not found`
      });
    }
    
    // Extract decision data
    const decisionData = await responseProcessor.extractDecisionData(document);
    
    // If appeal ID provided, update that appeal directly
    if (matchedAppeal) {
      const updatedAppeal = await responseProcessor.updateAppealWithResponse(matchedAppeal, decisionData);
      const nextSteps = responseProcessor.generateNextSteps(updatedAppeal, decisionData);
      
      return res.status(200).json({
        success: true,
        appeal: updatedAppeal,
        decisionData,
        nextSteps,
        message: 'Successfully processed response and updated appeal'
      });
    }
    
    // Otherwise, try to find matching appeal
    matchedAppeal = await responseProcessor.findMatchingAppeal(decisionData);
    
    if (!matchedAppeal) {
      return res.status(404).json({
        success: false,
        decisionData,
        message: 'Could not match response to an existing appeal'
      });
    }
    
    // Update the matched appeal
    const updatedAppeal = await responseProcessor.updateAppealWithResponse(matchedAppeal, decisionData);
    const nextSteps = responseProcessor.generateNextSteps(updatedAppeal, decisionData);
    
    return res.status(200).json({
      success: true,
      appeal: updatedAppeal,
      decisionData,
      nextSteps,
      message: 'Successfully matched response and updated appeal'
    });
  } catch (error) {
    logger.error('Error matching response to appeal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error matching response to appeal',
      error: error.message
    });
  }
};

/**
 * Get document by ID
 * Placeholder for document retrieval service
 * 
 * @param {String} documentId - Document ID
 * @returns {Object} Document object
 */
async function getDocumentById(documentId) {
  // This would be implemented based on your document storage system
  // For now, return a mock document for development
  return {
    id: documentId,
    path: `/tmp/documents/${documentId}.pdf`,
    mockText: "Appeal Decision Letter\n\nPatient: John Doe\nClaim #: CL123456\nAppeal #: AP789012\n\nDecision: Approved\n\nYour appeal has been reviewed and approved. The requested amount of $1,500.00 will be processed within 30 days."
  };
}

/**
 * Get next steps based on a decision
 * 
 * @route GET /api/responses/next-steps
 * @param {String} req.query.decision - Decision type (approved, denied, partiallyApproved)
 * @param {String} req.query.appealId - Optional appeal ID for context
 * @returns {Object} Next steps recommendations
 */
exports.getNextSteps = async (req, res) => {
  try {
    const { decision, appealId } = req.query;
    
    // Validate required fields
    if (!decision) {
      return res.status(400).json({
        success: false,
        message: 'Decision type is required'
      });
    }
    
    let appeal = null;
    // If appeal ID provided, get appeal for context
    if (appealId) {
      appeal = await Appeal.findById(appealId);
      if (!appeal) {
        return res.status(404).json({
          success: false,
          message: `No appeal found with ID ${appealId}`
        });
      }
    }
    
    // Generate next steps based on decision
    const decisionData = { decision };
    const nextSteps = responseProcessor.generateNextSteps(appeal, decisionData);
    
    return res.status(200).json({
      success: true,
      decision,
      nextSteps
    });
  } catch (error) {
    logger.error('Error getting next steps:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting next steps',
      error: error.message
    });
  }
};

/**
 * Get a list of recently processed responses
 * 
 * @route GET /api/responses
 * @param {Number} req.query.limit - Maximum number of responses to return
 * @param {String} req.query.patientId - Optional filter by patient
 * @returns {Array} List of processed responses
 */
exports.getRecentResponses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const patientFilter = req.query.patientId ? { patient: req.query.patientId } : {};
    
    // Find appeals with responses
    const appeals = await Appeal.find({
      ...patientFilter,
      responseDate: { $exists: true },
      decision: { $in: ['approved', 'denied', 'partiallyApproved'] }
    })
    .populate('patient', 'name patientId')
    .sort({ responseDate: -1 })
    .limit(limit);
    
    const responses = appeals.map(appeal => ({
      appealId: appeal._id,
      patientName: appeal.patient?.name || 'Unknown',
      patientId: appeal.patient?.patientId || 'Unknown',
      claimId: appeal.claimId,
      decision: appeal.decision,
      responseDate: appeal.responseDate,
      reason: appeal.responseDetails?.reason || null,
      approvedAmount: appeal.approvedAmount || 0,
      deniedAmount: appeal.deniedAmount || 0
    }));
    
    return res.status(200).json({
      success: true,
      count: responses.length,
      responses
    });
  } catch (error) {
    logger.error('Error getting recent responses:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting recent responses',
      error: error.message
    });
  }
};

module.exports = exports;