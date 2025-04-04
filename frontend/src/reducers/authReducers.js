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
  USER_UPDATE_PROFILE_RESET,
  USER_UPDATE_CONSENT_REQUEST,
  USER_UPDATE_CONSENT_SUCCESS,
  USER_UPDATE_CONSENT_FAIL,
} from '../constants/authConstants';

export const authReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
    case USER_REGISTER_REQUEST:
    case USER_UPDATE_PROFILE_REQUEST:
    case USER_UPDATE_CONSENT_REQUEST:
      return { ...state, loading: true };
    
    case USER_LOGIN_SUCCESS:
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
      };
      
    case USER_UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        success: true,
      };
      
    case USER_UPDATE_CONSENT_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: {
          ...state.userInfo,
          consents: action.payload.consents,
        },
        success: true,
      };
      
    case USER_LOGIN_FAIL:
    case USER_REGISTER_FAIL:
    case USER_UPDATE_PROFILE_FAIL:
    case USER_UPDATE_CONSENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      
    case USER_LOGOUT:
      return { userInfo: null };
      
    case USER_UPDATE_PROFILE_RESET:
      return {
        ...state,
        success: false,
      };

    default:
      return state;
  }
};