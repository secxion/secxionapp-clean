# Testing Framework Setup - Jest

## Overview

The Secxion application uses **Jest** testing framework for both frontend (React) and backend (Node.js) testing. Jest provides a comprehensive testing solution with built-in mocking, code coverage, and snapshot testing.

## Setup

### Frontend (React)

**Configuration:** `frontend/jest.config.js`

**Test Files Location:** `frontend/src/__tests__/**/*.test.js`

**Test Utilities:** `frontend/src/__tests__/testUtils.js`

#### Running Tests

```bash
# Frontend tests
cd frontend

# Run all tests with coverage
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

#### Writing Frontend Tests

Example test file: `frontend/src/__tests__/formValidation.test.js`

```javascript
import { validateEmail } from "../utils/formValidation";

describe("validateEmail", () => {
  it("should validate correct emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
  });
});
```

#### Component Testing

For React components, use the custom `render` function from testUtils:

```javascript
import { render, screen, fireEvent } from "../__tests__/testUtils";
import MyComponent from "../Components/MyComponent";

describe("MyComponent", () => {
  it("should render with props", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should handle clicks", async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Backend (Node.js)

**Configuration:** `backend/jest.config.js`

**Test Files Location:** `backend/src/__tests__/**/*.test.js` or `backend/**/*.test.js`

**Test Utilities:** `backend/src/__tests__/testUtils.js`

#### Running Tests

```bash
# Backend tests
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

#### Writing Backend Tests

Example test file: `backend/src/__tests__/securityMiddleware.test.js`

```javascript
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/securityMiddleware";
import { createMockRequest, createMockResponse } from "./testUtils";

describe("Token Generation", () => {
  it("should generate valid access token", () => {
    const token = generateAccessToken("user123", "test@example.com", "GENERAL");
    expect(token).toBeDefined();
    expect(token.split(".").length).toBe(3); // JWT format
  });
});
```

#### API Endpoint Testing

For testing Express routes and controllers:

```javascript
import request from "supertest";
import app from "../index";
import { generateMockToken } from "./testUtils";

describe("GET /api/user-details", () => {
  it("should return user details with valid token", async () => {
    const token = generateMockToken("507f1f77bcf86cd799439011");

    const response = await request(app)
      .get("/api/user-details")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user");
  });
});
```

## Test Utilities

### Frontend: `testUtils.js`

- **`render()`** - Custom render function with Redux/Router/Context providers
- **`mockUser`** - Pre-configured test user object
- **`mockProduct`** - Pre-configured test product object
- **`mockNotification`** - Pre-configured test notification object
- **`waitForLoadingToFinish()`** - Helper to wait for async operations

### Backend: `testUtils.js`

- **`createTestRequest(app)`** - Creates a test request helper
- **`mockUserData`** - Pre-configured test user data
- **`mockProductData`** - Pre-configured test product data
- **`mockWalletData`** - Pre-configured test wallet data
- **`generateMockToken(userId, role)`** - Generates JWT tokens for testing
- **`cleanupAfterTest(models)`** - Database cleanup helper
- **`createMockRequest(body, query, params, headers)`** - Mock Express request
- **`createMockResponse()`** - Mock Express response
- **`assertResponseStructure(response, options)`** - Response validation helper

## Code Coverage

Coverage reports are generated in the `coverage/` directory:

```bash
# Frontend coverage
cd frontend && npm run test:coverage
# Reports in: frontend/coverage/

# Backend coverage
cd backend && npm run test:coverage
# Reports in: backend/coverage/
```

View HTML coverage reports:

```bash
# Frontend
open frontend/coverage/lcov-report/index.html

# Backend
open backend/coverage/lcov-report/index.html
```

## Minimum Coverage Thresholds

- **Frontend:** 50% (branches, functions,lines, statements)
- **Backend:** 40% (branches, functions, lines, statements)

Tests will fail if coverage drops below these thresholds.

## Mocking

### Mock localStorage/sessionStorage

```javascript
// In tests, automatically mocked in setupTests.js
localStorage.setItem("key", "value");
expect(localStorage.setItem).toHaveBeenCalledWith("key", "value");
```

### Mock API Calls

```javascript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ user: { id: 1, name: "Test" } }),
  }),
);

// In test
const response = await fetch("/api/user-details");
expect(global.fetch).toHaveBeenCalledWith("/api/user-details");
```

### Mock Redux Store

```javascript
const { store } = render(<MyComponent />, {
  initialState: {
    user: { user: mockUser, isLoggedIn: true },
  },
});

expect(store.getState().user.user.name).toBe("Test User");
```

## Best Practices

1. **Test Behavior, Not Implementation** - Test what the user sees/interacts with, not internal implementation details
2. **Use Descriptive Test Names** - `it('should display error message when email is invalid')`
3. **One Assertion Per Concept** - Group related assertions but avoid testing multiple features in one test
4. **Test Error Cases** - Include tests for success AND failure scenarios
5. **Avoid Flaky Tests** - Mock network requests, use `waitFor()` for async operations
6. **Keep Tests Isolated** - Each test should be independent; use `beforeEach()` for setup
7. **Use Meaningful Mock Data** - Mock data should reflect real-world scenarios

## Coverage Goals

**Phase 2 Coverage Targets:**

- Form validation: 100%
- Security middleware: 80%
- Email verification: 70%
- Toast system: 60%

Run periodic coverage reports to track progress:

```bash
npm test:coverage
```

## Troubleshooting

**Issue:** `Failed to find a valid ace installer`

```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Tests timeout

```javascript
// Increase timeout for slow tests
jest.setTimeout(10000); // 10 seconds

// Or specify per test
it("slow test", async () => {
  // test code
}, 10000);
```

**Issue:** Import paths not resolving

- Ensure `moduleNameMapper` in jest.config.js matches your alias setup
- Frontend: `^@/(.*)$` → `<rootDir>/src/$1`

## Next Steps

1. Write tests for form validators (Task 10)
2. Add tests for authentication flow
3. Test API endpoints and controllers
4. Add integration tests for critical user journeys
5. Achieve target code coverage thresholds
