import {
  DOCUMENT_LIST_REQUEST,
  DOCUMENT_LIST_SUCCESS,
  DOCUMENT_LIST_FAIL,
  DOCUMENT_DETAILS_REQUEST,
  DOCUMENT_DETAILS_SUCCESS,
  DOCUMENT_DETAILS_FAIL,
  DOCUMENT_UPLOAD_REQUEST,
  DOCUMENT_UPLOAD_SUCCESS,
  DOCUMENT_UPLOAD_FAIL,
  DOCUMENT_DELETE_REQUEST,
  DOCUMENT_DELETE_SUCCESS,
  DOCUMENT_DELETE_FAIL,
} from '../constants/documentConstants';
import { setNotification } from './uiActions';
import * as documentService from '../services/documentService';

// Get all documents
export const getDocuments = () => async (dispatch) => {
  try {
    dispatch({ type: DOCUMENT_LIST_REQUEST });

    const data = await documentService.getDocuments();

    dispatch({
      type: DOCUMENT_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: DOCUMENT_LIST_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
  }
};

// Get document details by ID
export const getDocumentDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: DOCUMENT_DETAILS_REQUEST });

    const data = await documentService.getDocumentById(id);

    dispatch({
      type: DOCUMENT_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: DOCUMENT_DETAILS_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
  }
};

// Upload a document
export const uploadDocument = (formData) => async (dispatch) => {
  try {
    dispatch({ type: DOCUMENT_UPLOAD_REQUEST });

    const data = await documentService.uploadDocument(formData);

    dispatch({
      type: DOCUMENT_UPLOAD_SUCCESS,
      payload: data,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Document uploaded successfully',
    }));
    
    return data;
  } catch (error) {
    dispatch({
      type: DOCUMENT_UPLOAD_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
    
    throw error;
  }
};

// Update document
export const updateDocument = (id, documentData) => async (dispatch) => {
  try {
    dispatch({ type: DOCUMENT_DETAILS_REQUEST });

    const data = await documentService.updateDocument(id, documentData);

    dispatch({
      type: DOCUMENT_DETAILS_SUCCESS,
      payload: data,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Document updated successfully',
    }));
    
    return data;
  } catch (error) {
    dispatch({
      type: DOCUMENT_DETAILS_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
    
    throw error;
  }
};

// Delete document
export const deleteDocument = (id) => async (dispatch) => {
  try {
    dispatch({ type: DOCUMENT_DELETE_REQUEST });

    await documentService.deleteDocument(id);

    dispatch({
      type: DOCUMENT_DELETE_SUCCESS,
      payload: id,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Document deleted successfully',
    }));
  } catch (error) {
    dispatch({
      type: DOCUMENT_DELETE_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
  }
};

// Download document
export const downloadDocument = (id, filename) => async (dispatch) => {
  try {
    const blob = await documentService.downloadDocument(id);
    
    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    
    dispatch(setNotification({
      type: 'success',
      message: 'Document download started',
    }));
  } catch (error) {
    dispatch(setNotification({
      type: 'error',
      message: `Failed to download document: ${error.message}`,
    }));
  }
};
