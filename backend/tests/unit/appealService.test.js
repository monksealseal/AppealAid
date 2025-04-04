const chai = require('chai');
const { expect } = chai;
const appealService = require('../../services/appealService');
const aiService = require('../../services/aiService');

describe('Appeal Service', () => {
  describe('identifyAppealStrategy', () => {
    it('should identify medical necessity appeal from denial reason', () => {
      const result = appealService.identifyAppealStrategy('not medically necessary', null);
      expect(result.appealType).to.equal('medicalNecessity');
      expect(result.templateId).to.equal('medical_necessity_standard');
    });

    it('should identify appeal type from denial code if available', () => {
      const result = appealService.identifyAppealStrategy(null, 'B1');
      expect(result.appealType).to.equal('priorAuthorization');
    });

    it('should return general appeal type for unknown reasons', () => {
      const result = appealService.identifyAppealStrategy('unknown reason', null);
      expect(result.appealType).to.equal('other');
      expect(result.templateId).to.equal('general_appeal');
    });
  });

  describe('generateAIEnhancedContent', () => {
    it('should enhance appeal content with additional arguments', () => {
      // Mock document data
      const documentData = {
        denialReason: 'not medically necessary',
        serviceDescription: 'MRI scan',
        diagnosisCodes: ['M54.5'],
        procedureCodes: ['70553'],
        billedAmount: 1200,
        providerName: 'Dr. Smith'
      };
      
      // Get the appeal type
      const appealStrategy = appealService.identifyAppealStrategy(documentData.denialReason, null);
      
      // This is testing an internal method that's not exposed in the module.exports
      // In a real test, we would mock the private method or test the public methods that use it
      // For demonstration purposes, we're assuming the method exists and is accessible
      
      // Assuming the method is accessible (it would not be in a real scenario)
      // const result = appealService.generateAIEnhancedContent(
      //   documentData,
      //   appealStrategy.templateId,
      //   appealStrategy.appealType
      // );
      
      // Instead, we'll test the public method
      const result = appealService.generateAppeal(documentData);
      
      // Check that the result has expected values
      expect(result).to.have.property('appealContent');
      expect(result).to.have.property('appealType').equal('medicalNecessity');
      expect(result).to.have.property('suggestedEvidence').that.is.an('array');
    });
  });
});

describe('AI Service', () => {
  describe('generateDeadlineWarning', () => {
    it('should generate a high severity warning for urgent deadlines', () => {
      // Create a deadline 2 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      const result = aiService.generateDeadlineWarning(futureDate);
      
      expect(result).to.have.property('type').equal('urgent');
      expect(result).to.have.property('severity').equal('high');
      expect(result).to.have.property('daysRemaining').equal(2);
    });
    
    it('should return null for deadlines far in the future', () => {
      // Create a deadline 30 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const result = aiService.generateDeadlineWarning(futureDate);
      
      expect(result).to.be.null;
    });
    
    it('should generate an expired warning for past deadlines', () => {
      // Create a deadline 5 days ago
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const result = aiService.generateDeadlineWarning(pastDate);
      
      expect(result).to.have.property('type').equal('expired');
      expect(result).to.have.property('severity').equal('high');
      expect(result).to.have.property('daysRemaining').equal(-5);
    });
  });
});