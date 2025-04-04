/**
 * Test Utilities
 * 
 * Reusable functions for test setup and teardown
 */

const mongoose = require('mongoose');
const Patient = require('../../../models/patientModel');
const Appeal = require('../../../models/appealModel');
const User = require('../../../models/userModel');
const logger = require('../../../utils/logger');

// Track created test data for cleanup
let testData = {
  patients: [],
  appeals: [],
  users: []
};

// Shared test data that persists between tests
let sharedTestData = {};

/**
 * Get shared test data
 * 
 * @returns {Object} Shared test data
 */
const getSharedTestData = () => {
  return sharedTestData;
};

/**
 * Update shared test data
 * 
 * @param {Object} newData - New data to merge
 */
const updateSharedTestData = (newData) => {
  sharedTestData = {
    ...sharedTestData,
    ...newData
  };
};

/**
 * Set up MongoDB connection for tests
 */
const setupMongoDB = async () => {
  // Skip if already connected or using mock mode
  if (mongoose.connection.readyState !== 0 || process.env.USE_MOCK_DB === 'true') {
    return;
  }
  
  try {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/appealaid_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info('Connected to test database');
  } catch (error) {
    logger.error('Error connecting to test database:', error);
    throw error;
  }
};

/**
 * Create mock data for tests
 * Creates patients, appeals, etc.
 * 
 * @returns {Object} Created test data
 */
const setupTestData = async () => {
  // Skip actual DB operations if using mock mode
  if (process.env.USE_MOCK_DB === 'true') {
    // Generate and return mock data for tests
    const mockPatients = [
      {
        _id: 'mock-patient-1',
        patientId: 'P12345',
        name: 'John Doe',
        preferredLanguage: 'en',
        email: 'john@example.com'
      },
      {
        _id: 'mock-patient-2',
        patientId: 'P67890',
        name: 'Jane Smith',
        preferredLanguage: 'es',
        email: 'jane@example.com'
      }
    ];
    
    const mockAppeals = [
      {
        _id: 'mock-appeal-1',
        appealId: 'AP789012',
        claimId: 'CL123456',
        patient: mockPatients[0]._id,
        status: 'submitted',
        decision: null,
        serviceName: 'MRI - Lower Back',
        serviceDate: new Date('2023-06-01'),
        insuranceCompany: 'Blue Cross Blue Shield',
        reason: 'Service was medically necessary',
        requestedAmount: 1500.00,
        submissionDate: new Date('2023-06-15')
      },
      {
        _id: 'mock-appeal-2',
        appealId: 'AP123456',
        claimId: 'CL987654',
        patient: mockPatients[1]._id,
        status: 'submitted',
        decision: null,
        serviceName: 'Physical Therapy',
        serviceDate: new Date('2023-07-01'),
        insuranceCompany: 'Aetna',
        reason: 'Treatment was ordered by physician',
        requestedAmount: 2500.00,
        submissionDate: new Date('2023-07-20')
      }
    ];
    
    testData = {
      patients: mockPatients,
      appeals: mockAppeals,
      users: []
    };
    
    // Update shared test data for other tests to use
    updateSharedTestData({
      patients: mockPatients,
      appeals: mockAppeals
    });
    
    return testData;
  }
  
  // Connect to MongoDB for tests
  await setupMongoDB();
  
  try {
    // Create test patients
    const patients = [
      new Patient({
        patientId: 'TEST-P12345',
        name: 'John Doe Test',
        dateOfBirth: new Date('1980-01-01'),
        gender: 'male',
        email: 'john.test@example.com',
        phone: '555-123-4567',
        preferredLanguage: 'en',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        insuranceInfo: [{
          insuranceCompany: 'Blue Cross Blue Shield',
          memberId: 'BCBS12345',
          groupNumber: 'GRP123',
          isPrimary: true
        }]
      }),
      new Patient({
        patientId: 'TEST-P67890',
        name: 'Jane Smith Test',
        dateOfBirth: new Date('1985-02-15'),
        gender: 'female',
        email: 'jane.test@example.com',
        phone: '555-987-6543',
        preferredLanguage: 'es',
        address: {
          street: '456 Oak Ave',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890'
        },
        insuranceInfo: [{
          insuranceCompany: 'Aetna',
          memberId: 'AET67890',
          groupNumber: 'GRP456',
          isPrimary: true
        }]
      })
    ];
    
    // Save patients
    for (const patient of patients) {
      await patient.save();
      testData.patients.push(patient);
    }
    
    // Create test appeals
    const appeals = [
      new Appeal({
        appealId: 'TEST-AP789012',
        claimId: 'TEST-CL123456',
        patient: patients[0]._id,
        serviceDate: new Date('2023-06-01'),
        serviceName: 'MRI - Lower Back',
        serviceDescription: 'Magnetic resonance imaging of the lumbar spine',
        serviceProvider: 'Medical Imaging Center',
        insuranceCompany: 'Blue Cross Blue Shield',
        insurancePlan: 'PPO',
        insuranceMemberId: 'BCBS12345',
        requestedAmount: 1500.00,
        status: 'submitted',
        reason: 'Service was medically necessary',
        submissionDate: new Date('2023-06-15')
      }),
      new Appeal({
        appealId: 'TEST-AP123456',
        claimId: 'TEST-CL987654',
        patient: patients[1]._id,
        serviceDate: new Date('2023-07-01'),
        serviceName: 'Physical Therapy',
        serviceDescription: '10 sessions of physical therapy for lower back pain',
        serviceProvider: 'Back Pain Clinic',
        insuranceCompany: 'Aetna',
        insurancePlan: 'HMO',
        insuranceMemberId: 'AET67890',
        requestedAmount: 2500.00,
        status: 'submitted',
        reason: 'Treatment was ordered by physician',
        submissionDate: new Date('2023-07-20')
      })
    ];
    
    // Save appeals
    for (const appeal of appeals) {
      await appeal.save();
      testData.appeals.push(appeal);
    }
    
    // Update shared test data for other tests to use
    updateSharedTestData({
      patients,
      appeals
    });
    
    return testData;
  } catch (error) {
    logger.error('Error setting up test data:', error);
    throw error;
  }
};

/**
 * Clear test data after tests
 */
const clearTestData = async () => {
  // Skip cleanup if using mock mode
  if (process.env.USE_MOCK_DB === 'true') {
    testData = {
      patients: [],
      appeals: [],
      users: []
    };
    return;
  }
  
  try {
    // Delete test data
    if (mongoose.connection.readyState !== 0) {
      for (const appeal of testData.appeals) {
        await Appeal.findByIdAndDelete(appeal._id);
      }
      
      for (const patient of testData.patients) {
        await Patient.findByIdAndDelete(patient._id);
      }
      
      for (const user of testData.users) {
        await User.findByIdAndDelete(user._id);
      }
    }
    
    // Reset tracked test data
    testData = {
      patients: [],
      appeals: [],
      users: []
    };
  } catch (error) {
    logger.error('Error clearing test data:', error);
    throw error;
  }
};

module.exports = {
  setupMongoDB,
  setupTestData,
  clearTestData,
  getSharedTestData,
  updateSharedTestData
};