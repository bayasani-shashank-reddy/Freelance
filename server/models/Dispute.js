import mongoose from 'mongoose';

const DisputeSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  raisedById: { type: String, required: true, index: true },
  raisedByName: { type: String, required: true },
  raisedByRole: { type: String, enum: ['client', 'freelancer'], required: true },
  againstId: { type: String, required: true },
  againstName: { type: String, default: '' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  evidenceUrls: [{ type: String }],
  requestedRefundNCX: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['open', 'under_review', 'mediation', 'resolved', 'rejected'],
    default: 'open',
    index: true
  },
  adminDecision: {
    resolutionNotes: { type: String },
    refundedNCX: { type: Number, default: 0 },
    resolvedByAdminId: { type: String },
    resolvedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Dispute = mongoose.models.Dispute || mongoose.model('Dispute', DisputeSchema);
