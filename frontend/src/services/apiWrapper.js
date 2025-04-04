/**
 * API Wrapper Service
 * Routes API calls to either the real backend or mock service based on configuration
 */

import api from './api';
import mockApiService from './mockApiService';
import config from '../utils/config';

const apiWrapper = {
  // Generic API methods
  get: async (url, params = {}) => {
    if (config.api.useMockApi) {
      console.log(`Mock API GET: ${url}`);
      
      // Maps endpoints to mock service methods
      if (url.match(/\/appeals\/[\w-]+$/)) {
        const id = url.split('/').pop();
        return mockApiService.getAppealById(id);
      } else if (url === '/appeals') {
        return mockApiService.getAppeals();
      } else if (url.match(/\/documents\/[\w-]+$/)) {
        const id = url.split('/').pop();
        return mockApiService.getDocumentById(id);
      } else if (url === '/documents') {
        return mockApiService.getDocuments();
      } else if (url.match(/\/peer-reviews\/appeal\/[\w-]+$/)) {
        const id = url.split('/').pop();
        return mockApiService.getPeerReviewByAppeal(id);
      } else if (url === '/peer-reviews') {
        return mockApiService.getPeerReviews();
      } else if (url === '/users/profile') {
        return {
          success: true,
          _id: 'user1',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          role: 'patient',
          insuranceInfo: {
            provider: 'Blue Cross Blue Shield',
            memberId: 'BCBS12345678',
            groupNumber: 'GROUP123'
          }
        };
      }
      
      throw new Error(`Mock API GET not implemented for ${url}`);
    }
    
    // Use real API
    const response = await api.get(url, { params });
    return response.data;
  },
  
  post: async (url, data) => {
    if (config.api.useMockApi) {
      console.log(`Mock API POST: ${url}`);
      
      if (url === '/users/login') {
        return mockApiService.login(data.email, data.password);
      } else if (url === '/users') {
        return mockApiService.register(data);
      } else if (url === '/appeals') {
        return mockApiService.createAppeal(data);
      } else if (url === '/documents/upload') {
        return mockApiService.uploadDocument(data);
      } else if (url === '/peer-reviews') {
        return mockApiService.createPeerReview(data);
      } else if (url === '/peer-reviews/discussion-points') {
        return mockApiService.generateDiscussionPoints(data.appealId);
      }
      
      throw new Error(`Mock API POST not implemented for ${url}`);
    }
    
    // Use real API
    const response = await api.post(url, data);
    return response.data;
  },
  
  put: async (url, data) => {
    if (config.api.useMockApi) {
      console.log(`Mock API PUT: ${url}`);
      
      if (url.match(/\/appeals\/[\w-]+$/)) {
        const id = url.split('/').pop();
        return mockApiService.updateAppeal(id, data);
      } else if (url.match(/\/peer-reviews\/[\w-]+$/)) {
        const id = url.split('/').pop();
        return mockApiService.updatePeerReview(id, data);
      }
      
      throw new Error(`Mock API PUT not implemented for ${url}`);
    }
    
    // Use real API
    const response = await api.put(url, data);
    return response.data;
  },
  
  delete: async (url) => {
    if (config.api.useMockApi) {
      console.log(`Mock API DELETE: ${url}`);
      throw new Error(`Mock API DELETE not implemented for ${url}`);
    }
    
    // Use real API
    const response = await api.delete(url);
    return response.data;
  },
  
  // Auth specific methods
  login: async (email, password) => {
    return apiWrapper.post('/users/login', { email, password });
  },
  
  register: async (userData) => {
    return apiWrapper.post('/users', userData);
  },
  
  // Appeal methods
  getAppeals: async () => {
    return apiWrapper.get('/appeals');
  },
  
  getAppealById: async (id) => {
    return apiWrapper.get(`/appeals/${id}`);
  },
  
  createAppeal: async (appealData) => {
    return apiWrapper.post('/appeals', appealData);
  },
  
  updateAppeal: async (id, appealData) => {
    return apiWrapper.put(`/appeals/${id}`, appealData);
  },
  
  // Document methods
  getDocuments: async () => {
    return apiWrapper.get('/documents');
  },
  
  getDocumentById: async (id) => {
    return apiWrapper.get(`/documents/${id}`);
  },
  
  uploadDocument: async (formData) => {
    return apiWrapper.post('/documents/upload', formData);
  },
  
  // Peer Review methods
  getPeerReviews: async () => {
    return apiWrapper.get('/peer-reviews');
  },
  
  getPeerReviewsByAppeal: async (appealId) => {
    return apiWrapper.get(`/peer-reviews/appeal/${appealId}`);
  },
  
  createPeerReview: async (reviewData) => {
    return apiWrapper.post('/peer-reviews', reviewData);
  },
  
  generateDiscussionPoints: async (appealId) => {
    return apiWrapper.post('/peer-reviews/discussion-points', { appealId });
  }
};

export default apiWrapper;