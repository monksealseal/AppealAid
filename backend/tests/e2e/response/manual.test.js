/**
 * E2E Test for Manual Response Entry
 */
const { expect } = require('chai');
const path = require('path');
const {
  setupDriver,
  loginViaApi,
  setupTestDatabase,
  cleanupTestDatabase,
  recordManualResponse,
  getAppealData,
  getPatientStatusUpdate,
  getAppealCostImpact,
  takeScreenshot
} = require('../utils/testUtils');
const config = require('../config');

describe('Manual Response Entry', function() {
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
    it('should manually record a partially approved response', async function() {
      // Create response data
      const responseData = {
        appealId: testData.appeal._id,
        decision: 'partiallyApproved',
        responseDate: new Date().toISOString(),
        recoveredAmount: 1200,
        notes: 'Partially approved. Only covered 60% of billed charges due to fee schedule limitations.'
      };
      
      // Record the response
      const result = await recordManualResponse(responseData, token);
      
      // Verify recording was successful
      expect(result.success).to.be.true;
      expect(result.decision).to.equal('partiallyApproved');
      expect(result.recoveredAmount).to.equal(1200);
      expect(result).to.have.property('appeal');
      expect(result).to.have.property('nextSteps');
      expect(result.nextSteps).to.be.an('array');
      
      // Check that the appropriate next steps are included
      const nextSteps = result.nextSteps;
      expect(nextSteps).to.include.members([
        'Record partial payment when received',
        'Consider appeal for remaining denied amount'
      ]);
      
      // Check that patient status update is included
      expect(result).to.have.property('patientStatusUpdate');
      expect(result.patientStatusUpdate).to.have.property('currentStatus');
    });
    
    it('should update the appeal with partial approval details', async function() {
      // Get the updated appeal
      const appeal = await getAppealData(testData.appeal._id, token);
      
      // Verify appeal was updated correctly
      expect(appeal.status).to.equal('approved');  // Partially approved uses 'approved' status
      expect(appeal).to.have.property('outcomeDetails');
      expect(appeal.outcomeDetails.decision).to.equal('partiallyApproved');
      expect(appeal.outcomeDetails.recoveredAmount).to.equal(1200);
      expect(appeal.outcomeDetails.notes).to.include('Partially approved');
      
      // Verify timeline was updated
      expect(appeal.timeline).to.be.an('array');
      const lastTimelineEntry = appeal.timeline[appeal.timeline.length - 1];
      expect(lastTimelineEntry.status).to.equal('partiallyApproved');
    });
    
    it('should provide patient-friendly status update for partial approval', async function() {
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
    
    it('should reflect partial recovery in cost impact analysis', async function() {
      // Get cost impact analysis
      const costImpact = await getAppealCostImpact(testData.appeal._id, token);
      
      // Verify cost impact
      expect(costImpact.success).to.be.true;
      expect(costImpact.data).to.have.property('appealStatus');
      expect(costImpact.data.appealStatus).to.equal('approved');
      expect(costImpact.data).to.have.property('currentPatientResponsibility');
      
      // Since we recovered 1200 out of the 2000 denied amount
      const remainingResponsibility = 2000 - 1200;
      expect(costImpact.data.currentPatientResponsibility).to.be.approximately(remainingResponsibility, 1);
    });
  });
});