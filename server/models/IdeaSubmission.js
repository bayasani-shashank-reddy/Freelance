import mongoose from 'mongoose';

const IdeaSubmissionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, required: true },
  clientAvatar: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  rawIdea: { type: String, required: true },
  docFileName: { type: String, default: null },
  docContentHtml: { type: String, default: null },
  docBase64: { type: String, default: null },
  submissionType: { type: String, default: 'text' },
  creditsCost: { type: Number, default: 50 },
  status: { type: String, default: 'New' },
  createdAt: { type: String, default: () => new Date().toLocaleString() },
  timestamp: { type: Date, default: Date.now }
});

export const IdeaSubmission = mongoose.model('IdeaSubmission', IdeaSubmissionSchema);
