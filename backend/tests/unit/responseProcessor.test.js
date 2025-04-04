const mongoose = require('mongoose');
const responseProcessorService = require('../../services/responseProcessorService');
const Document = require('../../models/documentModel');
const Appeal = require('../../models/appealModel');

// Mock the dependencies
jest.mock('../../models/documentModel');
jest.mock('../../models/appealModel');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('Response Processor Service', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isResponseDocument', () => {
    test('should identify document with response type', () => {
      const document = {
        documentType: 'insuranceResponse',
        extractedData: {}
      };
      
      expect(responseProcessorService.isResponseDocument(document)).toBe(true);
    });
    
    test('should identify document with appeal response type', () => {
      const document = {
        documentType: 'appealResponse',
        extractedData: {}
      };
      
      expect(responseProcessorService.isResponseDocument(document)).toBe(true);
    });
    
    test('should identify document with EOB type', () => {
      const document = {
        documentType: 'EOB',
        extractedData: {}
      };
      
      expect(responseProcessorService.isResponseDocument(document)).toBe(true);
    });
    
    test('should identify document with response in title', () => {
      const document = {
        documentType: 'letter',
        extractedData: {
          documentTitle: 'Appeal Response Letter'
        }
      };
      
      expect(responseProcessorService.isResponseDocument(document)).toBe(true);
    });
    
    test('should identify document with decision language', () => {
      const document = {
        documentType: 'letter',
        extractedData: {
          extractedText: 'We have decided to approve your appeal request.'
        }
      };
      
      expect(responseProcessorService.isResponseDocument(document)).toBe(true);
    });
    
    test('should return false for non-response document', () => {
      const document = {
        documentType: 'medicalRecord',
        extractedData: {
          documentTitle: 'Progress Notes',
          extractedText: 'Patient presented with...'
        }
      };
      
      expect(responseProcessorService.isResponseDocument(document)).toBe(false);
    });
  });
  
  describe('extractDecisionData', () => {
    test('should extract approved decision data', () => {
      const document = {
        extractedData: {
          appealDecision: 'approved',
          responseDate: '2023-07-15',
          approvedAmount: '1500.00',
          claimNumber: '12345678',
          memberId: 'ABC123',
          patientName: 'John Doe',
          serviceDate: '2023-05-01'
        }
      };
      
      const result = responseProcessorService.extractDecisionData(document);
      
      expect(result).toEqual({
        decision: 'approved',
        responseDate: new Date('2023-07-15'),
        recoveredAmount: 1500,
        notes: '',
        denialReason: '',
        nextLevelDeadline: null,
        claimNumber: '12345678',
        memberId: 'ABC123',
        patientName: 'John Doe',
        serviceDate: '2023-05-01'
      });
    });
    
    test('should extract denied decision data', () => {
      const document = {
        extractedData: {
          appealDecision: 'denied',
          responseDate: '2023-07-15',
          denialReason: 'Service not medically necessary',
          nextLevelAppealDeadline: '2023-08-15',
          claimNumber: '12345678'
        }
      };
      
      const result = responseProcessorService.extractDecisionData(document);
      
      expect(result).toEqual({
        decision: 'denied',
        responseDate: new Date('2023-07-15'),
        recoveredAmount: 0,
        notes: 'Service not medically necessary',
        denialReason: 'Service not medically necessary',
        nextLevelDeadline: new Date('2023-08-15'),
        claimNumber: '12345678',
        memberId: undefined,
        patientName: undefined,
        serviceDate: undefined
      });
    });
    
    test('should detect decision from text content', () => {
      const document = {
        extractedData: {
          extractedText: 'We have reviewed your appeal and the decision is APPROVED.',
          letterDate: '2023-07-15',
          allowedAmount: '1200.50'
        }
      };
      
      const result = responseProcessorService.extractDecisionData(document);
      
      expect(result.decision).toBe('approved');
      expect(result.recoveredAmount).toBe(1200.5);
    });
  });
  
  describe('processResponseDocument', () => {
    test('should process a response document and update appeal', async () => {
      // Setup mocks
      const mockDocument = {
        _id: 'doc123',
        user: 'user123',
        status: 'processed',
        documentType: 'insuranceResponse',
        extractedData: {
          appealDecision: 'approved',
          responseDate: '2023-07-15',
          approvedAmount: '1500.00',
          claimNumber: '12345678',
          patientName: 'John Doe'
        }
      };
      
      const mockAppeal = {
        _id: 'appeal123',
        status: 'submitted',
        timeline: [],
        save: jest.fn().mockResolvedValue({
          _id: 'appeal123',
          status: 'approved',
          outcomeDetails: {
            responseDate: new Date('2023-07-15'),
            decision: 'approved',
            recoveredAmount: 1500,
            notes: ''
          },
          timeline: [
            {
              date: expect.any(Date),
              status: 'approved',
              description: 'Appeal approved: '
            }
          ]
        })
      };
      
      // Mock the document retrieval
      Document.findById.mockResolvedValue(mockDocument);
      
      // Mock finding a matching appeal
      Appeal.find.mockResolvedValue([mockAppeal]);
      
      // Call the process function
      const result = await responseProcessorService.processResponseDocument('doc123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.appeal).toBe('appeal123');
      expect(result.decision).toBe('approved');
      expect(result.recoveredAmount).toBe(1500);
      expect(mockAppeal.save).toHaveBeenCalled();
    });
    
    test('should return error for unprocessed document', async () => {
      // Setup mocks
      const mockDocument = {
        _id: 'doc123',
        status: 'uploaded'
      };
      
      // Mock the document retrieval
      Document.findById.mockResolvedValue(mockDocument);
      
      // Call the process function
      const result = await responseProcessorService.processResponseDocument('doc123');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Document has not been processed yet');
    });
    
    test('should handle no matching appeal found', async () => {
      // Setup mocks
      const mockDocument = {
        _id: 'doc123',
        user: 'user123',
        status: 'processed',
        documentType: 'insuranceResponse',
        extractedData: {
          appealDecision: 'approved',
          claimNumber: '99999'  // No matching claim number
        }
      };
      
      // Mock empty appeals list (no matches)
      Appeal.find.mockResolvedValue([]);
      
      // Mock the document retrieval
      Document.findById.mockResolvedValue(mockDocument);
      
      // Call the process function
      const result = await responseProcessorService.processResponseDocument('doc123');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('No matching appeal found');
      expect(result.possibleMatches).toEqual([]);
    });
  });
  
  describe('updateAppealWithResponse', () => {
    test('should update appeal for approved decision', async () => {
      // Setup mock appeal
      const mockAppeal = {
        _id: 'appeal123',
        status: 'submitted',
        timeline: [],
        save: jest.fn().mockResolvedValue({
          _id: 'appeal123',
          status: 'approved'
        })
      };
      
      // Decision data
      const decisionData = {
        decision: 'approved',
        responseDate: new Date('2023-07-15'),
        recoveredAmount: 1500,
        notes: 'Appeal approved'
      };
      
      // Call update function
      const result = await responseProcessorService.updateAppealWithResponse(mockAppeal, decisionData);
      
      // Assertions
      expect(mockAppeal.status).toBe('approved');
      expect(mockAppeal.outcomeDetails).toEqual({
        responseDate: decisionData.responseDate,
        decision: 'approved',
        recoveredAmount: 1500,
        notes: 'Appeal approved'
      });
      expect(mockAppeal.timeline.length).toBe(1);
      expect(mockAppeal.save).toHaveBeenCalled();
      expect(result._id).toBe('appeal123');
    });
    
    test('should update appeal for denied decision', async () => {
      // Setup mock appeal with medical necessity type
      const mockAppeal = {
        _id: 'appeal123',
        status: 'submitted',
        appealType: 'medicalNecessity',
        timeline: [],
        save: jest.fn().mockResolvedValue({
          _id: 'appeal123',
          status: 'denied'
        })
      };
      
      // Decision data
      const decisionData = {
        decision: 'denied',
        responseDate: new Date('2023-07-15'),
        recoveredAmount: 0,
        notes: 'Service not medically necessary',
        denialReason: 'Service not medically necessary',
        nextLevelDeadline: new Date('2023-08-15')
      };
      
      // Call update function
      const result = await responseProcessorService.updateAppealWithResponse(mockAppeal, decisionData);
      
      // Assertions
      expect(mockAppeal.status).toBe('denied');
      expect(mockAppeal.outcomeDetails).toEqual({
        responseDate: decisionData.responseDate,
        decision: 'denied',
        recoveredAmount: 0,
        notes: 'Service not medically necessary'
      });
      expect(mockAppeal.nextLevelAppeal).toEqual({
        isEligible: true,
        deadline: decisionData.nextLevelDeadline,
        denialReason: 'Service not medically necessary'
      });
      expect(mockAppeal.externalReview).toEqual({
        isEligibleForExternalReview: true
      });
      expect(mockAppeal.timeline.length).toBe(1);
      expect(mockAppeal.save).toHaveBeenCalled();
    });
  });
  
  describe('generateNextSteps', () => {
    test('should generate next steps for approved appeals', () => {
      const mockAppeal = {
        status: 'approved',
        outcomeDetails: {
          decision: 'approved'
        }
      };
      
      const decisionData = {
        decision: 'approved'
      };
      
      const nextSteps = responseProcessorService.generateNextSteps(mockAppeal, decisionData);
      
      expect(nextSteps).toContainEqual('Record payment when received');
      expect(nextSteps).toContainEqual('Verify correct amount was approved');
      expect(nextSteps).toContainEqual('Update patient account');
    });
    
    test('should generate next steps for denied appeals', () => {
      const mockAppeal = {
        status: 'denied',
        outcomeDetails: {
          decision: 'denied'
        },
        nextLevelAppeal: {
          isEligible: true,
          deadline: new Date('2023-08-15')
        },
        externalReview: {
          isEligibleForExternalReview: true
        }
      };
      
      const decisionData = {
        decision: 'denied'
      };
      
      const nextSteps = responseProcessorService.generateNextSteps(mockAppeal, decisionData);
      
      expect(nextSteps).toContainEqual('Consider next level appeal');
      expect(nextSteps).toContainEqual(expect.stringContaining('Submit by'));
      expect(nextSteps).toContainEqual('Consider external review through state insurance department');
      expect(nextSteps).toContainEqual('Update patient regarding denial and next options');
    });
  });
});