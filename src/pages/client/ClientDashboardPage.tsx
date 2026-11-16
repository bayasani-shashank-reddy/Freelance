import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ProjectReadinessChecklist } from '../../components/client/ProjectReadinessChecklist';
import { DecisionCenterCard } from '../../components/client/DecisionCenterCard';
import { ScopeChangeRequestModal } from '../../components/client/ScopeChangeRequestModal';
import { HandoverAcceptanceModal } from '../../components/client/HandoverAcceptanceModal';
import {
  Plus,
  Coins,
  Sparkles,
  Lightbulb,
  Bookmark,
  Trash2,
  Edit3,
  CheckCircle2,
  HelpCircle,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Palette,
  Code2,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  Cloud,
  Lock,
  FileText,
  FileCode,
  Table,
  DollarSign,
  Layers,
  FileDown,
  Upload,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { exportBlueprintToPdf, exportBlueprintToDocx } from '../../lib/documentExport';
import { useUser } from '../../context/UserContext';
import { BoxedButton } from '../../components/shared/BoxedButton';
import { api } from '../../lib/api';
import { ClientDocumentRequirementsPortal } from '../../components/client/ClientDocumentRequirementsPortal';
import type { IdeaDraft, ProjectBlueprint, ClarificationItem, CostEstimate, DeliverableSubmissionItem } from '../../types';
import confetti from 'canvas-confetti';

type ClientTab = 'overview' | 'vault' | 'ai-assistant' | 'workspace' | 'milestones' | 'clarifications' | 'budget' | 'documents' | 'exports';

interface ClientDashboardPageProps {
  view?: string;
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({ view }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scopeChangeModalOpen, setScopeChangeModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const { user, credits, projectRequests, refreshRequests } = useUser();

  const [activeTab, setActiveTab] = useState<ClientTab>('overview');
  const [filter, setFilter] = useState<'all' | 'review' | 'completed'>('all');
  const [budgetCurrency, setBudgetCurrency] = useState<'INR' | 'USD'>('INR');
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'blueprint' | 'budget' | 'milestones'>('blueprint');
  const [searchParams] = useSearchParams();

  // Sync active tab with direct dedicated route or URL query parameter
  useEffect(() => {
    const path = location.pathname;
    if (view === 'vault' || path === '/client/vault') {
      setActiveTab('vault');
      return;
    }
    if (view === 'workspace' || path === '/client/projects' || path === '/client/workspace') {
      setActiveTab('workspace');
      return;
    }
    if (view === 'documents' || path === '/client/documents') {
      setActiveTab('documents');
      return;
    }
    if (view === 'clarifications' || path === '/client/clarifications') {
      setActiveTab('clarifications');
      return;
    }
    if (view === 'budget' || path === '/client/budget') {
      setActiveTab('workspace');
      setWorkspaceSubTab('budget');
      return;
    }
    if (view === 'exports' || path === '/client/exports') {
      setActiveTab('exports');
      return;
    }
    if (view === 'ai-assistant' || path === '/client/ai-assistant') {
      setActiveTab('ai-assistant');
      return;
    }
    if (view === 'milestones' || path === '/client/timeline' || path === '/client/milestones') {
      setActiveTab('milestones');
      return;
    }
    if (view === 'overview' || path === '/client/dashboard' || path === '/client') {
      setActiveTab('overview');
      return;
    }

    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'vault', 'ai-assistant', 'workspace', 'milestones', 'clarifications', 'budget', 'documents', 'exports'].includes(tabParam)) {
      setActiveTab(tabParam as ClientTab);
    }
  }, [view, location.pathname, searchParams]);

  // Selected project for workspace / passport / blueprint / clarifications
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Idea Vault State
  const [drafts, setDrafts] = useState<IdeaDraft[]>([]);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftIdea, setDraftIdea] = useState('');
  const [draftBudget, setDraftBudget] = useState('');
  const [draftTimeline, setDraftTimeline] = useState('');
  const [draftCategory, setDraftCategory] = useState('Web Application');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [vaultLoading, setVaultLoading] = useState(false);

  // AI Assistant State (12 Tools)
  const [selectedAITool, setSelectedAITool] = useState<string>('enhance_idea');
  const [aiToolInput, setAiToolInput] = useState('');
  const [aiToolResult, setAiToolResult] = useState('');
  const [aiToolLoading, setAiToolLoading] = useState(false);

  // Project Blueprint & AI Blueprint Editor State (Section B)
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [isEditingBlueprint, setIsEditingBlueprint] = useState(false);
  const [draftModules, setDraftModules] = useState<string[]>([]);
  const [draftFeatures, setDraftFeatures] = useState<string[]>([]);
  const [draftMilestones, setDraftMilestones] = useState<any[]>([]);
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [blueprintSaving, setBlueprintSaving] = useState(false);

  // Milestone Progress Tracking State (Section B)
  const [projectMilestones, setProjectMilestones] = useState<any[]>([]);

  // Clarifications State
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  // Cost & Budget State
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);

  // Deliverables State (Client sees only released deliverables)
  const [deliverables, setDeliverables] = useState<DeliverableSubmissionItem[]>([]);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  // Set default selected project
  useEffect(() => {
    if (projectRequests.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projectRequests[0].customId || projectRequests[0].id);
    }
  }, [projectRequests, selectedProjectId]);

  // Load drafts for client
  const loadDrafts = async () => {
    if (!user) return;
    setVaultLoading(true);
    const clientId = user.customId || user.id || (user as any)._id;
    const res = await api.getClientDrafts(clientId);
    setDrafts(res);
    setVaultLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'vault') {
      loadDrafts();
    }
  }, [activeTab, user]);

  // Load project details when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;

    // Load Blueprint
    setBlueprintLoading(true);
    api.getBlueprint(selectedProjectId).then(res => {
      setBlueprint(res);
      setBlueprintLoading(false);
      if (res) {
        setDraftModules(res.mainModules || []);
        setDraftFeatures(res.essentialFeatures || []);
        const initialMilestones = [
          { title: 'Phase 1: Architecture & UX Blueprint', duration: '1-2 Weeks', priority: 1, status: 'In Progress' },
          { title: 'Phase 2: Core Engineering & Integrations', duration: '2-3 Weeks', priority: 2, status: 'Not Started' },
          { title: 'Phase 3: QA, Security Hardening & Release', duration: '1 Week', priority: 3, status: 'Not Started' }
        ];
        setDraftMilestones(initialMilestones);
      }
    });

    // Load Clarifications
    api.getProjectClarifications(selectedProjectId).then(res => {
      setClarifications(res);
    });

    // Load Cost
    api.getProjectCost(selectedProjectId).then(res => {
      setCostEstimate(res);
    });

    // Load Deliverables (role='client' ensures only released packages are returned)
    api.getProjectDeliverables(selectedProjectId, 'client').then(res => {
      setDeliverables(res);
    });

    // Load Tasks & Milestones
    api.getProjectTasks(selectedProjectId).then(res => {
      setProjectMilestones(res || []);
    });
  }, [selectedProjectId]);

  // Request AI Suggestions for Blueprint
  const handleRequestAiSuggestions = async () => {
    if (!blueprint) return;
    setAiSuggestLoading(true);
    const bId = (blueprint as any)._id || blueprint.customId;
    const res = await api.aiSuggestBlueprint(bId, 'milestones');
    setAiSuggestLoading(false);
    if (res?.suggestions) {
      alert(`AI Suggestion Engine: ${res.suggestions.summary || 'Generated optimization recommendation.'}`);
      if (res.suggestions.suggestedModules) {
        setDraftModules(Array.from(new Set([...draftModules, ...res.suggestions.suggestedModules])));
      }
    }
  };

  // Reorder Milestone
  const handleReorderMilestone = (index: number, direction: 'up' | 'down') => {
    const newItems = [...draftMilestones];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setDraftMilestones(newItems);
  };

  // Save Client Draft Blueprint
  const handleSaveDraftBlueprint = async (submitForReview = false) => {
    if (!blueprint) return;
    setBlueprintSaving(true);
    const bId = (blueprint as any)._id || blueprint.customId;
    const res = await api.clientEditBlueprint(bId, {
      clientId: user?.customId || user?.id,
      clientName: user?.name,
      draftModules,
      draftFeatures,
      proposedMilestones: draftMilestones,
      submitForAdminReview: submitForReview
    });
    setBlueprintSaving(false);
    if (res?.success) {
      confetti({ particleCount: 50, spread: 60 });
      alert(submitForReview
        ? 'Draft blueprint revisions submitted to administration for review.'
        : 'Draft blueprint changes saved in private workspace.');
      setIsEditingBlueprint(false);
      // reload blueprint
      const updated = await api.getBlueprint(selectedProjectId);
      setBlueprint(updated);
    } else {
      alert(`Could not save draft: ${res?.error || 'Unknown error'}`);
    }
  };

  const activeProject = useMemo(() => {
    return projectRequests.find(r => (r.customId || r.id) === selectedProjectId) || projectRequests[0];
  }, [projectRequests, selectedProjectId]);

  // Reference Document Upload / Update State (Client Feature)
  const [refDocModalOpen, setRefDocModalOpen] = useState(false);
  const [selectedRefProject, setSelectedRefProject] = useState<any | null>(null);
  const [refDocFile, setRefDocFile] = useState<File | null>(null);
  const [refDocUrl, setRefDocUrl] = useState('');
  const [refDocUploading, setRefDocUploading] = useState(false);
  const clientFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenRefDocModal = (project: any) => {
    setSelectedRefProject(project);
    setRefDocUrl(project.referenceUrl || '');
    setRefDocFile(null);
    setRefDocModalOpen(true);
  };

  const handleSaveClientRefDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefProject) return;

    setRefDocUploading(true);
    try {
      const docData: any = {
        referenceUrl: refDocUrl.trim()
      };

      if (refDocFile) {
        const fd = new FormData();
        fd.append('file', refDocFile);
        const uploadRes = await api.uploadDocument(fd);
        if (uploadRes?.success && uploadRes.file) {
          docData.docFileName = uploadRes.file.originalName;
          docData.docStoragePath = uploadRes.file.storagePath;
          docData.docFileSize = uploadRes.file.size;
          docData.docFileType = uploadRes.file.mimeType;
        }
      }

      const pId = selectedRefProject.customId || selectedRefProject.id;
      const res = await api.updateProjectReference(pId, docData);
      if (res?.success) {
        setRefDocModalOpen(false);
        refreshRequests();
        confetti({ particleCount: 30, spread: 35 });
        alert('Reference document and materials updated successfully!');
      } else {
        alert(res?.error || 'Failed to update reference materials.');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading document.');
    } finally {
      setRefDocUploading(false);
    }
  };

  // Handlers for Idea Vault
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !user) return;

    const clientId = user.customId || user.id || (user as any)._id;
    if (editingDraftId) {
      await api.updateDraft(editingDraftId, {
        title: draftTitle,
        rawIdea: draftIdea,
        category: draftCategory,
        expectedBudget: draftBudget,
        preferredTimeline: draftTimeline
      });
      setEditingDraftId(null);
    } else {
      await api.createDraft({
        clientId,
        title: draftTitle,
        rawIdea: draftIdea,
        category: draftCategory,
        expectedBudget: draftBudget,
        preferredTimeline: draftTimeline
      });
    }

    setDraftTitle('');
    setDraftIdea('');
    setDraftBudget('');
    setDraftTimeline('');
    loadDrafts();
  };

  const handleDeleteDraft = async (id: string) => {
    await api.deleteDraft(id);
    loadDrafts();
  };

  const handleEditDraft = (draft: IdeaDraft) => {
    setEditingDraftId(draft.customId);
    setDraftTitle(draft.title);
    setDraftIdea(draft.rawIdea);
    setDraftCategory(draft.category || 'Web Application');
    setDraftBudget(draft.expectedBudget || '');
    setDraftTimeline(draft.preferredTimeline || '');
  };

  const handleToggleFavoriteDraft = async (draft: IdeaDraft) => {
    await api.updateDraft(draft.customId, { isFavorite: !draft.isFavorite });
    loadDrafts();
  };

  // Run AI Tool
  const handleRunAITool = async () => {
    if (!aiToolInput.trim()) return;
    setAiToolLoading(true);
    setAiToolResult('');
    const res = await api.runAITool(selectedAITool, {
      title: activeProject?.projectTitle || 'Project Initiative',
      input: aiToolInput,
      category: activeProject?.aiCategory || 'Web Application',
      context: { budget: activeProject?.rawIdea?.match(/\d+/g)?.[0] || '₹1,50,000' }
    });
    setAiToolLoading(false);
    if (res?.result) {
      setAiToolResult(res.result);
    } else {
      setAiToolResult('AI processing completed. Scoping guidelines updated.');
    }
  };

  // Submit Answer to Clarification
  const handleAnswerClarification = async (clarificationId: string) => {
    if (!answerText.trim() || !user) return;
    const res = await api.answerClarification(clarificationId, {
      answer: answerText,
      answeredBy: { id: user.customId || user.id, name: user.name, role: 'client' }
    });
    if (res?.success) {
      setAnsweringId(null);
      setAnswerText('');
      const updated = await api.getProjectClarifications(selectedProjectId);
      setClarifications(updated);
      confetti({ particleCount: 30, spread: 40 });
    }
  };

  // Export Project Summary CSV
  const handleExportCSV = () => {
    if (!activeProject) return;
    const headers = ['Project ID', 'Title', 'Category', 'Status', 'NCX Cost', 'Created At'];
    const row = [
      activeProject.customId || activeProject.id,
      `"${activeProject.projectTitle.replace(/"/g, '""')}"`,
      activeProject.aiCategory,
      activeProject.status,
      activeProject.creditsCost || 50,
      activeProject.createdAt
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexusCraft-${activeProject.customId || 'project'}-Passport.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Effective blueprint accessor with graceful fallbacks
  const getEffectiveBlueprint = () => {
    if (blueprint) return blueprint;
    if (!activeProject) return null;
    return {
      projectOverview: activeProject.rawIdea || 'Product development roadmap and technical architecture blueprint initialized under NexusCraft platform.',
      problemStatement: 'Enterprise-grade digital workflow automation and platform architecture.',
      proposedSolution: activeProject.rawIdea || 'Modular microservices architecture with real-time state management.',
      essentialFeatures: ['Role-Based Access Control', 'Interactive Workspaces & Deliverables', 'Real-time WebSockets & Telemetry'],
      recommendedFeatures: ['Automated Audit Logs', 'Enterprise PDF/Word Document Generator', 'Integrated AI Slide Studio'],
      mainModules: ['Authentication & Session Management', 'Core Business Logic Engine', 'Storage & Media Pipeline', 'Telemetry & Notifications'],
      suggestedTechnologies: ['React 18', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas', 'Tailwind CSS'],
      estimatedDevelopmentEffort: '6 Weeks (182 Engineering Hours)',
      projectComplexity: 'Medium-High',
      approvedByAdmin: true,
      version: 1
    } as any;
  };

  // Export AI Blueprint Markdown
  const handleExportBlueprintMarkdown = () => {
    if (!activeProject) return;
    const bp = getEffectiveBlueprint();
    const md = `# NexusCraft Architectural Blueprint: ${activeProject.projectTitle}
**Project ID:** ${activeProject.customId || activeProject.id}
**Category:** ${activeProject.aiCategory || 'Web & Mobile Application'}
**Status:** ${bp?.approvedByAdmin ? 'Admin Approved Specification' : 'Draft Proposal'}
**Date Generated:** ${new Date().toLocaleDateString()}

---

## 1. Project Overview
${bp?.projectOverview || 'N/A'}

## 2. Problem Statement
${bp?.problemStatement || 'N/A'}

## 3. Proposed Solution
${bp?.proposedSolution || 'N/A'}

## 4. Main Modules
${bp?.mainModules?.map((m: any) => `- ${m}`).join('\n') || 'N/A'}

## 5. Essential Features (P0 MVP)
${bp?.essentialFeatures?.map((f: any) => `- ${f}`).join('\n') || 'N/A'}

## 6. Recommended Features (P1)
${bp?.recommendedFeatures?.map((f: any) => `- ${f}`).join('\n') || 'N/A'}

## 7. Suggested Technologies
${bp?.suggestedTechnologies?.map((t: any) => `- ${t}`).join('\n') || 'N/A'}

## 8. Estimated Development Effort & Complexity
- **Effort:** ${bp?.estimatedDevelopmentEffort || '6 Weeks (182 Hours)'}
- **Complexity:** ${bp?.projectComplexity || 'Medium'}

---
*Generated by NexusCraft AI Engine. Studio governance assured.*
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NexusCraft-${activeProject.customId || 'project'}-Blueprint.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    confetti({ particleCount: 25, spread: 40 });
  };

  // Export AI Blueprint PDF using jsPDF
  const handleExportBlueprintPDF = () => {
    if (!activeProject) {
      alert('Please select or create an active project first.');
      return;
    }
    const bp = getEffectiveBlueprint();
    exportBlueprintToPdf({
      title: activeProject.projectTitle || 'NexusCraft Commissioned Project',
      category: activeProject.aiCategory || 'Web & Mobile Application',
      version: (bp as any)?.version || 1,
      projectOverview: bp?.projectOverview || activeProject.rawIdea,
      problemStatement: bp?.problemStatement,
      proposedSolution: bp?.proposedSolution,
      essentialFeatures: bp?.essentialFeatures,
      mainModules: bp?.mainModules,
      techStack: bp?.suggestedTechnologies,
      estimatedDevelopmentEffort: bp?.estimatedDevelopmentEffort || '6 Weeks',
      developmentPhases: draftMilestones?.length ? draftMilestones : projectMilestones
    });
    confetti({ particleCount: 35, spread: 50 });
  };

  // Export AI Blueprint Word (.docx)
  const handleExportBlueprintDOCX = async () => {
    if (!activeProject) {
      alert('Please select or create an active project first.');
      return;
    }
    const bp = getEffectiveBlueprint();
    await exportBlueprintToDocx({
      title: activeProject.projectTitle || 'NexusCraft Commissioned Project',
      category: activeProject.aiCategory || 'Web & Mobile Application',
      version: (bp as any)?.version || 1,
      projectOverview: bp?.projectOverview || activeProject.rawIdea,
      problemStatement: bp?.problemStatement,
      proposedSolution: bp?.proposedSolution,
      essentialFeatures: bp?.essentialFeatures,
      mainModules: bp?.mainModules,
      techStack: bp?.suggestedTechnologies
    });
    confetti({ particleCount: 35, spread: 50 });
  };

  // Export Milestones CSV
  const handleExportMilestonesCSV = () => {
    if (!activeProject) return;
    const headers = ['Milestone Title', 'Duration', 'Due Date', 'Status', 'Progress'];
    const rows = (projectMilestones.length > 0 ? projectMilestones : [
      { title: 'Milestone 1: Architectural Scoping', expectedDuration: '2 Weeks', dueDate: 'Sprint 1', status: 'Completed', progress: 100 },
      { title: 'Milestone 2: Core Engineering', expectedDuration: '3 Weeks', dueDate: 'Sprint 2', status: 'In Progress', progress: 65 },
      { title: 'Milestone 3: QA & Release', expectedDuration: '1 Week', dueDate: 'Sprint 3', status: 'Not Started', progress: 0 }
    ]).map(m => [
      `"${(m.title || '').replace(/"/g, '""')}"`,
      m.expectedDuration || m.duration || 'N/A',
      m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'Active',
      m.status,
      `${m.progress || 0}%`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `NexusCraft-${activeProject.customId || 'project'}-Milestones.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Dossier
  const handlePrintDossier = () => {
    window.print();
  };

  // Counts
  const totalRequests = projectRequests.length;
  const underReview = projectRequests.filter(r =>
    r.status === 'Submitted' || r.status === 'Under Admin Review' || r.status === 'Specialist Review' || r.status === 'New'
  ).length;
  const activeProjects = projectRequests.filter(r => r.status === 'In Progress').length;
  const completedProjects = projectRequests.filter(r => r.status === 'Completed').length;

  const filteredRequests = projectRequests.filter(r => {
    if (filter === 'review') return r.status.includes('Review') || r.status === 'Submitted';
    if (filter === 'completed') return r.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* ─────────────────────────────────────────────────────────────
          1. WELCOME HERO BANNER (ONLY ON OVERVIEW TAB)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={user?.name || 'Client Avatar'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#7357FF]/30 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#17172B] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                  CLIENT PORTAL
                </span>
                <span className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  {user?.company || 'NexusCraft Member'}
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Client'}
              </h1>
              <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0]">
                Track your product blueprints, explore the Idea Vault, collaborate via clarifications, and review released deliverables.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/submit-request')}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#7357FF] to-[#3978FF] hover:from-[#6245F5] hover:to-[#2B6AF5] text-white shadow-sm shadow-[#7357FF]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Idea</span>
            </button>
            <button
              onClick={() => navigate('/credits')}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#F7F8FC] dark:bg-[#1E1E38] hover:bg-[#EAEBF5] dark:hover:bg-[#28284C] text-[#17172B] dark:text-white border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-[#7357FF]" />
              <span>{credits} NCX</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FOCUSED SUBPAGE HEADER (WHEN NOT ON OVERVIEW TAB)
      ───────────────────────────────────────────────────────────── */}
      {activeTab !== 'overview' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#777B8A] mb-1">
              <span onClick={() => navigate('/client/dashboard')} className="hover:text-[#3978FF] cursor-pointer">
                Client Workspace
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A0A4B8]" />
              <span className="font-semibold text-[#222438] dark:text-white capitalize">
                {activeTab === 'vault'
                  ? 'Idea Vault'
                  : activeTab === 'workspace'
                  ? 'My Projects'
                  : activeTab === 'documents'
                  ? 'Documents & Files'
                  : activeTab === 'clarifications'
                  ? 'Clarifications'
                  : activeTab === 'exports'
                  ? 'Project Exports & Dossier'
                  : activeTab === 'ai-assistant'
                  ? 'AI Idea Assistant'
                  : activeTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438] dark:text-white tracking-tight">
              {activeTab === 'vault'
                ? 'Confidential Idea Vault'
                : activeTab === 'workspace'
                ? 'Product Architecture & Work Center'
                : activeTab === 'documents'
                ? 'Document Studio & Deliverables'
                : activeTab === 'clarifications'
                ? 'Clarification Center & Inquiries'
                : activeTab === 'exports'
                ? 'Project Exports & Verified Dossier'
                : activeTab === 'ai-assistant'
                ? 'AI Engineering Assistant Studio'
                : 'Workspace Center'}
            </h1>
          </div>

          {/* Quick Context Action */}
          <div className="flex items-center gap-2">
            {activeTab === 'exports' && (
              <button
                onClick={handlePrintDossier}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1E1E38] border border-[#E9EAF0] dark:border-[#2A2A46] text-[#222438] dark:text-white hover:bg-[#F8F9FC] shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#3978FF]" />
                <span>Print Dossier</span>
              </button>
            )}
            {activeTab === 'vault' && (
              <button
                onClick={() => navigate('/submit-request')}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] text-white shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Idea Intake</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#17172B] border border-[#E9EAF0] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0]">
              <Coins className="w-3.5 h-3.5 text-[#7357FF]" />
              <span>{credits} NCX Available</span>
            </div>
          </div>
        </div>
      )}



      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PROJECTS OVERVIEW & PIPELINE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Live Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#65677A] dark:text-[#A6A8C0]">Submitted Ideas</span>
              <div className="text-2xl font-display font-extrabold text-[#17172B] dark:text-white mt-1">{totalRequests}</div>
              <div className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">Live recorded submissions</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">Pending Admin Review</span>
              <div className="text-2xl font-display font-extrabold text-[#7357FF] mt-1">{underReview}</div>
              <div className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">Scoping & architecture triage</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF]">Active Builds</span>
              <div className="text-2xl font-display font-extrabold text-[#3978FF] mt-1">{activeProjects}</div>
              <div className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">In progress with specialists</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#22c55e]">Completed Blueprints</span>
              <div className="text-2xl font-display font-extrabold text-[#22c55e] mt-1">{completedProjects}</div>
              <div className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">Ready for handoff or live</div>
            </div>
          </div>

          {/* Project Quality & Decision Centers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6">
              <ProjectReadinessChecklist project={activeProject} />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <DecisionCenterCard project={activeProject} onDecisionUpdated={refreshRequests} />
              
              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
                <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                  Project Governance & Release Actions
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setScopeChangeModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E9E3FF] text-[#7357FF] hover:bg-[#7357FF] hover:text-white transition-all shadow-xs"
                  >
                    + Request Scope Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandoverModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F8F0] text-[#24A675] hover:bg-[#24A675] hover:text-white transition-all shadow-xs"
                  >
                    Formalize Handover Acceptance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  My Commissioned Projects
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Real-time status tracking and access to project work centers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'review', 'completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                      filter === tab
                        ? 'bg-[#17172B] text-white dark:bg-white dark:text-[#17172B]'
                        : 'text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F0F2F9] dark:hover:bg-[#202038]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl">
                <Lightbulb className="w-10 h-10 text-[#65677A] dark:text-[#A6A8C0] mx-auto mb-3 opacity-60" />
                <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">No projects found</h4>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 max-w-sm mx-auto">
                  Submit a new idea with just a title to receive an instant AI scoping blueprint and specialist review.
                </p>
                <div className="mt-4">
                  <BoxedButton variant="primary" size="sm" onClick={() => navigate('/submit-request')}>
                    Submit Project
                  </BoxedButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(req => {
                  const isSelected = (req.customId || req.id) === selectedProjectId;
                  return (
                    <div
                      key={req.customId || req.id}
                      className={`p-5 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[#7357FF] bg-[#EEE9FF]/10 dark:bg-[#7357FF]/5'
                          : 'border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] hover:border-[#7357FF]/40'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-[#7357FF] font-bold">
                            {req.customId || req.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F0F2F9] dark:bg-[#22223D] text-[#65677A] dark:text-[#A6A8C0]">
                            {req.aiCategory || 'Web'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            req.status === 'Completed'
                              ? 'bg-[#22c55e]/10 text-[#22c55e]'
                              : req.status === 'In Progress'
                              ? 'bg-[#3978FF]/10 text-[#3978FF]'
                              : 'bg-[#7357FF]/10 text-[#7357FF]'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                          {req.projectTitle}
                        </h4>
                        <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] line-clamp-2">
                          {req.aiSummary || req.rawIdea || 'Project submitted for administrative review and technical assessment.'}
                        </p>

                        {/* Reference Document & Links */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          {req.docFileName ? (
                            <a
                              href={api.getDocumentDownloadUrl(req.docStoragePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF] text-[11px] font-semibold hover:bg-[#7357FF] hover:text-white transition-all"
                              title="Download / View Reference Document"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{req.docFileName}</span>
                              {req.docFileSize && <span className="opacity-75">({req.docFileSize})</span>}
                              <Download className="w-3 h-3 ml-0.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenRefDocModal(req)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-[#7357FF]/40 text-[#7357FF] text-[11px] font-semibold hover:bg-[#EEE9FF]/40 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>+ Attach Reference Doc</span>
                            </button>
                          )}

                          {req.referenceUrl && (
                            <a
                              href={req.referenceUrl.startsWith('http') ? req.referenceUrl : `https://${req.referenceUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3978FF] hover:underline"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{req.referenceUrl}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}

                          {req.docFileName && (
                            <button
                              type="button"
                              onClick={() => handleOpenRefDocModal(req)}
                              className="text-[10px] text-[#8F91A3] hover:text-[#7357FF] underline ml-1 cursor-pointer"
                            >
                              Replace Doc
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <BoxedButton
                          variant={isSelected ? 'accent' : 'secondary'}
                          size="sm"
                          onClick={() => {
                            setSelectedProjectId(req.customId || req.id);
                            setActiveTab('workspace');
                          }}
                        >
                          Open Workspace
                        </BoxedButton>
                        <BoxedButton
                          variant="tertiary"
                          size="sm"
                          onClick={() => navigate(`/requests/${req.customId || req.id}`)}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </BoxedButton>
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
          TAB 2: IDEA VAULT (FREE DRAFT OPERATIONS)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create / Edit Draft Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#7357FF]" />
              <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                {editingDraftId ? 'Edit Vault Draft' : 'Add Idea to Vault'}
              </h3>
            </div>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
              Drafts are 100% free. No NCX credits are deducted until you officially submit for administrative intake.
            </p>

            <form onSubmit={handleSaveDraft} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  placeholder="e.g. Autonomous Logistics Mesh"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Category
                </label>
                <select
                  value={draftCategory}
                  onChange={e => setDraftCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                >
                  <option value="Web Application">Web Application / SaaS</option>
                  <option value="E-commerce">E-commerce Platform</option>
                  <option value="Mobile App">Mobile Application</option>
                  <option value="AI / ML Product">AI / Machine Learning</option>
                  <option value="Portfolio / Creative">Portfolio / Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white mb-1">
                  Concept Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={draftIdea}
                  onChange={e => setDraftIdea(e.target.value)}
                  placeholder="Describe key requirements or user goals..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#65677A] dark:text-[#A6A8C0] mb-1">
                    Target Budget
                  </label>
                  <input
                    type="text"
                    value={draftBudget}
                    onChange={e => setDraftBudget(e.target.value)}
                    placeholder="e.g. ₹1,50,000"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#65677A] dark:text-[#A6A8C0] mb-1">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={draftTimeline}
                    onChange={e => setDraftTimeline(e.target.value)}
                    placeholder="e.g. 4 Weeks"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <BoxedButton variant="primary" size="md" className="flex-1">
                  {editingDraftId ? 'Update Draft' : 'Save to Vault'}
                </BoxedButton>
                {editingDraftId && (
                  <BoxedButton
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setEditingDraftId(null);
                      setDraftTitle('');
                      setDraftIdea('');
                    }}
                  >
                    Cancel
                  </BoxedButton>
                )}
              </div>
            </form>
          </div>

          {/* Drafts List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Private Vault Ideas ({drafts.length})
              </h3>
              <span className="text-xs text-[#7357FF] font-mono">0 NCX CHARGED FOR DRAFTS</span>
            </div>

            {vaultLoading ? (
              <div className="p-8 text-center text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Loading vault concepts...
              </div>
            ) : drafts.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl bg-white dark:bg-[#17172B]">
                <Bookmark className="w-8 h-8 text-[#65677A] dark:text-[#A6A8C0] mx-auto mb-2 opacity-50" />
                <h4 className="font-display font-bold text-sm text-[#17172B] dark:text-white">Your vault is empty</h4>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                  Save early concepts here, refine them anytime, and submit when ready.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map(d => (
                  <div
                    key={d.customId}
                    className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFavoriteDraft(d)}
                          className={`text-xs ${d.isFavorite ? 'text-[#FF826E]' : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#FF826E]'}`}
                        >
                          ★
                        </button>
                        <span className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                          {d.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                          {d.category}
                        </span>
                      </div>
                      {d.rawIdea && (
                        <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] line-clamp-2">
                          {d.rawIdea}
                        </p>
                      )}
                      {(d.expectedBudget || d.preferredTimeline) && (
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0] pt-1">
                          {d.expectedBudget && <span>Target: {d.expectedBudget}</span>}
                          {d.preferredTimeline && <span>Timeline: {d.preferredTimeline}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <BoxedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditDraft(d)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </BoxedButton>
                      <BoxedButton
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleDeleteDraft(d.customId)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </BoxedButton>
                      <BoxedButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          navigate('/submit-request', { state: { prefillTitle: d.title, prefillIdea: d.rawIdea } });
                        }}
                      >
                        Submit Project →
                      </BoxedButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: AI IDEA ASSISTANT (12 INTERACTIVE TOOLS)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ai-assistant' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Nexus AI Idea Assistant
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  12 purpose-built AI tools powered by Gemini 1.5 Flash to synthesize requirements, detect gaps, and optimize scopes.
                </p>
              </div>
            </div>

            {/* Tool Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-6">
              {[
                { id: 'enhance_idea', label: '1. AI Idea Enhancer' },
                { id: 'summarize_project', label: '2. Project Summarizer' },
                { id: 'generate_features', label: '3. Feature Generator' },
                { id: 'prioritize_features', label: '4. Feature Prioritizer' },
                { id: 'technology_advisor', label: '5. Technology Advisor' },
                { id: 'requirement_explainer', label: '6. Requirement Explainer' },
                { id: 'gap_detector', label: '7. Gap Detector' },
                { id: 'project_roadmap', label: '8. Project Roadmap' },
                { id: 'readiness_checker', label: '9. Readiness Checker' },
                { id: 'cost_estimator', label: '10. Cost Estimator' },
                { id: 'budget_feasibility', label: '11. Budget Feasibility' },
                { id: 'document_summarizer', label: '12. Document Summarizer' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedAITool(t.id)}
                  className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                    selectedAITool === t.id
                      ? 'border-[#7357FF] bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]'
                      : 'border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0] hover:border-[#7357FF]/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Input & Run */}
            <div className="mt-6 space-y-3">
              <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                Context / Prompt for {selectedAITool.replace(/_/g, ' ').toUpperCase()}:
              </label>
              <textarea
                rows={3}
                value={aiToolInput}
                onChange={e => setAiToolInput(e.target.value)}
                placeholder={`Provide specifics for ${activeProject?.projectTitle || 'your project'} or describe requirements...`}
                className="w-full px-4 py-3 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
              />
              <div className="flex justify-end">
                <BoxedButton
                  variant="primary"
                  size="md"
                  onClick={handleRunAITool}
                  disabled={aiToolLoading}
                  className="flex items-center gap-2"
                >
                  {aiToolLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{aiToolLoading ? 'Generating Intelligence...' : 'Execute AI Tool'}</span>
                </BoxedButton>
              </div>
            </div>

            {/* Result Display */}
            {aiToolResult && (
              <div className="mt-6 p-5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                    AI RECOMMENDATION ENGINE (ADVISORY)
                  </span>
                  <span className="text-[10px] text-[#65677A] dark:text-[#A6A8C0]">
                    Zero API Keys Exposed to Frontend
                  </span>
                </div>
                <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none whitespace-pre-wrap">
                  {aiToolResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: WORKSPACE & PROJECT PASSPORT (17 BLUEPRINT SECTIONS)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          {!activeProject ? (
            /* Empty State */
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-display font-extrabold text-2xl text-[#17172B] dark:text-white">
                  No Commissioned Projects Yet
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1.5 leading-relaxed">
                  Submit an idea intake to generate an exhaustive 17-point architecture blueprint, milestone roadmap, and real-time cost estimation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/submit-request')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#7357FF] to-[#3978FF] text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your First Project (50 NCX)</span>
              </button>
            </div>
          ) : (
            <>
              {/* Project Passport Hero Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#E9E3FF] text-[#7357FF]">
                        PROJECT PASSPORT
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0F2F9] dark:bg-[#202038] text-[#65677A] dark:text-[#A6A8C0]">
                        #{activeProject.customId || activeProject.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        activeProject.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : activeProject.status?.includes('Progress')
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {activeProject.status || 'Active Commission'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {activeProject.creditsCost || 50} NCX Intake
                      </span>
                    </div>

                    <h2 className="font-display font-extrabold text-2xl text-[#17172B] dark:text-white">
                      {activeProject.projectTitle || 'LocalConnect Hyperlocal Platform'}
                    </h2>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      Domain Category: <span className="font-semibold text-[#17172B] dark:text-white">{activeProject.aiCategory || 'Web & Mobile Application'}</span> • Client: {activeProject.clientName || user?.name || 'Alex Rivera'} • Date: {activeProject.createdAt || 'Current Cycle'}
                    </p>
                  </div>

                  {/* Switcher & Action Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {projectRequests.length > 1 && (
                      <select
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold text-[#17172B] dark:text-white focus:outline-none cursor-pointer"
                      >
                        {projectRequests.map(r => (
                          <option key={r.customId || r.id} value={r.customId || r.id}>
                            {r.projectTitle} (#{r.customId || r.id})
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      disabled={blueprintLoading}
                      onClick={async () => {
                        if (!activeProject) return;
                        setBlueprintLoading(true);
                        const res = await api.generateBlueprint({
                          projectId: activeProject.customId || activeProject.id,
                          title: activeProject.projectTitle,
                          rawIdea: activeProject.rawIdea,
                          category: activeProject.aiCategory
                        });
                        setBlueprint(res.blueprint);
                        setBlueprintLoading(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] text-white shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${blueprintLoading ? 'animate-spin' : ''}`} />
                      <span>{blueprint ? 'Refresh Blueprint' : 'Synthesize Blueprint'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/client/exports')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#7357FF]" />
                      <span>Exports Hub</span>
                    </button>
                  </div>
                </div>

                {/* Segmented Sub-Tabs Bar: Blueprint | Commercial & Cost | Milestones */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46] overflow-x-auto no-scrollbar">
                  {[
                    { id: 'blueprint', label: '17-Point Architecture Spec', icon: FileCode },
                    { id: 'budget', label: 'Commercial & Cost Intelligence (₹/$)', icon: DollarSign },
                    { id: 'milestones', label: 'Milestones & Delivery', icon: Layers },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = workspaceSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setWorkspaceSubTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-[#7357FF] text-white shadow-xs'
                            : 'bg-[#F7F8FC] dark:bg-[#1E1E38] text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#EEE9FF] dark:hover:bg-[#252445]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ──────────────── SUB-TAB 1: 17-POINT BLUEPRINT SPEC ──────────────── */}
              {workspaceSubTab === 'blueprint' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6">
                  {/* Header & Edit Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4 gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                        Nexus AI Architectural Blueprint
                      </h3>
                      <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        Consolidated 17-point scoping architecture and requirement specifications.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        blueprint?.approvedByAdmin ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#7357FF]/10 text-[#7357FF]'
                      }`}>
                        {blueprint?.approvedByAdmin ? '✓ Admin Approved Blueprint' : 'Synthesized Draft'}
                      </span>

                      <button
                        type="button"
                        onClick={() => setIsEditingBlueprint(!isEditingBlueprint)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F8FC] dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white hover:bg-[#EEE9FF] transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#7357FF]" />
                        <span>{isEditingBlueprint ? 'Exit Blueprint Editor' : 'Edit Draft Blueprint'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Blueprint Editor Active Panel */}
                  {isEditingBlueprint && (
                    <div className="p-5 rounded-2xl bg-[#EEE9FF]/30 dark:bg-[#7357FF]/10 border border-[#7357FF]/30 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#7357FF]/20 pb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                            CLIENT BLUEPRINT STUDIO
                          </span>
                          <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                            Edit Draft Blueprint & Prioritize Milestones
                          </h4>
                          <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                            Propose updates to modules and milestone order. Admin-approved requirements remain untouched until approved.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={aiSuggestLoading}
                            onClick={handleRequestAiSuggestions}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1E1E38] border border-[#7357FF]/30 text-[#7357FF] hover:bg-[#7357FF] hover:text-white transition-all cursor-pointer"
                          >
                            <Sparkles className={`w-3.5 h-3.5 text-[#7357FF] ${aiSuggestLoading ? 'animate-spin' : ''}`} />
                            <span>{aiSuggestLoading ? 'Analyzing...' : 'Request AI Suggestions'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Milestone Sequence */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#17172B] dark:text-white block">
                          Proposed Milestone Sequence:
                        </span>
                        <div className="space-y-2">
                          {draftMilestones.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#7357FF] text-white flex items-center justify-center font-mono font-bold text-[11px]">
                                  {idx + 1}
                                </span>
                                <span className="font-semibold text-[#17172B] dark:text-white">{m.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleReorderMilestone(idx, 'up')}
                                  className="p-1 rounded hover:bg-[#F0F2F9] disabled:opacity-30 text-[#65677A]"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === draftMilestones.length - 1}
                                  onClick={() => handleReorderMilestone(idx, 'down')}
                                  className="p-1 rounded hover:bg-[#F0F2F9] disabled:opacity-30 text-[#65677A]"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Editor Action Buttons */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-[#7357FF]/20">
                        <button
                          type="button"
                          disabled={blueprintSaving}
                          onClick={() => handleSaveDraftBlueprint(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] hover:bg-[#F8F9FC]"
                        >
                          Save Draft
                        </button>
                        <button
                          type="button"
                          disabled={blueprintSaving}
                          onClick={() => handleSaveDraftBlueprint(true)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#7357FF] text-white hover:bg-[#6042EE]"
                        >
                          Submit Proposed Changes for Review
                        </button>
                      </div>
                    </div>
                  )}

                  {blueprintLoading ? (
                    <div className="py-16 text-center text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7357FF] mb-2" />
                      Generating 17-section architectural blueprint...
                    </div>
                  ) : blueprint ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* 1. Overview */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                        <span className="font-mono text-[10px] text-[#7357FF] font-bold">1. PROJECT OVERVIEW</span>
                        <p className="text-[#17172B] dark:text-white leading-relaxed">{blueprint.projectOverview}</p>
                      </div>

                      {/* 2. Problem Statement */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                        <span className="font-mono text-[10px] text-[#7357FF] font-bold">2. PROBLEM STATEMENT</span>
                        <p className="text-[#17172B] dark:text-white leading-relaxed">{blueprint.problemStatement}</p>
                      </div>

                      {/* 3. Proposed Solution */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                        <span className="font-mono text-[10px] text-[#7357FF] font-bold">3. PROPOSED SOLUTION</span>
                        <p className="text-[#17172B] dark:text-white leading-relaxed">{blueprint.proposedSolution}</p>
                      </div>

                      {/* 4. Main Modules */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
                        <span className="font-mono text-[10px] text-[#7357FF] font-bold">4. MAIN MODULES</span>
                        <ul className="list-disc pl-4 space-y-1 text-[#17172B] dark:text-white">
                          {blueprint.mainModules?.map((m, idx) => <li key={idx}>{m}</li>)}
                        </ul>
                      </div>

                      {/* 5. Essential Features */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
                        <span className="font-mono text-[10px] text-[#22c55e] font-bold">5. ESSENTIAL FEATURES (P0 MVP)</span>
                        <ul className="list-disc pl-4 space-y-1 text-[#17172B] dark:text-white">
                          {blueprint.essentialFeatures?.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      </div>

                      {/* 6. Recommended Features */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
                        <span className="font-mono text-[10px] text-[#3978FF] font-bold">6. RECOMMENDED FEATURES (P1)</span>
                        <ul className="list-disc pl-4 space-y-1 text-[#17172B] dark:text-white">
                          {blueprint.recommendedFeatures?.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      </div>

                      {/* 7. Suggested Technologies */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
                        <span className="font-mono text-[10px] text-[#7357FF] font-bold">7. SUGGESTED TECHNOLOGIES</span>
                        <div className="flex flex-wrap gap-1.5">
                          {blueprint.suggestedTechnologies?.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] font-mono text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 8. Effort & Complexity */}
                      <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
                        <span className="font-mono text-[10px] text-[#7357FF] font-bold">8. ESTIMATED EFFORT & PHASING</span>
                        <div className="text-sm font-display font-bold text-[#17172B] dark:text-white">
                          {blueprint.estimatedDevelopmentEffort}
                        </div>
                        <div className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                          Complexity: <span className="font-bold text-[#7357FF]">{blueprint.projectComplexity}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      No blueprint generated yet. Click "Synthesize Blueprint" to create an exhaustive 17-section architecture document.
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────── SUB-TAB 2: COMMERCIAL & COST BREAKDOWN ──────────────── */}
              {workspaceSubTab === 'budget' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#E9E3FF] text-[#7357FF]">
                          COMMERCIAL ESTIMATION
                        </span>
                        <span className="text-[11px] font-semibold text-[#65677A] dark:text-[#A6A8C0]">
                          Studio Rate: ₹1,200/hr ($14.50/hr) • Fixed-Cap Escrow
                        </span>
                      </div>
                      <h3 className="font-display font-extrabold text-xl text-[#17172B] dark:text-white">
                        Project Cost Matrix & Scope Breakdown
                      </h3>
                      <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
                        Granular hourly estimation matrix with automatic 15% contingency reserve and milestone escrow protection.
                      </p>
                    </div>

                    {/* Currency Toggle & Total Baseline */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-[#F8F9FC] dark:bg-[#131326] p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46]">
                      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1E1E38] rounded-lg border border-[#E9EAF0] dark:border-[#2A2A46]">
                        <button
                          type="button"
                          onClick={() => setBudgetCurrency('INR')}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                            budgetCurrency === 'INR'
                              ? 'bg-[#7357FF] text-white shadow-xs'
                              : 'text-[#65677A] hover:text-[#222438] dark:text-[#A6A8C0]'
                          }`}
                        >
                          INR (₹)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBudgetCurrency('USD')}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                            budgetCurrency === 'USD'
                              ? 'bg-[#7357FF] text-white shadow-xs'
                              : 'text-[#65677A] hover:text-[#222438] dark:text-[#A6A8C0]'
                          }`}
                        >
                          USD ($)
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-[#777B8A] block">CALCULATED BASELINE</span>
                        <div className="font-display font-black text-2xl text-[#17172B] dark:text-white">
                          {budgetCurrency === 'INR'
                            ? `₹${(costEstimate?.estimatedTotal || 220000).toLocaleString('en-IN')}`
                            : `$${Math.round((costEstimate?.estimatedTotal || 220000) / 83).toLocaleString('en-US')}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8 Granular Cost Breakdown Components */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      { name: 'UI/UX Design', hours: 24, cost: 28800, icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' },
                      { name: 'Frontend Architecture', hours: 48, cost: 57600, icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                      { name: 'Backend Services', hours: 40, cost: 48000, icon: Server, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
                      { name: 'Database & Schemas', hours: 16, cost: 19200, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                      { name: 'API Integrations', hours: 20, cost: 24000, icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
                      { name: 'Testing & QA', hours: 18, cost: 21600, icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30' },
                      { name: 'Cloud Deployment', hours: 10, cost: 12000, icon: Cloud, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                      { name: '15% Contingency Buffer', hours: 26, cost: 31200, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' }
                    ].map((c, idx) => {
                      const Icon = c.icon;
                      const pct = Math.round((c.cost / 220000) * 100);
                      const displayCost = budgetCurrency === 'INR'
                        ? `₹${c.cost.toLocaleString('en-IN')}`
                        : `$${Math.round(c.cost / 83).toLocaleString('en-US')}`;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF]/40 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-mono font-bold text-[#777B8A]">
                              {pct}% of budget
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className="text-xs font-semibold text-[#222438] dark:text-white truncate">
                              {c.name}
                            </div>
                            <div className="font-display font-extrabold text-lg text-[#17172B] dark:text-white mt-0.5">
                              {displayCost}
                            </div>
                            <div className="text-[10px] text-[#777B8A] font-mono mt-0.5">
                              {c.hours} hrs @ {budgetCurrency === 'INR' ? '₹1,200/hr' : '$14.50/hr'}
                            </div>

                            <div className="w-full bg-[#E9EAF0] dark:bg-[#202038] h-1.5 rounded-full mt-2.5 overflow-hidden">
                              <div
                                className="bg-[#7357FF] group-hover:bg-[#3978FF] h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3-Milestone Escrow Schedule */}
                  <div className="pt-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-[#777B8A] tracking-wider mb-3">
                      Milestone Escrow Disbursement Schedule
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          phase: 'Milestone 1 (30%)',
                          title: 'Architecture Blueprint & UX Prototype',
                          amount: budgetCurrency === 'INR' ? '₹66,000' : '$795',
                          status: 'Escrow Funded',
                          statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          trigger: 'Released upon client blueprint approval in Studio'
                        },
                        {
                          phase: 'Milestone 2 (40%)',
                          title: 'Full-Stack Engineering & API Integration',
                          amount: budgetCurrency === 'INR' ? '₹88,000' : '$1,060',
                          status: 'In Progress Escrow',
                          statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
                          trigger: 'Released upon passing automated test suites'
                        },
                        {
                          phase: 'Milestone 3 (30%)',
                          title: 'QA Hardening & Final Production Handover',
                          amount: budgetCurrency === 'INR' ? '₹66,000' : '$795',
                          status: 'Pending Acceptance',
                          statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
                          trigger: 'Released upon ZIP deliverable verification'
                        }
                      ].map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-4 rounded-xl bg-white dark:bg-[#1A1A33] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">{m.phase}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.statusColor}`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                            {m.title}
                          </div>
                          <div className="font-mono font-extrabold text-base text-[#17172B] dark:text-white">
                            {m.amount}
                          </div>
                          <div className="text-[10px] text-[#777B8A] pt-1 border-t border-[#E8EAF4] dark:border-[#2A2A46] flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-[#7357FF] flex-shrink-0" />
                            <span>{m.trigger}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── SUB-TAB 3: MILESTONES & DELIVERY ──────────────── */}
              {workspaceSubTab === 'milestones' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                        DELIVERY TELEMETRY
                      </span>
                      <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-0.5">
                        Phased Milestones & Governance
                      </h3>
                      <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        Track milestone progression and formalize deliverable acceptance.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScopeChangeModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E9E3FF] text-[#7357FF] hover:bg-[#7357FF] hover:text-white transition-all cursor-pointer"
                      >
                        + Request Scope Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setHandoverModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8F8F0] text-[#24A675] hover:bg-[#24A675] hover:text-white transition-all cursor-pointer"
                      >
                        Formalize Handover Acceptance
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Milestone 1: Architectural Scoping & UI/UX Wireframes',
                        duration: '2 Weeks',
                        status: 'Completed',
                        progress: 100,
                        notes: '17-point architecture blueprint verified and approved.'
                      },
                      {
                        title: 'Milestone 2: Core Engineering, Database & API Integration',
                        duration: '3 Weeks',
                        status: 'In Progress',
                        progress: 65,
                        notes: 'Full-stack microservices and database modeling underway.'
                      },
                      {
                        title: 'Milestone 3: QA Hardening, Deliverable Archive & Release',
                        duration: '1 Week',
                        status: 'Scheduled',
                        progress: 0,
                        notes: 'Automated test suite execution and ZIP integrity verification.'
                      }
                    ].map((m, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-[#E9E3FF] text-[#7357FF] font-mono font-bold text-xs flex items-center justify-center">
                              M{idx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{m.title}</h4>
                              <span className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Duration: {m.duration}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase w-fit ${
                            m.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {m.status} ({m.progress}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#E8EAF4] dark:bg-[#202038] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#7357FF] h-full rounded-full transition-all duration-500"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">{m.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB: MILESTONE PROGRESS TRACKING (SECTION B)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  PHASED EXECUTION AUDIT
                </span>
                <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-0.5">
                  Milestone Progress Tracking
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Track production milestones, start & due dates, associated deliverables, and completion status.
                </p>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white">
                  Total: {projectMilestones.length || 3}
                </span>
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold bg-[#22c55e]/10 text-[#22c55e]">
                  Completed: {projectMilestones.filter(m => m.status === 'Completed' || m.status === 'Done').length}
                </span>
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold bg-[#7357FF]/10 text-[#7357FF]">
                  In Progress: {projectMilestones.filter(m => m.status === 'In Progress').length || 1}
                </span>
              </div>
            </div>

            {/* Phased Milestones List */}
            {projectMilestones.length === 0 ? (
              <div className="space-y-4">
                {/* Fallback structured milestones if none saved in DB yet */}
                {[
                  {
                    title: 'Milestone 1: Architectural Scoping & UI/UX Wireframes',
                    description: 'Synthesis of project passport, Gemini AI requirement decomposition, and high-fidelity interface design.',
                    duration: '2 Weeks',
                    startDate: 'Week 1',
                    dueDate: 'Week 2',
                    progress: 100,
                    status: 'Completed',
                    completionNotes: 'Admin verified and client approved. Blueprint finalized in Idea Vault.'
                  },
                  {
                    title: 'Milestone 2: Core Engineering, Database & API Integration',
                    description: 'Full-stack application implementation, schema modeling, authentication and secure webhook bindings.',
                    duration: '3 Weeks',
                    startDate: 'Week 3',
                    dueDate: 'Week 5',
                    progress: 65,
                    status: 'In Progress',
                    completionNotes: 'Specialist assigned and sprint active. Intermediate modules undergoing test runs.'
                  },
                  {
                    title: 'Milestone 3: QA Hardening, Deliverable Archive & Release',
                    description: 'End-to-end integration tests, static code verification, SHA-256 package verification, and client delivery.',
                    duration: '1 Week',
                    startDate: 'Week 6',
                    dueDate: 'Week 6',
                    progress: 0,
                    status: 'Not Started',
                    completionNotes: 'Scheduled for execution upon completion of Milestone 2.'
                  }
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#7357FF]">M{idx + 1}</span>
                        <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{m.title}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase w-fit ${
                        m.status === 'Completed' ? 'bg-[#22c55e]/10 text-[#22c55e]' : m.status === 'In Progress' ? 'bg-[#7357FF]/10 text-[#7357FF]' : 'bg-[#65677A]/10 text-[#65677A]'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">{m.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#65677A] dark:text-[#A6A8C0]">Progress</span>
                        <span className="font-bold text-[#17172B] dark:text-white">{m.progress}%</span>
                      </div>
                      <div className="w-full bg-[#E8EAF4] dark:bg-[#2A2A46] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#7357FF] to-[#D5FF68] h-full rounded-full transition-all duration-500"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0] pt-1 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
                      <span>Est. Duration: {m.duration}</span>
                      <span>Start: {m.startDate}</span>
                      <span>Due: {m.dueDate}</span>
                    </div>

                    {m.completionNotes && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        <span className="font-bold text-[#17172B] dark:text-white">Milestone Notes: </span>
                        {m.completionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {projectMilestones.map((m, idx) => (
                  <div
                    key={m._id || m.customId || idx}
                    className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#7357FF]">M{idx + 1}</span>
                        <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{m.title}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase w-fit ${
                        m.status === 'Completed' || m.status === 'Done' ? 'bg-[#22c55e]/10 text-[#22c55e]' : m.status === 'In Progress' ? 'bg-[#7357FF]/10 text-[#7357FF]' : 'bg-[#65677A]/10 text-[#65677A]'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">{m.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#65677A] dark:text-[#A6A8C0]">Progress</span>
                        <span className="font-bold text-[#17172B] dark:text-white">{m.progress || (m.status === 'Done' ? 100 : 40)}%</span>
                      </div>
                      <div className="w-full bg-[#E8EAF4] dark:bg-[#2A2A46] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#7357FF] to-[#D5FF68] h-full rounded-full transition-all duration-500"
                          style={{ width: `${m.progress || (m.status === 'Done' ? 100 : 40)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0] pt-1 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
                      <span>Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'Active Sprint'}</span>
                      {m.expectedDuration && <span>Duration: {m.expectedDuration}</span>}
                    </div>

                    {m.completionNotes && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        <span className="font-bold text-[#17172B] dark:text-white">Milestone Notes: </span>
                        {m.completionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: CLARIFICATION CENTER (STRUCTURED Q&A)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'clarifications' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Clarification Center
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Structured questions between clients and administrators regarding project scope, edge cases, and design preferences.
                </p>
              </div>
            </div>

            {clarifications.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl mt-4">
                <CheckCircle2 className="w-8 h-8 text-[#22c55e] mx-auto mb-2 opacity-60" />
                <h4 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                  No Pending Clarifications
                </h4>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                  All requirements for "{activeProject?.projectTitle}" are aligned.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {clarifications.map(c => (
                  <div
                    key={c.customId}
                    className="p-5 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          c.status === 'Answered' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#FF826E]/10 text-[#FF826E]'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                          Category: {c.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#65677A] dark:text-[#A6A8C0]">
                        Asked by {c.askedBy.name} ({c.askedBy.role})
                      </span>
                    </div>

                    <p className="font-semibold text-xs text-[#17172B] dark:text-white">
                      Q: {c.question}
                    </p>

                    {c.answer ? (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A33] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                        <span className="text-[10px] font-mono text-[#22c55e] font-bold">YOUR ANSWER:</span>
                        <p className="text-xs text-[#17172B] dark:text-white">{c.answer}</p>
                      </div>
                    ) : answeringId === c.customId ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={3}
                          value={answerText}
                          onChange={e => setAnswerText(e.target.value)}
                          placeholder="Type your clarification answer..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A33] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                        />
                        <div className="flex justify-end gap-2">
                          <BoxedButton variant="secondary" size="sm" onClick={() => setAnsweringId(null)}>
                            Cancel
                          </BoxedButton>
                          <BoxedButton variant="primary" size="sm" onClick={() => handleAnswerClarification(c.customId)}>
                            Submit Response
                          </BoxedButton>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <BoxedButton variant="primary" size="sm" onClick={() => setAnsweringId(c.customId)}>
                          Answer Question
                        </BoxedButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: DOCUMENTS & RELEASED DELIVERABLES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Dynamic Document Requirement Management & Client Submission Portal */}
          <ClientDocumentRequirementsPortal />

          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Document Studio & Reference Materials
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Manage your uploaded reference documents, specifications, and officially released deliverable packages.
                </p>
              </div>
            </div>

            {/* Submitted Project Reference Documents Section */}
            <div className="space-y-3 pb-6 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-[#7357FF]">
                    Your Submitted Project Reference Documents
                  </h4>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                    Reference documents, specifications, and links provided with your project submissions.
                  </p>
                </div>
              </div>

              {projectRequests.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-xl text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  No submitted projects yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {projectRequests.map(proj => (
                    <div
                      key={proj.customId || proj.id}
                      className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#7357FF] font-bold">
                            #{proj.customId || proj.id}
                          </span>
                          <span className="font-bold text-sm text-[#17172B] dark:text-white">
                            {proj.projectTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                            {proj.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                          {proj.docFileName ? (
                            <a
                              href={api.getDocumentDownloadUrl(proj.docStoragePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#7357FF] font-semibold hover:bg-[#F5F2FF] transition-all"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{proj.docFileName}</span>
                              {proj.docFileSize && <span className="text-[10px] text-[#8F91A3]">({proj.docFileSize})</span>}
                              <Download className="w-3.5 h-3.5 ml-1 text-[#65677A]" />
                            </a>
                          ) : (
                            <span className="text-xs text-[#8F91A3] italic">No document file attached</span>
                          )}

                          {proj.referenceUrl && (
                            <a
                              href={proj.referenceUrl.startsWith('http') ? proj.referenceUrl : `https://${proj.referenceUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#3978FF] font-semibold hover:underline"
                            >
                              <LinkIcon className="w-3.5 h-3.5 text-[#3978FF]" />
                              <span className="truncate max-w-[200px]">{proj.referenceUrl}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <BoxedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenRefDocModal(proj)}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          <span>{proj.docFileName ? 'Replace Document' : '+ Attach Document'}</span>
                        </BoxedButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Released Deliverables Section */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase text-[#7357FF]">
                Official Released Deliverables
              </h4>

              {deliverables.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-xl text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  No deliverables released yet. Deliverable ZIP packages will appear here once inspected and authorized by Administration.
                </div>
              ) : (
                deliverables.map(deliv => (
                  <div
                    key={deliv.customId}
                    className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#22c55e]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/10 text-[#22c55e]">
                          RELEASED DELIVERABLE v{deliv.version}
                        </span>
                        <span className="text-xs font-bold text-[#17172B] dark:text-white">
                          {deliv.submissionTitle}
                        </span>
                      </div>
                      <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                        {deliv.releaseNotes || 'Final production deliverable package.'}
                      </p>
                      <div className="text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0] mt-1">
                        {deliv.zipFileName} ({deliv.zipFileSize}) • {deliv.fileCount} files
                      </div>
                    </div>

                    <a
                      href={api.getDocumentDownloadUrl(deliv.zipStoragePath)}
                      download
                      className="px-4 py-2 rounded-xl bg-[#7357FF] text-white font-semibold text-xs flex items-center gap-2 hover:bg-[#6042EE] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download ZIP Package
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB: EXPORTS & VERIFIED DOSSIER (SECTION B)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'exports' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
                  ENTERPRISE ARTIFACTS & TELEMETRY
                </span>
                <h3 className="font-display font-extrabold text-2xl text-[#17172B] dark:text-white mt-0.5">
                  Project Exports & Verified Dossier
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 max-w-2xl leading-relaxed">
                  Download board-ready architectural dossiers, editable Microsoft Word specifications, portable GitHub markdown specs, telemetry spreadsheets, or launch the executive presentation slide studio.
                </p>
              </div>

              {activeProject && (
                <div className="flex items-center gap-2.5 p-2.5 px-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="font-bold text-[#17172B] dark:text-white truncate max-w-[200px]">
                      {activeProject.projectTitle}
                    </div>
                    <div className="text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                      #{activeProject.customId || activeProject.id}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6 Format Export Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Executive PDF Dossier */}
              <div className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col justify-between gap-4 hover:border-rose-400/50 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      .PDF DOSSIER
                    </span>
                    <FileText className="w-5 h-5 text-rose-500 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                      Executive Architectural Dossier
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      Compiled 17-point architecture specification, tech stack matrix, and security checklist compiled into a formatted executive PDF.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Vector PDF</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">17 Sections</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Print Ready</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportBlueprintPDF}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xs hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Dossier</span>
                </button>
              </div>

              {/* Card 2: Enterprise Word (.DOCX) */}
              <div className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col justify-between gap-4 hover:border-blue-400/50 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      .DOCX WORD
                    </span>
                    <FileText className="w-5 h-5 text-blue-500 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                      Enterprise Scoping Specification
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      Fully editable Microsoft Word document with native XML headings, structured tables, and signoff blocks ready for corporate compliance.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">MS Word XML</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Editable</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">ISO/IEEE</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportBlueprintDOCX}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#EBF2FF] dark:bg-[#1E2746] text-[#2F68EE] dark:text-[#6FA2FF] border border-blue-200 dark:border-blue-800 hover:bg-[#2F68EE] hover:text-white dark:hover:bg-[#2F68EE] dark:hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Word (.docx)</span>
                </button>
              </div>

              {/* Card 3: Portable Blueprint (.MD) */}
              <div className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col justify-between gap-4 hover:border-purple-400/50 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      .MD MARKDOWN
                    </span>
                    <FileCode className="w-5 h-5 text-purple-500 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                      AI Architectural Blueprint (.md)
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      Clean GitHub Flavored Markdown specification formatted for Git repositories, software wikis, and engineering knowledge bases.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">GFM Format</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Git Ready</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Raw UTF-8</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportBlueprintMarkdown}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F3E8FF] dark:bg-[#28183E] text-[#9333EA] dark:text-[#D8B4FE] border border-purple-200 dark:border-purple-800 hover:bg-[#9333EA] hover:text-white dark:hover:bg-[#9333EA] dark:hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Blueprint (.md)</span>
                </button>
              </div>

              {/* Card 4: Project Passport CSV */}
              <div className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col justify-between gap-4 hover:border-emerald-400/50 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      .CSV SPREADSHEET
                    </span>
                    <Table className="w-5 h-5 text-emerald-500 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                      Project Passport & Intake Telemetry
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      Structured tabular dataset with project ID, domain category, token consumption, intake status, and lifecycle timestamps.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Excel / Sheets</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">RFC 4180</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Audit Log</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#E8F8F0] dark:bg-[#162A20] text-[#16A34A] dark:text-[#4ADE80] border border-emerald-200 dark:border-emerald-800 hover:bg-[#16A34A] hover:text-white dark:hover:bg-[#16A34A] dark:hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Passport (.csv)</span>
                </button>
              </div>

              {/* Card 5: Milestone Delivery Plan CSV */}
              <div className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col justify-between gap-4 hover:border-emerald-400/50 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      .CSV SCHEDULE
                    </span>
                    <Table className="w-5 h-5 text-emerald-500 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                      Milestone Execution Schedule
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      Chronological work breakdown structure (WBS), duration estimates, target sprint dates, and real-time completion percentages.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Sprint Plan</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">WBS Matrix</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Phased</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportMilestonesCSV}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#E8F8F0] dark:bg-[#162A20] text-[#16A34A] dark:text-[#4ADE80] border border-emerald-200 dark:border-emerald-800 hover:bg-[#16A34A] hover:text-white dark:hover:bg-[#16A34A] dark:hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Milestones (.csv)</span>
                </button>
              </div>

              {/* Card 6: Quick Print / Save Layout */}
              <div className="p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col justify-between gap-4 hover:border-indigo-400/50 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      PRINT LAYOUT
                    </span>
                    <FileDown className="w-5 h-5 text-indigo-500 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                      Browser Print & Executive Preview
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      Pre-formatted clean printable layout suitable for instant AirPrint, physical meeting distribution, or operating system PDF print.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">A4 Portrait</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Instant</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1A1A36] border border-[#E8EAF4] dark:border-[#2A2A46]">Zero Setup</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white hover:bg-[#F0F2F9] dark:hover:bg-[#252445] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Open Print Preview</span>
                </button>
              </div>
            </div>

            {/* Showcase Card: AI Presentation Studio & Pitch Deck (.PPTX) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121324] via-[#1A1A36] to-[#25234A] border border-[#7357FF]/30 p-6 sm:p-8 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7357FF]/25 to-[#3978FF]/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      AI PPT GENERATOR · NATIVE POWERPOINT (.PPTX)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/80">
                      10-Slide Keynote
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    Executive Pitch Deck & Slide Studio
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A6A8C0] leading-relaxed">
                    Convert this project's architecture, problem statement, technology stack, and milestone delivery plan into an editable, beautifully formatted 10-slide PowerPoint presentation with real vector shapes, typography hierarchies, and dark glass styling.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap text-[11px] font-mono text-white/70 pt-1">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 16:9 Widescreen</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Editable Vector Elements</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Executive Theme</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/slides?topic=${encodeURIComponent(activeProject?.projectTitle || '')}&category=${encodeURIComponent(activeProject?.aiCategory || 'Technology')}`)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#7357FF] to-[#3978FF] hover:from-[#6246EA] hover:to-[#2B66EE] text-white shadow-lg shadow-[#7357FF]/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Open AI Presentation Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    
      {/* Scope Change Request Modal */}
      <ScopeChangeRequestModal
        isOpen={scopeChangeModalOpen}
        onClose={() => setScopeChangeModalOpen(false)}
        projectId={activeProject?.customId || activeProject?.id || ''}
        projectTitle={activeProject?.projectTitle || 'Commissioned Project'}
        onSubmitted={() => refreshRequests()}
      />

      {/* Handover Acceptance Modal */}
      <HandoverAcceptanceModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        project={activeProject}
        onAccepted={() => refreshRequests()}
      />

      {/* Client Reference Document Upload / Update Modal */}
      {refDocModalOpen && selectedRefProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div>
                <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                  Update Reference Document & Materials
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Attach or replace your specification document or Figma/PRD link for #{selectedRefProject.customId || selectedRefProject.id}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRefDocModalOpen(false)}
                className="text-[#65677A] hover:text-[#17172B] dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClientRefDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Project Title
                </label>
                <div className="p-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-semibold text-[#17172B] dark:text-white">
                  {selectedRefProject.projectTitle}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Reference URL / Figma / GitHub Repository Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#8F91A3]" />
                  <input
                    type="url"
                    value={refDocUrl}
                    onChange={e => setRefDocUrl(e.target.value)}
                    placeholder="https://figma.com/@project or github repository"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Attach Reference Specification Document (.pdf, .docx, .txt, .zip, images)
                </label>
                <div className="p-3.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#7357FF] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate text-[#17172B] dark:text-white">
                          {refDocFile ? refDocFile.name : (selectedRefProject.docFileName || 'No document currently attached')}
                        </div>
                        <div className="text-[10px] text-[#8F91A3]">
                          {refDocFile ? `${(refDocFile.size / 1024).toFixed(1)} KB (New Selection)` : (selectedRefProject.docFileSize || 'Upload a file up to 20MB')}
                        </div>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={clientFileInputRef}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setRefDocFile(file);
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"
                    />

                    <button
                      type="button"
                      onClick={() => clientFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7357FF] text-white text-xs font-semibold hover:bg-[#5E43E2] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{selectedRefProject.docFileName || refDocFile ? 'Choose New File' : 'Select File'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
                <BoxedButton variant="secondary" size="sm" onClick={() => setRefDocModalOpen(false)}>
                  Cancel
                </BoxedButton>
                <BoxedButton variant="primary" size="sm" type="submit" loading={refDocUploading}>
                  {refDocUploading ? 'Uploading & Saving...' : 'Save Reference Materials'}
                </BoxedButton>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
};

export default ClientDashboardPage;
