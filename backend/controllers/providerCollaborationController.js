/**
 * Provider Collaboration Controller
 * 
 * Handles API endpoints for provider collaboration features
 */

const providerCollaborationService = require('../services/providerCollaborationService');
const Appeal = require('../models/appealModel');
const logger = require('../utils/logger');

/**
 * Create a collaboration request for provider documentation
 * 
 * @route POST /api/provider-collaboration/request
 * @param {String} req.body.appealId - Appeal ID
 * @param {String} req.body.message - Custom message for provider
 * @param {Array} req.body.requestedItems - Specific documentation items needed
 * @param {String} req.body.providerEmail - Provider's email
 * @param {Date} req.body.responseDeadline - Deadline for response
 */
exports.createCollaborationRequest = async (req, res) => {
  try {
    const { appealId, ...requestData } = req.body;
    
    // Validate required fields
    if (!appealId) {
      return res.status(400).json({
        success: false,
        message: 'Appeal ID is required'
      });
    }
    
    // Create the collaboration request
    const result = await providerCollaborationService.createCollaborationRequest(appealId, requestData);
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error creating collaboration request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating collaboration request',
      error: error.message
    });
  }
};

/**
 * Process provider documentation submission
 * 
 * @route POST /api/provider-collaboration/submit
 * @param {Array} req.files - Uploaded files
 * @param {String} req.body.appealId - Appeal ID
 * @param {String} req.body.providerNotes - Provider's notes about the documentation
 * @param {Array} req.body.documentTypes - Types of documents being submitted
 */
exports.processProviderSubmission = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const { appealId, providerNotes, documentTypes } = req.body;
    
    // Validate required fields
    if (!appealId) {
      return res.status(400).json({
        success: false,
        message: 'Appeal ID is required'
      });
    }
    
    // Process the submission
    const result = await providerCollaborationService.processProviderSubmission(
      req.files,
      appealId,
      providerNotes,
      documentTypes ? JSON.parse(documentTypes) : []
    );
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error processing provider submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing provider submission',
      error: error.message
    });
  }
};

/**
 * Get provider secure access page data
 * 
 * @route GET /api/provider-collaboration/access/:token
 * @param {String} req.params.token - Secure access token
 */
exports.getProviderAccessData = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Decode token
    let appealId, patientId;
    try {
      const decodedData = Buffer.from(token, 'base64').toString('utf-8').split(':');
      appealId = decodedData[0];
      patientId = decodedData[1];
      
      // Optional: Verify timestamp if token should expire
      // const timestamp = parseInt(decodedData[2]);
      // if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) { // 7 days expiration
      //   throw new Error('Token expired');
      // }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid access token'
      });
    }
    
    // Get appeal and patient data
    const appeal = await Appeal.findById(appealId).populate('patient', 'name dateOfBirth');
    
    if (!appeal || appeal.patient._id.toString() !== patientId) {
      return res.status(404).json({
        success: false,
        message: 'Appeal not found or access denied'
      });
    }
    
    // Return limited appeal data for provider page
    return res.status(200).json({
      success: true,
      appealData: {
        appealId: appeal._id,
        patientName: appeal.patient.name,
        patientDOB: appeal.patient.dateOfBirth,
        serviceName: appeal.serviceName,
        serviceDate: appeal.serviceDate,
        insuranceCompany: appeal.insuranceCompany,
        collaborationRequests: appeal.collaborationRequests
      }
    });
  } catch (error) {
    logger.error('Error getting provider access data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting provider access data',
      error: error.message
    });
  }
};

/**
 * Fetch clinical data from EHR system
 * 
 * @route POST /api/provider-collaboration/ehr-data
 * @param {String} req.body.appealId - Appeal ID
 * @param {Object} req.body.ehrConnection - EHR connection details
 * @param {Array} req.body.dataTypes - Types of data to fetch
 */
exports.fetchEHRData = async (req, res) => {
  try {
    const { appealId, ehrConnection, dataTypes } = req.body;
    
    // Validate required fields
    if (!appealId) {
      return res.status(400).json({
        success: false,
        message: 'Appeal ID is required'
      });
    }
    
    // Fetch EHR data
    const result = await providerCollaborationService.fetchEHRData(appealId, ehrConnection, dataTypes);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error fetching EHR data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching EHR data',
      error: error.message
    });
  }
};

/**
 * Generate clinical summary for appeal
 * 
 * @route POST /api/provider-collaboration/clinical-summary
 * @param {String} req.body.appealId - Appeal ID
 */
exports.generateClinicalSummary = async (req, res) => {
  try {
    const { appealId } = req.body;
    
    // Validate required fields
    if (!appealId) {
      return res.status(400).json({
        success: false,
        message: 'Appeal ID is required'
      });
    }
    
    // Generate clinical summary
    const result = await providerCollaborationService.generateClinicalSummary(appealId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error generating clinical summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating clinical summary',
      error: error.message
    });
  }
};

/**
 * Get collaboration requests for an appeal
 * 
 * @route GET /api/provider-collaboration/requests/:appealId
 * @param {String} req.params.appealId - Appeal ID
 */
exports.getCollaborationRequests = async (req, res) => {
  try {
    const { appealId } = req.params;
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: `No appeal found with ID ${appealId}`
      });
    }
    
    // Return collaboration requests
    return res.status(200).json({
      success: true,
      collaborationRequests: appeal.collaborationRequests || []
    });
  } catch (error) {
    logger.error('Error getting collaboration requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting collaboration requests',
      error: error.message
    });
  }
};

module.exports = exports;