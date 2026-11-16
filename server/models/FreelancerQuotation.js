import mongoose from 'mongoose';

const FreelancerQuotationSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  projectTitle: { type: String, required: true },
  freelancerId: { type: String, required: true, index: true },
  freelancerName: { type: String, required: true },
  freelancerEmail: { type: String, required: true },
  version: { type: Number, default: 1 },
  currency: { type: String, default: 'INR (₹)' },
  totalCost: { type: Number, required: true },
  estimatedHours: { type: Number, default: 0 },
  estimatedTimeline: { type: String, default: '' },
  breakdown: {
    frontendCost: { type: Number, default: 0 },
    backendCost: { type: Number, default: 0 },
    databaseCost: { type: Number, default: 0 },
    uiUxCost: { type: Number, default: 0 },
    integrationCost: { type: Number, default: 0 },
    testingCost: { type: Number, default: 0 },
    deploymentCost: { type: Number, default: 0 },
    additionalExpenses: { type: Number, default: 0 }
  },
  assumptions: [{ type: String }],
  exclusions: [{ type: String }],
  risks: [{ type: String }],
  validityPeriod: { type: String, default: '30 Days' },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Revision Requested', 'Approved', 'Rejected'],
    default: 'Submitted'
  },
  adminFeedback: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const FreelancerQuotation = mongoose.models.FreelancerQuotation || mongoose.model('FreelancerQuotation', FreelancerQuotationSchema);

