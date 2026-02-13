/**
 * Test Utilities for Backend/API Tests
 * Provides helpers for testing controllers, models, and API endpoints
 */

import request from "supertest";

/**
 * Create a test request helper for API endpoints
 */
export function createTestRequest(app) {
  return request(app);
}

/**
 * Mock user data for database tests
 */
export const mockUserData = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPassword123!",
  profilePic: "https://example.com/profile.jpg",
  role: "GENERAL",
  isVerified: true,
  emailToken: null,
};

/**
 * Mock product data for database tests
 */
export const mockProductData = {
  productName: "Test Product",
  category: "Electronics",
  price: 5000,
  description: "A test product",
  images: ["https://example.com/image1.jpg"],
  inStock: true,
  quantity: 10,
};

/**
 * Mock wallet data
 */
export const mockWalletData = {
  balance: 1000,
  currency: "NGN",
};

/**
 * Helper to generate JWT token for authenticated requests
 */
export function generateMockToken(userId, role = "GENERAL") {
  const jwt = require("jsonwebtoken");
  const token = jwt.sign(
    {
      _id: userId,
      email: "test@example.com",
      role,
    },
    process.env.TOKEN_SECRET_KEY || "test-secret",
    { expiresIn: "8h" },
  );
  return token;
}

/**
 * Helper to clean up after tests
 */
export async function cleanupAfterTest(models = []) {
  for (const model of models) {
    await model.deleteMany({});
  }
}

/**
 * Mock Express request object
 */
export function createMockRequest(
  body = {},
  query = {},
  params = {},
  headers = {},
) {
  return {
    body,
    query,
    params,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    user: null,
  };
}

/**
 * Mock Express response object
 */
export function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    statusCode: 200,
  };
  return res;
}

/**
 * Assert response structure
 */
export function assertResponseStructure(
  response,
  { statusCode, hasBody = true, hasSuccess = false } = {},
) {
  if (statusCode) {
    expect(response.statusCode).toBe(statusCode);
  }
  if (hasBody) {
    expect(response.body).toBeDefined();
  }
  if (hasSuccess) {
    expect(response.body.success).toBeDefined();
  }
}
