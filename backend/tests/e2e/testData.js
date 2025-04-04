/**
 * Shared test data for E2E tests
 */
const mongoose = require('mongoose');

module.exports = {
  // Mock user data
  user: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com'
  },
  
  // Mock document data
  document: {
    _id: new mongoose.Types.ObjectId(),
    fileName: 'test_denial.pdf',
    documentType: 'denialLetter',
    fileUrl: '/uploads/test_denial.pdf',
    status: 'processed',
    extractedData: {
      claimNumber: 'CLAIM12345',
      patientName: 'John Doe',
      serviceDate: '2023-05-01',
      denialReason: 'Service not medically necessary',
      billedAmount: 2000,
      allowedAmount: 0,
      insuranceCarrier: 'Test Insurance'
    }
  },
  
  // Mock appeal data
  appeal: {
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Appeal',
    appealType: 'medicalNecessity',
    description: 'Test description',
    denialInfo: {
      denialReason: 'Service not medically necessary',
      claimNumber: 'CLAIM12345',
      serviceDate: '2023-05-01',
      deniedAmount: 2000
    },
    status: 'submitted',
    appealContent: 'This is a test appeal letter content',
    submissionDetails: {
      submittedDate: new Date(),
      submissionMethod: 'email'
    },
    timeline: [
      {
        date: new Date(),
        status: 'generated',
        description: 'Appeal letter generated'
      },
      {
        date: new Date(),
        status: 'submitted',
        description: 'Appeal submitted via email'
      }
    ]
  },
  
  // Mock response document data
  responseDocument: null, // Will be populated by tests
  
  // Mock auth token
  token: 'mock_token_for_testing_purposes'
};