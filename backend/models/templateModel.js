const mongoose = require('mongoose');

const templateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['medicalNecessity', 'codingError', 'networkStatus', 'priorAuthorization', 'experimentalTreatment', 'outOfNetwork', 'other'],
      required: true
    },
    insuranceCarriers: [String],
    content: {
      type: String,
      required: true
    },
    placeholders: [
      {
        key: String,
        description: String,
        required: {
          type: Boolean,
          default: false
        }
      }
    ],
    customizableFields: [
      {
        fieldName: String,
        description: String,
        defaultValue: String
      }
    ],
    suggestedEvidence: [String],
    effectivenessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    totalUsage: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    version: {
      type: Number,
      default: 1
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for faster querying
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ name: 1, version: 1 });

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;