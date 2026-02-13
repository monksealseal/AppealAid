/**
 * Mock Database Setup
 *
 * Provides an in-memory mock layer for Mongoose models when no MongoDB
 * instance is available. Patches Mongoose models so all controllers
 * and services work without modification.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

// In-memory collections storage
const collections = {};

/**
 * Generate a new ObjectId-like string
 */
function newId() {
  return new mongoose.Types.ObjectId().toString();
}

/**
 * Deep clone an object (for returning copies, not references)
 */
function deepClone(obj) {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value instanceof mongoose.Types.ObjectId) return value.toString();
    if (value instanceof Date) return value.toISOString();
    return value;
  }));
}

/**
 * Simple query matcher - checks if a document matches a query
 */
function matchesQuery(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or') {
      const orResult = value.some(subQuery => matchesQuery(doc, subQuery));
      if (!orResult) return false;
      continue;
    }
    if (key === '$and') {
      const andResult = value.every(subQuery => matchesQuery(doc, subQuery));
      if (!andResult) return false;
      continue;
    }
    if (key === '$expr') continue; // Skip complex expressions

    // Get nested value
    const docValue = getNestedValue(doc, key);

    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Handle operators
      if (value.$in) {
        if (!value.$in.some(v => String(v) === String(docValue))) return false;
        continue;
      }
      if (value.$gte !== undefined) {
        if (docValue < value.$gte) return false;
      }
      if (value.$lte !== undefined) {
        if (docValue > value.$lte) return false;
      }
      if (value.$lt !== undefined) {
        if (docValue >= value.$lt) return false;
      }
      if (value.$gt !== undefined) {
        if (docValue <= value.$gt) return false;
      }
      continue;
    }

    // Direct comparison
    if (String(docValue) !== String(value)) return false;
  }
  return true;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
}

/**
 * Create a mock document instance with save/toObject methods
 */
function createMockDocument(data, collectionName) {
  const doc = { ...data };

  if (!doc._id) {
    doc._id = newId();
  }
  doc._id = String(doc._id);

  if (!doc.createdAt) doc.createdAt = new Date();
  if (!doc.updatedAt) doc.updatedAt = new Date();

  // Add Mongoose-like instance methods
  doc.save = async function () {
    doc.updatedAt = new Date();
    const col = collections[collectionName] || [];
    const idx = col.findIndex(d => String(d._id) === String(doc._id));
    if (idx >= 0) {
      collections[collectionName][idx] = { ...doc };
    } else {
      if (!collections[collectionName]) collections[collectionName] = [];
      collections[collectionName].push({ ...doc });
    }
    return doc;
  };

  doc.toObject = function () {
    const obj = { ...doc };
    delete obj.save;
    delete obj.toObject;
    delete obj.populate;
    delete obj.isModified;
    delete obj.matchPassword;
    return obj;
  };

  doc.populate = function () {
    return Promise.resolve(doc);
  };

  doc.isModified = function () {
    return false;
  };

  // For User model compatibility
  if (collectionName === 'users') {
    doc.matchPassword = async function (enteredPassword) {
      return bcrypt.compare(enteredPassword, doc.password);
    };
  }

  return doc;
}

/**
 * Create a chainable query object (mimics Mongoose Query)
 */
function createQuery(results) {
  const query = {
    _results: results,
    _selectFields: null,
    _sortOption: null,
    _limitVal: 0,
    _skipVal: 0,
    _populateFields: [],

    select(fields) {
      query._selectFields = fields;
      return query;
    },
    sort(option) {
      query._sortOption = option;
      return query;
    },
    limit(val) {
      query._limitVal = val;
      return query;
    },
    skip(val) {
      query._skipVal = val;
      return query;
    },
    populate(field, select) {
      query._populateFields.push({ field, select });
      return query;
    },
    lean() {
      return query;
    },
    exec() {
      return query.then(r => r);
    },
    then(resolve, reject) {
      try {
        let res = [...query._results];

        // Apply sorting
        if (query._sortOption && typeof query._sortOption === 'string') {
          const desc = query._sortOption.startsWith('-');
          const field = desc ? query._sortOption.slice(1) : query._sortOption;
          res.sort((a, b) => {
            const aVal = getNestedValue(a, field);
            const bVal = getNestedValue(b, field);
            if (aVal < bVal) return desc ? 1 : -1;
            if (aVal > bVal) return desc ? -1 : 1;
            return 0;
          });
        }

        // Apply skip
        if (query._skipVal > 0) {
          res = res.slice(query._skipVal);
        }

        // Apply limit
        if (query._limitVal > 0) {
          res = res.slice(0, query._limitVal);
        }

        resolve(res);
      } catch (err) {
        if (reject) reject(err);
      }
    },
    catch(reject) {
      return Promise.resolve(query._results).catch(reject);
    }
  };
  return query;
}

/**
 * Patch a Mongoose model to use in-memory storage
 */
function patchModel(model) {
  const collectionName = model.modelName.toLowerCase() + 's';

  if (!collections[collectionName]) {
    collections[collectionName] = [];
  }

  // Override static methods
  const originalCreate = model.create.bind(model);
  model.create = async function (data) {
    const doc = createMockDocument(data, collectionName);
    // For User model, hash password
    if (collectionName === 'users' && data.password && !data.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(data.password, salt);
    }
    collections[collectionName].push({ ...doc });
    return doc;
  };

  model.find = function (query) {
    const results = (collections[collectionName] || [])
      .filter(doc => matchesQuery(doc, query))
      .map(doc => createMockDocument({ ...doc }, collectionName));
    return createQuery(results);
  };

  model.findById = function (id) {
    const doc = (collections[collectionName] || []).find(d => String(d._id) === String(id));
    if (!doc) return { populate: () => Promise.resolve(null), then: (r) => r(null), catch: () => {} };
    const result = createMockDocument({ ...doc }, collectionName);
    return {
      populate: () => Promise.resolve(result),
      select: () => Promise.resolve(result),
      then: (r) => r(result),
      catch: () => {}
    };
  };

  model.findOne = function (query) {
    const doc = (collections[collectionName] || []).find(d => matchesQuery(d, query));
    if (!doc) return { populate: () => Promise.resolve(null), then: (r) => r(null), catch: () => {} };
    const result = createMockDocument({ ...doc }, collectionName);
    return {
      populate: () => Promise.resolve(result),
      select: () => Promise.resolve(result),
      then: (r) => r(result),
      catch: () => {}
    };
  };

  model.findByIdAndUpdate = async function (id, update) {
    const col = collections[collectionName] || [];
    const idx = col.findIndex(d => String(d._id) === String(id));
    if (idx < 0) return null;
    const updateData = update.$set || update;
    col[idx] = { ...col[idx], ...updateData, updatedAt: new Date() };
    return createMockDocument({ ...col[idx] }, collectionName);
  };

  model.findOneAndUpdate = async function (query, update) {
    const col = collections[collectionName] || [];
    const idx = col.findIndex(d => matchesQuery(d, query));
    if (idx < 0) return null;
    const updateData = update.$set || update;
    col[idx] = { ...col[idx], ...updateData, updatedAt: new Date() };
    return createMockDocument({ ...col[idx] }, collectionName);
  };

  model.updateMany = async function (query, update) {
    const col = collections[collectionName] || [];
    const updateData = update.$set || update;
    let matched = 0;
    let modified = 0;
    col.forEach((doc, idx) => {
      if (matchesQuery(doc, query)) {
        matched++;
        col[idx] = { ...doc, ...updateData, updatedAt: new Date() };
        modified++;
      }
    });
    return { matchedCount: matched, modifiedCount: modified };
  };

  model.countDocuments = async function (query) {
    return (collections[collectionName] || []).filter(d => matchesQuery(d, query || {})).length;
  };

  model.aggregate = async function () {
    // Return empty results for aggregate queries (used for stats)
    return [];
  };

  model.deleteOne = async function (query) {
    const col = collections[collectionName] || [];
    const idx = col.findIndex(d => matchesQuery(d, query));
    if (idx >= 0) {
      col.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  };

  model.deleteMany = async function (query) {
    const col = collections[collectionName] || [];
    const before = col.length;
    collections[collectionName] = col.filter(d => !matchesQuery(d, query || {}));
    return { deletedCount: before - collections[collectionName].length };
  };

  // Constructor override for `new Model(data)`
  const OriginalModel = model;
  return model;
}

/**
 * Start the mock database - patches all Mongoose models
 */
async function startMockDb() {
  try {
    logger.info('Initializing in-memory mock database...');

    // Patch all registered models
    const modelNames = mongoose.modelNames();
    for (const name of modelNames) {
      patchModel(mongoose.model(name));
    }

    // Also patch any models registered after this point
    const originalModel = mongoose.model.bind(mongoose);
    const patchedModels = new Set(modelNames);

    const modelProxy = function (name, schema, collection) {
      const model = originalModel(name, schema, collection);
      if (!patchedModels.has(name) && schema) {
        patchModel(model);
        patchedModels.add(name);
      }
      return model;
    };
    // Don't override mongoose.model since it breaks things - just patch after requiring

    // Seed the database with demo data
    await seedDatabase();

    logger.info('In-memory mock database ready');
  } catch (error) {
    logger.error(`Failed to start mock database: ${error.message}`);
    throw error;
  }
}

/**
 * Seed the in-memory database with demo data
 */
async function seedDatabase() {
  try {
    // Import and patch models
    const User = require('../models/userModel');
    const Document = require('../models/documentModel');
    const Appeal = require('../models/appealModel');

    patchModel(User);
    patchModel(Document);
    patchModel(Appeal);

    // Also patch models that may be used by other routes
    try { patchModel(require('../models/facilityModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/batchModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/peerReviewModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/patientModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/templateModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/checklistModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/subscriptionModel')); } catch (e) { /* optional */ }
    try { patchModel(require('../models/organizationModel')); } catch (e) { /* optional */ }

    // Create demo users (password is pre-hashed for 'password123')
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUserId = '60d0fe4f5311236168a109ca';
    const adminUserId = '60d0fe4f5311236168a109cb';

    collections['users'] = [
      {
        _id: demoUserId,
        firstName: 'Demo',
        lastName: 'User',
        name: 'Demo User',
        email: 'demo@appealaid.com',
        password: hashedPassword,
        role: 'patient',
        insuranceInfo: {
          carrier: 'Blue Cross Blue Shield',
          memberId: 'BCBS12345678',
          groupNumber: 'GROUP123'
        },
        consents: {
          termsAndConditions: true,
          privacyPolicy: true,
          dataProcessing: true,
          consentDate: new Date()
        },
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        _id: adminUserId,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        email: 'admin@appealaid.com',
        password: hashedPassword,
        role: 'admin',
        insuranceInfo: {
          carrier: 'Aetna',
          memberId: 'AET98765432',
          groupNumber: 'ADMINGRP'
        },
        consents: {
          termsAndConditions: true,
          privacyPolicy: true,
          dataProcessing: true,
          consentDate: new Date()
        },
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ];

    // Create demo documents
    const doc1Id = newId();
    const doc2Id = newId();
    const doc3Id = newId();

    collections['documents'] = [
      {
        _id: doc1Id,
        user: demoUserId,
        documentType: 'eob',
        fileName: 'Blue Cross EOB - 05/15/2023.pdf',
        fileSize: 245000,
        fileType: 'application/pdf',
        filePath: '/uploads/mock/eob-bcbs.pdf',
        status: 'processed',
        isDeleted: false,
        isPriority: true,
        extractedData: {
          documentDate: new Date('2023-05-15'),
          providerName: 'City Medical Imaging',
          patientName: 'Demo User',
          insuranceCarrier: 'Blue Cross Blue Shield',
          claimNumber: 'BCBS-2023-078945',
          memberId: 'BCBS12345678',
          serviceDate: new Date('2023-05-10'),
          billedAmount: 1250.75,
          allowedAmount: 375.25,
          patientResponsibility: 875.50,
          denialReason: 'Not Medically Necessary',
          denialCode: 'B445',
          serviceDescription: 'MRI Lower Back - CPT 72148',
          denialInfo: {
            isDenial: true,
            denialType: 'medicalNecessity',
            confidence: 0.92,
            appealDeadlineDays: 90,
            appealDeadlineDate: new Date('2023-08-18'),
            suggestedNextSteps: [
              'Gather medical records supporting medical necessity',
              'Obtain letter of medical necessity from referring physician',
              'Submit appeal within 90 days'
            ]
          },
          appealPotential: {
            successProbability: 0.72,
            priorityScore: 8.5,
            appealRecommendation: 'Strong candidate for appeal'
          }
        },
        extractedText: 'EXPLANATION OF BENEFITS - Blue Cross Blue Shield\nClaim: BCBS-2023-078945\nDenial Reason: Not Medically Necessary',
        createdAt: new Date('2023-05-20'),
        updatedAt: new Date('2023-05-20')
      },
      {
        _id: doc2Id,
        user: demoUserId,
        documentType: 'denialLetter',
        fileName: 'Aetna Denial Letter - 06/02/2023.pdf',
        fileSize: 320000,
        fileType: 'application/pdf',
        filePath: '/uploads/mock/denial-aetna.pdf',
        status: 'processed',
        isDeleted: false,
        isPriority: false,
        extractedData: {
          documentDate: new Date('2023-06-02'),
          providerName: 'Elite Physical Therapy',
          patientName: 'Demo User',
          insuranceCarrier: 'Aetna Health Insurance',
          claimNumber: 'AET-2023-123456',
          billedAmount: 2340.00,
          allowedAmount: 0,
          patientResponsibility: 2340.00,
          denialReason: 'Out of Network',
          denialCode: 'OON-243',
          serviceDescription: 'Physical Therapy Sessions x5',
          denialInfo: {
            isDenial: true,
            denialType: 'networkStatus',
            confidence: 0.95,
            appealDeadlineDays: 60,
            appealDeadlineDate: new Date('2023-09-02'),
            suggestedNextSteps: [
              'Verify if provider has any in-network affiliations',
              'Document attempts to find in-network provider'
            ]
          },
          appealPotential: {
            successProbability: 0.58,
            priorityScore: 7.2,
            appealRecommendation: 'Moderate appeal potential'
          }
        },
        extractedText: 'DENIAL OF COVERAGE - Aetna Health Insurance\nClaim: AET-2023-123456\nDenial Reason: Out of Network',
        createdAt: new Date('2023-06-05'),
        updatedAt: new Date('2023-06-05')
      },
      {
        _id: doc3Id,
        user: demoUserId,
        documentType: 'medicalRecord',
        fileName: 'Medical Records - Dr. Smith.pdf',
        fileSize: 580000,
        fileType: 'application/pdf',
        filePath: '/uploads/mock/medical-records.pdf',
        status: 'processed',
        isDeleted: false,
        isPriority: false,
        extractedData: {
          documentDate: new Date('2023-06-05'),
          providerName: 'Dr. Jane Smith',
          patientName: 'Demo User',
          serviceDescription: 'Office visit and examination for lower back pain'
        },
        extractedText: 'MEDICAL RECORDS\nPatient: Demo User\nProvider: Dr. Jane Smith',
        createdAt: new Date('2023-06-05'),
        updatedAt: new Date('2023-06-05')
      }
    ];

    // Create demo appeals
    const patientId = newId();
    collections['appeals'] = [
      {
        _id: newId(),
        appealId: 'AP001',
        claimId: 'BCBS-2023-078945',
        patient: patientId,
        serviceDate: new Date('2023-05-10'),
        serviceName: 'MRI Lower Back',
        serviceDescription: 'MRI of the lumbar spine to diagnose persistent lower back pain',
        serviceProvider: 'City Medical Imaging',
        serviceLocation: 'City Medical Imaging, Boston, MA',
        insuranceCompany: 'Blue Cross Blue Shield',
        insurancePlan: 'BCBS PPO',
        insuranceMemberId: 'BCBS12345678',
        requestedAmount: 1250.75,
        approvedAmount: 0,
        deniedAmount: 1250.75,
        status: 'submitted',
        decision: null,
        reason: 'The MRI was ordered by my physician due to severe, persistent lower back pain that did not improve with 6 weeks of physical therapy.',
        submissionDate: new Date('2023-06-15'),
        documents: [
          { documentId: doc1Id, documentType: 'denial_letter', name: 'Blue Cross EOB.pdf', path: '/uploads/mock/eob-bcbs.pdf', uploadDate: new Date('2023-06-12') }
        ],
        clinicalSummary: {
          patientInfo: { age: 42, gender: 'Male' },
          primaryDiagnosis: { code: 'M54.5', description: 'Low back pain' },
          clinicalJustification: 'Patient has persistent lower back pain unresponsive to conservative treatment.'
        },
        lastActivity: { date: new Date('2023-06-15'), action: 'submitted', details: 'Appeal submitted' },
        createdAt: new Date('2023-06-12'),
        updatedAt: new Date('2023-06-15')
      },
      {
        _id: newId(),
        appealId: 'AP002',
        claimId: 'AET-2023-123456',
        patient: patientId,
        serviceDate: new Date('2023-05-28'),
        serviceName: 'Physical Therapy Sessions',
        serviceDescription: '5 sessions of physical therapy for lower back pain',
        serviceProvider: 'Elite Physical Therapy',
        serviceLocation: 'Elite Physical Therapy, Cambridge, MA',
        insuranceCompany: 'Aetna Health Insurance',
        insurancePlan: 'Aetna PPO',
        insuranceMemberId: 'AET98765432',
        requestedAmount: 2340.00,
        approvedAmount: 0,
        deniedAmount: 2340.00,
        status: 'draft',
        decision: null,
        reason: 'Physical therapy sessions denied as out-of-network.',
        documents: [
          { documentId: doc2Id, documentType: 'denial_letter', name: 'Aetna Denial Letter.pdf', path: '/uploads/mock/denial-aetna.pdf', uploadDate: new Date('2023-06-10') }
        ],
        lastActivity: { date: new Date('2023-06-10'), action: 'created', details: 'Appeal draft created' },
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2023-06-10')
      }
    ];

    // Initialize empty collections for other models
    if (!collections['facilitys']) collections['facilitys'] = [];
    if (!collections['batchs']) collections['batchs'] = [];
    if (!collections['peerreviews']) collections['peerreviews'] = [];
    if (!collections['patients']) collections['patients'] = [];
    if (!collections['templates']) collections['templates'] = [];
    if (!collections['checklists']) collections['checklists'] = [];

    logger.info('Mock database seeded:');
    logger.info(`  - ${collections['users'].length} users`);
    logger.info(`  - ${collections['documents'].length} documents`);
    logger.info(`  - ${collections['appeals'].length} appeals`);

  } catch (error) {
    logger.error(`Error seeding mock database: ${error.message}`);
    throw error;
  }
}

/**
 * Stop the mock database
 */
async function stopMockDb() {
  for (const key of Object.keys(collections)) {
    delete collections[key];
  }
}

module.exports = {
  startMockDb,
  stopMockDb
};
