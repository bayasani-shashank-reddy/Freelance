import mongoose from 'mongoose';

const FeasibilityAssessmentSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  projectTitle: { type: String, required: true },
  freelancerId: { type: String, required: true, index: true },
  freelancerName: { type: String, required: true },
  freelancerEmail: { type: String, required: true },
  feasibility: {
    type: String,
    enum: ['Possible', 'Needs Clarification', 'Not Suitable'],
    required: true
  },
  technicalApproach: { type: String, default: '' },
  technologyStack: [{ type: String }],
  estimatedHours: { type: Number, default: 0 },
  estimatedDuration: { type: String, default: '' },
  requiredResources: [{ type: String }],
  risks: [{ type: String }],
  dependencies: [{ type: String }],
  missingInformation: [{ type: String }],
  taskBreakdown: [
    {
      task: { type: String },
      hours: { type: Number }
    }
  ],
  notesForAdmin: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Submitted', 'Revision Requested', 'Approved', 'Archived'],
    default: 'Submitted'
  },
  adminFeedback: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const FeasibilityAssessment = mongoose.models.FeasibilityAssessment || mongoose.model('FeasibilityAssessment', FeasibilityAssessmentSchema);

