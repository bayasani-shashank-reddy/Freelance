import mongoose from 'mongoose';

const ProjectRequestSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, required: true },
  clientAvatar: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  clientCountryCode: { type: String, default: '+1' },
  projectTitle: { type: String, required: true },
  rawIdea: { type: String, default: '' },
  referenceUrl: { type: String, default: '' },
  docFileName: { type: String, default: null },
  docFileSize: { type: String, default: null },
  docFileType: { type: String, default: null },
  docStoragePath: { type: String, default: null },
  docContentHtml: { type: String, default: null },
  docBase64: { type: String, default: null },
  aiSummary: { type: String, default: '' },
  aiSuggestedFeatures: [{ type: String }],
  aiAssumptions: [{ type: String }],
  aiCategory: { type: String, default: 'Website' },
  submissionType: { type: String, default: 'title_only' },
  creditsCost: { type: Number, default: 50 },
  status: {
    type: String,
    enum: [
      'Submitted',
      'Under Admin Review',
      'Additional Information Needed',
      'Specialist Review',
      'Estimate Preparation',
      'Awaiting Client Decision',
      'In Progress',
      'Revision or Information Pending',
      'Completed',
      'Declined',
      'Cancelled',
      'New',
      'Reviewed',
      'Actioned'
    ],
    default: 'Submitted'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  reviewDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24-hour review target
  },
  assignedFreelancerId: { type: String, default: null },
  assignedFreelancerName: { type: String, default: null },
  commercialTerms: {
    proposedClientPrice: { type: Number, default: 0 },
    proposedFreelancerFee: { type: Number, default: 0 },
    approvedClientPrice: { type: Number, default: 0 },
    approvedFreelancerFee: { type: Number, default: 0 },
    projectedPlatformMargin: { type: Number, default: 0 },
    marginPercentage: { type: Number, default: 0 },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    revisionHistory: [
      {
        proposedClientPrice: Number,
        proposedFreelancerFee: Number,
        approvedClientPrice: Number,
        approvedFreelancerFee: Number,
        projectedPlatformMargin: Number,
        marginPercentage: Number,
        updatedBy: String,
        updatedAt: { type: Date, default: Date.now },
        reason: String
      }
    ]
  },
  userVisibleNote: { type: String, default: '' },
  internalNote: { type: String, default: '' },
  sharedFreelancerIds: [{ type: String }],
  scopeChanges: [
    {
      customId: String,
      title: String,
      description: String,
      reason: String,
      affectedRequirements: [String],
      estimatedBudgetImpact: { type: Number, default: 0 },
      estimatedTimelineImpact: { type: String, default: 'No change' },
      status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
        default: 'Pending'
      },
      adminNotes: { type: String, default: '' },
      submittedAt: { type: Date, default: Date.now },
      reviewedAt: Date
    }
  ],
  decisions: [
    {
      customId: String,
      title: String,
      description: String,
      decisionType: { type: String, default: 'requirement' },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Changes Requested'],
        default: 'Pending'
      },
      clientFeedback: { type: String, default: '' },
      deadline: Date,
      decidedAt: Date,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  handoverAcceptance: {
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Issues Raised'],
      default: 'Pending'
    },
    rating: { type: Number, default: 5 },
    feedback: { type: String, default: '' },
    acceptedAt: Date,
    issues: [{ type: String }]
  },
  worklogs: [
    {
      customId: String,
      freelancerId: String,
      freelancerName: String,
      taskTitle: String,
      estimatedHours: Number,
      actualHours: Number,
      workCompleted: String,
      remainingWork: String,
      deviationReason: String,
      loggedAt: { type: Date, default: Date.now }
    }
  ],
  handoverDoc: {
    overview: String,
    technologies: [{ type: String }],
    installationInstructions: String,
    envVariables: [{ type: String }],
    databaseSetup: String,
    startupInstructions: String,
    keyModules: [{ type: String }],
    knownLimitations: String,
    futureRecommendations: String,
    generatedAt: Date,
    authorName: String
  },
  createdAt: { type: String, default: () => new Date().toLocaleString() },
  timestamp: { type: Date, default: Date.now }
});

export const ProjectRequest = mongoose.models.ProjectRequest || mongoose.model('ProjectRequest', ProjectRequestSchema);
export const IdeaSubmission = ProjectRequest; // Alias for seamless backward compatibility
