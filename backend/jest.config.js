module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/build/**",
    "!**/dist/**",
    "!**/jest.config.js",
  ],
  coverageThresholds: {
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
