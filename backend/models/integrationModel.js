const mongoose = require('mongoose');

const apiIntegrationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    integrationType: {
      type: String,
      enum: [
        'insurerAPI', 
        'billingSystem', 
        'documentManagement', 
        'ehrSystem',
        'clearinghouse',
        'aiService',
        'medicationDatabase',
        'medicalLiterature',
        'regulatoryDatabase',
        'telephony',
        'emailService',
        'faxService',
        'analyticsService',
        'customAPI'
      ],
      required: true
    },
    vendor: {
      name: String,
      contactInfo: String,
      supportEmail: String,
      supportPhone: String,
      website: String
    },
    connectionDetails: {
      baseUrl: String,
      apiKey: {
        type: String,
        select: false // For security, not returned in queries by default
      },
      clientId: String,
      clientSecret: {
        type: String,
        select: false
      },
      authType: {
        type: String,
        enum: ['basic', 'oauth', 'apiKey', 'jwt', 'custom'],
        default: 'apiKey'
      },
      tokenEndpoint: String,
      refreshToken: {
        type: String,
        select: false
      },
      accessToken: {
        type: String,
        select: false
      },
      tokenExpiry: Date,
      webhookUrl: String,
      webhookSecret: {
        type: String,
        select: false
      },
      ipWhitelist: [String],
      customHeaders: [{
        key: String,
        value: String
      }]
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'testing', 'error', 'pending'],
      default: 'testing'
    },
    lastConnected: Date,
    lastError: String,
    endpoints: [{
      name: String,
      path: String,
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      },
      description: String,
      parameters: [{
        name: String,
        type: String,
        required: Boolean,
        defaultValue: String
      }],
      requestTemplate: String,
      responseMapping: [{
        sourceField: String,
        targetField: String,
        transformation: String
      }],
      throttleLimit: Number,
      isEnabled: {
        type: Boolean,
        default: true
      }
    }],
    settings: {
      timeout: {
        type: Number,
        default: 30000
      },
      retryAttempts: {
        type: Number,
        default: 3
      },
      retryDelay: {
        type: Number,
        default: 1000
      },
      logging: {
        type: Boolean,
        default: true
      },
      logLevel: {
        type: String,
        enum: ['error', 'warn', 'info', 'debug'],
        default: 'info'
      },
      concurrentLimit: {
        type: Number,
        default: 5
      },
      cacheEnabled: {
        type: Boolean,
        default: false
      },
      cacheTTL: {
        type: Number,
        default: 3600
      }
    },
    permissions: [{
      role: {
        type: String,
        enum: ['admin', 'manager', 'user', 'billing', 'provider']
      },
      endpoints: [String],
      allowCreate: Boolean,
      allowRead: Boolean,
      allowUpdate: Boolean,
      allowDelete: Boolean
    }],
    metrics: {
      totalCalls: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 0
      },
      averageResponseTime: {
        type: Number,
        default: 0
      },
      errorRate: {
        type: Number,
        default: 0
      },
      lastSync: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

const securitySettingsSchema = mongoose.Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    securityLevel: {
      type: String,
      enum: ['basic', 'standard', 'enhanced', 'hipaa', 'custom'],
      default: 'hipaa'
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 12
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      },
      expirationDays: {
        type: Number,
        default: 90
      },
      preventPasswordReuse: {
        type: Number,
        default: 5
      },
      lockoutThreshold: {
        type: Number,
        default: 5
      },
      lockoutDuration: {
        type: Number,
        default: 30
      }
    },
    sessionSettings: {
      sessionTimeout: {
        type: Number,
        default: 15
      },
      extendSessionOnActivity: {
        type: Boolean,
        default: true
      },
      singleSessionPerUser: {
        type: Boolean,
        default: false
      },
      enforceIpRestrictions: {
        type: Boolean,
        default: false
      },
      allowedIpRanges: [String]
    },
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: true
      },
      requiredForRoles: [{
        type: String,
        enum: ['admin', 'manager', 'user', 'billing', 'provider', 'all']
      }],
      methods: [{
        type: String,
        enum: ['sms', 'email', 'authenticator', 'hardware'],
        default: 'authenticator'
      }],
      gracePeriod: {
        type: Number,
        default: 0
      },
      rememberDeviceDays: {
        type: Number,
        default: 30
      }
    },
    dataEncryption: {
      patientDataEncryption: {
        type: Boolean,
        default: true
      },
      documentEncryption: {
        type: Boolean,
        default: true
      },
      encryptionLevel: {
        type: String,
        enum: ['AES-128', 'AES-256', 'custom'],
        default: 'AES-256'
      },
      keystoreLocation: String,
      rotationSchedule: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly', 'manual'],
        default: 'quarterly'
      }
    },
    accessControls: {
      roleBasedAccessControl: {
        type: Boolean,
        default: true
      },
      attributeBasedAccessControl: {
        type: Boolean,
        default: false
      },
      customRules: [String]
    },
    auditSettings: {
      enableAuditLogging: {
        type: Boolean,
        default: true
      },
      logUserActions: {
        type: Boolean,
        default: true
      },
      logSystemEvents: {
        type: Boolean,
        default: true
      },
      logDataAccess: {
        type: Boolean,
        default: true
      },
      retentionPeriod: {
        type: Number,
        default: 365
      },
      alertOnSuspiciousActivity: {
        type: Boolean,
        default: true
      }
    },
    hipaaCompliance: {
      conductedRiskAssessment: {
        type: Boolean,
        default: false
      },
      lastRiskAssessmentDate: Date,
      appointedSecurityOfficer: String,
      disasterRecoveryPlan: {
        type: Boolean,
        default: false
      },
      breachNotificationProcedure: {
        type: Boolean,
        default: false
      },
      businessAssociateAgreements: {
        type: Boolean,
        default: false
      },
      employeeTraining: {
        type: Boolean,
        default: false
      },
      sanctionPolicy: {
        type: Boolean,
        default: false
      }
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
apiIntegrationSchema.index({ facility: 1, integrationType: 1 });
apiIntegrationSchema.index({ status: 1 });

securitySettingsSchema.index({ facility: 1 });

const APIIntegration = mongoose.model('APIIntegration', apiIntegrationSchema);
const SecuritySettings = mongoose.model('SecuritySettings', securitySettingsSchema);

module.exports = { APIIntegration, SecuritySettings };