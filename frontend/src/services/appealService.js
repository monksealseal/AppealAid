import apiWrapper from './apiWrapper';

// Get all appeals for the current user
export const getAppeals = async () => {
  try {
    return await apiWrapper.getAppeals();
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get a single appeal by ID
export const getAppealById = async (id) => {
  try {
    return await apiWrapper.getAppealById(id);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new appeal
export const createAppeal = async (appealData) => {
  try {
    return await apiWrapper.createAppeal(appealData);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update an appeal
export const updateAppeal = async (id, appealData) => {
  try {
    return await apiWrapper.updateAppeal(id, appealData);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete an appeal
export const deleteAppeal = async (id) => {
  try {
    return await apiWrapper.delete(`/appeals/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Submit an appeal
export const submitAppeal = async (id, submissionData) => {
  try {
    return await apiWrapper.put(`/appeals/${id}/submit`, submissionData);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Generate appeal letter
export const generateAppealLetter = async (documentId, templateId = null) => {
  try {
    return await apiWrapper.post('/appeals/generate', { 
      documentId, 
      templateId 
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Analyze a document for appeal potential
export const analyzeAppealPotential = async (documentId) => {
  try {
    return await apiWrapper.post('/appeals/analyze', { documentId });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Record the outcome of an appeal
export const recordAppealOutcome = async (id, outcomeData) => {
  try {
    return await apiWrapper.put(`/appeals/${id}/outcome`, outcomeData);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get appeal templates
export const getAppealTemplates = async (category = null) => {
  try {
    const url = category ? `/appeals/templates?category=${category}` : '/appeals/templates';
    return await apiWrapper.get(url);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Download appeal letter as PDF
export const downloadAppealLetter = async (id) => {
  try {
    // Mock implementation for static site
    const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    return blob;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  const message = 
    error.response && error.response.data.message
      ? error.response.data.message
      : error.message || 'An unexpected error occurred';
  
  return new Error(message);
};