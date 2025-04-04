/**
 * Appeal Model
 * 
 * Schema for insurance appeal records
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appealSchema = new Schema({
  // Appeal identifiers
  appealId: {
    type: String,
    sparse: true,
    index: true
  },
  claimId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // Patient reference
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  // Service information
  serviceDate: {
    type: Date,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceDescription: {
    type: String
  },
  serviceProvider: {
    type: String
  },
  serviceLocation: {
    type: String
  },
  
  // Insurance information
  insuranceCompany: {
    type: String,
    required: true
  },
  insurancePlan: {
    type: String
  },
  insuranceMemberId: {
    type: String
  },
  
  // Financial information
  requestedAmount: {
    type: Number,
    min: 0
  },
  approvedAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  deniedAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Appeal status and outcome
  status: {
    type: String,
    enum: ['draft', 'pending', 'submitted', 'in_progress', 'approved', 'denied', 'cancelled', 'pending_review'],
    default: 'draft',
    index: true
  },
  decision: {
    type: String,
    enum: ['approved', 'denied', 'partiallyApproved', null],
    default: null
  },
  
  // Appeal details
  reason: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date
  },
  responseDate: {
    type: Date
  },
  responseDetails: {
    reason: String,
    approvedAmount: Number,
    deniedAmount: Number,
    decisionText: String
  },
  
  // Supporting documents
  documents: [{
    documentId: String,
    documentType: {
      type: String,
      enum: ['medical_record', 'denial_letter', 'appeal_letter', 'insurance_response', 'clinical_documentation', 'imaging', 'lab_results', 'other']
    },
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    providerSubmitted: {
      type: Boolean,
      default: false
    },
    providerNotes: String
  }],
  
  // Provider collaboration
  collaborationRequests: [{
    requestDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    requestType: {
      type: String,
      enum: ['documentation', 'clarification', 'additional_information', 'other'],
      default: 'documentation'
    },
    message: String,
    requestedItems: [String],
    responseDeadline: Date,
    responseDate: Date,
    responseNotes: String,
    providerEmail: String,
    providerPhone: String,
    providerPortalLink: String
  }],
  
  // Clinical data from provider systems
  clinicalData: {
    diagnoses: [{
      code: String,
      description: String,
      date: Date,
      status: String,
      provider: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      status: String,
      prescriber: String
    }],
    labs: [{
      name: String,
      date: Date,
      results: [{
        name: String,
        value: String,
        unit: String,
        reference: String,
        flag: String
      }],
      provider: String
    }],
    vitals: [{
      date: Date,
      readings: [{
        name: String,
        value: String,
        unit: String
      }],
      provider: String
    }],
    imaging: [{
      type: String,
      bodyPart: String,
      date: Date,
      findings: String,
      impression: String,
      provider: String
    }],
    procedures: [{
      name: String,
      date: Date,
      provider: String,
      notes: String
    }],
    notes: [{
      type: String,
      date: Date,
      provider: String,
      content: String
    }]
  },
  
  // Generated clinical summary for appeal
  clinicalSummary: {
    patientInfo: {
      age: Number,
      gender: String
    },
    primaryDiagnosis: {
      code: String,
      description: String
    },
    comorbidities: [{
      code: String,
      description: String
    }],
    relevantMedications: [{
      name: String,
      dosage: String
    }],
    relevantLabs: [{
      name: String,
      value: String,
      flag: String
    }],
    relevantVitals: [{
      name: String,
      value: String,
      unit: String
    }],
    functionalStatus: {
      mobility: String,
      adls: String,
      cognition: String,
      strength: String,
      source: String
    },
    clinicalJustification: String
  },
  
  // Activity tracking
  lastActivity: {
    date: {
      type: Date,
      default: Date.now
    },
    action: String,
    details: String
  },
  
  // Timestamps for creation and updates
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching appeals
appealSchema.index({ 
  appealId: 'text', 
  claimId: 'text', 
  serviceName: 'text', 
  serviceDescription: 'text',
  insuranceCompany: 'text'
});

const Appeal = mongoose.model('Appeal', appealSchema);

module.exports = Appeal;