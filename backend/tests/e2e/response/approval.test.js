/**
 * E2E Test for Approval Response Processing
 */
const { expect } = require('chai');
const path = require('path');
const {
  setupDriver,
  loginViaApi,
  setupTestDatabase,
  cleanupTestDatabase,
  createResponseDocument,
  processResponseDocument,
  getAppealData,
  getPatientStatusUpdate,
  getAppealCostImpact,
  takeScreenshot
} = require('../utils/testUtils');
const config = require('../config');

describe('Approval Response Processing', function() {
  // Increase timeout for E2E tests
  this.timeout(60000);
  
  let driver;
  let testData;
  let token;
  
  before(async function() {
    // Setup test database
    testData = await setupTestDatabase();
    
    // Get authentication token
    const loginResult = await loginViaApi();
    token = loginResult.token;
    
    // Setup WebDriver
    driver = await setupDriver();
  });
  
  after(async function() {
    // Quit WebDriver
    if (driver) {
      await driver.quit();
    }
    
    // Clean up test database
    await cleanupTestDatabase();
  });
  
  describe('API Tests', function() {
    it('should create an approval response document', async function() {
      // Create a response document
      const responseDoc = await createResponseDocument({
        fileName: 'approval_response.pdf',
        documentType: 'insuranceResponse',
        claimNumber: 'CLAIM12345',
        patientName: 'John Doe',
        serviceDate: '2023-05-01',
        decision: 'approved',
        approvedAmount: 1800
      }, token);
      
      // Verify document was created
      expect(responseDoc).to.have.property('_id');
      expect(responseDoc.documentType).to.equal('insuranceResponse');
      
      // Store for later use in shared test data
      const testData = require('../testData');
      testData.responseDocument = responseDoc;
    });
    
    it('should process the approval response document', async function() {
      // Process the response document
      const result = await processResponseDocument(testData.responseDocument._id, token);
      
      // Verify processing was successful
      expect(result.success).to.be.true;
      expect(result.decision).to.equal('approved');
      expect(result.recoveredAmount).to.equal(1800);
      expect(result).to.have.property('appeal');
      expect(result).to.have.property('nextSteps');
      expect(result.nextSteps).to.be.an('array');
      
      // Check that patient status update is included
      expect(result).to.have.property('patientStatusUpdate');
      expect(result.patientStatusUpdate).to.have.property('currentStatus');
    });
    
    it('should update the appeal with approval details', async function() {
      // Get the updated appeal
      const appeal = await getAppealData(testData.appeal._id, token);
      
      // Verify appeal was updated correctly
      expect(appeal.status).to.equal('approved');
      expect(appeal).to.have.property('outcomeDetails');
      expect(appeal.outcomeDetails.decision).to.equal('approved');
      expect(appeal.outcomeDetails.recoveredAmount).to.equal(1800);
      
      // Verify timeline was updated
      expect(appeal.timeline).to.be.an('array');
      const lastTimelineEntry = appeal.timeline[appeal.timeline.length - 1];
      expect(lastTimelineEntry.status).to.equal('approved');
    });
    
    it('should provide patient-friendly status update', async function() {
      // Get patient status update
      const statusUpdate = await getPatientStatusUpdate(testData.appeal._id, token);
      
      // Verify status update
      expect(statusUpdate.success).to.be.true;
      expect(statusUpdate.data).to.have.property('currentStatus');
      expect(statusUpdate.data.currentStatus).to.equal('approved');
      expect(statusUpdate.data).to.have.property('statusMessage');
      expect(statusUpdate.data).to.have.property('nextSteps');
      expect(statusUpdate.data.nextSteps).to.be.an('array');
    });
    
    it('should provide appeal cost impact analysis', async function() {
      // Get cost impact analysis
      const costImpact = await getAppealCostImpact(testData.appeal._id, token);
      
      // Verify cost impact
      expect(costImpact.success).to.be.true;
      expect(costImpact.data).to.have.property('appealStatus');
      expect(costImpact.data.appealStatus).to.equal('approved');
      expect(costImpact.data).to.have.property('potentialSavings');
      expect(costImpact.data.potentialSavings).to.have.property('successProbability');
      expect(costImpact.data.potentialSavings.successProbability).to.equal(1);  // Should be 100% for approved appeals
    });
  });
});