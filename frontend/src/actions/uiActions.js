import {
  UI_SET_NOTIFICATION,
  UI_CLEAR_NOTIFICATION,
  UI_SET_LOADING,
  UI_CLEAR_LOADING,
} from '../constants/uiConstants';

// Set notification
export const setNotification = (notification) => (dispatch) => {
  dispatch({
    type: UI_SET_NOTIFICATION,
    payload: notification,
  });
  
  // Auto-clear notification after 5 seconds
  setTimeout(() => {
    dispatch(clearNotification());
  }, 5000);
};

// Clear notification
export const clearNotification = () => ({
  type: UI_CLEAR_NOTIFICATION,
});

// Set loading state
export const setLoading = (message = '') => ({
  type: UI_SET_LOADING,
  payload: message,
});

// Clear loading state
export const clearLoading = () => ({
  type: UI_CLEAR_LOADING,
});
