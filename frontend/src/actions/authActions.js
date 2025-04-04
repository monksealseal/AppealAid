import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_CONSENT_REQUEST,
  USER_UPDATE_CONSENT_SUCCESS,
  USER_UPDATE_CONSENT_FAIL,
} from '../constants/authConstants';
import api from '../services/api';

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    const { data } = await api.post('/users/login', { email, password });

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch({
      type: USER_REGISTER_REQUEST,
    });

    const { data } = await api.post('/users', userData);

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    });

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Logout user
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch({ type: USER_LOGOUT });
  // Optional: Reset other states when user logs out
  // dispatch({ type: USER_DETAILS_RESET });
  // window.location.href = '/login';
};

// Update user profile
export const updateUserProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_PROFILE_REQUEST,
    });

    const { data } = await api.put('/users/profile', userData);

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: {
        ...getState().auth.userInfo,
        ...data,
      },
    });

    // Update localStorage with new userInfo
    localStorage.setItem(
      'userInfo',
      JSON.stringify({
        ...getState().auth.userInfo,
        ...data,
      })
    );
  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update consent settings
export const updateConsent = (consentData) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_CONSENT_REQUEST,
    });

    const { data } = await api.put('/users/consent', consentData);

    dispatch({
      type: USER_UPDATE_CONSENT_SUCCESS,
      payload: data,
    });

    // Update localStorage with new consent information
    const updatedUserInfo = {
      ...getState().auth.userInfo,
      consents: data.consents,
    };
    
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
  } catch (error) {
    dispatch({
      type: USER_UPDATE_CONSENT_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
