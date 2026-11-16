import mongoose from 'mongoose';

const IdeaDraftSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  clientId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  rawIdea: { type: String, default: '' },
  category: { type: String, default: 'Web Application' },
  expectedBudget: { type: String, default: '' },
  preferredTimeline: { type: String, default: '' },
  referenceUrl: { type: String, default: '' },
  tags: [{ type: String }],
  isFavorite: { type: Boolean, default: false },
  aiNotes: { type: String, default: '' },
  
  // Feasibility Pre-score (ID 18)
  feasibilityScore: { type: Number, default: 75 }, // 1 to 100
  feasibilityBreakdown: {
    titleClarity: { type: Number, default: 20 },      // max 25
    categoryPlausibility: { type: Number, default: 20 }, // max 25
    budgetAlignment: { type: Number, default: 18 },       // max 25
    timelineViability: { type: Number, default: 17 }      // max 25
  },
  feasibilityFactors: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const IdeaDraft = mongoose.models.IdeaDraft || mongoose.model('IdeaDraft', IdeaDraftSchema);
