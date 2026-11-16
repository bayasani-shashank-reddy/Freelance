import mongoose from 'mongoose';

const ProjectBlueprintVersionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  blueprintId: { type: String, required: true, index: true },
  versionNumber: { type: Number, required: true },
  changeSummary: { type: String, default: 'Blueprint revision' },
  authorId: { type: String, required: true },
  authorName: { type: String, default: 'NexusCraft System' },
  authorRole: { type: String, default: 'admin' },
  snapshot: {
    projectOverview: { type: String },
    essentialFeatures: [{ type: String }],
    mainModules: [{ type: String }],
    techStack: [{ type: String }],
    systemArchitecture: { type: String },
    developmentPhases: [{ type: mongoose.Schema.Types.Mixed }],
    estimatedTimelineWeeks: { type: String },
    estimatedDevelopmentEffort: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export const ProjectBlueprintVersion = mongoose.models.ProjectBlueprintVersion || mongoose.model('ProjectBlueprintVersion', ProjectBlueprintVersionSchema);
