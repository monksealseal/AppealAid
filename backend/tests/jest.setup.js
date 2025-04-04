/**
 * Jest Setup for E2E Tests
 */

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGO_URI_TEST = 'mongodb://localhost:27017/appealaid_test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Set mock mode for tests that don't need a real database
process.env.USE_MOCK_DB = 'true';

// Silence console logs during tests to reduce noise
// Comment out these lines if you need to debug tests
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

// Set up global before/after hooks
beforeAll(async () => {
  // Global setup before all tests
});

afterAll(async () => {
  // Global cleanup after all tests
  // Make sure any open handles are closed
  setTimeout(() => process.exit(0), 1000).unref();
});