/**
 * Peer Review Controller
 * 
 * Handles API endpoints for peer-to-peer reviews
 */

const peerReviewService = require('../services/peerReviewService');
const logger = require('../utils/logger');

/**
 * Create a new peer-to-peer review
 * 
 * @route POST /api/peer-reviews
 * @param {String} req.body.appeal - Appeal ID
 * @param {Object} req.body.insuranceReviewer - Insurance reviewer details
 * @param {Object} req.body.treatingProvider - Treating provider details
 * @param {Date} req.body.scheduledDate - Scheduled date
 * @param {String} req.body.scheduledTime - Scheduled time
 */
exports.createPeerReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await peerReviewService.createPeerReview(req.body, userId);
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error creating peer review:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating peer review',
      error: error.message
    });
  }
};

/**
 * Update a peer-to-peer review
 * 
 * @route PUT /api/peer-reviews/:id
 * @param {String} req.params.id - Peer review ID
 */
exports.updatePeerReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviewId = req.params.id;
    
    const result = await peerReviewService.updatePeerReview(reviewId, req.body, userId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error updating peer review:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating peer review',
      error: error.message
    });
  }
};

/**
 * Get a peer-to-peer review by ID
 * 
 * @route GET /api/peer-reviews/:id
 * @param {String} req.params.id - Peer review ID
 */
exports.getPeerReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const result = await peerReviewService.getPeerReviewById(reviewId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    logger.error('Error getting peer review:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting peer review',
      error: error.message
    });
  }
};

/**
 * Get peer-to-peer reviews for an appeal
 * 
 * @route GET /api/peer-reviews/appeal/:appealId
 * @param {String} req.params.appealId - Appeal ID
 */
exports.getPeerReviewsForAppeal = async (req, res) => {
  try {
    const appealId = req.params.appealId;
    const result = await peerReviewService.getPeerReviewsForAppeal(appealId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error getting peer reviews for appeal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting peer reviews for appeal',
      error: error.message
    });
  }
};

/**
 * Generate discussion points for peer-to-peer call
 * 
 * @route POST /api/peer-reviews/discussion-points
 * @param {String} req.body.appealId - Appeal ID
 */
exports.generateDiscussionPoints = async (req, res) => {
  try {
    const { appealId } = req.body;
    
    if (!appealId) {
      return res.status(400).json({
        success: false,
        message: 'Appeal ID is required'
      });
    }
    
    const result = await peerReviewService.generateDiscussionPoints(appealId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error generating discussion points:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating discussion points',
      error: error.message
    });
  }
};

/**
 * Cancel a peer-to-peer review
 * 
 * @route POST /api/peer-reviews/:id/cancel
 * @param {String} req.params.id - Peer review ID
 * @param {String} req.body.reason - Cancellation reason
 */
exports.cancelPeerReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviewId = req.params.id;
    const { reason } = req.body;
    
    const result = await peerReviewService.cancelPeerReview(reviewId, userId, reason);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error cancelling peer review:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling peer review',
      error: error.message
    });
  }
};

/**
 * Search for peer-to-peer reviews
 * 
 * @route GET /api/peer-reviews/search
 * @param {Object} req.query - Search parameters
 */
exports.searchPeerReviews = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      appeal: req.query.appeal,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      outcome: req.query.outcome,
      searchText: req.query.searchText
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await peerReviewService.searchPeerReviews(filters, page, limit);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error searching peer reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching peer reviews',
      error: error.message
    });
  }
};

module.exports = exports;