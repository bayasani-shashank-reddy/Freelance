export type UserRole = 'client' | 'freelancer' | 'admin';

export type ViewMode = 'landing' | 'how-it-works' | 'brief-builder' | 'directory' | 'designer-profile' | 'dashboard' | 'register' | 'notifications';

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'SaaS' | 'Mobile App' | 'Fintech' | 'AI Studio' | 'E-commerce' | 'Design System';
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

export interface Review {
  id: string;
  clientName: string;
  clientAvatar: string;
  company: string;
  rating: number;
  date: string;
  text: string;
  projectTitle: string;
  communicationRating?: number;
  qualityRating?: number;
  deadlineRating?: number;
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

export interface NexusScoreBreakdown {
  totalScore: number; // 0 - 100
  clientSatisfaction: number;
  onTimeDelivery: number;
  codeQuality: number;
  communication: number;
}

export interface Designer {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  title: string;
  bio: string;
  location: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  specialties: string[];
  availability: 'Available Now' | 'In 1 Week' | 'In 2 Weeks' | 'Booked';
  badge: 'Top 1%' | 'Pro Elite' | 'Rising Star' | 'Master Craftsman';
  portfolioItems: PortfolioItem[];
  reviews: Review[];
  packages: ServicePackage[];
  nexusScore?: NexusScoreBreakdown;
  stats: {
    completedProjects: number;
    jobSuccessRate: number;
    repeatClients: number;
    responseTime: string;
    totalEarnings?: number;
  };
  verifiedBadges?: string[];
  socials?: {
    dribbble?: string;
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
  };
}

export interface BriefInput {
  rawIdea: string;
  projectTypes: string[];
  customProjectType?: string;
  businessIndustry: string;
  customIndustry?: string;
  selectedFeatures: string[];
  customFeatures?: string;
  stylePreference: string;
  customStyleDetails?: string;
  referenceUrls: string[];
  referenceNotes?: string;
  targetAudience: string;
  budget: string;
  timeline: string;
  requiredRoles: string[];
  customRequiredRole?: string;
  experiencePreference: string;
  additionalDetails: string;
  clarificationAnswers?: Record<string, string>;
  industry?: string; // fallback compatibility
  deliverables?: string[]; // fallback compatibility
}

export interface ProjectBrief {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  briefData: BriefInput;
  aiSummary: {
    objective: string;
    keyFeatures: string[];
    suggestedRoles: string[];
    designDirection: string;
    targetAudience: string;
    aiClarifications?: { question: string; answer: string }[];
  };
  status: 'Draft' | 'Open' | 'Hiring' | 'Active' | 'Completed';
  createdAt: string;
  proposalsCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending Review' | 'Upcoming';
}

export interface DeliverableVersion {
  version: number;
  submittedAt: string;
  description: string;
  files: { name: string; url: string; size?: string }[];
  status: 'Approved' | 'Revision Requested' | 'Under Review';
  feedback?: string;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  type: 'Figma File' | 'Framer Link' | 'React Codebase' | 'Brand Specs' | 'Video Walkthrough';
  url: string;
  updatedAt: string;
  versions?: DeliverableVersion[];
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee: string;
  dueDate?: string;
}

export interface ActiveProject {
  id: string;
  title: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;
  designerTitle: string;
  clientId?: string;
  clientName?: string;
  status: 'Active' | 'Under Review' | 'Completed' | 'On Hold';
  progress: number;
  totalBudget: number;
  paidAmount: number;
  startDate: string;
  deadline: string;
  milestones: Milestone[];
  deliverables: ProjectDeliverable[];
  tasks?: TaskItem[];
  nextDeliverable: string;
  healthStatus?: 'On Track' | 'At Risk' | 'Delayed';
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
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert';
  skills: string[];
  proposalsCount: number;
  postedAt: string;
  status: 'Open' | 'In Review' | 'Closed';
  isRemote: boolean;
  saved?: boolean;
  clientId?: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
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
  milestonesProposed: { title: string; amount: number }[];
  status: 'Submitted' | 'Viewed' | 'Shortlisted' | 'Accepted' | 'Rejected';
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isClient: boolean;
  isSelf?: boolean;
  replyToId?: string;
  reaction?: string;
  attachment?: {
    name: string;
    type: string;
    url: string;
    size?: string;
  };
  audioNoteUrl?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'Deposit' | 'Escrow Hold' | 'Milestone Release' | 'Withdrawal' | 'Refund';
  amount: number;
  projectTitle: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Processing';
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
  status: 'Open' | 'Under Arbitrage' | 'Resolved';
  amountInDispute: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title?: string;
  bio?: string;
  company?: string;
  balance: number;
  escrowBalance: number;
  credits?: number;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  skills?: string[];
  trustScore?: number;
  verificationBadge?: string;
  completedContracts?: number;
  monthlyGoal?: number;
  earningsForecast?: number;
  sprintVelocity?: number;
  reputationLevel?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum Elite';
}

export interface IdeaSubmission {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientEmail: string;
  rawIdea: string;
  docFileName?: string;
  submissionType: 'text' | 'document' | 'detailed_brief';
  status: 'New' | 'Reviewed' | 'Actioned';
  creditsCost: number;
  createdAt: string;
}

export interface AdminClientMessage {
  id: string;
  conversationId: string; // clientId
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'admin' | 'client';
  text: string;
  timestamp: string;
  attachmentName?: string;
}


