import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { EffortTrackerModal } from '../../components/freelancer/EffortTrackerModal';
import { TechnicalHandoverModal } from '../../components/freelancer/TechnicalHandoverModal';
import { SubmissionReadinessInspector } from '../../components/freelancer/SubmissionReadinessInspector';
import {
  Shield,
  Eye,
  Upload,
  CheckCircle2,
  Send,
  Clock,
  Edit3,
  X,
  Copy,
  ChevronRight
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';
import { BoxedButton } from '../../components/shared/BoxedButton';
import { api } from '../../lib/api';
import type { FeasibilityAssessmentItem, FreelancerQuotationItem, DeliverableSubmissionItem, ProjectTaskItem } from '../../types';
import confetti from 'canvas-confetti';

type FreelancerTab = 'briefs' | 'timeline' | 'assessment' | 'quotation' | 'tasks' | 'deliverables';

interface FreelancerDashboardPageProps {
  view?: string;
}

export const FreelancerDashboardPage: React.FC<FreelancerDashboardPageProps> = ({ view }) => {
  const { user, freelancerShares, refreshFreelancerShares } = useUser();
  const location = useLocation();
  const [effortModalOpen, setEffortModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<FreelancerTab>('briefs');
  const [selectedShareId, setSelectedShareId] = useState<string>('');
  const [searchParams] = useSearchParams();

  // Sync active tab with direct dedicated route or URL query parameter
  useEffect(() => {
    const path = location.pathname;
    if (view === 'briefs' || path === '/freelancer/briefs' || path === '/freelancer/projects') {
      setActiveTab('briefs');
      return;
    }
    if (view === 'assessment' || path === '/freelancer/assessments') {
      setActiveTab('assessment');
      return;
    }
    if (view === 'quotation' || path === '/freelancer/quotations') {
      setActiveTab('quotation');
      return;
    }
    if (view === 'tasks' || path === '/freelancer/tasks') {
      setActiveTab('tasks');
      return;
    }
    if (view === 'timeline' || path === '/freelancer/calendar' || path === '/freelancer/dashboard' || path === '/freelancer') {
      setActiveTab('timeline');
      return;
    }
    if (view === 'deliverables' || path === '/freelancer/deliverables' || path === '/freelancer/zips' || path === '/freelancer/revisions' || path === '/freelancer/history' || path === '/freelancer/documents') {
      setActiveTab('deliverables');
      return;
    }

    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (['briefs', 'timeline', 'assessment', 'quotation', 'tasks', 'deliverables'].includes(tabParam)) {
        setActiveTab(tabParam as FreelancerTab);
      } else if (tabParam === 'workspace') {
        setActiveTab('briefs');
      } else if (tabParam === 'quotes') {
        setActiveTab('quotation');
      } else if (tabParam === 'documents' || tabParam === 'revisions' || tabParam === 'history') {
        setActiveTab('deliverables');
      }
    }
  }, [view, location.pathname, searchParams]);

  // Document Viewer Modal
  const [docViewer, setDocViewer] = useState<{ isOpen: boolean; fileName: string; storagePath?: string }>({
    isOpen: false,
    fileName: ''
  });

  // Profile Completion & Availability State (Section C)
  const [profileCompletion, setProfileCompletion] = useState<{ score: number; missingFields: string[]; breakdown: any }>({
    score: 80,
    missingFields: [],
    breakdown: {}
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: user?.bio || '',
    title: user?.title || 'Senior Full-Stack Architect',
    hourlyRate: (user as any)?.hourlyRate || 1500,
    technicalSpecialties: (user as any)?.technicalSpecialties?.join(', ') || 'React, TypeScript, Node.js, GraphQL, Microservices',
    portfolioUrls: (user as any)?.portfolio?.map((p: any) => p.url).join(', ') || 'https://github.com/nexus-engineer, https://demo.nexuscraft.dev',
    availabilityStatus: (user as any)?.availabilityStatus || 'Available'
  });

  // Timeline State (Section C)
  const [myTimeline, setMyTimeline] = useState<any[]>([]);

  // Feasibility Assessment State
  const [myAssessments, setMyAssessments] = useState<FeasibilityAssessmentItem[]>([]);
  const [assessmentForm, setAssessmentForm] = useState({
    feasibility: 'Possible' as 'Possible' | 'Needs Clarification' | 'Not Suitable',
    technicalApproach: '',
    technologyStack: 'React, Node.js, TypeScript, PostgreSQL',
    estimatedHours: 120,
    estimatedDuration: '3 Weeks',
    requiredResources: 'Senior Frontend Dev, DevOps Engineer',
    risks: 'Third-party API rate limits, edge case concurrency',
    dependencies: 'AWS S3, Payment Webhook credentials',
    missingInformation: 'Clarification needed on expected concurrent transactions',
    notesForAdmin: ''
  });
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false);

  // Quotation State
  const [myQuotations, setMyQuotations] = useState<FreelancerQuotationItem[]>([]);
  const [quoteForm, setQuoteForm] = useState({
    totalCost: 180000,
    currency: 'INR (₹)',
    estimatedHours: 140,
    estimatedTimeline: '4 Weeks',
    frontendCost: 60000,
    backendCost: 50000,
    databaseCost: 20000,
    uiUxCost: 25000,
    integrationCost: 15000,
    testingCost: 10000,
    deploymentCost: 10000,
    additionalExpenses: 0,
    assumptions: 'Client provides branding assets; API specs finalized in Week 1',
    exclusions: 'Post-launch 24/7 dedicated telephone support',
    risks: 'Scope changes during review phase',
    validityPeriod: '30 Days'
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Tasks State
  const [myTasks, setMyTasks] = useState<ProjectTaskItem[]>([]);
  const [logHoursInput, setLogHoursInput] = useState<{ [key: string]: string }>({});

  // Deliverables State (Section F)
  const [myDeliverables, setMyDeliverables] = useState<DeliverableSubmissionItem[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [delivTitle, setDelivTitle] = useState('');
  const [delivDescription, setDelivDescription] = useState('');
  const [delivReleaseNotes, setDelivReleaseNotes] = useState('');
  const [sourceRepoUrl, setSourceRepoUrl] = useState('');
  const [livePreviewUrl, setLivePreviewUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
  const [gitCommitHash, setGitCommitHash] = useState('');
  const [zipUploading, setZipUploading] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshFreelancerShares();
  }, [refreshFreelancerShares]);

  const activeShare = freelancerShares.find(s => (s.customId || s.id) === selectedShareId) || freelancerShares[0];

  useEffect(() => {
    if (freelancerShares.length > 0 && !selectedShareId) {
      setSelectedShareId(freelancerShares[0].customId || freelancerShares[0].id);
    }
  }, [freelancerShares, selectedShareId]);

  // Load Specialist Data
  const loadSpecialistData = async () => {
    if (!user) return;
    const fId = user.customId || user.id || (user as any)._id;

    // Load Assessments
    const aRes = await api.getFreelancerAssessments(fId);
    setMyAssessments(aRes);

    // Load Quotations
    const qRes = await api.getFreelancerQuotations(fId);
    setMyQuotations(qRes);

    // Load Tasks
    const tRes = await api.getFreelancerTasks(fId);
    setMyTasks(tRes);

    // Load Deliverables
    const dRes = await api.getFreelancerDeliverables(fId);
    setMyDeliverables(dRes);

    // Load Timeline (Today's Delivery Timeline)
    const tlRes = await api.getFreelancerTimeline(fId);
    if (tlRes?.timeline) {
      setMyTimeline(tlRes.timeline);
    }

    // Load Profile Completion score
    const pcRes = await api.getFreelancerProfileCompletion(fId);
    if (pcRes?.success) {
      setProfileCompletion({
        score: pcRes.score,
        missingFields: pcRes.missingFields,
        breakdown: pcRes.breakdown
      });
      if (pcRes.freelancer) {
        setProfileForm({
          bio: pcRes.freelancer.bio || '',
          title: pcRes.freelancer.title || 'Senior Software Architect',
          hourlyRate: pcRes.freelancer.hourlyRate || 1500,
          technicalSpecialties: pcRes.freelancer.technicalSpecialties?.join(', ') || 'React, TypeScript, Node.js, GraphQL, Microservices',
          portfolioUrls: pcRes.freelancer.portfolio?.map((p: any) => p.url).join(', ') || 'https://github.com/nexus-engineer, https://demo.nexuscraft.dev',
          availabilityStatus: pcRes.freelancer.availabilityStatus || 'Available'
        });
      }
    }
  };

  // Update Availability Handler
  const handleUpdateAvailability = async (newStatus: 'Available' | 'Busy' | 'On Leave') => {
    if (!user) return;
    const fId = user.customId || user.id || (user as any)._id;
    await api.updateFreelancerProfile(fId, { availabilityStatus: newStatus });
    setProfileForm(prev => ({ ...prev, availabilityStatus: newStatus }));
    loadSpecialistData();
  };

  // Save Full Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const fId = user.customId || user.id || (user as any)._id;
    await api.updateFreelancerProfile(fId, {
      bio: profileForm.bio,
      title: profileForm.title,
      hourlyRate: Number(profileForm.hourlyRate),
      availabilityStatus: profileForm.availabilityStatus,
      technicalSpecialties: profileForm.technicalSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean),
      portfolio: profileForm.portfolioUrls.split(',').map((u: string) => ({ url: u.trim(), title: 'Engineering Portfolio' })).filter((p: { url: string; title: string }) => p.url)
    });
    setIsProfileModalOpen(false);
    confetti({ particleCount: 50, spread: 60 });
    alert('Freelancer profile updated successfully! Completion score recalculated.');
    loadSpecialistData();
  };

  useEffect(() => {
    loadSpecialistData();
  }, [user, activeTab]);

  // Submit Feasibility Assessment
  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShare || !user) return;
    setAssessmentSubmitting(true);

    const res = await api.submitAssessment({
      requestId: activeShare.requestId,
      projectTitle: activeShare.projectTitle,
      freelancerId: user.customId || user.id,
      freelancerName: user.name,
      freelancerEmail: user.email,
      feasibility: assessmentForm.feasibility,
      technicalApproach: assessmentForm.technicalApproach,
      technologyStack: assessmentForm.technologyStack.split(',').map(s => s.trim()),
      estimatedHours: assessmentForm.estimatedHours,
      estimatedDuration: assessmentForm.estimatedDuration,
      requiredResources: assessmentForm.requiredResources.split(',').map(s => s.trim()),
      risks: assessmentForm.risks.split(',').map(s => s.trim()),
      dependencies: assessmentForm.dependencies.split(',').map(s => s.trim()),
      missingInformation: assessmentForm.missingInformation.split(',').map(s => s.trim()),
      notesForAdmin: assessmentForm.notesForAdmin
    });

    setAssessmentSubmitting(false);
    if (res?.success) {
      confetti({ particleCount: 50, spread: 50 });
      alert('Feasibility Assessment filed successfully with Administration.');
      loadSpecialistData();
    }
  };

  // Submit Quotation
  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShare || !user) return;
    setQuoteSubmitting(true);

    const res = await api.submitQuotation({
      requestId: activeShare.requestId,
      projectTitle: activeShare.projectTitle,
      freelancerId: user.customId || user.id,
      freelancerName: user.name,
      freelancerEmail: user.email,
      currency: quoteForm.currency,
      totalCost: quoteForm.totalCost,
      estimatedHours: quoteForm.estimatedHours,
      estimatedTimeline: quoteForm.estimatedTimeline,
      breakdown: {
        frontendCost: quoteForm.frontendCost,
        backendCost: quoteForm.backendCost,
        databaseCost: quoteForm.databaseCost,
        uiUxCost: quoteForm.uiUxCost,
        integrationCost: quoteForm.integrationCost,
        testingCost: quoteForm.testingCost,
        deploymentCost: quoteForm.deploymentCost,
        additionalExpenses: quoteForm.additionalExpenses
      },
      assumptions: quoteForm.assumptions.split(';').map(s => s.trim()),
      exclusions: quoteForm.exclusions.split(';').map(s => s.trim()),
      risks: quoteForm.risks.split(';').map(s => s.trim()),
      validityPeriod: quoteForm.validityPeriod
    });

    setQuoteSubmitting(false);
    if (res?.success) {
      confetti({ particleCount: 50, spread: 50 });
      alert(`Quotation v${res.quotation.version} registered. Administration notified.`);
      loadSpecialistData();
    }
  };

  // Upload Deliverable ZIP
  const handleUploadZip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile || !activeShare || !user) return;

    setZipUploading(true);
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    formData.append('projectId', activeShare.requestId);
    formData.append('projectTitle', activeShare.projectTitle);
    formData.append('freelancerId', user.customId || user.id);
    formData.append('freelancerName', user.name);
    formData.append('submissionTitle', delivTitle || `${activeShare.projectTitle} - Release`);
    formData.append('description', delivDescription);
    formData.append('releaseNotes', delivReleaseNotes);
    if (sourceRepoUrl) formData.append('sourceRepoUrl', sourceRepoUrl);
    if (livePreviewUrl) formData.append('livePreviewUrl', livePreviewUrl);
    if (gitBranch) formData.append('gitBranch', gitBranch);
    if (gitCommitHash) formData.append('gitCommitHash', gitCommitHash);

    const res = await api.uploadDeliverableZip(formData);
    setZipUploading(false);

    if (res?.success) {
      confetti({ particleCount: 60, spread: 60 });
      alert('ZIP deliverable submitted. Structural scan completed; SHA-256 hash verified and queued for Admin inspection.');
      setZipFile(null);
      setDelivTitle('');
      setDelivDescription('');
      setDelivReleaseNotes('');
      setSourceRepoUrl('');
      setLivePreviewUrl('');
      setGitCommitHash('');
      if (zipInputRef.current) zipInputRef.current.value = '';
      loadSpecialistData();
    } else {
      alert(`Upload failed: ${res?.error || 'Unknown error'}`);
    }
  };

  // Update Task Status & Log Hours
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    await api.updateTask(taskId, { status: newStatus });
    loadSpecialistData();
  };

  const handleLogTaskHours = async (taskId: string) => {
    const hours = Number(logHoursInput[taskId]);
    if (!hours || isNaN(hours)) return;
    await api.updateTask(taskId, { logHours: hours, logNote: 'Specialist development hours logged' });
    setLogHoursInput({ ...logHoursInput, [taskId]: '' });
    loadSpecialistData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* ─────────────────────────────────────────────────────────────
          1. SPECIALIST HEADER BANNER & PROFILE COMPLETION (OVERVIEW ONLY)
      ───────────────────────────────────────────────────────────── */}
      {(activeTab === 'timeline' || activeTab === 'briefs') && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#E9E3FF] text-[#7357FF]">
                  VETTED SPECIALIST PORTAL
                </span>
                <span className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Private Technical Review & Deliverable Studio
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
                Specialist Dossier & Workboard
              </h1>
              <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0] mt-1">
                Welcome back, {user?.name || 'Engineer'}. File feasibility assessments, build multi-version quotations, and upload release packages.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Availability Management Control */}
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#65677A] font-bold">STATUS</span>
                  <span className="text-[10px] font-mono font-bold text-[#7357FF]">LIVE ROSTER</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['Available', 'Busy', 'On Leave'] as const).map(st => {
                    const isActive = profileForm.availabilityStatus === st;
                    const dotColor = st === 'Available' ? 'bg-[#22c55e]' : st === 'Busy' ? 'bg-amber-500' : 'bg-[#65677A]';
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateAvailability(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-[#17172B] dark:bg-white text-white dark:text-[#17172B] shadow-sm'
                            : 'bg-white dark:bg-[#1C1C36] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white border border-[#E8EAF4] dark:border-[#2A2A46]'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Quick Stat & Modal Trigger */}
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#65677A] font-bold">PROFILE COMPLETION</span>
                  <span className="font-mono text-xs font-bold text-[#7357FF]">{profileCompletion.score}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#E8EAF4] dark:bg-[#2A2A46] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] h-full rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion.score}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#65677A] dark:text-[#A6A8C0]">
                    {profileCompletion.missingFields.length > 0 ? `${profileCompletion.missingFields[0]} missing` : 'All 8 fields complete'}
                  </span>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-[10px] font-mono font-bold text-[#7357FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Missing fields recommendation pills */}
          {profileCompletion.missingFields.length > 0 && (
            <div className="pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46] flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-[#65677A] dark:text-[#A6A8C0] font-medium">Boost profile score:</span>
              {profileCompletion.missingFields.map((field, idx) => (
                <button
                  key={idx}
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-2 py-0.5 rounded-full bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] hover:bg-[#7357FF] hover:text-white transition-colors font-mono font-semibold cursor-pointer"
                >
                  + {field}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FOCUSED SPECIALIST SUBPAGE HEADER (WHEN NOT ON TIMELINE/BRIEFS)
      ───────────────────────────────────────────────────────────── */}
      {activeTab !== 'timeline' && activeTab !== 'briefs' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#777B8A] mb-1">
              <span>Specialist Studio</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A0A4B8]" />
              <span className="font-semibold text-[#222438] dark:text-white capitalize">
                {activeTab === 'assessment'
                  ? 'Feasibility Assessment'
                  : activeTab === 'quotation'
                  ? 'Quotations & Scoping'
                  : activeTab === 'tasks'
                  ? 'Tasks & Workboard'
                  : activeTab === 'deliverables'
                  ? 'Deliverables & ZIP Center'
                  : activeTab}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white tracking-tight">
              {activeTab === 'assessment'
                ? 'Technical Feasibility Assessments'
                : activeTab === 'quotation'
                ? 'Multi-Tier Commercial Quotations'
                : activeTab === 'tasks'
                ? 'Assigned Tasks & Effort Tracking'
                : activeTab === 'deliverables'
                ? 'Deliverable Submissions & Integrity Inspector'
                : 'Execution Studio'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEffortModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] hover:from-[#6245F5] hover:to-[#2B6AF5] text-white shadow-xs transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Log Effort Hours</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#7357FF]">
              <span>Rate: ₹{profileForm.hourlyRate}/hr</span>
            </div>
          </div>
        </div>
      )}



      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ASSIGNED BRIEFS & CONFIDENTIAL DOCUMENTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'briefs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
              Assigned Project Briefs ({freelancerShares.length})
            </h3>
            <span className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
              Shared under strict confidentiality.
            </span>
          </div>

          {freelancerShares.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-center text-xs text-[#65677A] dark:text-[#A6A8C0]">
              <Shield className="w-8 h-8 text-[#7357FF] mx-auto mb-2 opacity-60" />
              <h4 className="font-bold text-sm text-[#17172B] dark:text-white">No active briefs assigned</h4>
              <p className="mt-1">Administration has not assigned any confidential dossiers to your roster account yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {freelancerShares.map(s => {
                const isSelected = (s.customId || s.id) === selectedShareId;
                return (
                  <div
                    key={s.customId || s.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#7357FF] bg-[#EEE9FF]/10 dark:bg-[#7357FF]/5'
                        : 'border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B]'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#7357FF] font-bold">
                            {s.requestId}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F0F2F9] dark:bg-[#22223D]">
                            STATUS: {s.status}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                          {s.projectTitle}
                        </h4>
                        {s.adminInstructions && (
                          <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#65677A] dark:text-[#A6A8C0]">
                            <span className="font-bold text-[#17172B] dark:text-white">Admin Instructions: </span>
                            {s.adminInstructions}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {s.documentFileName && (
                          <BoxedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setDocViewer({
                                isOpen: true,
                                fileName: s.documentFileName || '',
                                storagePath: s.documentStoragePath
                              });
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview Doc
                          </BoxedButton>
                        )}
                        <BoxedButton
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setSelectedShareId(s.customId || s.id);
                            setActiveTab('assessment');
                          }}
                        >
                          File Assessment
                        </BoxedButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB: TODAY'S DELIVERY TIMELINE (SECTION C)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  REAL-TIME DEADLINES & EXECUTION HORIZON
                </span>
                <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-0.5">
                  Today's Delivery Timeline
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Chronological schedule of saved project deadlines, milestone deliverables, and critical sprint handoffs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D5FF68] text-[#17172B]">
                  {myTimeline.length} Saved Deadlines
                </span>
              </div>
            </div>

            {myTimeline.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#65677A] dark:text-[#A6A8C0] border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl mt-6">
                <Clock className="w-8 h-8 text-[#7357FF] mx-auto mb-2 opacity-50" />
                <h4 className="font-bold text-sm text-[#17172B] dark:text-white">No Upcoming Deadlines Today</h4>
                <p className="mt-1">All milestone deliveries are current. New scheduled sprint items will populate here.</p>
              </div>
            ) : (
              <div className="mt-8 relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8EAF4] dark:before:bg-[#2A2A46] space-y-6">
                {myTimeline.map((item, idx) => {
                  const dueDate = item.dueDate ? new Date(item.dueDate) : null;
                  const isOverdue = dueDate && dueDate.getTime() < Date.now() && item.status !== 'Done';
                  const isDone = item.status === 'Done' || item.status === 'Completed';

                  return (
                    <div key={item._id || item.customId || idx} className="relative group">
                      {/* Timeline node */}
                      <div className={`absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#17172B] ${
                        isDone ? 'bg-[#22c55e]' : isOverdue ? 'bg-red-500 animate-pulse' : 'bg-[#7357FF]'
                      }`} />

                      <div className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                              {item.title}
                            </span>
                            {item.isMilestone && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D5FF68] text-[#17172B]">
                                MILESTONE
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              isDone ? 'bg-[#22c55e]/10 text-[#22c55e]' : isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-[#7357FF]/10 text-[#7357FF]'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">{item.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                            <span>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Today'}</span>
                            {item.expectedDuration && <span>Duration: {item.expectedDuration}</span>}
                            {item.progress !== undefined && <span>Progress: {item.progress}%</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveTab('tasks')}
                            className="px-3 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-semibold text-[#17172B] dark:text-white hover:bg-white dark:hover:bg-[#1C1C36] transition-colors"
                          >
                            Open in Workboard →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FEASIBILITY ASSESSMENT FORM
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'assessment' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                FORMAL TECHNICAL AUDIT
              </span>
              <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                Feasibility Assessment for "{activeShare?.projectTitle || 'Assigned Project'}"
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Evaluate engineering practicality, stack selection, risks, and timeline estimates for administrative governance.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitAssessment} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Feasibility Determination *
                </label>
                <select
                  value={assessmentForm.feasibility}
                  onChange={e => setAssessmentForm({ ...assessmentForm, feasibility: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-bold text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                >
                  <option value="Possible">Possible (Green Light)</option>
                  <option value="Needs Clarification">Needs Clarification (Amber)</option>
                  <option value="Not Suitable">Not Suitable (Red Light)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Estimated Engineering Hours *
                </label>
                <input
                  type="number"
                  value={assessmentForm.estimatedHours}
                  onChange={e => setAssessmentForm({ ...assessmentForm, estimatedHours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={assessmentForm.estimatedDuration}
                  onChange={e => setAssessmentForm({ ...assessmentForm, estimatedDuration: e.target.value })}
                  placeholder="e.g. 3-4 Weeks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                Recommended Technology Stack (comma separated)
              </label>
              <input
                type="text"
                value={assessmentForm.technologyStack}
                onChange={e => setAssessmentForm({ ...assessmentForm, technologyStack: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                Technical Approach & Architecture Plan
              </label>
              <textarea
                rows={3}
                value={assessmentForm.technicalApproach}
                onChange={e => setAssessmentForm({ ...assessmentForm, technicalApproach: e.target.value })}
                placeholder="Explain the proposed architectural strategy, modular divisions, and integration pathways..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Risks & Vulnerabilities
                </label>
                <textarea
                  rows={2}
                  value={assessmentForm.risks}
                  onChange={e => setAssessmentForm({ ...assessmentForm, risks: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Missing Information / Clarifications Needed
                </label>
                <textarea
                  rows={2}
                  value={assessmentForm.missingInformation}
                  onChange={e => setAssessmentForm({ ...assessmentForm, missingInformation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <BoxedButton
                variant="primary"
                size="md"
                disabled={assessmentSubmitting}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{assessmentSubmitting ? 'Filing Assessment...' : 'File Official Assessment'}</span>
              </BoxedButton>
            </div>
          </form>

          {/* Prior Assessments List */}
          {myAssessments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-[#7357FF]">
                My Prior Feasibility Assessments ({myAssessments.length})
              </h4>
              <div className="space-y-2">
                {myAssessments.map(a => (
                  <div
                    key={a.customId}
                    className="p-3.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#17172B] dark:text-white mr-2">{a.projectTitle}</span>
                      <span className="font-mono text-[10px] text-[#65677A] dark:text-[#A6A8C0]">({a.estimatedHours} hrs, {a.estimatedDuration})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      a.feasibility === 'Possible' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#FF826E]/10 text-[#FF826E]'
                    }`}>
                      {a.feasibility}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: FREELANCER QUOTATION BUILDER (INR ₹, MULTI-VERSION)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'quotation' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                VERSION-CONTROLLED QUOTATION ENGINE
              </span>
              <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                Submit Commercial Quotation for "{activeShare?.projectTitle || 'Project'}"
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                All prior versions are preserved in an immutable audit ledger. Default currency: INR (₹).
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#65677A]">Total Quoted</span>
              <div className="font-display font-extrabold text-2xl text-[#17172B] dark:text-white">
                ₹{Number(quoteForm.totalCost).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitQuotation} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Total Quoted Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  value={quoteForm.totalCost}
                  onChange={e => setQuoteForm({ ...quoteForm, totalCost: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-bold text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Estimated Engineering Hours
                </label>
                <input
                  type="number"
                  value={quoteForm.estimatedHours}
                  onChange={e => setQuoteForm({ ...quoteForm, estimatedHours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Timeline / Delivery Date
                </label>
                <input
                  type="text"
                  value={quoteForm.estimatedTimeline}
                  onChange={e => setQuoteForm({ ...quoteForm, estimatedTimeline: e.target.value })}
                  placeholder="e.g. 4 Calendar Weeks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>
            </div>

            {/* Granular Cost Component Breakdown */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#7357FF] mb-2">
                Granular Component Breakdown (₹ INR)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-[#65677A] dark:text-[#A6A8C0]">Frontend (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.frontendCost}
                    onChange={e => setQuoteForm({ ...quoteForm, frontendCost: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#65677A] dark:text-[#A6A8C0]">Backend (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.backendCost}
                    onChange={e => setQuoteForm({ ...quoteForm, backendCost: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#65677A] dark:text-[#A6A8C0]">Database (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.databaseCost}
                    onChange={e => setQuoteForm({ ...quoteForm, databaseCost: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#65677A] dark:text-[#A6A8C0]">UI/UX (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.uiUxCost}
                    onChange={e => setQuoteForm({ ...quoteForm, uiUxCost: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Assumptions (semicolon separated)
                </label>
                <textarea
                  rows={2}
                  value={quoteForm.assumptions}
                  onChange={e => setQuoteForm({ ...quoteForm, assumptions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                    Exclusions (semicolon separated)
                </label>
                <textarea
                  rows={2}
                  value={quoteForm.exclusions}
                  onChange={e => setQuoteForm({ ...quoteForm, exclusions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <BoxedButton
                variant="primary"
                size="md"
                disabled={quoteSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{quoteSubmitting ? 'Registering Quotation...' : 'Submit Quotation Version'}</span>
              </BoxedButton>
            </div>
          </form>

          {/* Previous Quotation Versions */}
          {myQuotations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-[#7357FF]">
                My Prior Quotation Versions ({myQuotations.length})
              </h4>
              <div className="space-y-2">
                {myQuotations.map(q => (
                  <div
                    key={q.customId}
                    className="p-3.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#7357FF] mr-2">Version {q.version}</span>
                      <span className="font-bold text-[#17172B] dark:text-white">
                        ₹{q.totalCost.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#65677A] dark:text-[#A6A8C0] ml-2">({q.estimatedHours} hrs)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      q.status === 'Approved' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#7357FF]/10 text-[#7357FF]'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: TASK WORKBOARD & TIME LOG (SECTION C)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Assigned Task Workboard & Sprints
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Track sprint progress, update execution status, and log dedicated engineering hours.
                </p>
              </div>

              {/* Task progress breakdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white">
                  Total: {myTasks.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#22c55e]/10 text-[#22c55e]">
                  Done: {myTasks.filter(t => t.status === 'Done').length}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#7357FF]/10 text-[#7357FF]">
                  In Progress: {myTasks.filter(t => t.status === 'In Progress').length}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-500">
                  Review: {myTasks.filter(t => t.status === 'Review').length}
                </span>
              </div>
            </div>

            {myTasks.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-xl mt-6 text-xs text-[#65677A] dark:text-[#A6A8C0]">
                No assigned tasks currently open. Tasks provisioned by administration will display here.
              </div>
            ) : (
              <div className="space-y-3 mt-6">
                {myTasks.map(t => (
                  <div
                    key={t.customId}
                    className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#17172B] dark:text-white">{t.title}</span>
                        {t.isMilestone && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D5FF68] text-[#17172B]">
                            MILESTONE
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-[#65677A] dark:text-[#A6A8C0]">{t.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[#65677A] dark:text-[#A6A8C0] font-mono">
                        {t.dueDate && <span>Due: {t.dueDate}</span>}
                        {t.loggedHours !== undefined && <span>Logged: {t.loggedHours} hrs</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={t.status}
                        onChange={e => handleUpdateTaskStatus(t.customId, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs font-semibold text-[#17172B] dark:text-white"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Hrs"
                          value={logHoursInput[t.customId] || ''}
                          onChange={e => setLogHoursInput({ ...logHoursInput, [t.customId]: e.target.value })}
                          className="w-14 px-2 py-1.5 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs text-[#17172B] dark:text-white"
                        />
                        <BoxedButton variant="secondary" size="sm" onClick={() => handleLogTaskHours(t.customId)}>
                          Log
                        </BoxedButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: DELIVERABLES & ZIP UPLOAD STUDIO (SECTION F)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                SECURE PACKAGE RELEASE ENGINE
              </span>
              <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                Submit Production ZIP Package
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                All archives undergo safe structural parsing, expansion ratio checks, SHA-256 cryptographic hashing, and package manifest validation before administrative release to clients.
              </p>
            </div>

            <form onSubmit={handleUploadZip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    value={delivTitle}
                    onChange={e => setDelivTitle(e.target.value)}
                    placeholder="e.g. Production Candidate v1.0.0"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                    Git Branch
                  </label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={e => setGitBranch(e.target.value)}
                    placeholder="main or release/v1.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                    Source Code Repository URL
                  </label>
                  <input
                    type="url"
                    value={sourceRepoUrl}
                    onChange={e => setSourceRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                    Live Demo / Staging Preview URL
                  </label>
                  <input
                    type="url"
                    value={livePreviewUrl}
                    onChange={e => setLivePreviewUrl(e.target.value)}
                    placeholder="https://staging.nexuscraft.app"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Release Notes & Installation Highlights
                </label>
                <textarea
                  rows={2}
                  value={delivReleaseNotes}
                  onChange={e => setDelivReleaseNotes(e.target.value)}
                  placeholder="Summarize key features, bug fixes, or deployment instructions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>

              {/* ZIP File Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Archive (.zip file, max 50MB) *
                </label>
                <input
                  type="file"
                  ref={zipInputRef}
                  accept=".zip"
                  onChange={e => setZipFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-[#65677A] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#7357FF] file:text-white hover:file:bg-[#6042EE]"
                />
              </div>

              {/* Pre-submission Inspector */}
              <SubmissionReadinessInspector file={zipFile} />

              <div className="flex justify-end pt-2">
                <BoxedButton
                  variant="primary"
                  size="md"
                  disabled={zipUploading || !zipFile}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{zipUploading ? 'Scanning & Hashing Archive...' : 'Submit ZIP Archive'}</span>
                </BoxedButton>
              </div>
            </form>

            {/* My Submissions History */}
            {myDeliverables.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-[#7357FF]">
                  Submission History ({myDeliverables.length})
                </h4>
                <div className="space-y-3">
                  {myDeliverables.map(deliv => (
                    <div
                      key={deliv.customId}
                      className="p-5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#7357FF]">v{deliv.version}</span>
                          <span className="font-bold text-[#17172B] dark:text-white">{deliv.submissionTitle}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase w-fit ${
                          deliv.status === 'Approved' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#7357FF]/10 text-[#7357FF]'
                        }`}>
                          {deliv.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                        <span>{deliv.zipFileName} ({deliv.zipFileSize})</span>
                        <span>•</span>
                        <span>{deliv.fileCount || 0} files</span>
                        <span>•</span>
                        <span>README: {deliv.readmeDetected || (deliv as any).hasReadme ? '✓ Found' : 'None'}</span>
                        <span>•</span>
                        <span>package.json: {(deliv as any).hasPackageJson ? '✓ Found' : 'None'}</span>
                      </div>

                      {/* SHA-256 Checksum Display */}
                      {(deliv as any).sha256Checksum && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between gap-2">
                          <div className="font-mono text-[10px] text-[#65677A] dark:text-[#A6A8C0] truncate">
                            <span className="font-bold text-[#7357FF]">SHA-256: </span>
                            {(deliv as any).sha256Checksum}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText((deliv as any).sha256Checksum);
                              alert('SHA-256 Checksum copied to clipboard!');
                            }}
                            className="p-1 rounded text-[#65677A] hover:text-[#17172B] dark:hover:text-white"
                            title="Copy Checksum"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Integrity Disclaimer */}
                      <p className="text-[10px] text-[#65677A] dark:text-[#A6A8C0] italic">
                        {deliv.checksumDisclaimer || 'Checksum calculated via Node.js crypto module. SHA-256 verifies deliverable package integrity against tampering. This is not a formal code audit guarantee.'}
                      </p>

                      {deliv.adminFeedback && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                          <span className="font-bold">Admin Feedback: </span>
                          {deliv.adminFeedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FREELANCER PROFILE COMPLETION MODAL (SECTION C)
      ───────────────────────────────────────────────────────────── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#17172B] rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Edit Specialist Profile
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Complete all 8 weighted attributes for 100% smart matching visibility.
                </p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F0F2F9] dark:hover:bg-[#22223D] text-[#65677A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17172B] dark:text-white mb-1">
                  Professional Title / Discipline (10%)
                </label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Architect"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17172B] dark:text-white mb-1">
                  Bio / Engineering Philosophy (15%)
                </label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Describe your engineering focus, architectural approaches, and reliability standards..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#17172B] dark:text-white mb-1">
                    Hourly Studio Rate ₹ INR (10%)
                  </label>
                  <input
                    type="number"
                    value={profileForm.hourlyRate}
                    onChange={e => setProfileForm({ ...profileForm, hourlyRate: Number(e.target.value) })}
                    placeholder="1500"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[#17172B] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17172B] dark:text-white mb-1">
                    Availability Status (5%)
                  </label>
                  <select
                    value={profileForm.availabilityStatus}
                    onChange={e => setProfileForm({ ...profileForm, availabilityStatus: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[#17172B] dark:text-white focus:outline-none"
                  >
                    <option value="Available">Available Now</option>
                    <option value="Busy">Busy (Engaged)</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17172B] dark:text-white mb-1">
                  Technical Specialties (15% — comma separated)
                </label>
                <input
                  type="text"
                  value={profileForm.technicalSpecialties}
                  onChange={e => setProfileForm({ ...profileForm, technicalSpecialties: e.target.value })}
                  placeholder="e.g. React, TypeScript, Node.js, GraphQL, Microservices"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17172B] dark:text-white mb-1">
                  Portfolio Showcase Links (15% — comma separated)
                </label>
                <input
                  type="text"
                  value={profileForm.portfolioUrls}
                  onChange={e => setProfileForm({ ...profileForm, portfolioUrls: e.target.value })}
                  placeholder="https://github.com/myname, https://live-demo.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[#17172B] dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
                <BoxedButton variant="secondary" size="sm" type="button" onClick={() => setIsProfileModalOpen(false)}>
                  Cancel
                </BoxedButton>
                <BoxedButton variant="primary" size="sm" type="submit">
                  Save & Update Profile Score
                </BoxedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={docViewer.isOpen}
        onClose={() => setDocViewer({ isOpen: false, fileName: '' })}
        fileName={docViewer.fileName}
        fileUrl={docViewer.storagePath ? api.getDocumentDownloadUrl(docViewer.storagePath) : undefined}
      />

    
      {/* Effort vs Estimate Tracker Modal */}
      <EffortTrackerModal
        isOpen={effortModalOpen}
        onClose={() => setEffortModalOpen(false)}
        projectId={activeShare?.requestId || ''}
        projectTitle={activeShare?.projectTitle || 'Assigned Project'}
        freelancerId={user?.customId || user?.id || ''}
        freelancerName={user?.name || 'Specialist'}
        onLogged={() => {}}
      />

      {/* Technical Handover Generator Modal */}
      <TechnicalHandoverModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        project={activeShare ? {
          id: activeShare.requestId,
          customId: activeShare.requestId,
          projectTitle: activeShare.projectTitle,
          clientName: 'Client'
        } as any : null}
        freelancerName={user?.name || 'Specialist'}
        onSaved={() => {}}
      />
</div>
  );
};

export default FreelancerDashboardPage;
