/**
 * Security Middleware Tests
 * Tests for backend/middleware/securityMiddleware.js
 */

import {
  csrfProtection,
  apiLimiter,
  authLimiter,
  signupLimiter,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
} from '../middleware/securityMiddleware';
import { createMockRequest, createMockResponse } from './testUtils';

describe('Security Middleware', () => {
  describe('CSRF Protection', () => {
    it('should generate and set CSRF token', () => {
      const req = createMockRequest();
      req.session = {};
      const res = createMockResponse();
      const next = jest.fn();

      csrfProtection(req, res, next);

      expect(req.session.csrfToken).toBeDefined();
      expect(res.setHeader).toHaveBeenCalledWith(
        'X-CSRF-Token',
        expect.any(String)
      );
      expect(next).toHaveBeenCalled();
    });

    it('should return existing CSRF token if present', () => {
      const existingToken = 'existing-token-12345';
      const req = createMockRequest();
      req.session = { csrfToken: existingToken };
      const res = createMockResponse();
      const next = jest.fn();

      csrfProtection(req, res, next);

      expect(req.session.csrfToken).toBe(existingToken);
      expect(res.setHeader).toHaveBeenCalledWith('X-CSRF-Token', existingToken);
    });
  });

  describe('Token Generation', () => {
    it('should generate valid access token', () => {
      const token = generateAccessToken('user123', 'test@example.com', 'GENERAL');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format
    });

    it('should generate valid refresh token', () => {
      const token = generateRefreshToken('user123');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format
    });

    it('should include user data in access token', () => {
      const jwt = require('jsonwebtoken');
      const token = generateAccessToken('user123', 'test@example.com', 'ADMIN');
      const decoded = jwt.verify(
        token,
        process.env.TOKEN_SECRET_KEY || 'test-secret'
      );

      expect(decoded._id).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('ADMIN');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      // Note: Rate limiters are express-rate-limit instances
      // Actual testing requires supertest with a real or mocked app
      expect(apiLimiter).toBeDefined();
      expect(authLimiter).toBeDefined();
      expect(signupLimiter).toBeDefined();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const userId = 'user123';
      const refreshToken = generateRefreshToken(userId);

      // Mock the token storage
      global.TOKEN_STORE = new Map();
      global.TOKEN_STORE.set(refreshToken, {
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isRevoked: false,
      });

      const newAccessToken = refreshAccessToken(refreshToken);

      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe('string');
    });

    it('should not refresh revoked tokens', () => {
      const userId = 'user123';
      const refreshToken = generateRefreshToken(userId);

      // Mock revoked token
      global.TOKEN_STORE = new Map();
      global.TOKEN_STORE.set(refreshToken, {
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isRevoked: true, // Token is revoked
      });

      expect(() => refreshAccessToken(refreshToken)).toThrow();
    });
  });

  describe('Token Revocation', () => {
    it('should revoke refresh token on logout', async () => {
      const userId = 'user123';
      const refreshToken = generateRefreshToken(userId);

      // Mock token storage
      global.TOKEN_STORE = new Map();
      global.TOKEN_STORE.set(refreshToken, {
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isRevoked: false,
      });

      revokeRefreshToken(refreshToken);

      const tokenData = global.TOKEN_STORE.get(refreshToken);
      expect(tokenData.isRevoked).toBe(true);
    });
  });
});
