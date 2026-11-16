import mongoose from 'mongoose';

const DocumentShareSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  projectTitle: { type: String, required: true },
  documentFileName: { type: String, default: '' },
  documentStoragePath: { type: String, default: '' },
  freelancerId: { type: String, required: true, index: true },
  freelancerName: { type: String, required: true },
  freelancerEmail: { type: String, required: true },
  sharedByAdminId: { type: String, required: true },
  adminInstructions: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Shared', 'Viewed', 'Assessed', 'Revoked'],
    default: 'Shared'
  },
  viewedAt: { type: Date, default: null },
  downloadedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  assessment: {
    feasibility: { type: String, default: '' },
    suggestedApproach: { type: String, default: '' },
    estimatedDuration: { type: String, default: '' },
    preliminaryCost: { type: String, default: '' },
    risks: { type: String, default: '' },
    notesForAdmin: { type: String, default: '' },
    submittedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

export const DocumentShare = mongoose.models.DocumentShare || mongoose.model('DocumentShare', DocumentShareSchema);
