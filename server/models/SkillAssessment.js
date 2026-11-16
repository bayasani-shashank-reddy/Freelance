import mongoose from 'mongoose';

const SkillAssessmentSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  skill: { type: String, required: true },
  category: { type: String, default: 'Engineering' },
  questions: [
    {
      id: { type: String },
      question: { type: String },
      options: [{ type: String }],
      correctIndex: { type: Number }
    }
  ],
  passingScore: { type: Number, default: 80 },
  createdAt: { type: Date, default: Date.now }
});

export const SkillAssessment = mongoose.models.SkillAssessment || mongoose.model('SkillAssessment', SkillAssessmentSchema);
