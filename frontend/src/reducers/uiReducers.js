import {
  UI_SET_NOTIFICATION,
  UI_CLEAR_NOTIFICATION,
  UI_SET_LOADING,
  UI_CLEAR_LOADING,
} from '../constants/uiConstants';

const initialState = {
  notification: null,
  loading: false,
  loadingMessage: '',
};

export const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case UI_SET_NOTIFICATION:
      return {
        ...state,
        notification: {
          type: action.payload.type, // 'success', 'error', 'info', 'warning'
          message: action.payload.message,
        },
      };
      
    case UI_CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: null,
      };
      
    case UI_SET_LOADING:
      return {
        ...state,
        loading: true,
        loadingMessage: action.payload || '',
      };
      
    case UI_CLEAR_LOADING:
      return {
        ...state,
        loading: false,
        loadingMessage: '',
      };
      
    default:
      return state;
  }
};
