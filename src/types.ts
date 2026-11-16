export type UserRole = 'client' | 'freelancer' | 'admin';

export interface User {
  id: string;
  customId?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  countryCode?: string;
  company?: string;
  password?: string;
  role: UserRole;
  status?: 'active' | 'inactive' | 'archived';
  avatar?: string;
  title?: string;
  bio?: string;
  balance?: number;
  escrowBalance?: number;
  credits: number; // NCX virtual tokens (default 500)
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  skills?: string[];
  hourlyRate?: number;
  experience?: string;
  availability?: string;
  createdByAdmin?: boolean;
  trustScore?: number;
  verificationBadge?: string;
  lastLogin?: string;
  createdAt?: string;
  completedContracts?: number;
}

export type RequestStatus =
  | 'Submitted'
  | 'Under Admin Review'
  | 'Additional Information Needed'
  | 'Specialist Review'
  | 'Estimate Preparation'
  | 'Awaiting Client Decision'
  | 'In Progress'
  | 'Revision or Information Pending'
  | 'Completed'
  | 'Declined'
  | 'Cancelled'
  | 'New'
  | 'Reviewed'
  | 'Actioned';

export interface ProjectRequest {
  id: string;
  customId: string;
  _id?: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCountryCode?: string;
  projectTitle: string;
  title?: string;
  rawIdea: string;
  referenceUrl?: string;
  docFileName?: string | null;
  docFileSize?: string | null;
  docFileType?: string | null;
  docStoragePath?: string | null;
  docContentHtml?: string | null;
  aiSummary: string;
  aiSuggestedFeatures: string[];
  aiAssumptions: string[];
  aiCategory: string;
  submissionType?: string;
  creditsCost: number; // 50 NCX
  status: RequestStatus;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  reviewDeadline?: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  commercialTerms?: any;
  userVisibleNote?: string;
  internalNote?: string;
  sharedFreelancerIds?: string[];
  scopeChanges?: ScopeChangeItem[];
  decisions?: ProjectDecisionItem[];
  handoverAcceptance?: HandoverAcceptanceItem;
  worklogs?: FreelancerWorklogItem[];
  handoverDoc?: HandoverDocItem;
  createdAt: string;
  timestamp?: string;
}

export interface ScopeChangeItem {
  customId: string;
  title: string;
  description: string;
  reason?: string;
  affectedRequirements?: string[];
  estimatedBudgetImpact: number;
  estimatedTimelineImpact: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  adminNotes?: string;
  submittedAt: string | Date;
  reviewedAt?: string | Date;
}

export interface ProjectDecisionItem {
  customId: string;
  title: string;
  description: string;
  decisionType: 'requirement' | 'technology' | 'milestone' | 'revised_scope' | 'deliverable' | string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Changes Requested';
  clientFeedback?: string;
  deadline?: string | Date;
  decidedAt?: string | Date;
  createdAt: string | Date;
}

export interface HandoverAcceptanceItem {
  status: 'Pending' | 'Accepted' | 'Issues Raised';
  rating: number;
  feedback?: string;
  issues?: string[];
  acceptedAt?: string | Date;
}

export interface FreelancerWorklogItem {
  customId: string;
  freelancerId: string;
  freelancerName: string;
  taskTitle: string;
  estimatedHours: number;
  actualHours: number;
  workCompleted: string;
  remainingWork: string;
  deviationReason?: string;
  loggedAt: string | Date;
}

export interface HandoverDocItem {
  overview: string;
  technologies: string[];
  installationInstructions: string;
  envVariables?: string[];
  databaseSetup?: string;
  startupInstructions: string;
  keyModules?: string[];
  knownLimitations?: string;
  futureRecommendations?: string;
  generatedAt?: string | Date;
  authorName?: string;
}

// Alias for backwards compatibility
export type IdeaSubmission = ProjectRequest;

export interface CreditTransaction {
  id: string;
  customId: string;
  _id?: string;
  userId: string;
  userEmail?: string;
  amount: number; // e.g. +500, -50
  type: 'welcome_bonus' | 'project_submission' | 'admin_adjustment' | 'refund';
  description: string;
  requestId?: string | null;
  createdByAdminId?: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface DocumentShare {
  id: string;
  customId: string;
  _id?: string;
  requestId: string;
  projectTitle: string;
  documentFileName?: string;
  documentStoragePath?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  sharedByAdminId: string;
  adminInstructions?: string;
  dueDate?: string;
  status: 'Shared' | 'Viewed' | 'Assessed' | 'Revoked';
  viewedAt?: string | null;
  downloadedAt?: string | null;
  revokedAt?: string | null;
  assessment?: {
    feasibility?: string;
    suggestedApproach?: string;
    estimatedDuration?: string;
    preliminaryCost?: string;
    risks?: string;
    notesForAdmin?: string;
    submittedAt?: string | null;
  };
  createdAt: string;
}

export interface AdminContactLog {
  id: string;
  customId: string;
  _id?: string;
  requestId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  adminId: string;
  adminName: string;
  method: 'Call' | 'Email' | 'Other';
  outcome: string;
  details?: string;
  nextAction?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface RequestActivity {
  id: string;
  customId: string;
  _id?: string;
  requestId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  activityType: string;
  previousStatus: string;
  newStatus: string;
  userVisibleNote?: string;
  internalNote?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  customId: string;
  _id?: string;
  recipientId: string;
  recipientRole: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// 3D Scene Mock interfaces
export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  likes: number;
  views: number;
  tags: string[];
  colorPalette: string[];
  clientName: string;
  metrics: string;
  liveUrl?: string;
}

// Backward-compatibility exports for archived/legacy files
export type ViewMode = string;
export interface Designer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  reviewsCount?: number;
  reviewCount?: number;
  availability?: string;
  specialties?: string[];
  coverImage?: string;
  location?: string;
  portfolioItems?: any[];
  packages?: any[];
  stats?: any;
  [key: string]: any;
}
export interface ActiveProject {
  id: string;
  title: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;
  designerTitle: string;
  clientName?: string;
  status: string;
  progress: number;
  totalBudget: number;
  paidAmount: number;
  startDate: string;
  deadline: string;
  milestones: any[];
  deliverables: any[];
  nextDeliverable: string;
}
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isClient: boolean;
  attachment?: any;
}
export interface JobListing {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  clientRating: number;
  category: string;
  description: string;
  budgetType: 'Fixed' | 'Hourly';
  minBudget: number;
  maxBudget: number;
  duration: string;
  experienceLevel: string;
  skills: string[];
  proposalsCount: number;
  postedAt: string;
  status: string;
  isRemote: boolean;
  saved?: boolean;
}
export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerTitle?: string;
  coverLetter: string;
  proposedBudget: number;
  proposedDeliveryTime: string;
  milestonesProposed: any[];
  status: string;
  submittedAt: string;
}
export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  projectTitle: string;
  date: string;
  status: string;
  referenceNo: string;
}
export interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: string;
  against: string;
  reason: string;
  description: string;
  status: string;
  amountInDispute: number;
  createdAt: string;
}
export interface BriefInput {
  rawIdea: string;
  projectTypes: string[];
  businessIndustry: string;
  selectedFeatures: string[];
  customFeatures?: string;
  stylePreference: string;
  customStyleDetails?: string;
  referenceUrls: string[];
  targetAudience: string;
  budget: string;
  timeline: string;
  requiredRoles: string[];
  clarificationAnswers?: Record<string, string>;
}
export interface ProjectBrief {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  briefData: BriefInput;
  aiSummary: any;
  status: string;
  createdAt: string;
  proposalsCount: number;
}
export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
}
export interface TaskItem {
  id: string;
  title: string;
  status: string;
  assignee: string;
  dueDate?: string;
}
export interface DeliverableVersion {
  version: number;
  submittedAt: string;
  description: string;
  files: any[];
  status: string;
}

// ─────────────────────────────────────────────────────────────
// NEXUSCRAFT NEW ARCHITECTURAL TYPES & MODELS
// ─────────────────────────────────────────────────────────────

export interface ProjectBlueprint {
  _id?: string;
  customId: string;
  projectId: string;
  title: string;
  version: number;
  status: 'draft' | 'generated' | 'admin_approved' | 'client_shared';
  approvedByAdmin: boolean;
  approvedAt?: string | null;
  projectOverview: string;
  problemStatement: string;
  proposedSolution: string;
  mainModules: string[];
  essentialFeatures: string[];
  recommendedFeatures: string[];
  optionalFeatures: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  suggestedTechnologies: string[];
  thirdPartyIntegrations: string[];
  projectComplexity: 'Low' | 'Medium' | 'High' | 'Enterprise';
  developmentPhases: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  risks: string[];
  dependencies: string[];
  clarificationQuestions: string[];
  estimatedDevelopmentEffort: string;
  generatedAt: string;
  updatedAt: string;
}

export interface IdeaDraft {
  _id?: string;
  customId: string;
  clientId: string;
  title: string;
  rawIdea: string;
  category: string;
  expectedBudget: string;
  preferredTimeline: string;
  referenceUrl?: string;
  tags: string[];
  isFavorite: boolean;
  aiNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostComponent {
  hours: number;
  rate: number;
  cost: number;
}

export interface CostEstimate {
  _id?: string;
  customId: string;
  projectId: string;
  projectTitle?: string;
  clientBudget: number;
  currency: string;
  hourlyRate: number;
  totalHours: number;
  components: {
    uiUx: CostComponent;
    frontend: CostComponent;
    backend: CostComponent;
    database: CostComponent;
    apiIntegration: CostComponent;
    testing: CostComponent;
    deployment: CostComponent;
    documentation: CostComponent;
    contingencyPercentage: number;
    contingencyAmount: number;
  };
  estimatedMinTotal: number;
  estimatedMaxTotal: number;
  estimatedTotal: number;
  budgetFeasibility: 'potentially_insufficient' | 'within_estimated_range' | 'above_estimated_range' | 'needs_clarification';
  feasibilityNotes: string;
  adminApprovedAmount?: number;
  finalizedAmount?: number;
  status:
    | 'Pending Analysis'
    | 'AI Analyzed'
    | 'Under Admin Review'
    | 'Budget Insufficient'
    | 'Revision Requested'
    | 'Approved'
    | 'On Hold'
    | 'Finalized';
  statusHistory: Array<{
    status: string;
    changedBy: string;
    reason: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FeasibilityAssessmentItem {
  _id?: string;
  customId: string;
  requestId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  feasibility: 'Possible' | 'Needs Clarification' | 'Not Suitable';
  technicalApproach: string;
  technologyStack: string[];
  estimatedHours: number;
  estimatedDuration: string;
  requiredResources: string[];
  risks: string[];
  dependencies: string[];
  missingInformation: string[];
  taskBreakdown: Array<{ task: string; hours: number }>;
  notesForAdmin: string;
  status: 'Submitted' | 'Revision Requested' | 'Approved' | 'Archived';
  adminFeedback?: string;
  submittedAt: string;
}

export interface FreelancerQuotationItem {
  _id?: string;
  customId: string;
  requestId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  version: number;
  currency: string;
  totalCost: number;
  estimatedHours: number;
  estimatedTimeline: string;
  breakdown: {
    frontendCost: number;
    backendCost: number;
    databaseCost: number;
    uiUxCost: number;
    integrationCost: number;
    testingCost: number;
    deploymentCost: number;
    additionalExpenses: number;
  };
  assumptions: string[];
  exclusions: string[];
  risks: string[];
  validityPeriod: string;
  status: 'Submitted' | 'Under Review' | 'Revision Requested' | 'Approved' | 'Rejected';
  adminFeedback?: string;
  submittedAt: string;
}

export interface DeliverableSubmissionItem {
  _id?: string;
  customId: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  submissionTitle: string;
  version: number;
  description: string;
  releaseNotes: string;
  zipFileName: string;
  zipFileSize: string;
  zipStoragePath: string;
  fileCount: number;
  uncompressedSizeBytes: number;
  readmeDetected: boolean;
  readmeContent?: string;
  fileManifest: Array<{ path: string; size: number; isDirectory: boolean }>;
  securityScan: {
    passed: boolean;
    status: string;
    flags: string[];
  };
  sha256Checksum?: string;
  hasPackageJson?: boolean;
  hasReadme?: boolean;
  configFilesDetected?: string[];
  nestedArchivesDetected?: boolean;
  checksumDisclaimer?: string;
  sourceRepoUrl?: string;
  livePreviewUrl?: string;
  gitBranch?: string;
  gitCommitHash?: string;
  status: 'Submitted' | 'Under Review' | 'Changes Requested' | 'Resubmitted' | 'Approved' | 'Rejected';
  releaseToClient: boolean;
  clientReleasedAt?: string | null;
  adminFeedback?: string;
  submittedAt: string;
}

export interface ClarificationItem {
  _id?: string;
  customId: string;
  projectId: string;
  projectTitle: string;
  question: string;
  category: string;
  askedBy: { id: string; name: string; role: string };
  assignedToRole: 'client' | 'admin' | 'freelancer';
  assignedToId?: string;
  answer?: string;
  answeredBy?: { id: string; name: string; role: string };
  answeredAt?: string | null;
  status: 'Pending' | 'Answered' | 'Closed';
  supportingDocs?: string[];
  createdAt: string;
}

export interface ProjectTaskItem {
  _id?: string;
  customId: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  dueDate: string;
  startDate?: string;
  isMilestone?: boolean;
  expectedDuration?: string;
  loggedHours?: number;
  completionNotes?: string;
  assigneeId: string;
  assigneeName: string;
  progress: number;
  worklog: Array<{ hours: number; note: string; loggedAt: string }>;
  createdAt: string;
}

export interface AuditLogItem {
  _id?: string;
  customId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  timestamp: string;
}

