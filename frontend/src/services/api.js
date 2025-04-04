import axios from 'axios';
import config from '../utils/config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (requestConfig) => {
    const userInfo = localStorage.getItem(config.auth.tokenKey);
    
    if (userInfo) {
      const token = JSON.parse(userInfo).token;
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(config.auth.tokenKey);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;