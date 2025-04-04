const mongoose = require('mongoose');

const batchSchema = mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'generating', 'complete', 'failed'],
      default: 'uploaded'
    },
    batchType: {
      type: String,
      enum: ['denial', 'eob', 'mixed'],
      default: 'denial'
    },
    processingStats: {
      totalDocuments: {
        type: Number,
        default: 0
      },
      processedDocuments: {
        type: Number,
        default: 0
      },
      failedDocuments: {
        type: Number,
        default: 0
      },
      generatedAppeals: {
        type: Number,
        default: 0
      },
      pendingAppeals: {
        type: Number,
        default: 0
      },
      totalDenialAmount: {
        type: Number,
        default: 0
      },
      appealsByType: {
        type: Map,
        of: Number,
        default: {}
      },
      averageConfidenceScore: {
        type: Number,
        default: 0
      }
    },
    prioritization: {
      method: {
        type: String,
        enum: ['amount', 'deadline', 'success', 'custom'],
        default: 'amount'
      },
      customRules: [{
        ruleType: {
          type: String,
          enum: ['amount', 'deadline', 'provider', 'diagnosis', 'payer', 'appealType']
        },
        threshold: mongoose.Schema.Types.Mixed,
        weight: Number
      }]
    },
    appealGeneration: {
      strategy: {
        type: String,
        enum: ['auto', 'manual', 'highValue', 'deadline'],
        default: 'manual'
      },
      threshold: {
        amountThreshold: Number,
        confidenceThreshold: Number,
        priorityOnly: {
          type: Boolean,
          default: false
        },
        excludeTypes: [String]
      },
      templateOverrides: {
        type: Map,
        of: String
      },
      autoSubmit: {
        type: Boolean,
        default: false
      }
    },
    documents: [{
      document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      },
      appeal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appeal'
      },
      priority: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ['pending', 'processed', 'appealed', 'submitted', 'skipped', 'error'],
        default: 'pending'
      },
      denialAmount: Number,
      appealDeadline: Date,
      appealType: String,
      successProbability: Number
    }],
    processingOptions: {
      generateAppeals: {
        type: Boolean,
        default: false
      },
      useAI: {
        type: Boolean,
        default: true
      },
      autoCategorizeDenials: {
        type: Boolean,
        default: true
      },
      reviewThreshold: {
        type: Number,
        default: 0.7
      }
    },
    notes: String,
    startTime: Date,
    completionTime: Date,
    // For storing any batch specific additional metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster querying
batchSchema.index({ batchId: 1 });
batchSchema.index({ facility: 1, createdAt: -1 });
batchSchema.index({ status: 1 });

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;