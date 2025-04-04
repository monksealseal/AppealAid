/**
 * End-to-End Testing Configuration
 */

module.exports = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.TEST_API_URL || 'http://localhost:5000/api',
  testUser: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  },
  browser: process.env.TEST_BROWSER || 'chrome',
  headless: process.env.TEST_HEADLESS === 'true',
  slowMo: process.env.TEST_SLOW_MO ? parseInt(process.env.TEST_SLOW_MO) : 0,
  implicitTimeout: 10000,
  explicitTimeout: 30000,
  mongoUri: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/appealaid_test',
  uploadDir: '/home/esima/cc1/AppealAid/backend/docs/test-samples/',
  sampleFiles: {
    approvalLetter: 'approval_letter.txt',
    denialResponse: 'denial_response.txt',
    externalReview: 'external_review_decision.txt'
  }
};