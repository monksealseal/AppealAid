const mongoose = require('mongoose');

const ehrConnectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    ehrSystem: {
      type: String,
      enum: [
        'Epic', 
        'Cerner', 
        'Allscripts', 
        'MEDITECH', 
        'NextGen', 
        'eClinicalWorks', 
        'athenahealth',
        'GE Healthcare',
        'McKesson',
        'Greenway Health',
        'Custom',
        'Other'
      ],
      required: true
    },
    version: String,
    connectionType: {
      type: String,
      enum: [
        'HL7', 
        'FHIR', 
        'API', 
        'Database', 
        'SFTP', 
        'Custom'
      ],
      required: true
    },
    connectionDetails: {
      baseUrl: String,
      apiKey: String,
      clientId: String,
      username: String,
      passwordEncrypted: String,
      certificatePath: String,
      tokenEndpoint: String,
      refreshToken: String,
      accessToken: String,
      tokenExpiry: Date,
      databaseConnectionString: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'testing', 'error'],
      default: 'testing'
    },
    lastConnected: Date,
    lastError: String,
    permissions: {
      canReadPatientDemographics: {
        type: Boolean,
        default: true
      },
      canReadEncounters: {
        type: Boolean,
        default: true
      },
      canReadDiagnoses: {
        type: Boolean,
        default: true
      },
      canReadMedications: {
        type: Boolean,
        default: false
      },
      canReadProcedures: {
        type: Boolean,
        default: true
      },
      canReadDocuments: {
        type: Boolean,
        default: true
      },
      canReadOrders: {
        type: Boolean,
        default: false
      },
      canReadBilling: {
        type: Boolean,
        default: true
      },
      canWrite: {
        type: Boolean,
        default: false
      }
    },
    dataMapping: {
      patientIdField: String,
      encounterIdField: String,
      diagnosisCodeField: String,
      procedureCodeField: String,
      dateOfServiceField: String,
      providerIdField: String,
      customMappings: [{
        sourceField: String,
        targetField: String,
        transformationRule: String
      }]
    },
    configurations: {
      enableRealTimeQueries: {
        type: Boolean,
        default: false
      },
      batchSize: {
        type: Number,
        default: 50
      },
      syncFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'weekly', 'manual'],
        default: 'manual'
      },
      retryAttempts: {
        type: Number,
        default: 3
      },
      timeout: {
        type: Number,
        default: 30000
      },
      enableDeltaSync: {
        type: Boolean,
        default: true
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const clinicalDocumentSchema = mongoose.Schema(
  {
    ehrConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EHRConnection',
      required: true
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    patientId: {
      type: String,
      required: true
    },
    ehrPatientId: String,
    documentType: {
      type: String,
      enum: [
        'progressNote', 
        'consultNote', 
        'dischargeNote', 
        'procedureNote', 
        'diagnosticNote',
        'laboratoryReport',
        'imagingReport',
        'nursingNote',
        'medicationOrder',
        'treatmentPlan',
        'priorAuthorizationRequest',
        'physicalExam',
        'historyAndPhysical',
        'operativeReport',
        'pathologyReport',
        'other'
      ],
      required: true
    },
    documentTitle: String,
    authoredBy: String,
    authoredDate: Date,
    documentIdentifier: String,
    visitType: {
      type: String,
      enum: ['inpatient', 'outpatient', 'emergency', 'office', 'telehealth', 'other']
    },
    encounterDate: Date,
    encounterIdentifier: String,
    facilityLocation: String,
    department: String,
    status: {
      type: String,
      enum: ['preliminary', 'final', 'amended', 'cancelled'],
      default: 'final'
    },
    content: {
      format: {
        type: String,
        enum: ['html', 'text', 'pdf', 'rtf', 'ccda', 'fhir', 'hl7'],
        default: 'text'
      },
      data: String,
      structuredData: mongoose.Schema.Types.Mixed
    },
    relevantDiagnosisCodes: [String],
    relevantProcedureCodes: [String],
    contentHighlights: [{
      text: String,
      startPosition: Number,
      endPosition: Number,
      highlightType: {
        type: String,
        enum: ['medicalNecessity', 'relevantFinding', 'contradictingEvidence', 'supportingEvidence', 'keyPhrase']
      },
      highlightedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      highlightedAt: {
        type: Date,
        default: Date.now
      },
      notes: String
    }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    tags: [String],
    relatedDocuments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicalDocument'
    }],
    relatedAppeals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appeal'
    }]
  },
  {
    timestamps: true
  }
);

// Add index for faster querying
ehrConnectionSchema.index({ facility: 1, ehrSystem: 1 });
ehrConnectionSchema.index({ status: 1 });

clinicalDocumentSchema.index({ patientId: 1 });
clinicalDocumentSchema.index({ ehrConnectionId: 1 });
clinicalDocumentSchema.index({ encounterDate: 1 });
clinicalDocumentSchema.index({ 'relevantDiagnosisCodes': 1 });
clinicalDocumentSchema.index({ 'relevantProcedureCodes': 1 });
clinicalDocumentSchema.index({ 'relatedAppeals': 1 });

const EHRConnection = mongoose.model('EHRConnection', ehrConnectionSchema);
const ClinicalDocument = mongoose.model('ClinicalDocument', clinicalDocumentSchema);

module.exports = { EHRConnection, ClinicalDocument };