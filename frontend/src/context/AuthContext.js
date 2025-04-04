import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiWrapper from '../services/apiWrapper';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const userInfoFromStorage = localStorage.getItem('userInfo');
        
        if (userInfoFromStorage) {
          const userInfo = JSON.parse(userInfoFromStorage);
          
          // Set auth token on axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
          
          setUser(userInfo);
        }
      } catch (error) {
        // If there's an error with stored data, clear it
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiWrapper.login(email, password);
      
      // Save user data
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set auth token on axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data);
      navigate('/');
      
      return data;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Invalid email or password';
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiWrapper.register(userData);
      
      // Save user data
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set auth token on axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data);
      navigate('/');
      
      return data;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Registration failed';
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiWrapper.put('/users/profile', userData);
      
      // Update stored user data
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return data;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Profile update failed';
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  // Update consent settings
  const updateConsent = async (consentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiWrapper.put('/users/consent', consentData);
      
      // Update stored user data with new consent information
      const updatedUser = { 
        ...user, 
        consents: data.consents 
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return data;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Consent update failed';
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updateConsent,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;