import mongoose from 'mongoose';

const ClarificationSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  question: { type: String, required: true },
  category: { type: String, default: 'Requirements Scope' },
  askedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  assignedToRole: {
    type: String,
    enum: ['client', 'admin', 'freelancer'],
    default: 'client'
  },
  assignedToId: { type: String, default: '' },
  answer: { type: String, default: '' },
  answeredBy: {
    id: { type: String },
    name: { type: String },
    role: { type: String }
  },
  answeredAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['Pending', 'Answered', 'Closed'],
    default: 'Pending'
  },
  supportingDocs: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Clarification = mongoose.models.Clarification || mongoose.model('Clarification', ClarificationSchema);

