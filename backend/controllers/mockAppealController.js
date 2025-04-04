/**
 * Mock Appeal Controller
 * 
 * Mock implementations for testing UI components
 */

const logger = require('../utils/logger');

// Mock appeal data for testing
const MOCK_APPEALS = [
  {
    _id: '60d21b4667d0d8992e610c85',
    appealId: 'AP001',
    claimId: 'CL12345',
    patient: {
      _id: '60d21b4667d0d8992e610c80',
      name: 'John Doe',
      dateOfBirth: new Date('1985-05-15')
    },
    serviceDate: new Date('2023-12-01'),
    serviceName: 'Post-Stroke Rehabilitation',
    serviceDescription: 'Inpatient rehabilitation following stroke',
    serviceProvider: 'Memorial Rehabilitation Center',
    serviceLocation: 'Memorial Hospital',
    insuranceCompany: 'UnitedHealthcare',
    insurancePlan: 'UHC Choice Plus',
    insuranceMemberId: 'UHC1234567',
    requestedAmount: 12500.00,
    approvedAmount: 0,
    deniedAmount: 12500.00,
    status: 'denied',
    decision: 'denied',
    reason: 'The claim for inpatient rehabilitation was denied using the nH Predict algorithm, which incorrectly classified the service as not medically necessary despite clinical documentation supporting the need for intensive rehabilitation following a stroke.',
    submissionDate: new Date('2024-01-15'),
    responseDate: new Date('2024-02-01'),
    responseDetails: {
      reason: 'Not medically necessary',
      decisionText: 'Services determined to be not medically necessary based on clinical criteria.'
    },
    documents: [
      {
        documentId: 'DOC001',
        documentType: 'denial_letter',
        name: 'UHC Denial Letter.pdf',
        path: '/uploads/denial_letter_001.pdf',
        uploadDate: new Date('2024-02-05'),
        providerSubmitted: false
      },
      {
        documentId: 'DOC002',
        documentType: 'medical_record',
        name: 'Discharge Summary.pdf',
        path: '/uploads/discharge_summary.pdf',
        uploadDate: new Date('2024-02-10'),
        providerSubmitted: false
      }
    ],
    collaborationRequests: [
      {
        requestDate: new Date('2024-02-10'),
        status: 'completed',
        requestType: 'documentation',
        message: 'Please provide clinical documentation showing medical necessity for inpatient rehabilitation.',
        requestedItems: ['Therapy assessments', 'Physician notes', 'Functional status reports'],
        responseDeadline: new Date('2024-02-17'),
        responseDate: new Date('2024-02-15'),
        responseNotes: 'Attached are all requested clinical documents showing patient required 24-hour nursing care and intensive therapy.',
        providerEmail: 'rehab@memorial.example.com',
        providerPortalLink: 'http://localhost:3000/provider/document-upload/abc123'
      }
    ],
    clinicalData: {
      diagnoses: [
        {
          code: 'I63.9',
          description: 'Cerebral infarction, unspecified',
          date: new Date('2023-11-25'),
          status: 'active',
          provider: 'Dr. Sarah Johnson'
        },
        {
          code: 'I10',
          description: 'Essential (primary) hypertension',
          date: new Date('2023-01-15'),
          status: 'active',
          provider: 'Dr. Sarah Johnson'
        },
        {
          code: 'E11.9',
          description: 'Type 2 diabetes mellitus without complications',
          date: new Date('2022-08-22'),
          status: 'active',
          provider: 'Dr. Michael Chen'
        }
      ],
      medications: [
        {
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          startDate: new Date('2023-11-26'),
          endDate: null,
          status: 'active',
          prescriber: 'Dr. Sarah Johnson'
        },
        {
          name: 'Atorvastatin',
          dosage: '40mg',
          frequency: 'Once daily',
          startDate: new Date('2023-11-26'),
          endDate: null,
          status: 'active',
          prescriber: 'Dr. Sarah Johnson'
        },
        {
          name: 'Metoprolol',
          dosage: '25mg',
          frequency: 'Twice daily',
          startDate: new Date('2023-11-26'),
          endDate: null,
          status: 'active',
          prescriber: 'Dr. Sarah Johnson'
        }
      ],
      labs: [
        {
          name: 'Complete Blood Count (CBC)',
          date: new Date('2023-11-26'),
          results: [
            { name: 'WBC', value: '8.2', unit: 'K/uL', reference: '4.5-11.0' },
            { name: 'RBC', value: '4.8', unit: 'M/uL', reference: '4.5-5.9' },
            { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', reference: '13.5-17.5' },
            { name: 'Hematocrit', value: '42', unit: '%', reference: '41-50' },
            { name: 'Platelets', value: '210', unit: 'K/uL', reference: '150-400' }
          ],
          provider: 'Dr. Sarah Johnson'
        },
        {
          name: 'Basic Metabolic Panel (BMP)',
          date: new Date('2023-11-26'),
          results: [
            { name: 'Sodium', value: '138', unit: 'mmol/L', reference: '135-145' },
            { name: 'Potassium', value: '4.2', unit: 'mmol/L', reference: '3.5-5.0' },
            { name: 'Chloride', value: '102', unit: 'mmol/L', reference: '98-107' },
            { name: 'CO2', value: '24', unit: 'mmol/L', reference: '23-29' },
            { name: 'BUN', value: '15', unit: 'mg/dL', reference: '7-20' },
            { name: 'Creatinine', value: '0.9', unit: 'mg/dL', reference: '0.6-1.2' },
            { name: 'Glucose', value: '110', unit: 'mg/dL', reference: '70-99', flag: 'High' }
          ],
          provider: 'Dr. Sarah Johnson'
        }
      ],
      vitals: [
        {
          date: new Date('2023-12-08'),
          readings: [
            { name: 'Blood Pressure', value: '138/88', unit: 'mmHg' },
            { name: 'Heart Rate', value: '78', unit: 'bpm' },
            { name: 'Respiratory Rate', value: '16', unit: 'breaths/min' },
            { name: 'Temperature', value: '98.6', unit: 'F' },
            { name: 'SpO2', value: '97', unit: '%' }
          ],
          provider: 'Emily Williams, RN'
        },
        {
          date: new Date('2023-12-04'),
          readings: [
            { name: 'Blood Pressure', value: '142/90', unit: 'mmHg' },
            { name: 'Heart Rate', value: '82', unit: 'bpm' },
            { name: 'Respiratory Rate', value: '18', unit: 'breaths/min' },
            { name: 'Temperature', value: '98.8', unit: 'F' },
            { name: 'SpO2', value: '96', unit: '%' }
          ],
          provider: 'Robert Thompson, RN'
        }
      ],
      imaging: [
        {
          type: 'CT Scan',
          bodyPart: 'Head',
          date: new Date('2023-11-25'),
          findings: 'Acute infarct in the territory of the right middle cerebral artery. No evidence of hemorrhage.',
          impression: 'Acute ischemic stroke, right MCA territory.',
          provider: 'Dr. James Wilson'
        },
        {
          type: 'MRI',
          bodyPart: 'Brain',
          date: new Date('2023-11-26'),
          findings: 'Confirmed right MCA territory infarct involving the right parietal lobe. No evidence of hemorrhagic transformation.',
          impression: 'Acute to subacute right MCA ischemic stroke.',
          provider: 'Dr. James Wilson'
        }
      ],
      procedures: [
        {
          name: 'Tissue Plasminogen Activator (tPA) administration',
          date: new Date('2023-11-25'),
          provider: 'Dr. Sarah Johnson',
          notes: 'Patient received IV tPA within 3 hours of symptom onset. No complications during administration.'
        },
        {
          name: 'Carotid Doppler Ultrasound',
          date: new Date('2023-11-27'),
          provider: 'Dr. Elizabeth Roberts',
          notes: 'Moderate stenosis of right internal carotid artery (approximately 50-69%). Left carotid artery without significant stenosis.'
        }
      ],
      notes: [
        {
          type: 'Progress Note',
          date: new Date('2023-11-29'),
          provider: 'Dr. Sarah Johnson',
          content: 'Patient continues to show improvement in right-sided weakness. Speech remains slightly slurred but improved from admission. Patient able to ambulate with assistance. Plan to continue current medications and physical therapy.'
        },
        {
          type: 'PT Evaluation',
          date: new Date('2023-11-27'),
          provider: 'Jason Martinez, PT',
          content: 'Patient presents with right-sided hemiparesis, more pronounced in upper extremity. Strength 3/5 in right arm, 4/5 in right leg. Decreased coordination and balance. Patient requires moderate assistance with transfers and minimal assistance with ambulation using a quad cane. Recommend daily PT sessions x 2 weeks.'
        },
        {
          type: 'Discharge Summary',
          date: new Date('2023-12-10'),
          provider: 'Dr. Sarah Johnson',
          content: 'Patient admitted for acute ischemic stroke. During hospitalization, patient received tPA and showed gradual improvement in neurological deficits. Patient now has mild right arm weakness and minimal speech difficulties. Patient discharged to inpatient rehabilitation facility for continued therapy. Medications at discharge include: Aspirin 81mg daily, Atorvastatin 40mg daily, Metoprolol 25mg BID.'
        }
      ]
    },
    clinicalSummary: {
      patientInfo: {
        age: 38,
        gender: 'Male'
      },
      primaryDiagnosis: {
        code: 'I63.9',
        description: 'Cerebral infarction, unspecified'
      },
      comorbidities: [
        {
          code: 'I10',
          description: 'Essential (primary) hypertension'
        },
        {
          code: 'E11.9',
          description: 'Type 2 diabetes mellitus without complications'
        }
      ],
      relevantMedications: [
        {
          name: 'Aspirin',
          dosage: '81mg'
        },
        {
          name: 'Atorvastatin',
          dosage: '40mg'
        },
        {
          name: 'Metoprolol',
          dosage: '25mg'
        }
      ],
      relevantLabs: [
        {
          name: 'Glucose',
          value: '110 mg/dL',
          flag: 'High'
        }
      ],
      relevantVitals: [
        {
          name: 'Blood Pressure',
          value: '142/90',
          unit: 'mmHg'
        }
      ],
      functionalStatus: {
        mobility: 'Requires moderate assistance',
        adls: 'Needs assistance with bathing and dressing',
        cognition: 'Alert and oriented',
        strength: '3/5',
        source: 'PT Evaluation by Jason Martinez, PT on 11/27/2023'
      },
      clinicalJustification: 'Patient is status post acute ischemic stroke with resulting right-sided weakness and functional deficits requiring intensive rehabilitation. Patient currently requires assistance with mobility and activities of daily living. Continued inpatient rehabilitation is medically necessary to prevent further deterioration and maximize functional recovery.'
    },
    lastActivity: {
      date: new Date('2024-02-15'),
      action: 'provider_documentation_added',
      details: 'Provider submitted 3 document(s)'
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15')
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    appealId: 'AP002',
    claimId: 'CL67890',
    patient: {
      _id: '60d21b4667d0d8992e610c81',
      name: 'Jane Smith',
      dateOfBirth: new Date('1970-09-23')
    },
    serviceDate: new Date('2024-01-15'),
    serviceName: 'MRI - Lumbar Spine',
    serviceDescription: 'Magnetic resonance imaging of the lumbar spine',
    serviceProvider: 'City Imaging Center',
    serviceLocation: 'City Imaging Center',
    insuranceCompany: 'Blue Cross Blue Shield',
    insurancePlan: 'BCBS PPO',
    insuranceMemberId: 'BCBS7654321',
    requestedAmount: 1800.00,
    approvedAmount: 0,
    deniedAmount: 1800.00,
    status: 'pending',
    decision: null,
    reason: 'The MRI was ordered by my physician due to severe, persistent lower back pain with radiation to my leg that did not improve with physical therapy. The denial stated that conservative treatment was not tried for a sufficient period, but I had already completed 6 weeks of therapy with no improvement.',
    submissionDate: null,
    responseDate: null,
    responseDetails: null,
    documents: [
      {
        documentId: 'DOC101',
        documentType: 'denial_letter',
        name: 'BCBS Denial Letter.pdf',
        path: '/uploads/bcbs_denial.pdf',
        uploadDate: new Date('2024-02-01'),
        providerSubmitted: false
      },
      {
        documentId: 'DOC102',
        documentType: 'medical_record',
        name: 'Physical Therapy Notes.pdf',
        path: '/uploads/pt_notes.pdf',
        uploadDate: new Date('2024-02-05'),
        providerSubmitted: false
      }
    ],
    collaborationRequests: [],
    clinicalData: {},
    clinicalSummary: {},
    lastActivity: {
      date: new Date('2024-02-05'),
      action: 'document_added',
      details: 'Added Physical Therapy Notes document'
    },
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-05')
  }
];

// Get all appeals
exports.getAppeals = (req, res) => {
  logger.info('Mock: Getting all appeals');
  res.json({
    success: true,
    appeals: MOCK_APPEALS
  });
};

// Get a single appeal by ID
exports.getAppealById = (req, res) => {
  const { id } = req.params;
  logger.info(`Mock: Getting appeal by ID: ${id}`);
  
  const appeal = MOCK_APPEALS.find(a => a._id === id);
  if (!appeal) {
    return res.status(404).json({
      success: false,
      message: 'Appeal not found'
    });
  }
  
  res.json({
    success: true,
    appeal
  });
};

// Allow all other routes to call these mock functions
module.exports = {
  ...exports,
  submitAppeal: (req, res) => res.json({ success: true, appeal: MOCK_APPEALS[0] }),
  updateAppeal: (req, res) => res.json({ success: true, appeal: MOCK_APPEALS[0] }),
  generateAppeal: (req, res) => res.json({ success: true, appeal: MOCK_APPEALS[0] }),
  recordOutcome: (req, res) => res.json({ success: true, appeal: MOCK_APPEALS[0] }),
  getTemplates: (req, res) => res.json({ success: true, templates: [] }),
  analyzeAppealPotential: (req, res) => res.json({ success: true, analysis: 'Mock analysis' }),
  generateAppealLetter: (req, res) => res.json({ success: true, letter: 'Mock letter' }),
  analyzeClaimWithAI: (req, res) => res.json({ success: true, analysis: 'Mock AI analysis' }),
  getFollowUpPlan: (req, res) => res.json({ success: true, plan: [] }),
  getSubmissionChecklist: (req, res) => res.json({ success: true, checklist: [] }),
  getInsurerRequirements: (req, res) => res.json({ success: true, requirements: [] }),
  getAppealsStats: (req, res) => res.json({ success: true, stats: { total: 2 } }),
  createProviderReview: (req, res) => res.json({ success: true, review: {} }),
  updateProviderReview: (req, res) => res.json({ success: true, review: {} }),
  getProviderReview: (req, res) => res.json({ success: true, review: {} })
};