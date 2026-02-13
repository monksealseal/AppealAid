const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'billing_company', 'practice', 'advocacy_group', 'other'],
      default: 'practice',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        joinedAt: {
          type: Date,
        },
        status: {
          type: String,
          enum: ['invited', 'active', 'suspended'],
          default: 'active',
        },
      },
    ],
    settings: {
      defaultTemplate: String,
      autoAssign: {
        type: Boolean,
        default: false,
      },
      notificationEmails: [String],
      branding: {
        logoUrl: String,
        primaryColor: String,
      },
    },
    contact: {
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: { type: String, default: 'US' },
      },
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    npiNumber: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
organizationSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Get active member count
organizationSchema.methods.getActiveMemberCount = function () {
  return this.members.filter((m) => m.status === 'active').length;
};

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
