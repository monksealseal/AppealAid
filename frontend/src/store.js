import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import { authReducer } from './reducers/authReducers';
import { documentReducer, documentDetailReducer, documentUploadReducer } from './reducers/documentReducers';
import { appealReducer, appealDetailReducer, appealCreateReducer, appealSubmitReducer } from './reducers/appealReducers';
import { uiReducer } from './reducers/uiReducers';

// Use Redux DevTools Extension if available, otherwise use compose
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Combine reducers
const reducer = combineReducers({
  auth: authReducer,
  documentList: documentReducer,
  documentDetail: documentDetailReducer,
  documentUpload: documentUploadReducer,
  appealList: appealReducer,
  appealDetail: appealDetailReducer,
  appealCreate: appealCreateReducer,
  appealSubmit: appealSubmitReducer,
  ui: uiReducer,
});

// Initial state
const initialState = {
  auth: {
    userInfo: localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null,
    loading: false,
    error: null,
  },
};

// Middleware
const middleware = [thunk];

// Create store
const store = createStore(
  reducer,
  initialState,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;