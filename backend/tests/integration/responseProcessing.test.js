const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/userModel');
const Document = require('../../models/documentModel');
const Appeal = require('../../models/appealModel');
const jwt = require('jsonwebtoken');

// This is an integration test file that tests the complete flow
// of processing insurance responses

describe('Response Processing Integration Tests', () => {
  let token;
  let userId;
  let documentId;
  let appealId;
  
  // Before all tests, set up a test user, document, and appeal
  beforeAll(async () => {
    // Connect to the test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/appealaid_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    
    // Clear relevant collections
    await User.deleteMany({});
    await Document.deleteMany({});
    await Appeal.deleteMany({});
    
    // Create a test user
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    userId = user._id;
    
    // Create JWT token for authentication
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'testjwtsecret', {
      expiresIn: '1d'
    });
    
    // Create a test document (denial letter)
    const document = new Document({
      user: userId,
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
    });
    
    const savedDoc = await document.save();
    documentId = savedDoc._id;
    
    // Create a test appeal
    const appeal = new Appeal({
      user: userId,
      relatedDocument: documentId,
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
    });
    
    const savedAppeal = await appeal.save();
    appealId = savedAppeal._id;
  });
  
  // After all tests, disconnect from the database
  afterAll(async () => {
    await mongoose.disconnect();
  });
  
  // Test Case 1: Create and process an approval response document
  test('should process an approval response document', async () => {
    // First, create a response document
    const responseDoc = new Document({
      user: userId,
      fileName: 'test_approval.pdf',
      documentType: 'insuranceResponse',
      fileUrl: '/uploads/test_approval.pdf',
      status: 'processed',
      extractedData: {
        claimNumber: 'CLAIM12345',
        patientName: 'John Doe',
        serviceDate: '2023-05-01',
        appealDecision: 'approved',
        responseDate: new Date(),
        approvedAmount: 1800,
        insuranceCarrier: 'Test Insurance'
      }
    });
    
    const savedResponseDoc = await responseDoc.save();
    
    // Process the response document via API
    const processResult = await request(app)
      .post('/api/responses/process-document')
      .set('Authorization', `Bearer ${token}`)
      .send({ documentId: savedResponseDoc._id });
    
    expect(processResult.statusCode).toBe(200);
    expect(processResult.body.success).toBe(true);
    expect(processResult.body.decision).toBe('approved');
    
    // Check that the appeal was updated
    const updatedAppeal = await Appeal.findById(appealId);
    expect(updatedAppeal.status).toBe('approved');
    expect(updatedAppeal.outcomeDetails.decision).toBe('approved');
    expect(updatedAppeal.outcomeDetails.recoveredAmount).toBe(1800);
    
    // Verify a timeline entry was added
    const lastTimelineEntry = updatedAppeal.timeline[updatedAppeal.timeline.length - 1];
    expect(lastTimelineEntry.status).toBe('approved');
  });
  
  // Test Case 2: Process a denial response document
  test('should process a denial response document', async () => {
    // Reset appeal to submitted status for this test
    await Appeal.findByIdAndUpdate(appealId, {
      status: 'submitted',
      $unset: { outcomeDetails: 1 }
    });
    
    // Create a denial response document
    const responseDoc = new Document({
      user: userId,
      fileName: 'test_denial_response.pdf',
      documentType: 'insuranceResponse',
      fileUrl: '/uploads/test_denial_response.pdf',
      status: 'processed',
      extractedData: {
        claimNumber: 'CLAIM12345',
        patientName: 'John Doe',
        serviceDate: '2023-05-01',
        appealDecision: 'denied',
        responseDate: new Date(),
        denialReason: 'Service remains not medically necessary',
        nextLevelAppealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        insuranceCarrier: 'Test Insurance'
      }
    });
    
    const savedResponseDoc = await responseDoc.save();
    
    // Process the response document via API
    const processResult = await request(app)
      .post('/api/responses/process-document')
      .set('Authorization', `Bearer ${token}`)
      .send({ documentId: savedResponseDoc._id });
    
    expect(processResult.statusCode).toBe(200);
    expect(processResult.body.success).toBe(true);
    expect(processResult.body.decision).toBe('denied');
    
    // Check that the appeal was updated
    const updatedAppeal = await Appeal.findById(appealId);
    expect(updatedAppeal.status).toBe('denied');
    expect(updatedAppeal.outcomeDetails.decision).toBe('denied');
    expect(updatedAppeal.nextLevelAppeal.isEligible).toBe(true);
    expect(updatedAppeal.externalReview.isEligibleForExternalReview).toBe(true);
    
    // Verify a timeline entry was added
    const lastTimelineEntry = updatedAppeal.timeline[updatedAppeal.timeline.length - 1];
    expect(lastTimelineEntry.status).toBe('denied');
  });
  
  // Test Case 3: Manual response entry
  test('should manually record an appeal response', async () => {
    // Reset appeal to submitted status for this test
    await Appeal.findByIdAndUpdate(appealId, {
      status: 'submitted',
      $unset: { outcomeDetails: 1, nextLevelAppeal: 1, externalReview: 1 }
    });
    
    // Manual response data
    const responseData = {
      appealId,
      decision: 'partiallyApproved',
      responseDate: new Date().toISOString(),
      recoveredAmount: 1200,
      notes: 'Partially approved with reduced amount'
    };
    
    // Submit manual response via API
    const manualResult = await request(app)
      .post('/api/responses/manual-entry')
      .set('Authorization', `Bearer ${token}`)
      .send(responseData);
    
    expect(manualResult.statusCode).toBe(200);
    expect(manualResult.body.success).toBe(true);
    expect(manualResult.body.decision).toBe('partiallyApproved');
    
    // Check that the appeal was updated
    const updatedAppeal = await Appeal.findById(appealId);
    expect(updatedAppeal.status).toBe('approved'); // Partially approved is still "approved" status
    expect(updatedAppeal.outcomeDetails.decision).toBe('partiallyApproved');
    expect(updatedAppeal.outcomeDetails.recoveredAmount).toBe(1200);
    
    // Verify a timeline entry was added
    const lastTimelineEntry = updatedAppeal.timeline[updatedAppeal.timeline.length - 1];
    expect(lastTimelineEntry.status).toBe('partiallyApproved');
    
    // Verify next steps are returned
    expect(manualResult.body.nextSteps).toContainEqual('Record partial payment when received');
    expect(manualResult.body.nextSteps).toContainEqual('Consider appeal for remaining denied amount');
  });
  
  // Test Case 4: Check if document is a response
  test('should check if a document is an insurance response', async () => {
    // Create a test document that looks like a response
    const responseDoc = new Document({
      user: userId,
      fileName: 'test_response_check.pdf',
      documentType: 'letter',
      fileUrl: '/uploads/test_response_check.pdf',
      status: 'processed',
      extractedData: {
        documentTitle: 'Appeal Decision Letter',
        extractedText: 'We have reviewed your appeal and have determined that the service is approved.'
      }
    });
    
    const savedResponseDoc = await responseDoc.save();
    
    // Call the check endpoint
    const checkResult = await request(app)
      .get(`/api/responses/check-document/${savedResponseDoc._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(checkResult.statusCode).toBe(200);
    expect(checkResult.body.isResponse).toBe(true);
    expect(checkResult.body.possibleMatches).toBeInstanceOf(Array);
    
    // Create a test document that doesn't look like a response
    const nonResponseDoc = new Document({
      user: userId,
      fileName: 'test_non_response.pdf',
      documentType: 'medicalRecord',
      fileUrl: '/uploads/test_non_response.pdf',
      status: 'processed',
      extractedData: {
        documentTitle: 'Clinical Notes',
        extractedText: 'Patient visit on 2023-05-01. Assessment and plan...'
      }
    });
    
    const savedNonResponseDoc = await nonResponseDoc.save();
    
    // Call the check endpoint
    const checkNonResponseResult = await request(app)
      .get(`/api/responses/check-document/${savedNonResponseDoc._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(checkNonResponseResult.statusCode).toBe(200);
    expect(checkNonResponseResult.body.isResponse).toBe(false);
    expect(checkNonResponseResult.body.possibleMatches).toEqual([]);
  });
  
  // Test Case 5: Manual match of response to appeal
  test('should manually match a response to an appeal', async () => {
    // Reset appeal to submitted status for this test
    await Appeal.findByIdAndUpdate(appealId, {
      status: 'submitted',
      $unset: { outcomeDetails: 1, nextLevelAppeal: 1, externalReview: 1 }
    });
    
    // Create an ambiguous response document (missing claim number)
    const ambiguousDoc = new Document({
      user: userId,
      fileName: 'ambiguous_response.pdf',
      documentType: 'insuranceResponse',
      fileUrl: '/uploads/ambiguous_response.pdf',
      status: 'processed',
      extractedData: {
        // No claim number to match automatically
        patientName: 'John Doe', 
        appealDecision: 'approved',
        responseDate: new Date(),
        approvedAmount: 1750
      }
    });
    
    const savedAmbiguousDoc = await ambiguousDoc.save();
    
    // Try to process - should not find a match automatically
    const processResult = await request(app)
      .post('/api/responses/process-document')
      .set('Authorization', `Bearer ${token}`)
      .send({ documentId: savedAmbiguousDoc._id });
    
    // Should return possible matches but not process automatically
    expect(processResult.body.success).toBe(false);
    expect(processResult.body.needsManualMatch).toBe(true);
    expect(processResult.body.possibleMatches).toBeInstanceOf(Array);
    
    // Manually match the document to the appeal
    const manualMatchResult = await request(app)
      .post('/api/responses/manual-match')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        documentId: savedAmbiguousDoc._id,
        appealId
      });
    
    expect(manualMatchResult.statusCode).toBe(200);
    expect(manualMatchResult.body.success).toBe(true);
    expect(manualMatchResult.body.decision).toBe('approved');
    expect(manualMatchResult.body.recoveredAmount).toBe(1750);
    
    // Check that the appeal was updated
    const updatedAppeal = await Appeal.findById(appealId);
    expect(updatedAppeal.status).toBe('approved');
    expect(updatedAppeal.outcomeDetails.decision).toBe('approved');
    expect(updatedAppeal.outcomeDetails.recoveredAmount).toBe(1750);
  });
  
  // Test Case 6: Get patient-friendly status update for a processed appeal
  test('should get patient-friendly status update for a processed appeal', async () => {
    // Check the patient status update
    const statusResult = await request(app)
      .get(`/api/patient/appeals/${appealId}/status`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(statusResult.statusCode).toBe(200);
    expect(statusResult.body.success).toBe(true);
    expect(statusResult.body.data).toHaveProperty('currentStatus', 'approved');
    expect(statusResult.body.data).toHaveProperty('statusMessage');
    expect(statusResult.body.data).toHaveProperty('nextSteps');
    expect(statusResult.body.data.suggestedActions).toBeInstanceOf(Array);
  });
});