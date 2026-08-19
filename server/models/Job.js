import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  clientAvatar: { type: String, default: '' },
  clientRating: { type: Number, default: 4.9 },
  clientId: { type: String, default: '', index: true },
  category: { type: String, default: 'Web Development' },
  description: { type: String, required: true },
  budgetType: { type: String, default: 'Fixed' },
  minBudget: { type: Number, default: 250 },
  maxBudget: { type: Number, default: 1500 },
  duration: { type: String, default: '2–4 weeks' },
  experienceLevel: { type: String, default: 'Intermediate' },
  skills: [{ type: String }],
  proposalsCount: { type: Number, default: 0 },
  postedAt: { type: String, default: 'Just now' },
  status: { type: String, default: 'Open' },
  assignedFreelancerId: { type: String, default: null },
  assignedFreelancerName: { type: String, default: null },
  isRemote: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Job = mongoose.model('Job', JobSchema);
