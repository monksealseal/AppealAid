const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const { 
  extractStructuredData,
  identifyDocumentType
} = require('../../services/documentService');

describe('Document Service Tests', () => {
  let denialLetterText;
  
  before(() => {
    // Read the test document
    denialLetterText = fs.readFileSync(
      path.join(__dirname, '../../uploads/test/denial_letter.txt'),
      'utf8'
    );
  });
  
  describe('identifyDocumentType', () => {
    it('should correctly identify denial letter', () => {
      const documentType = identifyDocumentType(denialLetterText);
      expect(documentType).to.equal('denialLetter');
    });
    
    it('should identify EOB documents', () => {
      const eobText = 'EXPLANATION OF BENEFITS This document contains important information about your claim.';
      const documentType = identifyDocumentType(eobText);
      expect(documentType).to.equal('eob');
    });
    
    it('should identify medical records', () => {
      const medicalRecordText = 'PATIENT MEDICAL RECORD Clinical notes for visit on 07/20/2023';
      const documentType = identifyDocumentType(medicalRecordText);
      expect(documentType).to.equal('medicalRecord');
    });
    
    it('should return "other" for unrecognized document types', () => {
      const otherText = 'Generic document with no specific identifiers';
      const documentType = identifyDocumentType(otherText);
      expect(documentType).to.equal('other');
    });
  });
  
  describe('extractStructuredData', () => {
    let extractedData;
    
    before(() => {
      // Extract data once for all tests
      extractedData = extractStructuredData(denialLetterText, 'denialLetter');
    });
    
    it('should extract claim number correctly', () => {
      expect(extractedData).to.have.property('claimNumber', 'BC23-456789');
    });
    
    it('should extract member ID correctly', () => {
      expect(extractedData).to.have.property('memberId', 'XYZ987654321');
    });
    
    it('should extract service date correctly', () => {
      expect(extractedData).to.have.property('serviceDate');
      expect(extractedData.serviceDate).to.be.an.instanceOf(Date);
      // Convert to ISO string and compare only the date part
      expect(extractedData.serviceDate.toISOString().split('T')[0]).to.equal('2023-07-15');
    });
    
    it('should extract document date correctly', () => {
      expect(extractedData).to.have.property('documentDate');
      expect(extractedData.documentDate).to.be.an.instanceOf(Date);
      expect(extractedData.documentDate.toISOString().split('T')[0]).to.equal('2023-07-20');
    });
    
    it('should extract billed amount correctly', () => {
      expect(extractedData).to.have.property('billedAmount', 1250.00);
    });
    
    it('should extract allowed amount correctly', () => {
      expect(extractedData).to.have.property('allowedAmount', 875.50);
    });
    
    it('should extract patient responsibility correctly', () => {
      expect(extractedData).to.have.property('patientResponsibility', 875.50);
    });
    
    it('should extract patient-related information correctly', () => {
      expect(extractedData).to.have.property('patientName');
    });
    
    it('should extract service-related information correctly', () => {
      expect(extractedData).to.have.property('serviceDescription');
    });
    
    it('should extract procedure codes', () => {
      expect(extractedData).to.have.property('procedureCodes');
      expect(extractedData.procedureCodes).to.be.an('array');
    });
    
    it('should extract diagnosis codes if present', () => {
      // This test is more permissive since diagnosis codes are optional
      if (extractedData.diagnosisCodes) {
        expect(extractedData.diagnosisCodes).to.be.an('array');
      }
    });
    
    it('should extract provider information', () => {
      expect(extractedData).to.have.property('providerInfo');
      expect(extractedData.providerInfo).to.be.an('object');
    });
    
    it('should extract denial reason correctly', () => {
      expect(extractedData).to.have.property('denialReason');
    });
    
    it('should extract denial code if present', () => {
      expect(extractedData).to.have.property('denialCode');
    });
    
    it('should extract appeal deadline correctly', () => {
      expect(extractedData).to.have.property('appealDeadline');
      expect(extractedData.appealDeadline).to.be.an.instanceOf(Date);
      
      // The appeal deadline should be 60 days after service date
      const serviceDate = new Date('2023-07-15');
      const expectedDeadline = new Date(serviceDate);
      expectedDeadline.setDate(expectedDeadline.getDate() + 60);
      
      // Compare only the date part (not the time)
      const actualDate = extractedData.appealDeadline.toISOString().split('T')[0];
      const expectedDate = expectedDeadline.toISOString().split('T')[0];
      expect(actualDate).to.equal(expectedDate);
    });
  });
});