/**
 * Response Processor E2E Tests
 * 
 * Tests the end-to-end flow of processing insurance responses
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Appeal = require('../../../models/appealModel');
const Patient = require('../../../models/patientModel');
const { processResponseDocument, findMatchingAppeal } = require('../../../services/responseProcessorService');
const { setupTestData, clearTestData } = require('../utils/testUtils');

// Skip tests that require DB if using mock mode
const shouldSkipDBTests = process.env.USE_MOCK_DB === 'true';
const itWithDB = shouldSkipDBTests ? it.skip : it;

describe('Response Processor Service', () => {
  let testData;
  let mockDocument;
  let approvalDocument;
  let denialDocument;
  
  // Set up test data before all tests
  beforeAll(async () => {
    // Initialize test data (patients, appeals, etc.)
    testData = await setupTestData();
    
    // Create mock documents for testing
    const createMockDocument = (type, content) => ({
      id: `mock-doc-${Math.floor(Math.random() * 10000)}`,
      path: `/tmp/test-doc-${type}.pdf`,
      mockText: content
    });
    
    // Create a generic mock document
    mockDocument = createMockDocument('generic', 
      'Some generic document text that is not an insurance response.'
    );
    
    // Create an approval document
    approvalDocument = createMockDocument('approval', 
      `Appeal Decision Letter
      
      Patient: ${testData.patients[0]?.name || 'John Doe'}
      Claim #: ${testData.appeals[0]?.claimId || 'CL123456'}
      Appeal #: ${testData.appeals[0]?.appealId || 'AP789012'}
      
      Decision: Approved
      
      Your appeal has been reviewed and approved. The requested amount of $1,500.00 will be processed within 30 days.
      
      Reason for Decision: Medical necessity criteria have been met based on the additional documentation provided.
      
      If you have any questions, please contact our customer service at 1-800-555-1234.`
    );
    
    // Create a denial document
    denialDocument = createMockDocument('denial', 
      `Appeal Determination Notice
      
      Patient: ${testData.patients[1]?.name || 'Jane Smith'}
      Claim #: ${testData.appeals[1]?.claimId || 'CL987654'}
      Appeal #: ${testData.appeals[1]?.appealId || 'AP123456'}
      
      Decision: Denied
      
      We regret to inform you that your appeal has been denied. The service remains not covered under your plan.
      
      Reason for Decision: The treatment is considered experimental/investigational under your plan's provisions.
      
      You have the right to request an external review within 60 days of this notice.`
    );
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await clearTestData();
    
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
  
  // Document identification tests
  describe('Document Identification', () => {
    it('should correctly identify a non-response document', async () => {
      const result = await processResponseDocument(mockDocument);
      expect(result.success).toBe(false);
      expect(result.isResponse).toBe(false);
    });
    
    it('should correctly identify an approval document', async () => {
      const result = await processResponseDocument(approvalDocument);
      expect(result.isResponse).toBe(true);
    });
    
    it('should correctly identify a denial document', async () => {
      const result = await processResponseDocument(denialDocument);
      expect(result.isResponse).toBe(true);
    });
  });
  
  // Decision extraction tests
  describe('Decision Extraction', () => {
    it('should extract approval decision correctly', async () => {
      const result = await processResponseDocument(approvalDocument);
      expect(result.decisionData.decision).toBe('approved');
    });
    
    it('should extract denial decision correctly', async () => {
      const result = await processResponseDocument(denialDocument);
      expect(result.decisionData.decision).toBe('denied');
    });
    
    it('should extract claim and appeal IDs correctly', async () => {
      const result = await processResponseDocument(approvalDocument);
      expect(result.decisionData.claimId).toBeTruthy();
      expect(result.decisionData.appealId).toBeTruthy();
    });
  });
  
  // Appeal matching tests (these require DB connection)
  describe('Appeal Matching', () => {
    itWithDB('should match a response to the correct appeal by ID', async () => {
      // Add a delay to ensure all test data is fully saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const appeal = testData.appeals[0];
      const decisionData = {
        appealId: appeal.appealId,
        decision: 'approved',
        decisionDate: new Date()
      };
      
      const matchedAppeal = await findMatchingAppeal(decisionData);
      expect(matchedAppeal).toBeTruthy();
      expect(matchedAppeal.appealId).toBe(appeal.appealId);
    });
    
    itWithDB('should match a response to the correct appeal by claim ID', async () => {
      const appeal = testData.appeals[1];
      const decisionData = {
        claimId: appeal.claimId,
        decision: 'denied',
        decisionDate: new Date()
      };
      
      const matchedAppeal = await findMatchingAppeal(decisionData);
      expect(matchedAppeal).toBeTruthy();
      expect(matchedAppeal.claimId).toBe(appeal.claimId);
    });
    
    itWithDB('should use scoring to match an appeal when no direct IDs match', async () => {
      const appeal = testData.appeals[0];
      const patient = testData.patients[0];
      
      const decisionData = {
        patientName: patient.name,
        insuranceCompany: appeal.insuranceCompany,
        decisionDate: new Date(),
        decision: 'approved'
      };
      
      const matchedAppeal = await findMatchingAppeal(decisionData);
      expect(matchedAppeal).toBeTruthy();
    });
  });
  
  // Appeal update tests
  describe('Appeal Update', () => {
    itWithDB('should update appeal status to approved for approval decision', async () => {
      const result = await processResponseDocument(approvalDocument);
      expect(result.success).toBe(true);
      
      if (result.appeal) {
        expect(result.appeal.status).toBe('approved');
        expect(result.appeal.decision).toBe('approved');
        expect(result.appeal.responseDate).toBeTruthy();
      }
    });
    
    itWithDB('should update appeal status to denied for denial decision', async () => {
      const result = await processResponseDocument(denialDocument);
      expect(result.success).toBe(true);
      
      if (result.appeal) {
        expect(result.appeal.status).toBe('denied');
        expect(result.appeal.decision).toBe('denied');
        expect(result.appeal.responseDate).toBeTruthy();
      }
    });
  });
  
  // Next steps generation tests
  describe('Next Steps Generation', () => {
    it('should generate appropriate next steps for approval', async () => {
      const result = await processResponseDocument(approvalDocument);
      expect(result.nextSteps).toBeTruthy();
      expect(result.nextSteps.patientNextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps.staffNextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps.externalReviewEligible).toBe(false);
    });
    
    it('should generate appropriate next steps for denial', async () => {
      const result = await processResponseDocument(denialDocument);
      expect(result.nextSteps).toBeTruthy();
      expect(result.nextSteps.patientNextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps.staffNextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps.externalReviewEligible).toBe(true);
    });
    
    it('should identify medical necessity denials for external review', async () => {
      const medicalNecessityDenial = {
        id: `mock-doc-${Math.floor(Math.random() * 10000)}`,
        path: `/tmp/test-doc-medical-necessity.pdf`,
        mockText: `
          Appeal Decision
          
          Patient: ${testData.patients[1]?.name || 'Jane Smith'}
          Claim #: CL987654
          
          Decision: Denied
          
          Reason for Decision: Not medically necessary according to our clinical guidelines.
        `
      };
      
      const result = await processResponseDocument(medicalNecessityDenial);
      expect(result.nextSteps).toBeTruthy();
      expect(result.nextSteps.externalReviewEligible).toBe(true);
      expect(result.nextSteps.externalReviewType).toBe('medical necessity');
    });
  });
});