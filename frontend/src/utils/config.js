/**
 * Application configuration 
 */

// Environment configuration
const config = {
  // API settings
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    useMockApi: true, // Always use mock API for GitHub Pages deployment
  },
  
  // Authentication settings
  auth: {
    tokenKey: 'userInfo',
    tokenExpiry: 8 * 60 * 60 * 1000, // 8 hours
  },
  
  // Feature flags
  features: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' || false,
    enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true' || true,
    showDebugInfo: process.env.NODE_ENV === 'development',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'doc', 'docx'],
  },
  
  // Demo/Test settings
  demo: {
    enableDemoMode: process.env.REACT_APP_DEMO_MODE === 'true' || false,
    demoUserEmail: 'demo@appealaid.com',
    demoUserPassword: 'demo123',
  }
};

export default config;