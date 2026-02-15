/**
 * Form Validation Tests
 * Tests for frontend/src/utils/formValidation.js
 */

import {
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
  validateForm,
} from '../utils/formValidation';

describe('Form Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@example.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should reject emails exceeding max length', () => {
      const longEmail = 'a'.repeat(255) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate passwords meeting requirements', () => {
      expect(validatePassword('Test123!@')).toBe(true);
      expect(validatePassword('SecurePass123')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('Short1!')).toBe(false);
    });

    it('should enforce custom complexity options', () => {
      const options = { minLength: 12, requireNumbers: true };
      expect(validatePassword('WeakPass', options)).toBe(false);
      expect(validatePassword('Strong Pass123', options)).toBe(true);
    });

    it('should reject passwords without required characters', () => {
      expect(validatePassword('nouppercase123')).toBe(false);
      expect(validatePassword('NOLOWERCASE123')).toBe(false);
      expect(validatePassword('NoNumbers')).toBe(false);
    });
  });

  describe('validateEthAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(
        validateEthAddress('0x742d35Cc6634C0532925a3b844Bc2e7595f5bEb6'),
      ).toBe(true);
      expect(validateEthAddress('0x' + '1'.repeat(40))).toBe(true);
    });

    it('should reject invalid Ethereum addresses', () => {
      expect(validateEthAddress('0x123')).toBe(false);
      expect(
        validateEthAddress('742d35Cc6634C0532925a3b844Bc2e7595f5bEb6'),
      ).toBe(false);
      expect(validateEthAddress('0x' + 'G'.repeat(40))).toBe(false);
    });

    it('should handle case variations', () => {
      const addr = '0x742d35Cc6634C0532925a3b844Bc2e7595f5bEb6';
      expect(validateEthAddress(addr.toLowerCase())).toBe(true);
      expect(validateEthAddress(addr.toUpperCase())).toBe(true);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate international phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('+2348012345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('not a number')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should validate proper names', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('Mary-Jane Smith')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('123')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate valid usernames', () => {
      expect(validateUsername('john_doe')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('a_b_c')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('user-name')).toBe(false);
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('a')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    it('should encode dangerous characters', () => {
      const input = 'Hello<img src=x onerror=alert("xss")>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('onerror=');
    });

    it('should preserve safe HTML', () => {
      const input = 'Hello <b>World</b>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });
  });

  describe('validateForm', () => {
    it('should validate complete form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
      };

      const rules = {
        email: validateEmail,
        password: validatePassword,
        name: validateName,
      };

      const result = validateForm(formData, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid fields', () => {
      const formData = {
        email: 'invalid-email',
        password: 'weak',
        name: 'John Doe',
      };

      const rules = {
        email: validateEmail,
        password: validatePassword,
        name: validateName,
      };

      const result = validateForm(formData, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });
});
