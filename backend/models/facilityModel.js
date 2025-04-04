const mongoose = require('mongoose');

const facilitySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['hospital', 'academicMedicalCenter', 'clinic', 'provider', 'lab', 'other'],
      required: true,
      default: 'hospital'
    },
    academicAffiliation: {
      isAcademic: {
        type: Boolean,
        default: false
      },
      institution: String,
      researchActive: {
        type: Boolean,
        default: false
      },
      teachingActive: {
        type: Boolean,
        default: false
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    },
    contactInfo: {
      phone: String,
      fax: String,
      email: String,
      website: String
    },
    identifiers: {
      npi: String,
      taxId: String,
      facilityId: String
    },
    administrators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    staff: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: ['admin', 'manager', 'user', 'provider', 'billing'],
          default: 'user'
        },
        permissions: {
          canUploadDocuments: {
            type: Boolean,
            default: true
          },
          canGenerateAppeals: {
            type: Boolean,
            default: true
          },
          canSubmitAppeals: {
            type: Boolean,
            default: false
          },
          canViewAll: {
            type: Boolean,
            default: false
          },
          canManageUsers: {
            type: Boolean,
            default: false
          }
        }
      }
    ],
    departments: [{
      name: String,
      code: String,
      contactPerson: String,
      contactEmail: String,
      contactPhone: String
    }],
    defaultSettings: {
      appealTemplates: {
        medicalNecessity: String,
        priorAuthorization: String,
        outOfNetwork: String,
        codingError: String,
        preAuthConflict: String,
        urgencyOverride: String,
        clinicalTrial: String,
        academicException: String,
        teachingPhysician: String
      },
      floridaSpecificSettings: {
        floridaStatutesEnabled: {
          type: Boolean,
          default: true
        },
        floridaPromptPayLawEnabled: {
          type: Boolean,
          default: true
        },
        miamiDadeCountyProvisions: {
          type: Boolean,
          default: false
        }
      },
      autoGenerateAppeals: {
        type: Boolean,
        default: false
      },
      batchProcessingEnabled: {
        type: Boolean,
        default: true
      },
      appealThresholds: {
        minimumDollarAmount: {
          type: Number,
          default: 100
        },
        priorityDollarAmount: {
          type: Number,
          default: 1000
        }
      },
      defaultInsurers: [{
        name: String,
        appealPortalUrl: String,
        appealFormats: [String],
        appealTimeframes: {
          standard: Number,
          expedited: Number
        },
        appealFormLocation: String,
        contactInfo: {
          appealsDepartment: String,
          phone: String,
          fax: String,
          email: String
        }
      }]
    },
    stats: {
      totalAppeals: {
        type: Number,
        default: 0
      },
      successfulAppeals: {
        type: Number,
        default: 0
      },
      pendingAppeals: {
        type: Number,
        default: 0
      },
      totalRecovered: {
        type: Number,
        default: 0
      },
      appealsByType: {
        type: Map,
        of: Number,
        default: {}
      },
      appealsByInsurer: {
        type: Map,
        of: Number,
        default: {}
      },
      successRateByType: {
        type: Map,
        of: Number,
        default: {}
      },
      avgProcessingTimeByInsurer: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'standard', 'premium', 'enterprise'],
        default: 'free'
      },
      maxUsers: {
        type: Number,
        default: 1
      },
      maxAppealsPerMonth: {
        type: Number,
        default: 10
      },
      features: {
        batchProcessing: {
          type: Boolean,
          default: false
        },
        aiEnhancedAppeals: {
          type: Boolean,
          default: false
        },
        advancedAnalytics: {
          type: Boolean,
          default: false
        },
        customTemplates: {
          type: Boolean,
          default: false
        },
        apiAccess: {
          type: Boolean,
          default: false
        }
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['active', 'trialing', 'pastDue', 'canceled'],
        default: 'active'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
);

// Add index for faster querying
facilitySchema.index({ name: 1 });
facilitySchema.index({ 'identifiers.npi': 1 });

const Facility = mongoose.model('Facility', facilitySchema);

module.exports = Facility;