/**
 * Comprehensive Form Validation Utilities
 * Used across all form components for consistent validation
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(email))
    return { valid: false, error: 'Invalid email format' };
  if (email.length > 254) return { valid: false, error: 'Email too long' };
  return { valid: true };
};

// Phone number validation (international format)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+?[1-9]\d{1,14})$/;
  if (!phone) return { valid: false, error: 'Phone number is required' };
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  return { valid: true };
};

// Password validation with complexity requirements
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true,
  } = options;

  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < minLength) {
    return {
      valid: false,
      error: `Password must be at least ${minLength} characters`,
    };
  }

  const tests = [];
  if (requireUppercase && !/[A-Z]/.test(password)) {
    tests.push('uppercase letter');
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    tests.push('lowercase letter');
  }
  if (requireNumbers && !/\d/.test(password)) {
    tests.push('number');
  }
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    tests.push('special character');
  }

  if (tests.length > 0) {
    return {
      valid: false,
      error: `Password must contain at least one ${tests.join(', ')}`,
    };
  }

  return { valid: true };
};

// Ethereum address validation
export const validateEthAddress = (address) => {
  if (!address) return { valid: false, error: 'ETH address is required' };

  // Check for 0x prefix and 40 hex characters
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return {
      valid: false,
      error:
        'Invalid ETH address format (must be 0x followed by 40 hex characters)',
    };
  }

  return { valid: true };
};

// Name validation
export const validateName = (name, minLength = 2, maxLength = 50) => {
  if (!name || !name.trim()) return { valid: false, error: 'Name is required' };

  const trimmed = name.trim();
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `Name must be at least ${minLength} characters`,
    };
  }
  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `Name cannot exceed ${maxLength} characters`,
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    };
  }

  return { valid: true };
};

// Username/Tag validation (alphanumeric + underscore)
export const validateUsername = (username, minLength = 3, maxLength = 20) => {
  if (!username || !username.trim())
    return { valid: false, error: 'Username is required' };

  const trimmed = username.trim();
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `Username must be at least ${minLength} characters`,
    };
  }
  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `Username cannot exceed ${maxLength} characters`,
    };
  }

  // Only alphanumeric and underscore
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true };
};

// File upload validation
export const validateFileUpload = (file, options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSizeMB = 5,
    minDimensions = { width: 0, height: 0 },
    maxDimensions = { width: 10000, height: 10000 },
  } = options;

  if (!file) return { valid: false, error: 'File is required' };

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`,
    };
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  return { valid: true };
};

// Amount validation for payments
export const validateAmount = (
  amount,
  minAmount = 100,
  maxAmount = 10000000,
) => {
  const numAmount = parseFloat(amount);

  if (!amount || isNaN(numAmount)) {
    return { valid: false, error: 'Valid amount is required' };
  }

  if (numAmount < minAmount) {
    return { valid: false, error: `Minimum amount is ${minAmount}` };
  }

  if (numAmount > maxAmount) {
    return { valid: false, error: `Maximum amount is ${maxAmount}` };
  }

  // Check decimal places (max 2 for currency)
  if (!/^\d+(\.\d{1,2})?$/.test(numAmount.toString())) {
    return { valid: false, error: 'Amount can have maximum 2 decimal places' };
  }

  return { valid: true };
};

// Bank account number validation
export const validateBankAccountNumber = (accountNumber, digitCount = 10) => {
  if (!accountNumber)
    return { valid: false, error: 'Account number is required' };

  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length !== digitCount) {
    return {
      valid: false,
      error: `Account number must be ${digitCount} digits`,
    };
  }

  return { valid: true };
};

// XSS Prevention - Sanitize HTML/Script content
export const sanitizeInput = (input) => {
  if (!input) return '';

  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Encode dangerous characters
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  sanitized = sanitized.replace(/[&<>"']/g, (char) => map[char]);

  return sanitized;
};

// CSRF Token management
export const getCSRFToken = () => {
  const name = 'XSRF-TOKEN';
  let csrfToken = localStorage.getItem(name);

  if (!csrfToken) {
    // Generate a simple CSRF token if not present
    csrfToken = generateRandomToken();
    localStorage.setItem(name, csrfToken);
  }

  return csrfToken;
};

// Generate random token
export const generateRandomToken = () => {
  return (
    Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
  );
};

// Validate CSRF token
export const validateCSRFToken = (token) => {
  const storedToken = localStorage.getItem('XSRF-TOKEN');
  return storedToken && storedToken === token;
};

// Batch validation - validate multiple fields at once
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((fieldName) => {
    const rule = validationRules[fieldName];
    const value = formData[fieldName];

    if (typeof rule === 'function') {
      const result = rule(value);
      if (!result.valid) {
        errors[fieldName] = result.error;
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateEthAddress,
  validateName,
  validateUsername,
  validateFileUpload,
  validateAmount,
  validateBankAccountNumber,
  sanitizeInput,
  getCSRFToken,
  generateRandomToken,
  validateCSRFToken,
  validateForm,
};
