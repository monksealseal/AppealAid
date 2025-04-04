/**
 * Demo Account Service
 * 
 * This service provides functionality for instant demo accounts
 * to simplify the onboarding process for users trying out AppealAid.
 */

import apiWrapper from './apiWrapper';

// Create a demo account without needing email verification
export const createDemoAccount = async () => {
  try {
    // Generate random username to avoid conflicts
    const randomId = Math.floor(Math.random() * 100000);
    
    // Demo account data
    const demoUser = {
      email: `demo${randomId}@appealaid.example.com`,
      password: 'demopassword123',
      firstName: 'Demo',
      lastName: 'User',
      phone: '555-123-4567',
      dateOfBirth: '1980-01-01',
      insuranceInfo: {
        provider: 'Demo Insurance Co.',
        memberId: `DEMO-${randomId}`,
        groupNumber: 'DEMO-GROUP-123'
      }
    };
    
    // Register the demo account
    const response = await apiWrapper.register(demoUser);
    
    // Save demo account info to localStorage
    localStorage.setItem('demoUser', JSON.stringify({
      email: demoUser.email,
      password: demoUser.password
    }));
    
    return response;
  } catch (error) {
    console.error('Error creating demo account:', error);
    throw error;
  }
};

// Log in with demo account
export const loginWithDemoAccount = async () => {
  try {
    // Try to get saved demo credentials
    const savedDemoUser = localStorage.getItem('demoUser');
    
    if (!savedDemoUser) {
      // If no saved demo account, create a new one and log in with it
      const newUser = await createDemoAccount();
      return newUser;
    }
    
    // Otherwise log in with saved credentials
    const { email, password } = JSON.parse(savedDemoUser);
    const response = await apiWrapper.login(email, password);
    
    return response;
  } catch (error) {
    console.error('Error logging in with demo account:', error);
    
    // If login fails (e.g., demo account expired), create a new one
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('demoUser');
      return createDemoAccount();
    }
    
    throw error;
  }
};

export default {
  createDemoAccount,
  loginWithDemoAccount
};