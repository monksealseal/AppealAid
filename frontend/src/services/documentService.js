import apiWrapper from './apiWrapper';

// Get all documents for the current user
export const getDocuments = async () => {
  try {
    return await apiWrapper.getDocuments();
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get a single document by ID
export const getDocumentById = async (id) => {
  try {
    return await apiWrapper.getDocumentById(id);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Upload a new document
export const uploadDocument = async (formData) => {
  try {
    return await apiWrapper.uploadDocument(formData);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update document metadata
export const updateDocument = async (id, data) => {
  try {
    return await apiWrapper.put(`/documents/${id}`, data);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a document
export const deleteDocument = async (id) => {
  try {
    return await apiWrapper.delete(`/documents/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Download document file
export const downloadDocument = async (id) => {
  try {
    // Mock implementation for static site
    const blob = new Blob(['Mock Document Content'], { type: 'application/pdf' });
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