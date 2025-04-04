/**
 * Patient Model
 * 
 * Schema for patient records
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  // Patient identifiers
  patientId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // Personal information
  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'unknown']
  },
  
  // Contact information
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
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
  
  // Communication preferences
  preferredLanguage: {
    type: String,
    default: 'en', // English
    enum: ['en', 'es', 'fr', 'zh', 'other']
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'mail', 'patient_portal']
  },
  
  // Insurance information
  insuranceInfo: [{
    insuranceCompany: String,
    memberId: String,
    groupNumber: String,
    planName: String,
    isPrimary: Boolean,
    startDate: Date,
    endDate: Date
  }],
  
  // Healthcare providers
  providers: [{
    name: String,
    facilityName: String,
    specialty: String,
    phone: String,
    isPrimary: Boolean
  }],
  
  // User account reference (if patient has an account)
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  
  // Document accessibility
  documents: [{
    documentId: String,
    documentType: String,
    name: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
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

// Index for searching patients
patientSchema.index({ name: 'text', email: 'text', 'insuranceInfo.insuranceCompany': 'text' });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;