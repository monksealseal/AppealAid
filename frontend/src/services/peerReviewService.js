import apiWrapper from './apiWrapper';

// Peer Review Service
const peerReviewService = {
  // Get peer reviews for an appeal
  getPeerReviewsForAppeal: async (appealId) => {
    return apiWrapper.getPeerReviewsByAppeal(appealId);
  },
  
  // Create a new peer review
  createPeerReview: async (data) => {
    return apiWrapper.createPeerReview(data);
  },
  
  // Generate discussion points
  generateDiscussionPoints: async (appealId) => {
    return apiWrapper.generateDiscussionPoints(appealId);
  },
  
  // Update a peer review
  updatePeerReview: async (reviewId, data) => {
    return apiWrapper.put(`/peer-reviews/${reviewId}`, data);
  },
  
  // Cancel a peer review
  cancelPeerReview: async (reviewId, reason) => {
    return apiWrapper.post(`/peer-reviews/${reviewId}/cancel`, { reason });
  }
};

export default peerReviewService;