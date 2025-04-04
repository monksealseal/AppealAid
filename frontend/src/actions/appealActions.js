import {
  APPEAL_LIST_REQUEST,
  APPEAL_LIST_SUCCESS,
  APPEAL_LIST_FAIL,
  APPEAL_DETAILS_REQUEST,
  APPEAL_DETAILS_SUCCESS,
  APPEAL_DETAILS_FAIL,
  APPEAL_CREATE_REQUEST,
  APPEAL_CREATE_SUCCESS,
  APPEAL_CREATE_FAIL,
  APPEAL_UPDATE_REQUEST,
  APPEAL_UPDATE_SUCCESS,
  APPEAL_UPDATE_FAIL,
  APPEAL_DELETE_REQUEST,
  APPEAL_DELETE_SUCCESS,
  APPEAL_DELETE_FAIL,
  APPEAL_SUBMIT_REQUEST,
  APPEAL_SUBMIT_SUCCESS,
  APPEAL_SUBMIT_FAIL,
} from '../constants/appealConstants';
import { setNotification } from './uiActions';
import * as appealService from '../services/appealService';

// Get all appeals
export const getAppeals = () => async (dispatch) => {
  try {
    dispatch({ type: APPEAL_LIST_REQUEST });

    const data = await appealService.getAppeals();

    dispatch({
      type: APPEAL_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: APPEAL_LIST_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
  }
};

// Get appeal details by ID
export const getAppealDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: APPEAL_DETAILS_REQUEST });

    const data = await appealService.getAppealById(id);

    dispatch({
      type: APPEAL_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: APPEAL_DETAILS_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
  }
};

// Create a new appeal
export const createAppeal = (appealData) => async (dispatch) => {
  try {
    dispatch({ type: APPEAL_CREATE_REQUEST });

    const data = await appealService.createAppeal(appealData);

    dispatch({
      type: APPEAL_CREATE_SUCCESS,
      payload: data,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Appeal created successfully',
    }));
    
    return data;
  } catch (error) {
    dispatch({
      type: APPEAL_CREATE_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
    
    throw error;
  }
};

// Update appeal
export const updateAppeal = (id, appealData) => async (dispatch) => {
  try {
    dispatch({ type: APPEAL_UPDATE_REQUEST });

    const data = await appealService.updateAppeal(id, appealData);

    dispatch({
      type: APPEAL_UPDATE_SUCCESS,
      payload: data,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Appeal updated successfully',
    }));
    
    return data;
  } catch (error) {
    dispatch({
      type: APPEAL_UPDATE_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
    
    throw error;
  }
};

// Delete appeal
export const deleteAppeal = (id) => async (dispatch) => {
  try {
    dispatch({ type: APPEAL_DELETE_REQUEST });

    await appealService.deleteAppeal(id);

    dispatch({
      type: APPEAL_DELETE_SUCCESS,
      payload: id,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Appeal deleted successfully',
    }));
  } catch (error) {
    dispatch({
      type: APPEAL_DELETE_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
  }
};

// Submit appeal
export const submitAppeal = (id, submissionData) => async (dispatch) => {
  try {
    dispatch({ type: APPEAL_SUBMIT_REQUEST });

    const data = await appealService.submitAppeal(id, submissionData);

    dispatch({
      type: APPEAL_SUBMIT_SUCCESS,
      payload: data,
    });
    
    dispatch(setNotification({
      type: 'success',
      message: 'Appeal submitted successfully',
    }));
    
    return data;
  } catch (error) {
    dispatch({
      type: APPEAL_SUBMIT_FAIL,
      payload: error.message,
    });
    
    dispatch(setNotification({
      type: 'error',
      message: error.message,
    }));
    
    throw error;
  }
};

// Generate appeal letter
export const generateAppealLetter = (documentId, templateId = null) => async (dispatch) => {
  try {
    const data = await appealService.generateAppealLetter(documentId, templateId);
    
    dispatch(setNotification({
      type: 'success',
      message: 'Appeal letter generated successfully',
    }));
    
    return data;
  } catch (error) {
    dispatch(setNotification({
      type: 'error',
      message: `Failed to generate appeal letter: ${error.message}`,
    }));
    
    throw error;
  }
};

// Download appeal letter
export const downloadAppealLetter = (id, filename) => async (dispatch) => {
  try {
    const blob = await appealService.downloadAppealLetter(id);
    
    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `appeal-letter-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    
    dispatch(setNotification({
      type: 'success',
      message: 'Appeal letter download started',
    }));
  } catch (error) {
    dispatch(setNotification({
      type: 'error',
      message: `Failed to download appeal letter: ${error.message}`,
    }));
  }
};
