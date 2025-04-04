/**
 * Mock API Service
 * This service provides mock data for the AppealAid application
 * to function without a real backend API.
 */

// Simulated database
let mockDb = {
  users: [
    {
      _id: 'user1',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      role: 'patient',
      insuranceInfo: {
        provider: 'Blue Cross Blue Shield',
        memberId: 'BCBS12345678',
        groupNumber: 'GROUP123'
      }
    }
  ],
  appeals: [
    {
      id: 'appeal1',
      title: 'MRI Denial',
      status: 'Pending',
      createdDate: new Date('2023-05-15T10:30:00Z').toISOString(),
      submittedDate: null,
      claimNumber: 'BCBS123456789',
      provider: 'Blue Cross Blue Shield',
      denialReason: 'Not Medically Necessary',
      progress: 60,
      document: {
        id: 'doc1',
        name: 'EOB - MRI Denial',
        type: 'Explanation of Benefits',
      },
      patient: {
        name: 'Demo User',
        dob: '1980-06-15',
        insuranceId: 'BCBS12345678',
        insuranceProvider: 'Blue Cross Blue Shield',
      },
      appealLetter: {
        greeting: 'To Whom It May Concern:',
        introduction: 'I am writing to appeal the denial of coverage for the MRI of my lower back that was performed on April 20, 2023. The claim number is BCBS123456789.',
        body: 'This procedure was recommended by my primary care physician, Dr. Jane Smith, due to persistent lower back pain that has not responded to conservative treatment over the past three months. Prior to the MRI, I completed six weeks of physical therapy and tried multiple pain medications without significant improvement.\n\nAccording to my plan documents, diagnostic tests that are ordered by a physician to determine the cause of symptoms are covered services. The MRI was medically necessary to diagnose the cause of my persistent pain and to guide appropriate treatment decisions.\n\nEnclosed with this appeal, I have included:\n1. A letter from Dr. Smith explaining the medical necessity of this procedure\n2. My physical therapy records showing lack of improvement with conservative treatment\n3. The relevant section of my insurance policy document showing coverage for diagnostic tests',
        conclusion: 'Based on this information, I request that you reconsider your decision and provide coverage for this medically necessary procedure. If you require any additional information, please contact me at the number listed below.\n\nThank you for your prompt attention to this matter.',
        signature: 'Sincerely,\nDemo User',
      },
    },
    {
      id: 'appeal2',
      title: 'Surgery Authorization Denial',
      status: 'Draft',
      createdDate: new Date('2023-06-10T14:45:00Z').toISOString(),
      submittedDate: null,
      claimNumber: 'BCBS987654321',
      provider: 'Blue Cross Blue Shield',
      denialReason: 'Pre-authorization Required',
      progress: 30,
      document: {
        id: 'doc2',
        name: 'Surgery Denial Letter',
        type: 'Authorization Denial',
      },
      patient: {
        name: 'Demo User',
        dob: '1980-06-15',
        insuranceId: 'BCBS12345678',
        insuranceProvider: 'Blue Cross Blue Shield',
      },
    }
  ],
  documents: [
    {
      id: 'doc1',
      name: 'EOB - MRI Denial',
      type: 'Explanation of Benefits',
      uploadDate: new Date('2023-05-15T10:00:00Z').toISOString(),
      size: 1024 * 1024 * 2.3, // 2.3 MB
      format: 'pdf',
      status: 'Processed',
    },
    {
      id: 'doc2',
      name: 'Surgery Denial Letter',
      type: 'Authorization Denial',
      uploadDate: new Date('2023-06-10T14:30:00Z').toISOString(),
      size: 1024 * 1024 * 1.1, // 1.1 MB
      format: 'pdf',
      status: 'Processed',
    },
    {
      id: 'doc3',
      name: 'Medical Records',
      type: 'Supporting Document',
      uploadDate: new Date('2023-06-05T09:15:00Z').toISOString(),
      size: 1024 * 1024 * 5.7, // 5.7 MB
      format: 'pdf',
      status: 'Processed',
    }
  ],
  peerReviews: [
    {
      _id: 'pr123456',
      appeal: 'appeal1',
      status: 'scheduled',
      scheduledDate: '2023-06-20',
      scheduledTime: '14:00',
      duration: 30,
      insuranceReviewer: {
        name: 'Dr. Michael Johnson',
        title: 'Medical Director',
        specialty: 'Internal Medicine',
        phone: '555-123-4567'
      },
      treatingProvider: {
        name: 'Dr. Jane Smith',
        title: 'Primary Care Physician',
        specialty: 'Family Medicine',
        phone: '555-987-6543'
      },
      discussionPoints: [
        {
          topic: 'Medical Necessity',
          notes: 'Discuss how the MRI meets medical necessity criteria based on patient\'s clinical presentation and history.'
        },
        {
          topic: 'Failed Conservative Treatments',
          notes: 'Review 6 weeks of physical therapy and medication trials that were unsuccessful.'
        },
        {
          topic: 'Clinical Evidence',
          notes: 'Reference clinical guidelines supporting MRI for persistent low back pain not responding to conservative treatment.'
        }
      ],
      createdAt: new Date('2023-06-15T10:30:00Z').toISOString(),
      updatedAt: new Date('2023-06-15T10:30:00Z').toISOString()
    }
  ]
};

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix) => `${prefix}${Date.now().toString().slice(-6)}`;

// Mock API Service
const mockApiService = {
  // Authentication
  login: async (email, password) => {
    await delay(500); // Simulate network delay
    
    // For demo purpose, any email with password works
    // This is easier for users testing the GitHub Pages deployment
    const mockUser = {
      _id: 'user1',
      firstName: 'Demo',
      lastName: 'User',
      email: email || 'demo@example.com',
      role: 'patient',
      token: 'mocktoken123456',
      insuranceInfo: {
        provider: 'Blue Cross Blue Shield',
        memberId: 'BCBS12345678',
        groupNumber: 'GROUP123'
      }
    };
    
    return {
      success: true,
      ...mockUser
    };
  },
  
  register: async (userData) => {
    await delay(700); // Simulate network delay
    
    const newUser = {
      _id: generateId('user'),
      ...userData,
      token: 'mocktoken' + Math.random().toString(36).substring(2)
    };
    
    delete newUser.password;
    mockDb.users.push(newUser);
    
    return {
      success: true,
      ...newUser
    };
  },
  
  // Appeals
  getAppeals: async () => {
    await delay(600);
    return {
      success: true,
      appeals: mockDb.appeals
    };
  },
  
  getAppealById: async (id) => {
    await delay(300);
    const appeal = mockDb.appeals.find(a => a.id === id);
    
    if (!appeal) {
      throw {
        response: {
          status: 404,
          data: {
            message: 'Appeal not found'
          }
        }
      };
    }
    
    return {
      success: true,
      appeal
    };
  },
  
  createAppeal: async (appealData) => {
    await delay(800);
    
    const newAppeal = {
      id: generateId('appeal'),
      ...appealData,
      status: 'Draft',
      createdDate: new Date().toISOString(),
      progress: 20
    };
    
    mockDb.appeals.push(newAppeal);
    
    return {
      success: true,
      appeal: newAppeal
    };
  },
  
  updateAppeal: async (id, appealData) => {
    await delay(500);
    
    const appealIndex = mockDb.appeals.findIndex(a => a.id === id);
    if (appealIndex === -1) {
      throw {
        response: {
          status: 404,
          data: {
            message: 'Appeal not found'
          }
        }
      };
    }
    
    mockDb.appeals[appealIndex] = {
      ...mockDb.appeals[appealIndex],
      ...appealData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      appeal: mockDb.appeals[appealIndex]
    };
  },
  
  // Documents
  getDocuments: async () => {
    await delay(600);
    return {
      success: true,
      documents: mockDb.documents
    };
  },
  
  getDocumentById: async (id) => {
    await delay(300);
    const document = mockDb.documents.find(d => d.id === id);
    
    if (!document) {
      throw {
        response: {
          status: 404,
          data: {
            message: 'Document not found'
          }
        }
      };
    }
    
    return {
      success: true,
      document
    };
  },
  
  uploadDocument: async (formData) => {
    await delay(1500); // Simulate upload time
    
    const newDocument = {
      id: generateId('doc'),
      name: formData.get('name') || 'Uploaded Document',
      type: formData.get('type') || 'Unknown',
      uploadDate: new Date().toISOString(),
      size: Math.floor(Math.random() * 1024 * 1024 * 10), // Random size up to 10MB
      format: 'pdf',
      status: 'Processed'
    };
    
    mockDb.documents.push(newDocument);
    
    return {
      success: true,
      document: newDocument
    };
  },
  
  // Peer Reviews
  getPeerReviews: async () => {
    await delay(400);
    return {
      success: true,
      peerReviews: mockDb.peerReviews
    };
  },
  
  getPeerReviewByAppeal: async (appealId) => {
    await delay(300);
    const peerReviews = mockDb.peerReviews.filter(pr => pr.appeal === appealId);
    
    return {
      success: true,
      peerReviews
    };
  },
  
  createPeerReview: async (reviewData) => {
    await delay(700);
    
    const newReview = {
      _id: generateId('pr'),
      ...reviewData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockDb.peerReviews.push(newReview);
    
    return {
      success: true,
      peerReview: newReview
    };
  },
  
  generateDiscussionPoints: async (appealId) => {
    await delay(1000);
    
    const discussionPoints = [
      {
        topic: 'Medical Necessity',
        notes: 'Discuss how the requested treatment meets medical necessity criteria based on the patient\'s specific clinical presentation and history.'
      },
      {
        topic: 'Failed Conservative Treatments',
        notes: 'Review prior treatments that have been attempted and explain why they were insufficient for this patient\'s condition.'
      },
      {
        topic: 'Clinical Evidence',
        notes: 'Reference clinical guidelines and peer-reviewed literature supporting the use of this treatment for the patient\'s diagnosis.'
      }
    ];
    
    const keyMedicalPoints = [
      'Patient has been diagnosed with chronic condition requiring ongoing management',
      'Multiple conservative treatments have been attempted without adequate improvement',
      'Patient\'s functional status continues to decline without this intervention',
      'No contraindications to the requested treatment exist'
    ];
    
    const relevantGuidelines = [
      {
        title: 'Clinical Practice Guidelines for Treatment of Lower Back Pain',
        source: 'American College of Physicians',
        link: '#',
        notes: 'Recommends advanced imaging for patients with persistent symptoms after 6 weeks of conservative therapy'
      }
    ];
    
    return {
      success: true,
      discussionPoints,
      keyMedicalPoints,
      relevantGuidelines
    };
  }
};

export default mockApiService;
export { mockDb };