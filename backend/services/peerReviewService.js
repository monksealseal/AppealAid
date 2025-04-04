/**
 * Peer-to-Peer Review Service
 * 
 * Service for managing peer-to-peer review sessions between treating
 * providers and insurance company medical reviewers
 */

const mongoose = require('mongoose');
const PeerReview = require('../models/peerReviewModel');
const Appeal = require('../models/appealModel');
const logger = require('../utils/logger');

/**
 * Create a new peer-to-peer review session
 * 
 * @param {Object} data - Peer review data
 * @param {String} userId - ID of user creating the review
 * @returns {Object} The created peer review session
 */
async function createPeerReview(data, userId) {
  try {
    logger.info('Creating peer-to-peer review', { appealId: data.appeal });
    
    // Validate appeal exists
    const appeal = await Appeal.findById(data.appeal);
    if (!appeal) {
      return {
        success: false,
        message: `No appeal found with ID ${data.appeal}`
      };
    }
    
    // Create peer review record
    const peerReview = new PeerReview({
      ...data,
      status: 'pending',
      createdBy: userId,
      updatedBy: userId
    });
    
    await peerReview.save();
    
    // Update appeal with last activity
    appeal.lastActivity = {
      date: new Date(),
      action: 'peer_review_scheduled',
      details: `Peer-to-peer review scheduled with ${data.insuranceReviewer?.name || 'insurance reviewer'}`
    };
    await appeal.save();
    
    return {
      success: true,
      peerReview,
      message: 'Peer-to-peer review created successfully'
    };
  } catch (error) {
    logger.error('Error creating peer-to-peer review:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update an existing peer-to-peer review
 * 
 * @param {String} reviewId - ID of the peer review to update
 * @param {Object} data - Updated peer review data
 * @param {String} userId - ID of user updating the review
 * @returns {Object} The updated peer review session
 */
async function updatePeerReview(reviewId, data, userId) {
  try {
    logger.info('Updating peer-to-peer review', { reviewId });
    
    // Find the peer review
    const peerReview = await PeerReview.findById(reviewId);
    if (!peerReview) {
      return {
        success: false,
        message: `No peer review found with ID ${reviewId}`
      };
    }
    
    // Update fields
    Object.keys(data).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        peerReview[key] = data[key];
      }
    });
    
    peerReview.updatedBy = userId;
    await peerReview.save();
    
    // Update appeal if status changed to completed
    if (data.status === 'completed' && peerReview.status !== 'completed') {
      const appeal = await Appeal.findById(peerReview.appeal);
      if (appeal) {
        appeal.lastActivity = {
          date: new Date(),
          action: 'peer_review_completed',
          details: `Peer-to-peer review completed with outcome: ${data.outcome || 'unknown'}`
        };
        
        // Update appeal status based on outcome
        if (data.outcome === 'approved') {
          appeal.status = 'approved';
          appeal.decision = 'approved';
        } else if (data.outcome === 'partially_approved') {
          appeal.status = 'approved';
          appeal.decision = 'partiallyApproved';
        } else if (data.outcome === 'denied') {
          appeal.status = 'denied';
          appeal.decision = 'denied';
        }
        
        await appeal.save();
      }
    }
    
    return {
      success: true,
      peerReview,
      message: 'Peer-to-peer review updated successfully'
    };
  } catch (error) {
    logger.error('Error updating peer-to-peer review:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get a peer-to-peer review by ID
 * 
 * @param {String} reviewId - ID of the peer review
 * @returns {Object} The peer review
 */
async function getPeerReviewById(reviewId) {
  try {
    logger.info('Getting peer-to-peer review by ID', { reviewId });
    
    const peerReview = await PeerReview.findById(reviewId)
      .populate('appeal', 'claimId serviceName serviceDate insuranceCompany status');
    
    if (!peerReview) {
      return {
        success: false,
        message: `No peer review found with ID ${reviewId}`
      };
    }
    
    return {
      success: true,
      peerReview
    };
  } catch (error) {
    logger.error('Error getting peer-to-peer review:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get peer-to-peer reviews for an appeal
 * 
 * @param {String} appealId - ID of the appeal
 * @returns {Object} The peer reviews
 */
async function getPeerReviewsForAppeal(appealId) {
  try {
    logger.info('Getting peer-to-peer reviews for appeal', { appealId });
    
    const peerReviews = await PeerReview.find({ appeal: appealId })
      .sort({ createdAt: -1 });
    
    return {
      success: true,
      peerReviews
    };
  } catch (error) {
    logger.error('Error getting peer-to-peer reviews for appeal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate discussion points for peer-to-peer call based on clinical data
 * 
 * @param {String} appealId - ID of the appeal
 * @returns {Object} Generated discussion points
 */
async function generateDiscussionPoints(appealId) {
  try {
    logger.info('Generating discussion points for peer-to-peer call', { appealId });
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return {
        success: false,
        message: `No appeal found with ID ${appealId}`
      };
    }
    
    // Check if we have clinical data
    if (!appeal.clinicalData || Object.keys(appeal.clinicalData).length === 0) {
      return {
        success: false,
        message: 'No clinical data available for discussion point generation'
      };
    }
    
    // In a real implementation, this would use AI/ML to generate
    // relevant discussion points based on the appeal and clinical data
    
    // For now, generate template discussion points
    const discussionPoints = [];
    
    // Add diagnosis-based points
    if (appeal.clinicalData.diagnoses && appeal.clinicalData.diagnoses.length > 0) {
      discussionPoints.push({
        topic: 'Primary Diagnosis and Clinical Presentation',
        notes: `Discuss the primary diagnosis of ${appeal.clinicalData.diagnoses[0].description} and how it affects the patient's condition and necessitates the requested treatment.`
      });
    }
    
    // Add medication-based points
    if (appeal.clinicalData.medications && appeal.clinicalData.medications.length > 0) {
      discussionPoints.push({
        topic: 'Current Treatment Regimen',
        notes: `Discuss the current medication regimen including ${appeal.clinicalData.medications.map(m => m.name).join(', ')} and why the requested service/treatment is the appropriate next step.`
      });
    }
    
    // Add lab-based points
    if (appeal.clinicalData.labs && appeal.clinicalData.labs.length > 0) {
      const abnormalResults = appeal.clinicalData.labs.flatMap(lab => 
        lab.results.filter(result => result.flag === 'High' || result.flag === 'Low' || result.flag === 'Critical')
      );
      
      if (abnormalResults.length > 0) {
        discussionPoints.push({
          topic: 'Significant Laboratory Findings',
          notes: `Highlight the significance of abnormal lab values including ${abnormalResults.map(r => r.name).join(', ')} and how they support the medical necessity of the requested service.`
        });
      }
    }
    
    // Add standard points
    discussionPoints.push({
      topic: 'Treatment Guidelines Compliance',
      notes: 'Discuss how the requested treatment aligns with current clinical guidelines and standards of care for this condition.'
    });
    
    discussionPoints.push({
      topic: 'Previous Treatments and Outcomes',
      notes: 'Review previous treatments attempted, outcomes, and why they were insufficient or inappropriate for this patient.'
    });
    
    discussionPoints.push({
      topic: 'Patient-Specific Factors',
      notes: 'Highlight any patient-specific factors (comorbidities, allergies, contraindications to alternatives) that support the medical necessity of the requested service.'
    });
    
    // If the treatment was denied, add a point addressing the stated reason
    if (appeal.responseDetails && appeal.responseDetails.reason) {
      discussionPoints.push({
        topic: 'Addressing Denial Reason',
        notes: `Specifically address the stated denial reason: "${appeal.responseDetails.reason}" and present clinical evidence to refute this rationale.`
      });
    }
    
    // Generate key medical points
    const keyMedicalPoints = [];
    
    // Add primary diagnosis
    if (appeal.clinicalData.diagnoses && appeal.clinicalData.diagnoses.length > 0) {
      keyMedicalPoints.push(`Primary diagnosis: ${appeal.clinicalData.diagnoses[0].description} (${appeal.clinicalData.diagnoses[0].code || 'No code'})`);
    }
    
    // Add comorbidities
    if (appeal.clinicalData.diagnoses && appeal.clinicalData.diagnoses.length > 1) {
      keyMedicalPoints.push(`Relevant comorbidities: ${appeal.clinicalData.diagnoses.slice(1).map(d => d.description).join(', ')}`);
    }
    
    // Add abnormal labs
    if (abnormalResults && abnormalResults.length > 0) {
      keyMedicalPoints.push(`Abnormal lab values: ${abnormalResults.map(r => `${r.name}: ${r.value} ${r.unit} (${r.flag})`).join(', ')}`);
    }
    
    // Add current medications
    if (appeal.clinicalData.medications && appeal.clinicalData.medications.length > 0) {
      keyMedicalPoints.push(`Current medications: ${appeal.clinicalData.medications.map(m => `${m.name} ${m.dosage}`).join(', ')}`);
    }
    
    // Add any functional limitations from clinical summary
    if (appeal.clinicalSummary && appeal.clinicalSummary.functionalStatus && appeal.clinicalSummary.functionalStatus.mobility) {
      keyMedicalPoints.push(`Functional status: ${appeal.clinicalSummary.functionalStatus.mobility}`);
    }
    
    // Mock relevant guidelines based on clinical data
    const relevantGuidelines = [];
    
    // Example guidelines based on common conditions
    if (appeal.clinicalData.diagnoses && appeal.clinicalData.diagnoses.some(d => d.code?.startsWith('I') || d.description?.toLowerCase().includes('heart'))) {
      relevantGuidelines.push({
        title: 'AHA/ACC Guidelines for the Management of Heart Failure',
        source: 'American Heart Association',
        link: 'https://professional.heart.org/en/guidelines-and-statements',
        notes: 'Supports the use of comprehensive rehab programs for heart failure patients.'
      });
    }
    
    if (appeal.clinicalData.diagnoses && appeal.clinicalData.diagnoses.some(d => d.code?.startsWith('M') || d.description?.toLowerCase().includes('joint'))) {
      relevantGuidelines.push({
        title: 'ACR Guidelines for the Management of Osteoarthritis',
        source: 'American College of Rheumatology',
        link: 'https://www.rheumatology.org/practice-quality/clinical-support/clinical-practice-guidelines',
        notes: 'Recommends a multi-modal approach including physical therapy and appropriate pain management.'
      });
    }
    
    return {
      success: true,
      discussionPoints,
      keyMedicalPoints,
      relevantGuidelines,
      message: 'Discussion points generated successfully'
    };
  } catch (error) {
    logger.error('Error generating discussion points:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel a peer-to-peer review
 * 
 * @param {String} reviewId - ID of the peer review to cancel
 * @param {String} userId - ID of user cancelling the review
 * @param {String} reason - Reason for cancellation
 * @returns {Object} The cancelled peer review
 */
async function cancelPeerReview(reviewId, userId, reason) {
  try {
    logger.info('Cancelling peer-to-peer review', { reviewId });
    
    // Find the peer review
    const peerReview = await PeerReview.findById(reviewId);
    if (!peerReview) {
      return {
        success: false,
        message: `No peer review found with ID ${reviewId}`
      };
    }
    
    // Update status and add cancellation reason
    peerReview.status = 'cancelled';
    peerReview.outcomeNotes = reason || 'No reason provided';
    peerReview.updatedBy = userId;
    await peerReview.save();
    
    // Update appeal
    const appeal = await Appeal.findById(peerReview.appeal);
    if (appeal) {
      appeal.lastActivity = {
        date: new Date(),
        action: 'peer_review_cancelled',
        details: `Peer-to-peer review cancelled. Reason: ${reason || 'Not specified'}`
      };
      await appeal.save();
    }
    
    return {
      success: true,
      peerReview,
      message: 'Peer-to-peer review cancelled successfully'
    };
  } catch (error) {
    logger.error('Error cancelling peer-to-peer review:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search for peer-to-peer reviews
 * 
 * @param {Object} filters - Search filters
 * @param {Number} page - Page number
 * @param {Number} limit - Results per page
 * @returns {Object} Filtered peer reviews
 */
async function searchPeerReviews(filters, page = 1, limit = 10) {
  try {
    logger.info('Searching peer-to-peer reviews', { filters });
    
    const query = {};
    
    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.appeal) {
      query.appeal = filters.appeal;
    }
    
    if (filters.startDate && filters.endDate) {
      query.scheduledDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    } else if (filters.startDate) {
      query.scheduledDate = { $gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
      query.scheduledDate = { $lte: new Date(filters.endDate) };
    }
    
    if (filters.outcome) {
      query.outcome = filters.outcome;
    }
    
    if (filters.searchText) {
      query.$text = { $search: filters.searchText };
    }
    
    // Count total matches
    const total = await PeerReview.countDocuments(query);
    
    // Get paginated results
    const skip = (page - 1) * limit;
    const peerReviews = await PeerReview.find(query)
      .populate('appeal', 'claimId serviceName serviceDate insuranceCompany status')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      success: true,
      peerReviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error searching peer-to-peer reviews:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createPeerReview,
  updatePeerReview,
  getPeerReviewById,
  getPeerReviewsForAppeal,
  generateDiscussionPoints,
  cancelPeerReview,
  searchPeerReviews
};