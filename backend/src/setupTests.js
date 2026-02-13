/**
 * Jest Setup File for Backend Tests
 * Configure testing environment for Node.js tests
 */

// Set test environment to development to avoid production warnings
process.env.NODE_ENV = "test";

// Suppress MongoDB connection warnings in tests if using in-memory DB
process.env.MONGODB_URI = "mongodb://localhost:27017/secxion-test";
