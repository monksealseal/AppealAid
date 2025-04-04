const mongoose = require('mongoose');

const checklistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    checklistType: {
      type: String,
      enum: [
        'appealPreparation', 
        'appealSubmission', 
        'externalReview', 
        'documentationQuality',
        'insurerSpecific',
        'billingCompliance',
        'regulatoryRequirements',
        'patientCommunication',
        'customChecklist'
      ],
      default: 'appealPreparation'
    },
    description: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    categories: [{
      name: String,
      description: String,
      sortOrder: Number,
      items: [{
        text: String,
        description: String,
        required: {
          type: Boolean,
          default: false
        },
        conditionalLogic: String, // JavaScript logic expression
        helpText: String,
        itemType: {
          type: String,
          enum: ['checkbox', 'text', 'file', 'select', 'date', 'user'],
          default: 'checkbox'
        },
        options: [String], // For select type
        defaultValue: mongoose.Schema.Types.Mixed,
        validationMessage: String,
        sortOrder: Number,
        regulatoryReference: String,
        linkedDocumentType: {
          type: String,
          enum: ['medicalRecord', 'authorizationForm', 'denialLetter', 'appealLetter', 'supportingDocument', 'patientConsent']
        }
      }]
    }],
    applicableToAppealTypes: [{
      type: String,
      enum: [
        'medicalNecessity', 
        'codingError', 
        'networkStatus', 
        'priorAuthorization', 
        'experimentalTreatment', 
        'outOfNetwork', 
        'preAuthConflict', 
        'urgencyOverride', 
        'clinicalTrial',
        'academicException',
        'teachingPhysician',
        'all'
      ]
    }],
    applicableToInsurers: [String],
    version: {
      type: String,
      default: '1.0'
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    expirationDate: Date,
    regulatoryReferences: [{
      authority: String,
      reference: String,
      url: String,
      description: String
    }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const checklistInstanceSchema = mongoose.Schema(
  {
    checklistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checklist',
      required: true
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    appealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appeal'
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completionDate: Date,
    status: {
      type: String,
      enum: ['inProgress', 'completed', 'rejected', 'needsRevision'],
      default: 'inProgress'
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    itemResponses: [{
      categoryIndex: Number,
      itemIndex: Number,
      response: mongoose.Schema.Types.Mixed, // Can be boolean, string, date, etc.
      completed: {
        type: Boolean,
        default: false
      },
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      completedAt: Date,
      attachedFiles: [{
        fileId: mongoose.Schema.Types.ObjectId,
        fileName: String
      }],
      notes: String
    }],
    notes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: String,
    history: [{
      action: {
        type: String,
        enum: ['created', 'updated', 'completed', 'reviewed', 'rejected', 'revised'],
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Add index for faster querying
checklistSchema.index({ checklistType: 1 });
checklistSchema.index({ facilityId: 1 });
checklistSchema.index({ 'applicableToAppealTypes': 1 });

checklistInstanceSchema.index({ checklistId: 1 });
checklistInstanceSchema.index({ appealId: 1 });
checklistInstanceSchema.index({ status: 1 });

const Checklist = mongoose.model('Checklist', checklistSchema);
const ChecklistInstance = mongoose.model('ChecklistInstance', checklistInstanceSchema);

module.exports = { Checklist, ChecklistInstance };