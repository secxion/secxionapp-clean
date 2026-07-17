export default {
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/build/**",
    "!**/dist/**",
    "!**/jest.config.js",
    "!**/__tests__/testUtils.js",
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/.git/"],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
};
