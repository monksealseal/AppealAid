/**
 * Jest E2E Test Configuration
 */

module.exports = {
  // Set test environment to Node.js
  testEnvironment: 'node',
  
  // Set test timeout (insurance response processing might be slow)
  testTimeout: 30000,
  
  // Only run tests in e2e folder
  roots: ['<rootDir>/e2e'],
  
  // Environment variables for tests
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  // Generate test reports
  reporters: [
    'default',
    ['../../../node_modules/mochawesome/src/mochawesome.js', {
      reportDir: './backend/tests/reports',
      reportFilename: 'e2e-tests-report',
      reportTitle: 'AppealAid E2E Tests',
      charts: true
    }]
  ],
  
  // Run tests in sequence
  maxWorkers: 1,
  
  // Don't run tests that match these patterns
  testPathIgnorePatterns: ['/node_modules/', '/browser-tests/'],
  
  // Show verbose output
  verbose: true
};