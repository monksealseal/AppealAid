/**
 * Peer-to-Peer Review Model
 * 
 * Schema for peer-to-peer review records between physicians
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const peerReviewSchema = new Schema({
  // Related appeal
  appeal: {
    type: Schema.Types.ObjectId,
    ref: 'Appeal',
    required: true,
    index: true
  },
  
  // Review status
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'pending'],
    default: 'pending',
    index: true
  },
  
  // Scheduling information
  scheduledDate: Date,
  scheduledTime: String,
  duration: Number, // in minutes
  completedDate: Date,
  
  // Insurance company reviewer
  insuranceReviewer: {
    name: String,
    title: String,
    specialty: String,
    email: String,
    phone: String,
    faxNumber: String,
    directLine: String
  },
  
  // Treating provider
  treatingProvider: {
    name: String,
    title: String,
    specialty: String,
    email: String,
    phone: String,
    npi: String,
    facility: String
  },
  
  // Discussion details
  discussionPoints: [{
    topic: String,
    notes: String,
    supportingDocuments: [{
      documentId: String,
      name: String
    }]
  }],
  
  // Pre-review preparation
  preparationNotes: String,
  keyMedicalPoints: [String],
  relevantGuidelines: [{
    title: String,
    source: String,
    link: String,
    notes: String
  }],
  
  // Outcome
  outcome: {
    type: String,
    enum: ['approved', 'denied', 'partially_approved', 'pending_additional_info', 'escalated', null],
    default: null
  },
  outcomeNotes: String,
  followUpActions: [String],
  
  // References
  referenceNumber: String,
  caseManager: String,
  caseManagerContact: String,
  
  // Call recording/notes
  recordingConsent: Boolean,
  recordingUrl: String,
  transcriptUrl: String,
  
  // Audit
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for searching
peerReviewSchema.index({ 
  'insuranceReviewer.name': 'text', 
  'treatingProvider.name': 'text',
  preparationNotes: 'text',
  outcomeNotes: 'text',
  referenceNumber: 'text'
});

const PeerReview = mongoose.model('PeerReview', peerReviewSchema);

module.exports = PeerReview;