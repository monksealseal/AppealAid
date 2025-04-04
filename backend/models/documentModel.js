const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    batchId: {
      type: String,
      index: true
    },
    documentType: {
      type: String,
      required: true,
      enum: ['eob', 'denialLetter', 'medicalRecord', 'other'],
      default: 'eob'
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    extractedData: {
      // Common fields for all documents
      documentDate: Date,
      providerName: String,
      patientName: String,
      
      // EOB specific fields
      insuranceCarrier: String,
      claimNumber: String,
      memberId: String,
      groupNumber: String,
      serviceDate: Date,
      billedAmount: Number,
      allowedAmount: Number,
      patientResponsibility: Number,
      denialReason: String,
      denialCode: String,
      
      // Appeal specific fields
      appealDeadline: Date,
      serviceDescription: String,
      diagnosisCodes: [String],
      procedureCodes: [String],
      providerInfo: {
        name: String,
        address: String,
        phone: String,
        fax: String,
        npi: String,
        tin: String
      },
      
      // Enhanced denial detection fields
      denialInfo: {
        isDenial: Boolean,
        denialType: {
          type: String,
          enum: [
            'medicalNecessity', 
            'priorAuthorization', 
            'networkStatus', 
            'experimentalTreatment', 
            'codingError', 
            'notCovered', 
            'benefitMaximum', 
            'timelyFiling', 
            'duplicate',
            'preAuthConflict',
            'urgencyOverride',
            'clinicalTrial',
            'academicException',
            'teachingPhysician',
            'other'
          ]
        },
        confidence: Number,
        appealDeadlineDays: Number,
        appealDeadlineDate: Date,
        suggestedNextSteps: [String]
      },
      
      // Appeal success prediction
      appealPotential: {
        successProbability: Number,
        priorityScore: Number,
        appealRecommendation: String,
        factors: [{
          factor: String,
          impact: {
            type: String,
            enum: ['positive', 'negative', 'neutral']
          },
          description: String
        }]
      },
      
      // Deadline warning information
      deadlineWarning: {
        daysRemaining: Number,
        urgencyLevel: {
          type: String,
          enum: ['high', 'medium', 'low', 'normal']
        },
        message: String
      },
      
      // Insurer portal information
      insurerPortalInfo: {
        name: String,
        appealPortalUrl: String,
        appealFormats: [String],
        appealTimeframes: {
          standard: Number,
          expedited: Number
        },
        appealFormLocation: String
      },
      
      // Academic Medical Center specific fields
      academicInfo: {
        isResearchRelated: Boolean,
        isTeachingCase: Boolean,
        clinicalTrialId: String,
        irbNumber: String,
        researchProtocol: String,
        studyPhase: String,
        teachingPhysician: {
          name: String,
          npi: String,
          role: String
        },
        residentInvolvement: Boolean,
        medicalStudentInvolvement: Boolean,
        universityAffiliation: String
      },
      
      // Florida specific payer information
      floridaPayerInfo: {
        isFloridaBluePolicy: Boolean,
        floridaBlueType: {
          type: String,
          enum: ['HMO', 'PPO', 'Medicare Advantage', 'Exchange', 'Other']
        },
        isMedicaidManaged: Boolean,
        floridaMedicaidPlan: String,
        isAvMedPolicy: Boolean,
        isSimplyHealthcare: Boolean,
        hasFLStatuteViolation: Boolean,
        statuteReference: String,
        payerResponseTimeframe: Number
      },
      
      // Evidence highlighting
      evidenceHighlights: [{
        pageNumber: Number,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number
        },
        highlightType: {
          type: String,
          enum: ['critical', 'supporting', 'contradicting', 'reference']
        },
        highlightText: String,
        highlightColor: String,
        relevanceScore: {
          type: Number,
          min: 0,
          max: 10
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        notes: String
      }],
      
      // Peer-reviewed literature citations
      literatureReferences: [{
        citationType: {
          type: String,
          enum: ['journal', 'guideline', 'textbook', 'clinicalTrial', 'caseStudy', 'other']
        },
        title: String,
        authors: [String],
        publication: String,
        publicationDate: Date,
        volume: String,
        issue: String,
        pages: String,
        doi: String,
        url: String,
        relevanceSummary: String,
        quotedText: String,
        supportStrength: {
          type: String,
          enum: ['strong', 'moderate', 'weak', 'contradictory', 'neutral']
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        dateAdded: {
          type: Date,
          default: Date.now
        },
        documentLink: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document'
        }
      }],
      
      // Prior authorization details for comprehensive tracking
      priorAuthorizationDetails: {
        authorizationNumbers: [String],
        authorizationStatus: {
          type: String,
          enum: ['approved', 'partially_approved', 'pending', 'denied', 'expired', 'not_required', 'unknown']
        },
        authorizationDate: Date,
        expirationDate: Date,
        authorizedServices: [String],
        authorizedProvider: String,
        authorizedFacility: String,
        authorizationMethod: {
          type: String,
          enum: ['phone', 'fax', 'portal', 'email', 'mail', 'other']
        },
        authorizedBy: {
          name: String,
          position: String,
          contactInfo: String,
          departmentName: String
        },
        limitationsNotes: String,
        referenceNumber: String,
        verificationDetails: {
          verifiedBy: String,
          verificationDate: Date,
          verificationMethod: String,
          verificationNotes: String
        },
        documents: [{
          documentType: {
            type: String,
            enum: ['authorization_letter', 'phone_call_reference', 'portal_screenshot', 'email_confirmation', 'other']
          },
          documentId: mongoose.Schema.Types.ObjectId,
          uploadDate: Date
        }]
      },
      
      // ROI tracking for financial impact analysis
      financialImpact: {
        deniedAmount: Number,
        patientResponsibilityBeforeAppeal: Number,
        insurerResponsibilityBeforeAppeal: Number,
        estimatedAppealCost: Number,
        timeInvestedMinutes: Number,
        staffCostPerHour: Number,
        externalCosts: Number,
        recoveredAmount: Number,
        patientResponsibilityAfterAppeal: Number,
        insurerResponsibilityAfterAppeal: Number,
        netRecoveryAmount: Number,
        roi: Number,
        costPerDollarRecovered: Number,
        timeToResolutionDays: Number,
        appealCategory: {
          type: String,
          enum: ['high_value', 'medium_value', 'low_value', 'principle_case', 'pattern_case', 'regulatory_compliance']
        },
        financialImpactNotes: String,
        assignedFinancialCategory: {
          type: String,
          enum: ['priority', 'standard', 'bulk', 'educational']
        },
        lastCalculated: {
          type: Date,
          default: Date.now
        }
      },
      
      // For storing any other extracted data that doesn't fit the schema
      additionalFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    },
    // Raw extracted text for searching and further processing
    extractedText: String,
    // Processing status
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded'
    },
    processingErrors: [String],
    isDeleted: {
      type: Boolean,
      default: false
    },
    // Appeal tracking information
    appealStatus: {
      hasAppeal: {
        type: Boolean,
        default: false
      },
      appealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appeal'
      },
      appealCreatedAt: Date
    },
    // Flag for high-priority items needing immediate attention
    isPriority: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for text search
documentSchema.index({ extractedText: 'text' });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;