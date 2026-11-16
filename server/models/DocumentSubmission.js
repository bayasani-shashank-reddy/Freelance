import mongoose from 'mongoose';

const DocumentSubmissionVersionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  storagePath: { type: String, required: true },
  fileSize: { type: String, default: '' },
  fileSizeBytes: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: {
    id: { type: String },
    name: { type: String },
    email: { type: String },
    role: { type: String, default: 'client' }
  },
  clientNotes: { type: String, default: '' },
  reviewStatus: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Approved', 'Revision Requested', 'Rejected'],
    default: 'Submitted'
  },
  reviewFeedback: {
    reason: { type: String, default: '' },
    instructions: { type: String, default: '' },
    revisionDeadline: { type: Date, default: null },
    internalNotes: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewerName: { type: String, default: '' },
    reviewedAt: { type: Date, default: null }
  }
});

const DocumentSubmissionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  requirementId: { type: String, required: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, default: '' },
  requirementName: { type: String, required: true },
  currentVersionNumber: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['Not Submitted', 'Submitted', 'Under Review', 'Approved', 'Revision Requested', 'Rejected', 'Overdue'],
    default: 'Submitted'
  },
  versions: [DocumentSubmissionVersionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const DocumentSubmission =
  mongoose.models.DocumentSubmission ||
  mongoose.model('DocumentSubmission', DocumentSubmissionSchema);
