/**
 * Response Processor Service
 * 
 * Handles processing of insurance company responses to appeals,
 * including document analysis, decision extraction, appeal matching,
 * and status updates.
 */

const mongoose = require('mongoose');
const Appeal = require('../models/appealModel');
const Patient = require('../models/patientModel');
const { generatePatientMessage } = require('./notificationService');
const logger = require('../utils/logger');

/**
 * Process an insurance response document
 * Analyzes the document, extracts decision data, matches to appeals,
 * and updates the appeal with the response information
 * 
 * @param {Object} document - The document object (with file path or content)
 * @param {Object} options - Processing options
 * @returns {Object} Processing result with matched appeal and decision data
 */
async function processResponseDocument(document, options = {}) {
  try {
    logger.info('Processing potential insurance response document');
    
    // Check if document is an insurance response
    const isResponse = await isResponseDocument(document);
    if (!isResponse.isResponseDocument) {
      return {
        success: false,
        isResponse: false,
        message: 'Document is not an insurance response'
      };
    }
    
    // Extract decision data from document
    const decisionData = await extractDecisionData(document);
    
    // Find matching appeal
    const matchingAppeal = await findMatchingAppeal(decisionData);
    if (!matchingAppeal) {
      return {
        success: false,
        isResponse: true,
        hasMatch: false,
        decisionData,
        message: 'Could not match response to an existing appeal'
      };
    }
    
    // Update appeal with response
    const updatedAppeal = await updateAppealWithResponse(matchingAppeal, decisionData);
    
    // Generate next steps based on decision
    const nextSteps = generateNextSteps(updatedAppeal, decisionData);
    
    return {
      success: true,
      isResponse: true,
      hasMatch: true,
      appeal: updatedAppeal,
      decisionData,
      nextSteps,
      message: 'Successfully processed response and updated appeal'
    };
  } catch (error) {
    logger.error('Error processing response document:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Record a manual response for an appeal
 * Used when response information is entered manually rather than via document processing
 * 
 * @param {Object} responseData - The manually entered response data
 * @param {String} appealId - Optional appeal ID if known
 * @returns {Object} Processing result with updated appeal
 */
async function recordManualResponse(responseData, appealId = null) {
  try {
    logger.info('Recording manual response', { appealId });
    
    let matchingAppeal;
    
    // If appeal ID is provided, find by ID
    if (appealId) {
      matchingAppeal = await Appeal.findById(appealId);
      if (!matchingAppeal) {
        return {
          success: false,
          message: `No appeal found with ID ${appealId}`
        };
      }
    } else {
      // Find matching appeal based on response data
      matchingAppeal = await findMatchingAppeal(responseData);
      if (!matchingAppeal) {
        return {
          success: false,
          message: 'Could not match response to an existing appeal'
        };
      }
    }
    
    // Update appeal with response
    const updatedAppeal = await updateAppealWithResponse(matchingAppeal, responseData);
    
    // Generate next steps based on decision
    const nextSteps = generateNextSteps(updatedAppeal, responseData);
    
    return {
      success: true,
      appeal: updatedAppeal,
      nextSteps,
      message: 'Successfully recorded response and updated appeal'
    };
  } catch (error) {
    logger.error('Error recording manual response:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if a document is an insurance response
 * Uses document analysis to determine if this is a response document
 * 
 * @param {Object} document - The document to analyze
 * @returns {Object} Result indicating if document is a response
 */
async function isResponseDocument(document) {
  try {
    // In a real implementation, this would use ML document analysis
    // For now we'll use a simplified approach with key phrase detection
    
    // Extract text from document (implementation depends on document format)
    const text = await extractTextFromDocument(document);
    
    // Check for common response keywords and phrases
    const responseKeywords = [
      'appeal decision',
      'determination',
      'approved',
      'denied',
      'partially approved',
      'appeal outcome',
      'claim reconsideration'
    ];
    
    // Check for header/title indicators
    const headerIndicators = [
      'notice of determination',
      'appeal decision letter',
      'response to appeal request',
      'appeal resolution',
      'determination notice'
    ];
    
    // Count how many response indicators are found
    let keywordCount = 0;
    let hasHeaderIndicator = false;
    
    // Check for keywords
    for (const keyword of responseKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        keywordCount++;
      }
    }
    
    // Check for header indicators
    for (const header of headerIndicators) {
      if (text.toLowerCase().includes(header.toLowerCase())) {
        hasHeaderIndicator = true;
        break;
      }
    }
    
    // Determine if this is a response document based on indicators
    const isResponseDocument = hasHeaderIndicator || keywordCount >= 2;
    
    return {
      isResponseDocument,
      confidence: hasHeaderIndicator ? 'high' : (keywordCount >= 3 ? 'high' : 'medium'),
      keywordMatches: keywordCount,
      hasHeaderIndicator
    };
  } catch (error) {
    logger.error('Error checking if document is response:', error);
    throw error;
  }
}

/**
 * Extract text from a document
 * Implementation depends on document format (PDF, image, etc.)
 * 
 * @param {Object} document - The document object
 * @returns {String} Extracted text
 */
async function extractTextFromDocument(document) {
  // This is a placeholder for document text extraction
  // In a real implementation, this would use appropriate libraries based on document type
  
  // For now, return mock text for testing
  if (document.mockText) {
    return document.mockText;
  }
  
  // Placeholder implementation - would be replaced with actual OCR or text extraction
  return "This is placeholder text for document extraction";
}

/**
 * Extract decision data from response document
 * Analyzes document to extract decision details
 * 
 * @param {Object} document - The document to analyze
 * @returns {Object} Extracted decision data
 */
async function extractDecisionData(document) {
  try {
    // Extract text from document
    const text = await extractTextFromDocument(document);
    
    // Extract decision type (approved, denied, partially approved)
    let decision = 'unknown';
    if (text.match(/approved in full|fully approved|approval granted/i)) {
      decision = 'approved';
    } else if (text.match(/partially approved|approved in part|partial approval/i)) {
      decision = 'partiallyApproved';
    } else if (text.match(/denied|not approved|appeal unsuccessful|determination: no/i)) {
      decision = 'denied';
    } else if (text.match(/approved/i)) {
      decision = 'approved'; // Default to approved if just "approved" is found
    }
    
    // Extract decision date
    let decisionDate = null;
    const dateMatch = text.match(/decision date:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) || 
                     text.match(/dated:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
    if (dateMatch && dateMatch[1]) {
      decisionDate = dateMatch[1];
    }
    
    // Extract appeal/claim identifiers
    let claimId = null;
    let appealId = null;
    const claimMatch = text.match(/claim(?:\s+id|#|:|\snumber):?\s*([a-z0-9\-]+)/i);
    const appealMatch = text.match(/appeal(?:\s+id|#|:|\snumber):?\s*([a-z0-9\-]+)/i);
    
    if (claimMatch && claimMatch[1]) {
      claimId = claimMatch[1];
    }
    
    if (appealMatch && appealMatch[1]) {
      appealId = appealMatch[1];
    }
    
    // Extract patient identifiers
    let patientId = null;
    let patientName = null;
    const patientIdMatch = text.match(/patient(?:\s+id|#|:|\snumber):?\s*([a-z0-9\-]+)/i);
    const patientNameMatch = text.match(/(?:patient|member):?\s*([a-z\s]+)(?:,|\n|$)/i);
    
    if (patientIdMatch && patientIdMatch[1]) {
      patientId = patientIdMatch[1];
    }
    
    if (patientNameMatch && patientNameMatch[1]) {
      patientName = patientNameMatch[1].trim();
    }
    
    // Extract insurance information
    let insuranceCompany = null;
    const companyMatch = text.match(/([a-z\s&]+insurance|healthcare|health\s+plan|medical)/i);
    if (companyMatch && companyMatch[1]) {
      insuranceCompany = companyMatch[1].trim();
    }
    
    // Extract amount information for partial approvals
    let approvedAmount = null;
    let deniedAmount = null;
    
    if (decision === 'partiallyApproved') {
      const approvedMatch = text.match(/approved(?:\s+amount)?:?\s*\$?([\d,]+\.\d{2})/i);
      const deniedMatch = text.match(/denied(?:\s+amount)?:?\s*\$?([\d,]+\.\d{2})/i);
      
      if (approvedMatch && approvedMatch[1]) {
        approvedAmount = approvedMatch[1].replace(/,/g, '');
      }
      
      if (deniedMatch && deniedMatch[1]) {
        deniedAmount = deniedMatch[1].replace(/,/g, '');
      }
    }
    
    // Extract reason for decision
    let reason = null;
    const reasonSection = text.match(/reason(?:\s+for\s+decision)?:?\s*([^\.]+\.)/i);
    if (reasonSection && reasonSection[1]) {
      reason = reasonSection[1].trim();
    }
    
    return {
      decision,
      decisionDate,
      claimId,
      appealId,
      patientId,
      patientName,
      insuranceCompany,
      approvedAmount,
      deniedAmount,
      reason,
      rawText: text
    };
  } catch (error) {
    logger.error('Error extracting decision data:', error);
    throw error;
  }
}

/**
 * Find appeal matching the response
 * Uses various identifiers to match response to an existing appeal
 * 
 * @param {Object} decisionData - The extracted decision data
 * @returns {Object} Matching appeal or null if no match found
 */
async function findMatchingAppeal(decisionData) {
  try {
    let matchingAppeal = null;
    let matchScore = 0;
    let potentialMatches = [];
    
    // Try to find by direct identifiers first
    if (decisionData.appealId) {
      // Try to find by extracted appeal ID
      matchingAppeal = await Appeal.findOne({
        appealId: decisionData.appealId
      });
      
      if (matchingAppeal) {
        logger.info('Found appeal match by appealId', { appealId: decisionData.appealId });
        return matchingAppeal;
      }
    }
    
    if (decisionData.claimId) {
      // Try to find by claim ID
      matchingAppeal = await Appeal.findOne({
        claimId: decisionData.claimId
      });
      
      if (matchingAppeal) {
        logger.info('Found appeal match by claimId', { claimId: decisionData.claimId });
        return matchingAppeal;
      }
    }
    
    // If no direct match, use a scoring approach with multiple fields
    let query = {};
    
    // Build a query based on available identifiers
    if (decisionData.patientId) {
      // Find patient by ID
      const patient = await Patient.findOne({ patientId: decisionData.patientId });
      if (patient) {
        query.patient = patient._id;
      }
    }
    
    if (decisionData.insuranceCompany) {
      query.insuranceCompany = { $regex: decisionData.insuranceCompany, $options: 'i' };
    }
    
    // Find potential matches
    potentialMatches = await Appeal.find(query)
      .populate('patient')
      .sort({ createdAt: -1 }) // Most recent appeals first
      .limit(10);
    
    if (potentialMatches.length === 0) {
      logger.info('No potential appeal matches found');
      return null;
    }
    
    // Score each potential match
    for (const appeal of potentialMatches) {
      let score = 0;
      
      // Check patient name if available
      if (decisionData.patientName && appeal.patient && appeal.patient.name) {
        // Simple name similarity check
        if (appeal.patient.name.toLowerCase().includes(decisionData.patientName.toLowerCase()) ||
            decisionData.patientName.toLowerCase().includes(appeal.patient.name.toLowerCase())) {
          score += 20;
        }
      }
      
      // Check insurance company
      if (decisionData.insuranceCompany && appeal.insuranceCompany) {
        if (appeal.insuranceCompany.toLowerCase().includes(decisionData.insuranceCompany.toLowerCase()) ||
            decisionData.insuranceCompany.toLowerCase().includes(appeal.insuranceCompany.toLowerCase())) {
          score += 15;
        }
      }
      
      // Check service date proximity if available
      if (decisionData.decisionDate && appeal.serviceDate) {
        const decisionDate = new Date(decisionData.decisionDate);
        const serviceDate = new Date(appeal.serviceDate);
        
        // Decision should typically come after service date
        if (decisionDate > serviceDate) {
          // Calculate days difference
          const daysDiff = Math.floor((decisionDate - serviceDate) / (1000 * 60 * 60 * 24));
          
          // Typical response times are 30-90 days
          if (daysDiff < 120) {
            // More points for more recent decisions
            score += Math.max(0, 10 - Math.floor(daysDiff / 14)); // Decreasing score as time increases
          }
        }
      }
      
      // Check appeal status - pending appeals are more likely matches
      if (appeal.status === 'pending' || appeal.status === 'submitted') {
        score += 15;
      } else if (appeal.status === 'in_progress') {
        score += 10;
      }
      
      // Update best match if this score is higher
      if (score > matchScore) {
        matchScore = score;
        matchingAppeal = appeal;
      }
    }
    
    // Return the best match if score is above threshold
    if (matchScore >= 25) {
      logger.info('Found appeal match by scoring', { score: matchScore, appealId: matchingAppeal._id });
      return matchingAppeal;
    }
    
    logger.info('No appeal match found with sufficient score', { highestScore: matchScore });
    return null;
  } catch (error) {
    logger.error('Error finding matching appeal:', error);
    throw error;
  }
}

/**
 * Update appeal with response information
 * 
 * @param {Object} appeal - The appeal to update
 * @param {Object} decisionData - The decision data
 * @returns {Object} Updated appeal
 */
async function updateAppealWithResponse(appeal, decisionData) {
  try {
    // Update appeal status based on decision
    let newStatus = '';
    
    switch (decisionData.decision) {
      case 'approved':
        newStatus = 'approved';
        break;
      case 'partiallyApproved':
        newStatus = 'approved'; // Status is approved but decision is partial
        break;
      case 'denied':
        newStatus = 'denied';
        break;
      default:
        newStatus = 'pending_review'; // If decision is unclear
    }
    
    // Update appeal with response information
    appeal.status = newStatus;
    appeal.decision = decisionData.decision;
    appeal.responseDate = decisionData.decisionDate ? new Date(decisionData.decisionDate) : new Date();
    appeal.responseDetails = {
      reason: decisionData.reason,
      approvedAmount: decisionData.approvedAmount,
      deniedAmount: decisionData.deniedAmount,
      decisionText: decisionData.rawText
    };
    
    // Calculate financial impact if possible
    if (appeal.requestedAmount) {
      if (decisionData.decision === 'approved') {
        appeal.approvedAmount = appeal.requestedAmount;
        appeal.deniedAmount = 0;
      } else if (decisionData.decision === 'partiallyApproved') {
        appeal.approvedAmount = decisionData.approvedAmount || 0;
        appeal.deniedAmount = decisionData.deniedAmount || 
          (appeal.requestedAmount - (decisionData.approvedAmount || 0));
      } else if (decisionData.decision === 'denied') {
        appeal.approvedAmount = 0;
        appeal.deniedAmount = appeal.requestedAmount;
      }
    }
    
    // Update last activity
    appeal.lastActivity = {
      date: new Date(),
      action: 'response_received',
      details: `Insurance ${decisionData.decision} appeal`
    };
    
    // Save updated appeal
    await appeal.save();
    
    // Send notification to patient if applicable
    if (appeal.patient) {
      try {
        const patient = await Patient.findById(appeal.patient);
        if (patient) {
          const message = await generatePatientMessage(
            patient,
            'appeal_decision',
            {
              appeal: appeal,
              decision: decisionData.decision,
              reason: decisionData.reason || 'Not provided'
            }
          );
          
          // In a real implementation, this would send the message
          logger.info('Generated patient message about appeal decision', { 
            patientId: patient._id,
            messageType: 'appeal_decision'
          });
        }
      } catch (err) {
        logger.error('Error sending patient notification:', err);
        // Continue processing even if notification fails
      }
    }
    
    return appeal;
  } catch (error) {
    logger.error('Error updating appeal with response:', error);
    throw error;
  }
}

/**
 * Generate next steps recommendations based on decision
 * 
 * @param {Object} appeal - The updated appeal
 * @param {Object} decisionData - The decision data
 * @returns {Object} Next steps recommendations
 */
function generateNextSteps(appeal, decisionData) {
  const nextSteps = {
    patientNextSteps: [],
    staffNextSteps: [],
    timeframe: null,
    externalReviewEligible: false
  };
  
  // Different next steps based on decision type
  switch (decisionData.decision) {
    case 'approved':
      nextSteps.patientNextSteps = [
        'No further action needed for this appeal',
        'Keep documentation of approval for your records',
        'Watch for the approved payment or service to be processed'
      ];
      
      nextSteps.staffNextSteps = [
        'Verify payment is received according to approval',
        'Update patient records to reflect successful appeal',
        'Close appeal in system once payment confirmed'
      ];
      
      nextSteps.timeframe = '30 days for payment processing';
      break;
      
    case 'partiallyApproved':
      nextSteps.patientNextSteps = [
        'Review which portions were approved and denied',
        'Consider appealing the denied portion',
        'Keep documentation of partial approval for your records'
      ];
      
      nextSteps.staffNextSteps = [
        'Analyze denied portion for potential second appeal',
        'Verify payment is received for approved portion',
        'Collect additional documentation for denied portion if pursuing further'
      ];
      
      nextSteps.timeframe = '60 days to file appeal for denied portion';
      nextSteps.externalReviewEligible = true;
      break;
      
    case 'denied':
      nextSteps.patientNextSteps = [
        'Review reason for denial',
        'Consider external review options',
        'Gather additional documentation if pursuing further appeals'
      ];
      
      nextSteps.staffNextSteps = [
        'Evaluate eligibility for external review',
        'Review denial reason to identify procedural errors',
        'Contact insurance for clarification if reason is unclear'
      ];
      
      nextSteps.timeframe = '30-60 days to file for external review';
      nextSteps.externalReviewEligible = true;
      
      // Check specific conditions that might affect external review eligibility
      if (decisionData.reason && decisionData.reason.match(/experimental|investigational|not medically necessary/i)) {
        nextSteps.externalReviewType = 'medical necessity';
      } else if (decisionData.reason && decisionData.reason.match(/not covered|excluded|benefit maximum/i)) {
        nextSteps.externalReviewType = 'benefit determination';
        nextSteps.externalReviewEligible = false; // Benefit exclusions typically not eligible
      }
      break;
      
    default:
      nextSteps.patientNextSteps = [
        'Contact AppealAid support for assistance with this response',
        'Keep all documentation related to this appeal'
      ];
      
      nextSteps.staffNextSteps = [
        'Contact insurance for clarification on decision',
        'Review response document for additional details',
        'Update appeal status once decision is clarified'
      ];
      
      nextSteps.timeframe = 'As soon as possible';
  }
  
  return nextSteps;
}

module.exports = {
  processResponseDocument,
  recordManualResponse,
  isResponseDocument,
  findMatchingAppeal,
  extractDecisionData,
  updateAppealWithResponse,
  generateNextSteps
};