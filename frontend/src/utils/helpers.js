/**
 * Utility functions for the application
 */

// Format date to display in UI
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
};

// Format currency values
export const formatCurrency = (amount, options = {}) => {
  if (amount === undefined || amount === null) return '';
  
  const defaultOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };
  
  return new Intl.NumberFormat('en-US', defaultOptions).format(amount);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Calculate time ago for dates
export const timeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// Get file extension from filename
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

// Convert bytes to human-readable file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get appeal status color
export const getAppealStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusMap = {
    'Draft': 'default',
    'Submitted': 'info',
    'In Review': 'primary',
    'Pending Information': 'warning',
    'Accepted': 'success',
    'Partially Accepted': 'success',
    'Denied': 'error',
    'Appealing': 'warning',
    'Closed': 'default'
  };
  
  return statusMap[status] || 'default';
};

// Get document type icon
export const getDocumentTypeIcon = (type) => {
  if (!type) return 'Description';
  
  const typeMap = {
    'Explanation of Benefits': 'Receipt',
    'Denial Letter': 'ReceiptLong',
    'Medical Report': 'MedicalServices',
    'Lab Results': 'Science',
    'Insurance Card': 'CardMembership',
    'Prescription': 'Medication',
    'Medical Bill': 'RequestQuote',
    'Prior Authorization': 'Gavel',
    'Referral': 'Share'
  };
  
  return typeMap[type] || 'Description';
};

// Generate a random ID (for testing/mocking)
export const generateId = (prefix = '') => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
};