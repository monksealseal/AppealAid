/**
 * Form validation utility functions
 */

// Email validation
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Password validation (minimum 8 characters, at least one letter and number)
export const isValidPassword = (password) => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
};

// Phone number validation (US format)
export const isValidPhone = (phone) => {
  const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return re.test(phone);
};

// Zip code validation (US format)
export const isValidZipCode = (zipCode) => {
  const re = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  return re.test(zipCode);
};

// Name validation (letters, spaces, hyphens, apostrophes)
export const isValidName = (name) => {
  const re = /^[a-zA-Z\s'-]+$/;
  return re.test(name);
};

// File size validation
export const isValidFileSize = (fileSize, maxSize = 10 * 1024 * 1024) => {
  return fileSize <= maxSize;
};

// File type validation
export const isValidFileType = (fileType, allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']) => {
  return allowedTypes.includes(fileType);
};

// Validate file extension
export const isValidFileExtension = (fileName, allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

// Required field validation
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
};

// Length validation
export const validateLength = (value, min = 0, max = Infinity) => {
  if (!value) return min === 0;
  return value.length >= min && value.length <= max;
};

// Fax number validation
export const isValidFaxNumber = (faxNumber) => {
  // Similar to phone validation
  const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return re.test(faxNumber);
};

// Simple URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Appeal form validation
export const validateAppealForm = (appeal, step) => {
  const errors = {};
  
  if (step === 0 || step === undefined) {
    if (!appeal.documentId) {
      errors.documentId = 'Please select a document';
    }
  }
  
  if (step === 1 || step === undefined) {
    if (!isRequired(appeal.title)) {
      errors.title = 'Appeal title is required';
    } else if (!validateLength(appeal.title, 5, 100)) {
      errors.title = 'Appeal title must be between 5 and 100 characters';
    }
    
    if (!isRequired(appeal.denialReason)) {
      errors.denialReason = 'Please select a reason for denial';
    }
    
    if (appeal.description && !validateLength(appeal.description, 0, 200)) {
      errors.description = 'Description should be 200 characters or less';
    }
  }
  
  if (step === 2 || step === undefined) {
    if (!isRequired(appeal.letter)) {
      errors.letter = 'Appeal letter content is required';
    } else if (!validateLength(appeal.letter, 50)) {
      errors.letter = 'Appeal letter must contain substantial content';
    }
  }
  
  if (step === 3 || step === undefined) {
    if (!isRequired(appeal.method)) {
      errors.submissionMethod = 'Please select a submission method';
    } else {
      // Validation based on the selected method
      switch (appeal.method) {
        case 'mail':
          if (!isRequired(appeal.address)) {
            errors.submissionMethod = 'Mailing address is required';
          } else if (!validateLength(appeal.address, 10)) {
            errors.submissionMethod = 'Please enter a complete mailing address';
          }
          break;
        
        case 'fax':
          if (!isRequired(appeal.faxNumber)) {
            errors.submissionMethod = 'Fax number is required';
          } else if (!isValidFaxNumber(appeal.faxNumber)) {
            errors.submissionMethod = 'Please enter a valid fax number';
          }
          break;
        
        case 'email':
          if (!isRequired(appeal.email)) {
            errors.submissionMethod = 'Email address is required';
          } else if (!isValidEmail(appeal.email)) {
            errors.submissionMethod = 'Please enter a valid email address';
          }
          break;
        
        case 'portal':
          if (!isRequired(appeal.portalLink)) {
            errors.submissionMethod = 'Portal URL is required';
          } else if (!isValidUrl(appeal.portalLink)) {
            errors.submissionMethod = 'Please enter a valid URL';
          }
          break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Document form validation
export const validateDocumentForm = (document) => {
  const errors = {};
  
  if (!document.file) {
    errors.file = 'Please select a file to upload';
  } else {
    if (!isValidFileSize(document.file.size)) {
      errors.file = 'File is too large. Maximum size is 10MB';
    }
    
    if (!isValidFileExtension(document.file.name)) {
      errors.file = 'Invalid file type. Allowed types are: PDF, JPG, JPEG, PNG';
    }
  }
  
  if (!isRequired(document.type)) {
    errors.type = 'Please select a document type';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// User form validation
export const validateUserForm = (user) => {
  const errors = {};
  
  if (!isRequired(user.firstName)) {
    errors.firstName = 'First name is required';
  } else if (!isValidName(user.firstName)) {
    errors.firstName = 'First name contains invalid characters';
  }
  
  if (!isRequired(user.lastName)) {
    errors.lastName = 'Last name is required';
  } else if (!isValidName(user.lastName)) {
    errors.lastName = 'Last name contains invalid characters';
  }
  
  if (!isRequired(user.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(user.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (user.phone && !isValidPhone(user.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  if (user.password !== undefined) {
    if (!isRequired(user.password)) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(user.password)) {
      errors.password = 'Password must be at least 8 characters and contain at least one letter and number';
    }
    
    if (user.confirmPassword !== undefined && user.confirmPassword !== user.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};