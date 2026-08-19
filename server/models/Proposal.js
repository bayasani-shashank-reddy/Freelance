import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  jobId: { type: String, required: true, index: true },
  jobTitle: { type: String, required: true },
  freelancerId: { type: String, required: true, index: true },
  freelancerName: { type: String, required: true },
  freelancerAvatar: { type: String, default: '' },
  freelancerTitle: { type: String, default: 'Freelancer' },
  proposedBudget: { type: Number, required: true },
  proposedDeliveryTime: { type: String, default: '2-3 weeks' },
  coverLetter: { type: String, required: true },
  milestonesProposed: { type: Array, default: [] },
  submittedAt: { type: String, default: 'Just now' },
  status: { type: String, default: 'Submitted' },
  createdAt: { type: Date, default: Date.now }
});

export const Proposal = mongoose.model('Proposal', ProposalSchema);
