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
  APPEAL_CREATE_RESET,
  APPEAL_UPDATE_REQUEST,
  APPEAL_UPDATE_SUCCESS,
  APPEAL_UPDATE_FAIL,
  APPEAL_UPDATE_RESET,
  APPEAL_DELETE_REQUEST,
  APPEAL_DELETE_SUCCESS,
  APPEAL_DELETE_FAIL,
  APPEAL_SUBMIT_REQUEST,
  APPEAL_SUBMIT_SUCCESS,
  APPEAL_SUBMIT_FAIL,
  APPEAL_SUBMIT_RESET,
} from '../constants/appealConstants';

export const appealReducer = (state = { appeals: [] }, action) => {
  switch (action.type) {
    case APPEAL_LIST_REQUEST:
      return { loading: true, appeals: [] };
    case APPEAL_LIST_SUCCESS:
      return { loading: false, appeals: action.payload };
    case APPEAL_LIST_FAIL:
      return { loading: false, error: action.payload };
    case APPEAL_DELETE_SUCCESS:
      return {
        ...state,
        appeals: state.appeals.filter(appeal => appeal.id !== action.payload),
      };
    default:
      return state;
  }
};

export const appealDetailReducer = (state = { appeal: {} }, action) => {
  switch (action.type) {
    case APPEAL_DETAILS_REQUEST:
    case APPEAL_UPDATE_REQUEST:
    case APPEAL_SUBMIT_REQUEST:
    case APPEAL_DELETE_REQUEST:
      return { ...state, loading: true };
      
    case APPEAL_DETAILS_SUCCESS:
      return { loading: false, appeal: action.payload };
      
    case APPEAL_UPDATE_SUCCESS:
      return { loading: false, success: true, appeal: action.payload };
      
    case APPEAL_SUBMIT_SUCCESS:
      return { 
        loading: false, 
        success: true, 
        appeal: { ...state.appeal, status: 'Submitted', submittedDate: new Date().toISOString() } 
      };
      
    case APPEAL_DELETE_SUCCESS:
      return { loading: false, success: true };
      
    case APPEAL_DETAILS_FAIL:
    case APPEAL_UPDATE_FAIL:
    case APPEAL_SUBMIT_FAIL:
    case APPEAL_DELETE_FAIL:
      return { loading: false, error: action.payload };
      
    case APPEAL_UPDATE_RESET:
    case APPEAL_SUBMIT_RESET:
      return { appeal: state.appeal };
      
    default:
      return state;
  }
};

export const appealCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case APPEAL_CREATE_REQUEST:
      return { loading: true };
    case APPEAL_CREATE_SUCCESS:
      return { loading: false, success: true, appeal: action.payload };
    case APPEAL_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case APPEAL_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const appealSubmitReducer = (state = {}, action) => {
  switch (action.type) {
    case APPEAL_SUBMIT_REQUEST:
      return { loading: true };
    case APPEAL_SUBMIT_SUCCESS:
      return { loading: false, success: true, appeal: action.payload };
    case APPEAL_SUBMIT_FAIL:
      return { loading: false, error: action.payload };
    case APPEAL_SUBMIT_RESET:
      return {};
    default:
      return state;
  }
};
