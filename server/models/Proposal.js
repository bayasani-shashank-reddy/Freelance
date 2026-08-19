import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  jobId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  freelancerId: { type: String, required: true },
  freelancerName: { type: String, required: true },
  freelancerAvatar: { type: String, default: '' },
  proposedBudget: { type: Number, required: true },
  estimatedDuration: { type: String, default: '2 weeks' },
  coverLetter: { type: String, required: true },
  submittedAt: { type: String, default: 'Just now' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Interviewing'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Proposal = mongoose.model('Proposal', ProposalSchema);
