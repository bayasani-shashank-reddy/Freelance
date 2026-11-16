import mongoose from 'mongoose';

const ProjectBlueprintSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  version: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['draft', 'generated', 'admin_approved', 'client_shared'],
    default: 'generated'
  },
  approvedByAdmin: { type: Boolean, default: false },
  approvedAt: { type: Date, default: null },

  // 17 Structured Blueprint Sections
  projectOverview: { type: String, default: '' },
  problemStatement: { type: String, default: '' },
  proposedSolution: { type: String, default: '' },
  mainModules: [{ type: String }],
  essentialFeatures: [{ type: String }],
  recommendedFeatures: [{ type: String }],
  optionalFeatures: [{ type: String }],
  functionalRequirements: [{ type: String }],
  nonFunctionalRequirements: [{ type: String }],
  suggestedTechnologies: [{ type: String }],
  thirdPartyIntegrations: [{ type: String }],
  projectComplexity: { type: String, enum: ['Low', 'Medium', 'High', 'Enterprise'], default: 'Medium' },
  developmentPhases: [
    {
      phase: { type: String },
      duration: { type: String },
      description: { type: String }
    }
  ],
  risks: [{ type: String }],
  dependencies: [{ type: String }],
  clarificationQuestions: [{ type: String }],
  estimatedDevelopmentEffort: { type: String, default: '160 - 240 hours' },

  generatedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ProjectBlueprint = mongoose.models.ProjectBlueprint || mongoose.model('ProjectBlueprint', ProjectBlueprintSchema);

