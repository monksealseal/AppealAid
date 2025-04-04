/**
 * Protected Route Component
 * 
 * Wrapper component that checks for authentication and redirects to login if needed
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// For demo purposes, we'll consider the user always authenticated in mock mode
const ProtectedRoute = ({ children }) => {
  // Check if mock mode is enabled
  const isMockMode = true; // In a real app, this would check process.env or similar
  
  // In a real app, this would check for an auth token or similar
  const isAuthenticated = isMockMode ? true : localStorage.getItem('authToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children ? children : <Outlet />;
};

export default ProtectedRoute;