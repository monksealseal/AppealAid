/**
 * Mock data provider for backend
 * 
 * This module provides mock data for the backend when running in mock mode
 * without MongoDB. It mimics database operations with in-memory data.
 */

// In-memory storage
let users = [
  {
    _id: '60d0fe4f5311236168a109ca',
    name: 'Demo User',
    email: 'demo@appealaid.com',
    password: '$2a$10$zQSMW7QSrEYFkKPM7c9Dm.jdLu6LXavMWUzPqVSPABfMBWxlGPE/2', // hashed "password123"
    role: 'user',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: '60d0fe4f5311236168a109cb',
    name: 'Admin User',
    email: 'admin@appealaid.com',
    password: '$2a$10$zQSMW7QSrEYFkKPM7c9Dm.jdLu6LXavMWUzPqVSPABfMBWxlGPE/2', // hashed "password123"
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

let documents = [
  {
    _id: 'd001',
    name: 'Blue Cross Explanation of Benefits - 05/15/2023',
    type: 'Explanation of Benefits',
    status: 'Processed',
    uploadDate: new Date('2023-05-20T08:00:00Z'),
    provider: 'Blue Cross Blue Shield',
    claimNumber: 'BCBS-2023-078945',
    denialReason: 'Not Medically Necessary',
    serviceDate: new Date('2023-05-10T00:00:00Z'),
    patientName: 'John Smith',
    amount: 1250.75,
    deniedAmount: 875.50,
    filePath: '/uploads/mock/eob-bcbs.pdf',
    user: '60d0fe4f5311236168a109ca',
    extractedData: {
      policyNumber: 'BCBS-POL-12345',
      serviceDescription: 'MRI Lower Back - CPT 72148',
      denialCode: 'B445',
      appealDeadline: new Date('2023-08-18T00:00:00Z'),
      providerInfo: {
        name: 'City Medical Imaging',
        address: '1234 Medical Way, Boston, MA 02115',
        phone: '(555) 123-4567',
        npi: '1234567890',
      }
    },
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-05-20')
  },
  {
    _id: 'd002',
    name: 'Aetna Denial Letter - 06/02/2023',
    type: 'Denial Letter',
    status: 'Processed',
    uploadDate: new Date('2023-06-05T14:30:00Z'),
    provider: 'Aetna Health Insurance',
    claimNumber: 'AET-2023-123456',
    denialReason: 'Out of Network',
    serviceDate: new Date('2023-05-28T00:00:00Z'),
    patientName: 'Jane Doe',
    amount: 2340.00,
    deniedAmount: 2340.00,
    filePath: '/uploads/mock/denial-aetna.pdf',
    user: '60d0fe4f5311236168a109ca',
    extractedData: {
      policyNumber: 'AET-POL-67890',
      serviceDescription: 'Physical Therapy Sessions x5',
      denialCode: 'OON-243',
      appealDeadline: new Date('2023-09-02T00:00:00Z'),
      providerInfo: {
        name: 'Elite Physical Therapy',
        address: '789 Health Blvd, Cambridge, MA 02139',
        phone: '(555) 987-6543',
        npi: '9876543210',
      }
    },
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05')
  }
];

let appeals = [
  {
    _id: 'a001',
    documentId: 'd001',
    title: 'Appeal for MRI Denial - BCBS',
    description: 'Appeal for denied MRI of lower back',
    denialReason: 'Not Medically Necessary',
    status: 'Submitted',
    createdAt: new Date('2023-06-12T14:35:00Z'),
    updatedAt: new Date('2023-06-15T10:20:00Z'),
    submittedAt: new Date('2023-06-15T10:20:00Z'),
    templateId: 'default',
    letter: 'This is a mock appeal letter content for MRI denial...',
    user: '60d0fe4f5311236168a109ca',
    document: 'd001',
    timeline: [
      {
        date: new Date('2023-06-12T14:35:00Z'),
        status: 'Created',
        description: 'Appeal created',
      },
      {
        date: new Date('2023-06-15T10:20:00Z'),
        status: 'Submitted',
        description: 'Appeal submitted to insurance',
      }
    ],
    attachments: [
      {
        id: 'att001',
        name: 'MRI Requisition.pdf',
        type: 'application/pdf',
        size: 245000,
        uploadDate: new Date('2023-06-12T15:30:00Z'),
        filePath: '/uploads/mock/mri-requisition.pdf'
      },
      {
        id: 'att002',
        name: 'Doctor Note - Medical Necessity.pdf',
        type: 'application/pdf',
        size: 320000,
        uploadDate: new Date('2023-06-12T15:35:00Z'),
        filePath: '/uploads/mock/doctor-note.pdf'
      }
    ]
  }
];

// Helper functions for mock database operations
const generateId = () => Math.random().toString(36).substring(2, 10);

// User operations
const userOperations = {
  findByEmail: (email) => {
    return Promise.resolve(users.find(user => user.email === email));
  },
  findById: (id) => {
    return Promise.resolve(users.find(user => user._id === id));
  },
  create: (userData) => {
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return Promise.resolve(newUser);
  }
};

// Document operations
const documentOperations = {
  findAll: (userId) => {
    return Promise.resolve(documents.filter(doc => doc.user === userId));
  },
  findById: (id) => {
    return Promise.resolve(documents.find(doc => doc._id === id));
  },
  create: (docData) => {
    const newDoc = {
      _id: `d${generateId()}`,
      ...docData,
      status: 'Uploaded',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    documents.push(newDoc);
    return Promise.resolve(newDoc);
  },
  updateById: (id, updateData) => {
    const index = documents.findIndex(doc => doc._id === id);
    if (index === -1) return Promise.resolve(null);
    
    documents[index] = {
      ...documents[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(documents[index]);
  },
  deleteById: (id) => {
    const index = documents.findIndex(doc => doc._id === id);
    if (index === -1) return Promise.resolve(false);
    
    documents.splice(index, 1);
    return Promise.resolve(true);
  }
};

// Appeal operations
const appealOperations = {
  findAll: (userId) => {
    return Promise.resolve(appeals.filter(appeal => appeal.user === userId));
  },
  findById: (id) => {
    return Promise.resolve(appeals.find(appeal => appeal._id === id));
  },
  create: (appealData) => {
    const newAppeal = {
      _id: `a${generateId()}`,
      ...appealData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Draft'
    };
    appeals.push(newAppeal);
    return Promise.resolve(newAppeal);
  },
  updateById: (id, updateData) => {
    const index = appeals.findIndex(appeal => appeal._id === id);
    if (index === -1) return Promise.resolve(null);
    
    appeals[index] = {
      ...appeals[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(appeals[index]);
  },
  deleteById: (id) => {
    const index = appeals.findIndex(appeal => appeal._id === id);
    if (index === -1) return Promise.resolve(false);
    
    appeals.splice(index, 1);
    return Promise.resolve(true);
  }
};

module.exports = {
  userOperations,
  documentOperations,
  appealOperations
};