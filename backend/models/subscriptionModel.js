const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid'],
      default: 'trialing',
    },
    stripeCustomerId: {
      type: String,
      trim: true,
    },
    stripeSubscriptionId: {
      type: String,
      trim: true,
    },
    stripePriceId: {
      type: String,
      trim: true,
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    usage: {
      appealsThisMonth: {
        type: Number,
        default: 0,
      },
      documentsThisMonth: {
        type: Number,
        default: 0,
      },
      aiGenerationsThisMonth: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
    invoices: [
      {
        stripeInvoiceId: String,
        amount: Number,
        currency: { type: String, default: 'usd' },
        status: String,
        paidAt: Date,
        invoiceUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Plan limits configuration
subscriptionSchema.statics.PLAN_LIMITS = {
  starter: {
    appealsPerMonth: 3,
    documentsPerMonth: 10,
    aiGenerationsPerMonth: 0,
    teamMembers: 1,
    features: ['basic_templates', 'document_upload', 'appeal_tracking', 'email_support'],
  },
  professional: {
    appealsPerMonth: -1, // unlimited
    documentsPerMonth: -1,
    aiGenerationsPerMonth: -1,
    teamMembers: 10,
    features: ['all_templates', 'advanced_ocr', 'ai_generation', 'analytics', 'priority_support', 'team_collaboration', 'appeal_tracking'],
  },
  enterprise: {
    appealsPerMonth: -1,
    documentsPerMonth: -1,
    aiGenerationsPerMonth: -1,
    teamMembers: -1,
    features: ['all_templates', 'advanced_ocr', 'ai_generation', 'custom_reports', 'api_access', 'webhooks', 'dedicated_support', 'sso', 'audit_logs', 'team_collaboration', 'appeal_tracking'],
  },
};

// Check if user can perform action based on plan limits
subscriptionSchema.methods.canPerformAction = function (action) {
  const limits = this.constructor.PLAN_LIMITS[this.plan];
  if (!limits) return false;

  if (this.status !== 'active' && this.status !== 'trialing') return false;

  switch (action) {
    case 'create_appeal':
      return limits.appealsPerMonth === -1 || this.usage.appealsThisMonth < limits.appealsPerMonth;
    case 'upload_document':
      return limits.documentsPerMonth === -1 || this.usage.documentsThisMonth < limits.documentsPerMonth;
    case 'ai_generation':
      return limits.aiGenerationsPerMonth === -1 || this.usage.aiGenerationsThisMonth < limits.aiGenerationsPerMonth;
    default:
      return limits.features.includes(action);
  }
};

// Reset monthly usage counters
subscriptionSchema.methods.resetMonthlyUsage = function () {
  this.usage.appealsThisMonth = 0;
  this.usage.documentsThisMonth = 0;
  this.usage.aiGenerationsThisMonth = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
