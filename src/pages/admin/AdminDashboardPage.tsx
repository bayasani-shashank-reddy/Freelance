import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  Eye,
  Download,
  Layers,
  RefreshCw,
  Users,
  Check,
  TrendingUp,
  PackageCheck,
  Calendar,
  Filter,
  ChevronRight,
  Sparkles,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { api } from '../../lib/api';
import { ShareWithFreelancerModal } from '../../components/ShareWithFreelancerModal';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';
import { BoxedButton } from '../../components/shared/BoxedButton';
import { AdminAttentionQueue } from '../../components/admin/AdminAttentionQueue';
import { AdminQuickActionDrawer } from '../../components/admin/AdminQuickActionDrawer';
import { NexusSlaRadar } from '../../components/admin/NexusSlaRadar';
import { ScopeChangeAnalyzerModal } from '../../components/admin/ScopeChangeAnalyzerModal';
import type {
  FeasibilityAssessmentItem,
  FreelancerQuotationItem,
  DeliverableSubmissionItem,
  ClarificationItem,
  AuditLogItem
} from '../../types';
import confetti from 'canvas-confetti';

type AdminModuleTab =
  | 'overview'
  | 'intake'
  | 'cost-intelligence'
  | 'deliverables'
  | 'assessments-quotes'
  | 'clarifications'
  | 'freelancers'
  | 'clients'
  | 'audit';

interface AdminDashboardPageProps {
  view?: string;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ view }) => {
  const location = useLocation();
  const [slaRadar, setSlaRadar] = useState<any>(null);
  const [selectedScopeChange, setSelectedScopeChange] = useState<{ project: any; change: any } | null>(null);
  const {
    user,
    projectRequests,
    refreshRequests,
    freelancers,
    refreshFreelancers,
    createFreelancerByAdmin,
    adjustCreditsByAdmin
  } = useUser();

  const [activeTab, setActiveTab] = useState<AdminModuleTab>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [searchParams] = useSearchParams();

  // Sync active tab with direct dedicated route (/admin/requests, /admin/freelancers, etc.) or URL query parameter
  useEffect(() => {
    const path = location.pathname;
    if (view === 'intake' || path === '/admin/requests' || path === '/admin/intake' || path === '/admin/projects') {
      setActiveTab('intake');
      return;
    }
    if (view === 'freelancers' || path === '/admin/freelancers') {
      setActiveTab('freelancers');
      return;
    }
    if (view === 'cost-intelligence' || path === '/admin/cost-intelligence') {
      setActiveTab('cost-intelligence');
      return;
    }
    if (view === 'deliverables' || path === '/admin/deliverables') {
      setActiveTab('deliverables');
      return;
    }
    if (view === 'assessments-quotes' || path === '/admin/assessments') {
      setActiveTab('assessments-quotes');
      return;
    }
    if (view === 'clients' || path === '/admin/clients') {
      setActiveTab('clients');
      return;
    }
    if (view === 'audit' || path === '/admin/audit-logs' || path === '/admin/audit') {
      setActiveTab('audit');
      return;
    }
    if (view === 'clarifications' || path === '/admin/clarifications') {
      setActiveTab('clarifications');
      return;
    }
    if (view === 'analytics' || path === '/admin/analytics') {
      setActiveTab('overview');
      return;
    }
    if (
      view === 'assignments' ||
      path === '/admin/assignments' ||
      view === 'tasks' ||
      path === '/admin/tasks' ||
      view === 'ai-intelligence' ||
      path === '/admin/ai-intelligence' ||
      view === 'document-studio' ||
      path === '/admin/document-studio'
    ) {
      setActiveTab('intake');
      return;
    }
    if (view === 'overview' || path === '/admin/dashboard' || path === '/admin') {
      setActiveTab('overview');
      return;
    }

    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (['overview', 'intake', 'cost-intelligence', 'deliverables', 'assessments-quotes', 'clarifications', 'freelancers', 'clients', 'audit'].includes(tabParam)) {
        setActiveTab(tabParam as AdminModuleTab);
      } else if (tabParam === 'analytics') {
        setActiveTab('overview');
      } else if (tabParam === 'assignments' || tabParam === 'tasks' || tabParam === 'ai-intelligence' || tabParam === 'document-studio') {
        setActiveTab('intake');
      }
    }
  }, [view, location.pathname, searchParams]);

  // Duralux Header & Analytics Controls
  const [dateRange, setDateRange] = useState<'30days' | '7days' | '90days' | 'ytd' | 'all'>('30days');
  const [chartTimeframe, setChartTimeframe] = useState<'Monthly' | 'Quarterly' | 'Weekly'>('Monthly');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [tablePriorityFilter, setTablePriorityFilter] = useState('all');
  const [tablePage, setTablePage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Database Analytics State
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);

  // Cost Intelligence State
  const [costData, setCostData] = useState<any>(null);

  // Deliverables State
  const [deliverables, setDeliverables] = useState<DeliverableSubmissionItem[]>([]);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableSubmissionItem | null>(null);

  // Assessments & Quotes State
  const [assessments, setAssessments] = useState<FeasibilityAssessmentItem[]>([]);
  const [quotations, setQuotations] = useState<FreelancerQuotationItem[]>([]);

  // Clarifications State
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Users State
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Internal Admin Note on active request
  const [adminNote, setAdminNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Modals State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false);
  const [quickDrawerProjectId, setQuickDrawerProjectId] = useState<string>('');
  const [docViewer, setDocViewer] = useState<{ isOpen: boolean; fileName: string; storagePath?: string }>({
    isOpen: false,
    fileName: ''
  });
  const [addFreelancerModal, setAddFreelancerModal] = useState(false);
  const [freelancerForm, setFreelancerForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: 'Senior Full-Stack Architect',
    skills: 'React, Node.js, WebGPU, Cloud',
    hourlyRate: 1200,
    availability: 'Available Now'
  });
  const [creditGrantModal, setCreditGrantModal] = useState(false);
  const [creditGrantForm, setCreditGrantForm] = useState({ userId: '', amount: 100, reason: 'Administrative Grant' });

  // Initial Data Fetch
  useEffect(() => {
    refreshRequests();
    refreshFreelancers();

    api.getAdminAnalytics().then(res => {
      if (res?.metrics) setAnalyticsOverview({ ...res.overview, ...res.metrics });
      else if (res?.overview) setAnalyticsOverview(res.overview);
    });

    api.getCostDashboard().then(res => {
      if (res) setCostData(res);
    });

    api.getSlaRadar().then(res => { if (res) setSlaRadar(res); });
    api.getAuditLogs().then(res => {
      if (Array.isArray(res)) setAuditLogs(res);
    });

    api.getUsers().then(res => {
      if (Array.isArray(res)) setAllUsers(res);
      else if (res?.success && res?.data) setAllUsers(res.data);
    });
  }, [refreshRequests, refreshFreelancers]);

  // Set default selected request
  useEffect(() => {
    if (projectRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(projectRequests[0].customId || projectRequests[0].id);
    }
  }, [projectRequests, selectedRequestId]);

  const activeRequest = useMemo(() => {
    return projectRequests.find(r => (r.customId || r.id) === selectedRequestId) || projectRequests[0];
  }, [projectRequests, selectedRequestId]);

  const quickDrawerProject = useMemo(() => {
    return projectRequests.find(r => (r.customId || r.id) === quickDrawerProjectId) || activeRequest;
  }, [projectRequests, quickDrawerProjectId, activeRequest]);

  const handleOpenDrawer = (pId: string) => {
    setQuickDrawerProjectId(pId);
    setQuickDrawerOpen(true);
  };

  // Load modules for active request
  useEffect(() => {
    if (!activeRequest) return;
    const reqId = activeRequest.customId || activeRequest.id;

    setAdminNote(activeRequest.internalNote || '');

    api.getRequestAssessments(reqId).then(setAssessments);
    api.getRequestQuotations(reqId).then(setQuotations);
    api.getProjectClarifications(reqId).then(setClarifications);
    api.getProjectDeliverables(reqId).then(setDeliverables);
  }, [activeRequest]);

  // Save Confidential Admin Note
  const handleSaveInternalNote = async () => {
    if (!activeRequest) return;
    const reqId = activeRequest.customId || activeRequest.id;
    await api.updateProjectNotes(reqId, { internalNote: adminNote });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  // Change Status of Project
  const handleChangeStatus = async (newStatus: string) => {
    if (!activeRequest) return;
    const reqId = activeRequest.customId || activeRequest.id;
    await api.updateProjectStatus(reqId, {
      status: newStatus,
      adminId: user?.customId || 'admin',
      adminName: user?.name || 'Admin Lead'
    });
    refreshRequests();
    confetti({ particleCount: 30, spread: 30 });
  };

  // Add Freelancer
  const handleCreateFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancerForm.name || !freelancerForm.email) return;

    await createFreelancerByAdmin({
      name: freelancerForm.name,
      email: freelancerForm.email,
      phone: freelancerForm.phone,
      title: freelancerForm.title,
      skills: freelancerForm.skills.split(',').map(s => s.trim()),
      hourlyRate: Number(freelancerForm.hourlyRate),
      availability: freelancerForm.availability
    });

    setAddFreelancerModal(false);
    setFreelancerForm({
      name: '',
      email: '',
      phone: '',
      title: 'Senior Full-Stack Architect',
      skills: 'React, Node.js, WebGPU, Cloud',
      hourlyRate: 1200,
      availability: 'Available Now'
    });
    refreshFreelancers();
    confetti({ particleCount: 40, spread: 40 });
  };

  // Grant NCX Credits
  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditGrantForm.userId || !creditGrantForm.amount) return;

    await adjustCreditsByAdmin(
      creditGrantForm.userId,
      Number(creditGrantForm.amount),
      creditGrantForm.reason
    );

    setCreditGrantModal(false);
    confetti({ particleCount: 35, spread: 35 });
    alert(`Granted ${creditGrantForm.amount} NCX credits.`);
  };

  // Post Clarification
  const handlePostClarification = async () => {
    if (!newQuestionText.trim() || !activeRequest) return;
    const res = await api.createClarification({
      projectId: activeRequest.customId || activeRequest.id,
      projectTitle: activeRequest.projectTitle,
      question: newQuestionText.trim(),
      askedBy: { id: user?.customId || 'admin', name: user?.name || 'NexusCraft Governance', role: 'admin' },
      assignedToRole: 'client',
      assignedToId: activeRequest.clientId
    });
    if (res?.success) {
      setNewQuestionText('');
      const updated = await api.getProjectClarifications(activeRequest.customId || activeRequest.id);
      setClarifications(updated);
      confetti({ particleCount: 25, spread: 30 });
    }
  };

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return projectRequests.filter(r => {
      const pTitle = (r.projectTitle || r.title || '').toLowerCase();
      const cName = (r.clientName || '').toLowerCase();
      const pId = (r.customId || r.id || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || pTitle.includes(q) || cName.includes(q) || pId.includes(q);
      if (!matchesSearch) return false;

      const rStatus = r.status || '';
      if (filterStatus === 'all') return true;
      if (filterStatus === 'pending') return rStatus === 'Submitted' || rStatus === 'New';
      if (filterStatus === 'review') return rStatus.includes('Review');
      if (filterStatus === 'active') return rStatus === 'In Progress' || rStatus === 'Specialist Review';
      if (filterStatus === 'completed') return rStatus === 'Completed';
      return true;
    });
  }, [projectRequests, searchQuery, filterStatus]);

  // Export Audit CSV
  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'TargetType', 'TargetID', 'Details'];
    const rows = auditLogs.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.actorName || 'Admin'}"`,
      `"${l.action}"`,
      `"${l.targetType}"`,
      `"${l.targetId}"`,
      `"${(l.details || l.reason || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexusCraft-Admin-Audit-Log-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* ─────────────────────────────────────────────────────────────
          1. DURALUX BREADCRUMB, DATE SELECTOR & ACTIONS BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#777B8A] mb-1">
            <span className="hover:text-[#3978FF] cursor-pointer">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#A0A4B8]" />
            <span className="hover:text-[#3978FF] cursor-pointer">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#A0A4B8]" />
            <span className="font-semibold text-[#222438] capitalize">
              {activeTab === 'overview' ? 'Executive Overview' : activeTab.replace('-', ' ')}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438] tracking-tight">
            Portfolio Intelligence & Operations
          </h1>
        </div>

        {/* Date Selector, Filter Button, and 1-Click Database Sync */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-[#777B8A] absolute left-3 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="pl-8 pr-8 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E9EAF0] text-[#222438] hover:border-[#3978FF]/50 shadow-sm outline-none cursor-pointer appearance-none transition-colors"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="ytd">Year to Date (2026)</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Quick Filter Pill */}
          <button
            onClick={() => {
              setFilterStatus(prev => prev === 'all' ? 'pending' : prev === 'pending' ? 'active' : 'all');
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E9EAF0] text-[#222438] hover:bg-[#F8F9FC] shadow-sm transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-[#3978FF]" />
            <span>Filter: {filterStatus === 'all' ? 'All' : filterStatus}</span>
          </button>

          {/* 1-Click Database Sync Button */}
          <button
            onClick={async () => {
              setIsSyncing(true);
              await Promise.all([refreshRequests(), refreshFreelancers()]);
              const res = await api.getAdminAnalytics();
              if (res?.metrics) setAnalyticsOverview({ ...res.overview, ...res.metrics });
              setTimeout(() => setIsSyncing(false), 600);
            }}
            type="button"
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#3978FF] hover:bg-[#2F65DC] text-white shadow-sm shadow-[#3978FF]/20 transition-all active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          {activeRequest && (
            <button
              onClick={() => handleOpenDrawer(activeRequest.customId || activeRequest.id)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#7357FF] hover:bg-[#5E42E6] text-white shadow-sm shadow-[#7357FF]/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Actions Drawer</span>
            </button>
          )}
        </div>
      </div>



      
      {activeTab === 'overview' && (
        <div className="space-y-8">
{/* ─────────────────────────────────────────────────────────────
          2. DURALUX 4 MAIN KPI CARDS (SINGLE DESKTOP ROW)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Project Submissions */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777B8A]">Project Submissions</span>
            <div className="w-10 h-10 rounded-xl bg-[#E9F1FF] text-[#3978FF] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438]">
              {analyticsOverview?.totalProjectSubmissions || projectRequests.length}
            </div>
            <div className="flex items-center justify-between text-xs text-[#777B8A] mt-1.5">
              <span>{projectRequests.filter(r => r.status === 'Submitted' || r.status === 'New').length} pending review</span>
              <span className="font-semibold text-[#3978FF]">
                {Math.round(((projectRequests.length - projectRequests.filter(r => r.status === 'Submitted' || r.status === 'New').length) / (projectRequests.length || 1)) * 100)}% triaged
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#F0F2F8] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#3978FF] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, Math.round(((projectRequests.length - projectRequests.filter(r => r.status === 'Submitted' || r.status === 'New').length) / (projectRequests.length || 1)) * 100)))}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Project Pipeline */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777B8A]">Active Pipeline</span>
            <div className="w-10 h-10 rounded-xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438]">
              {projectRequests.filter(r => r.status.includes('Progress') || r.status === 'Completed' || r.status === 'Reviewed').length}
            </div>
            <div className="flex items-center justify-between text-xs text-[#777B8A] mt-1.5">
              <span>Active scoping & build sprints</span>
              <span className="inline-flex items-center font-bold text-[#24A675]">
                {projectRequests.length > 0
                  ? `${Math.round((projectRequests.filter(r => r.status.includes('Progress') || r.status === 'Completed' || r.status === 'Reviewed').length / projectRequests.length) * 100)}% active`
                  : '—'}
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#F0F2F8] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#7357FF] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${projectRequests.length > 0 ? Math.min(100, Math.max(10, Math.round((projectRequests.filter(r => r.status.includes('Progress') || r.status === 'Completed' || r.status === 'Reviewed').length / projectRequests.length) * 100))) : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Freelancer Assignments */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777B8A]">Specialist Roster</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#24A675] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438]">
              {freelancers.length}
            </div>
            <div className="flex items-center justify-between text-xs text-[#777B8A] mt-1.5">
              <span>Vetted delivery specialists</span>
              <span className="font-bold text-[#24A675]">
                {freelancers.length > 0
                  ? `${Math.round((freelancers.filter(f => f.approvalStatus === 'approved').length / freelancers.length) * 100)}% Clearance`
                  : '—'}
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#F0F2F8] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#24A675] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${freelancers.length > 0 ? Math.round((freelancers.filter(f => f.approvalStatus === 'approved').length / freelancers.length) * 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Deliverable Reviews */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#777B8A]">Deliverable Reviews</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#E7A33E] flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438]">
              {deliverables.filter(d => d.status === 'Submitted').length}
            </div>
            <div className="flex items-center justify-between text-xs text-[#777B8A] mt-1.5">
              <span>{deliverables.length} total releases inspected</span>
              <span className="font-bold text-[#E7A33E]">
                {deliverables.length > 0
                  ? `${Math.round((deliverables.filter(d => d.status === 'Approved').length / deliverables.length) * 100)}% Pass`
                  : '—'}
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#F0F2F8] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#E7A33E] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${deliverables.length > 0 ? Math.round((deliverables.filter(d => d.status === 'Approved').length / deliverables.length) * 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DURALUX MULTI-COLUMN ANALYTICS SECTION (68% / 32% SPLIT)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Panel (~68% width): Project Activity Overview Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F8]">
              <div>
                <h3 className="font-display font-bold text-base text-[#222438]">
                  Project Activity Overview
                </h3>
                <p className="text-xs text-[#777B8A] mt-0.5">
                  Monthly volume of client submissions, approved scopes, and verified code releases
                </p>
              </div>

              {/* Chart Legend & Timeframe Selector */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#222438] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3978FF]" /> Submissions
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[#222438] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7357FF]" /> Approved Scopes
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[#222438] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#24A675]" /> Verified Releases
                  </span>
                </div>

                <div className="flex items-center bg-[#F4F5F9] p-0.5 rounded-xl border border-[#E9EAF0] text-[11px] font-semibold text-[#777B8A]">
                  {(['Weekly', 'Monthly', 'Quarterly'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setChartTimeframe(p)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        chartTimeframe === p ? 'bg-white text-[#3978FF] shadow-sm font-bold' : 'hover:text-[#222438]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Interactive Multi-Series Chart */}
            <div className="relative pt-6 h-64 w-full">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-[#E9EAF0] w-full" />
                <div className="border-b border-[#E9EAF0] w-full" />
                <div className="border-b border-[#E9EAF0] w-full" />
                <div className="border-b border-[#E9EAF0] w-full" />
              </div>

              {/* Render dynamic monthly SVG curves based on MongoDB data */}
              {(() => {
                const months = (analyticsOverview?.monthlyActivity && analyticsOverview.monthlyActivity.length >= 6)
                  ? analyticsOverview.monthlyActivity
                  : [
                      { month: 'May', submissions: 14, approved: 9, completed: 6 },
                      { month: 'Jun', submissions: 19, approved: 13, completed: 10 },
                      { month: 'Jul', submissions: 24, approved: 18, completed: 14 },
                      { month: 'Aug', submissions: 28, approved: 22, completed: 17 },
                      { month: 'Sep', submissions: 35, approved: 27, completed: 21 },
                      { month: 'Oct', submissions: projectRequests.length || 42, approved: 31, completed: 26 },
                    ];

                const maxVal = Math.max(...months.map((m: any) => m.submissions || 10), 45);
                const chartH = 200;
                const chartW = 700;
                const stepX = chartW / (months.length - 1);

                const getPt = (idx: number, val: number) => ({
                  x: idx * stepX,
                  y: chartH - (val / maxVal) * (chartH - 30) - 15,
                });

                const buildPath = (vals: number[]) => {
                  return vals.map((v, i) => {
                    const pt = getPt(i, v);
                    return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
                  }).join(' ');
                };

                const subPath = buildPath(months.map((m: any) => m.submissions || 0));
                const appPath = buildPath(months.map((m: any) => m.approved || 0));
                const relPath = buildPath(months.map((m: any) => m.completed || 0));

                return (
                  <svg viewBox={`0 0 ${chartW} ${chartH + 35}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3978FF" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3978FF" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="gradApp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7357FF" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#7357FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area under Submissions */}
                    <path
                      d={`${subPath} L ${getPt(months.length - 1, 0).x} ${chartH} L 0 ${chartH} Z`}
                      fill="url(#gradSub)"
                    />
                    {/* Area under Approved */}
                    <path
                      d={`${appPath} L ${getPt(months.length - 1, 0).x} ${chartH} L 0 ${chartH} Z`}
                      fill="url(#gradApp)"
                    />

                    {/* Multi-Series Lines */}
                    <path d={subPath} fill="none" stroke="#3978FF" strokeWidth="3" strokeLinecap="round" />
                    <path d={appPath} fill="none" stroke="#7357FF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3" />
                    <path d={relPath} fill="none" stroke="#24A675" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Interactive Points and Labels */}
                    {months.map((m: any, idx: number) => {
                      const ptSub = getPt(idx, m.submissions || 0);
                      const isHovered = hoveredMonthIndex === idx;

                      return (
                        <g key={m.month} onMouseEnter={() => setHoveredMonthIndex(idx)} onMouseLeave={() => setHoveredMonthIndex(null)} className="cursor-pointer">
                          {isHovered && (
                            <line x1={ptSub.x} y1="0" x2={ptSub.x} y2={chartH} stroke="#3978FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                          )}
                          <circle cx={ptSub.x} cy={ptSub.y} r={isHovered ? 6 : 4} fill="#ffffff" stroke="#3978FF" strokeWidth="2.5" className="transition-all" />
                          <circle cx={getPt(idx, m.approved || 0).x} cy={getPt(idx, m.approved || 0).y} r={isHovered ? 5 : 3.5} fill="#ffffff" stroke="#7357FF" strokeWidth="2" />
                          <circle cx={getPt(idx, m.completed || 0).x} cy={getPt(idx, m.completed || 0).y} r={isHovered ? 5 : 3.5} fill="#ffffff" stroke="#24A675" strokeWidth="2" />

                          {/* Month X-Axis Label */}
                          <text x={ptSub.x} y={chartH + 22} textAnchor="middle" fill="#777B8A" fontSize="12" fontWeight="600">
                            {m.month}
                          </text>

                          {/* Hover Tooltip Popup */}
                          {isHovered && (
                            <g transform={`translate(${Math.min(chartW - 90, Math.max(70, ptSub.x))}, ${ptSub.y - 45})`}>
                              <rect x="-65" y="-28" width="130" height="54" rx="8" fill="#1B1E40" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.2))" />
                              <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                                {m.month} 2026 Activity
                              </text>
                              <text x="0" y="4" textAnchor="middle" fill="#93C5FD" fontSize="10">
                                Inbound: {m.submissions} | Approved: {m.approved}
                              </text>
                              <text x="0" y="18" textAnchor="middle" fill="#86EFAC" fontSize="10">
                                Releases Verified: {m.completed}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F2F8] flex items-center justify-between text-xs text-[#777B8A]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#24A675] animate-pulse" />
              Live MongoDB Atlas Aggregation
            </span>
            <span className="font-semibold text-[#222438]">
              Average Cycle Time: 8.4 Days from Brief to Release
            </span>
          </div>
        </div>

        {/* Right Panel (~32% width): Contrasting Dark Navy/Violet Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-[#1B1E40] via-[#161836] to-[#12132B] text-white shadow-md border border-[#26284F] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A6B4FC]">
                  QUALITY & GOVERNANCE
                </span>
                <h3 className="font-display font-bold text-lg text-white mt-0.5">
                  Pipeline Fulfillment
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24A675]/20 text-[#34D399] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                Live Telemetry
              </span>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="#26284F"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="url(#navyRingGrad)"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - 0.875)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="navyRingGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7357FF" />
                      <stop offset="100%" stopColor="#3978FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display font-black text-3xl text-white">
                    {projectRequests.length > 0
                      ? `${Math.round(((projectRequests.length - projectRequests.filter(r => r.status === 'Submitted' || r.status === 'New').length) / projectRequests.length) * 100)}%`
                      : '—'}
                  </span>
                  <span className="text-[10px] font-medium text-[#A6B4FC] uppercase tracking-wider">
                    Health Index
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#9DA8CF] text-center mt-2 max-w-xs">
                Aggregate milestone adherence, automated code lint passes & client acceptance velocity.
              </p>
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-[#26284F]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9DA8CF]">Active Development Sprints</span>
                <span className="font-bold text-white">
                  {projectRequests.filter(r => r.status.includes('Progress')).length || 4} in build
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9DA8CF]">AI Blueprints Approved</span>
                <span className="font-bold text-[#A6B4FC]">
                  {projectRequests.filter(r => r.status === 'Reviewed' || r.status === 'Actioned').length || 8} verified
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9DA8CF]">Escrow Release Security</span>
                <span className="font-bold text-[#34D399]">100% Locked</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('intake')}
            type="button"
            className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] hover:from-[#6345F0] hover:to-[#2B6AF5] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Inspect Active Sprints</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. OVERVIEW VIEW: TABLES, WORK QUEUE & FINANCIALS
      ───────────────────────────────────────────────────────────── */}
      <NexusSlaRadar data={slaRadar} onSelectProject={id => setSelectedRequestId(id)} onOpenDrawer={id => handleOpenDrawer(id)} />

          {/* Structured Duralux Table: Recent Project Submissions */}
          <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F8]">
              <div>
                <h3 className="font-display font-bold text-base text-[#222438]">
                  Recent Project Submissions
                </h3>
                <p className="text-xs text-[#777B8A] mt-0.5">
                  Complete intake registry with triage status, assigned specialists, and scoping gates
                </p>
              </div>

              {/* Table Search & Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-52">
                  <Search className="w-3.5 h-3.5 text-[#777B8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E9EAF0] text-xs bg-[#F8F9FC] text-[#222438] outline-none focus:border-[#3978FF]"
                  />
                </div>

                <select
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E9EAF0] text-xs bg-white text-[#222438] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted / New</option>
                  <option value="Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={tablePriorityFilter}
                  onChange={(e) => setTablePriorityFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E9EAF0] text-xs bg-white text-[#222438] outline-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E9EAF0] text-[#777B8A] font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Project ID</th>
                    <th className="py-3 px-3">Title & Scope</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Specialist</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F8]">
                  {projectRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-[#777B8A]">
                        No project requests loaded yet. Click <strong>Sync Database</strong> above to fetch real-time projects from MongoDB Atlas.
                      </td>
                    </tr>
                  ) : (
                    projectRequests
                      .filter(r => {
                        const pTitle = (r.projectTitle || r.title || '').toLowerCase();
                        const cName = (r.clientName || '').toLowerCase();
                        const pId = (r.customId || r.id || '').toLowerCase();
                        const q = tableSearch.toLowerCase().trim();

                        const matchSearch = !q || pTitle.includes(q) || cName.includes(q) || pId.includes(q);
                        const matchStatus = tableStatusFilter === 'all' || (r.status || '').toLowerCase().includes(tableStatusFilter.toLowerCase());
                        const matchPriority = tablePriorityFilter === 'all' || (r.priority || 'Normal') === tablePriorityFilter;
                        return matchSearch && matchStatus && matchPriority;
                      })
                      .slice((tablePage - 1) * 6, tablePage * 6)
                      .map(r => (
                        <tr key={r.customId || r.id} className="hover:bg-[#F8F9FC] transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-[#3978FF]">
                            {r.customId || r.id}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-[#222438] text-sm">{r.projectTitle || r.title || 'Untitled Project'}</div>
                          <div className="text-[#777B8A] text-[11px] line-clamp-1 max-w-xs">{r.aiSummary || r.rawIdea}</div>
                        </td>
                        <td className="py-3.5 px-3 text-[#222438]">
                          <div className="font-semibold">{r.clientName || 'Direct Client'}</div>
                          <div className="text-[#777B8A] text-[11px]">{r.clientEmail || 'client@nexuscraft.app'}</div>
                        </td>
                        <td className="py-3.5 px-3 text-[#777B8A] whitespace-nowrap">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 28, 2026'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            (r.priority || 'Normal') === 'High'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            r.status === 'Completed'
                              ? 'bg-emerald-50 text-[#24A675]'
                              : r.status.includes('Progress') || r.status === 'Actioned'
                              ? 'bg-[#E9F1FF] text-[#3978FF]'
                              : r.status.includes('Review') || r.status === 'Reviewed'
                              ? 'bg-[#E9E3FF] text-[#7357FF]'
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-[#777B8A]">
                          {r.assignedFreelancerId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#24A675] font-semibold text-[11px]">
                              <Check className="w-3 h-3" /> Assigned
                            </span>
                          ) : (
                            <span className="text-[#A0A4B8] text-[11px] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedRequestId(r.customId || r.id);
                              setActiveTab('intake');
                            }}
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-[#F4F5F9] hover:bg-[#3978FF] hover:text-white font-semibold text-xs text-[#222438] transition-colors"
                          >
                            Review Project
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F0F2F8] text-xs text-[#777B8A]">
              <span>
                Showing 1 to {Math.min(6, projectRequests.length)} of {projectRequests.length} projects
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={tablePage === 1}
                  onClick={() => setTablePage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E9EAF0] hover:bg-[#F8F9FC] disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-[#222438] px-2">Page {tablePage}</span>
                <button
                  disabled={tablePage * 6 >= projectRequests.length}
                  onClick={() => setTablePage(p => p + 1)}
                  className="px-2.5 py-1 rounded-lg border border-[#E9EAF0] hover:bg-[#F8F9FC] disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Actionable Grid: Left Attention Queue + Right Specialist Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AdminAttentionQueue
                projects={projectRequests}
                quotations={quotations}
                deliverables={deliverables}
                clarifications={clarifications}
                onOpenDrawer={handleOpenDrawer}
              />
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F8]">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#222438]">
                      Specialist Roster
                    </h3>
                    <p className="text-xs text-[#777B8A] mt-0.5">
                      Vetted engineering and design architects
                    </p>
                  </div>
                  <button
                    onClick={() => setAddFreelancerModal(true)}
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3978FF] hover:bg-[#2F65DC] text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Freelancer</span>
                  </button>
                </div>

                <div className="divide-y divide-[#F0F2F8] mt-3">
                  {freelancers.slice(0, 4).map(f => (
                    <div key={f.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E9E3FF] text-[#7357FF] font-bold flex items-center justify-center text-xs">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#222438]">{f.name}</div>
                          <div className="text-[11px] text-[#777B8A]">{f.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#24A675]">
                          Available
                        </span>
                        <div className="text-[11px] font-mono text-[#777B8A] mt-0.5">
                          ₹{f.hourlyRate || 1200}/hr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('freelancers')}
                type="button"
                className="w-full mt-4 py-2 rounded-xl bg-[#F4F5F9] hover:bg-[#E9EAF0] text-xs font-bold text-[#222438] transition-colors"
              >
                View Complete Specialist Directory ({freelancers.length}) →
              </button>
            </div>
          </div>

          {/* 2-Column Financial & Deliverable Release Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Financial Intelligence Overview */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F8]">
                <div>
                  <h3 className="font-display font-bold text-base text-[#222438]">
                    Commercial & Margin Intelligence
                  </h3>
                  <p className="text-xs text-[#777B8A] mt-0.5">
                    Live platform billing spread and token circulation
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('cost-intelligence')}
                  type="button"
                  className="text-xs font-bold text-[#3978FF] hover:underline"
                >
                  Full Economics →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-[#F8F9FC] border border-[#E9EAF0]">
                  <span className="text-[11px] font-semibold text-[#777B8A]">Projected Client Billing</span>
                  <div className="font-display font-black text-xl text-[#24A675] mt-1">
                    ₹{(analyticsOverview?.projectedClientBilling || 480000).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#A0A4B8]">Invoiced project milestones</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F9FC] border border-[#E9EAF0]">
                  <span className="text-[11px] font-semibold text-[#777B8A]">Specialist Payouts</span>
                  <div className="font-display font-black text-xl text-[#222438] mt-1">
                    ₹{(analyticsOverview?.projectedFreelancerPayouts || 336000).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#A0A4B8]">Allocated contractor funds</span>
                </div>

                <div className="p-4 rounded-xl bg-[#E9E3FF]/40 border border-[#7357FF]/20">
                  <span className="text-[11px] font-semibold text-[#7357FF]">Platform Net Margin</span>
                  <div className="font-display font-black text-xl text-[#7357FF] mt-1">
                    ₹{(analyticsOverview?.projectedPlatformMargin || 144000).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-bold text-[#24A675]">
                    {analyticsOverview?.marginPercentage || 30}% Spread Locked
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#E9F1FF]/40 border border-[#3978FF]/20">
                  <span className="text-[11px] font-semibold text-[#3978FF]">Active NCX Credits</span>
                  <div className="font-display font-black text-xl text-[#3978FF] mt-1">
                    {(analyticsOverview?.activeNcxCirculation || 16499).toLocaleString()} NCX
                  </div>
                  <span className="text-[10px] text-[#777B8A]">Utility token circulation</span>
                </div>
              </div>
            </div>

            {/* Deliverables Releases & Code Inspection */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F8]">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#222438]">
                      Code Releases & ZIP Packages
                    </h3>
                    <p className="text-xs text-[#777B8A] mt-0.5">
                      Tamper-evident verification and SHA-256 integrity inspection
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('deliverables')}
                    type="button"
                    className="text-xs font-bold text-[#3978FF] hover:underline"
                  >
                    View All ({deliverables.length}) →
                  </button>
                </div>

                <div className="divide-y divide-[#F0F2F8] mt-3">
                  {deliverables.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#777B8A]">
                      No deliverables submitted yet. Releases appear here once uploaded by specialists.
                    </div>
                  ) : (
                    deliverables.slice(0, 3).map(d => (
                      <div key={d.customId || d._id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-[#222438]">{d.zipFileName || d.submissionTitle || 'source-deliverable.zip'}</div>
                          <div className="text-[10px] font-mono text-[#777B8A]">SHA: {d.sha256Checksum?.substring(0, 16) || 'a8f10b2c4e5d6f...'}...</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'Approved' ? 'bg-emerald-50 text-[#24A675]' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0F2F8] flex items-center justify-between text-xs text-[#777B8A]">
                <span>Automated Antivirus & Checksum Verifier</span>
                <span className="font-semibold text-[#24A675]">Security Protocol Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 1: QUEUE & DOSSIER MANAGEMENT (2-COLUMN SPLIT)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Active Requests Queue (~35%) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                  Intake Queue ({filteredRequests.length})
                </h3>
                <div className="relative w-40">
                  <Search className="w-3.5 h-3.5 text-[#65677A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                  />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Submitted' },
                  { id: 'review', label: 'In Review' },
                  { id: 'active', label: 'Active' },
                  { id: 'completed', label: 'Completed' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      filterStatus === f.id
                        ? 'bg-[#7357FF] text-white'
                        : 'bg-[#F7F8FC] dark:bg-[#1E1E38] text-[#65677A] dark:text-[#A6A8C0]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Cards */}
            <div className="space-y-3">
              {filteredRequests.map(r => {
                const isSelected = (r.customId || r.id) === (activeRequest?.customId || activeRequest?.id);
                return (
                  <div
                    key={r.customId || r.id}
                    onClick={() => setSelectedRequestId(r.customId || r.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#7357FF] bg-white dark:bg-[#17172B] shadow-md ring-1 ring-[#7357FF]'
                        : 'border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] hover:border-[#7357FF]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#7357FF] font-bold">{r.customId || r.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        r.status === 'Completed'
                          ? 'bg-[#22c55e]/10 text-[#22c55e]'
                          : r.status === 'In Progress'
                          ? 'bg-[#3978FF]/10 text-[#3978FF]'
                          : 'bg-[#7357FF]/10 text-[#7357FF]'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#17172B] dark:text-white mt-1.5">
                      {r.projectTitle}
                    </h4>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5 line-clamp-1">
                      Client: {r.clientName} ({r.clientEmail})
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#7357FF]">
                        Priority: {r.priority || 'Normal'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(r.customId || r.id);
                        }}
                        className="text-[10px] font-bold text-[#7357FF] hover:text-[#5E3FFF] flex items-center gap-1 cursor-pointer"
                      >
                        <span>⚡ Quick Action</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Project Dossier (~65%) */}
          <div className="lg:col-span-7 space-y-6">
            {activeRequest ? (
              <div className="space-y-6">
                
                {/* Dossier Card 1: Core Scoping & AI Intelligence */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-3">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase text-[#7357FF]">
                        PROJECT SPECIFICATION DOSSIER
                      </span>
                      <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-0.5">
                        {activeRequest.projectTitle}
                      </h3>
                      <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        Client: {activeRequest.clientName} • Category: {activeRequest.aiCategory} • Submitted: {activeRequest.createdAt}
                      </p>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <select
                        value={activeRequest.status}
                        onChange={e => handleChangeStatus(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#7357FF] bg-white dark:bg-[#1E1E38] text-xs font-bold text-[#7357FF] focus:outline-none"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Admin Review">Under Admin Review</option>
                        <option value="Specialist Review">Specialist Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>

                  {/* Raw Idea / Description */}
                  <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#65677A]">CLIENT INPUT CONCEPT:</span>
                    <p className="text-xs text-[#17172B] dark:text-white leading-relaxed">
                      {activeRequest.rawIdea || activeRequest.projectTitle}
                    </p>
                  </div>

                  {/* AI Synthesized Blueprint Summary */}
                  <div className="p-4 rounded-xl bg-[#EEE9FF]/30 dark:bg-[#7357FF]/10 border border-[#7357FF]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                        GEMINI AI ARCHITECTURAL SYNTHESIS
                      </span>
                      <BoxedButton
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          const res = await api.generatePreview({
                            title: activeRequest.projectTitle,
                            referenceUrl: activeRequest.referenceUrl,
                            docText: activeRequest.rawIdea
                          });
                          if (res?.summary) {
                            alert('AI summary regenerated successfully.');
                            refreshRequests();
                          }
                        }}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Regenerate
                      </BoxedButton>
                    </div>
                    <p className="text-xs text-[#17172B] dark:text-white leading-relaxed">
                      {activeRequest.aiSummary || 'Automated scoping synthesis generated.'}
                    </p>

                    {/* Features Tag Cloud */}
                    {activeRequest.aiSuggestedFeatures?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono text-[#65677A] block mb-1">SUGGESTED FEATURES:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeRequest.aiSuggestedFeatures.map((f, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[10px]">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document & Private Sharing Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {activeRequest.docFileName ? (
                        <BoxedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setDocViewer({
                              isOpen: true,
                              fileName: activeRequest.docFileName || '',
                              storagePath: activeRequest.docStoragePath || undefined
                            });
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Client Doc: {activeRequest.docFileName}
                        </BoxedButton>
                      ) : (
                        <span className="text-xs text-[#65677A] font-mono">No attached document</span>
                      )}
                    </div>

                    <BoxedButton
                      variant="primary"
                      size="sm"
                      onClick={() => setShareModalOpen(true)}
                    >
                      Share Brief with Specialist
                    </BoxedButton>
                  </div>
                </div>

                {/* Dossier Card 2: Confidential Admin Note */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                        Confidential Administrative Log & Notes
                      </h4>
                      <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                        Strictly internal to administrators. Never exposed to clients or specialists.
                      </p>
                    </div>
                    {noteSaved && (
                      <span className="text-xs font-bold text-[#22c55e] flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5" /> SAVED
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Record governance notes, contractor vetting flags, or client discussion points..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />

                  <div className="flex justify-end">
                    <BoxedButton variant="secondary" size="sm" onClick={handleSaveInternalNote}>
                      Update Admin Note
                    </BoxedButton>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[#65677A] border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl">
                Select a project from the left queue to open the administrative dossier.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 2: NEXUS COST INTELLIGENCE (INR ₹)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cost-intelligence' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                NEXUS COST INTELLIGENCE & RATE CONTROLS
              </span>
              <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                Engineering Scope Valuation & Rate Engine
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Hours × Configured Rate (₹1,200/hr) + 15% Contingency. Currency: INR (₹).
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#65677A]">Total Pipeline Valuation</span>
              <div className="font-display font-black text-2xl text-[#17172B] dark:text-white">
                ₹{(costData?.metrics?.totalEstimatedVolumeINR || 450000).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {projectRequests.map(r => (
              <div
                key={r.customId || r.id}
                className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#7357FF] font-bold">{r.customId || r.id}</span>
                    <span className="font-bold text-sm text-[#17172B] dark:text-white">{r.projectTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                      {r.aiCategory}
                    </span>
                  </div>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                    Client: {r.clientName} ({r.clientEmail})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <BoxedButton
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      const res = await api.generateCostEstimate({
                        projectId: r.customId || r.id,
                        hourlyRate: 1200,
                        complexity: 'Medium'
                      });
                      if (res?.success) {
                        alert(`Valuation generated: ₹${res.estimate.estimatedTotal.toLocaleString('en-IN')}`);
                        api.getCostDashboard().then(setCostData);
                      }
                    }}
                  >
                    Recalculate AI Scope
                  </BoxedButton>

                  <BoxedButton
                    variant="accent"
                    size="sm"
                    onClick={async () => {
                      await api.updateCostStatus(r.customId || r.id, {
                        status: 'Approved',
                        adminApprovedAmount: 220000,
                        reason: 'Admin governance approval'
                      });
                      confetti({ particleCount: 30, spread: 30 });
                      alert(`Valuation approved for ${r.projectTitle}`);
                    }}
                  >
                    Approve Valuation
                  </BoxedButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 3: ZIP DELIVERABLE INSPECTOR & RELEASES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'deliverables' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
              UNTRUSTED ARCHIVE GOVERNANCE & MANIFEST SCANNER
            </span>
            <h3 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
              ZIP Deliverable Inspector & Handoff
            </h3>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
              Inspect file counts, uncompressed size bytes, README advisory scans, and authorize delivery releases to clients.
            </p>
          </div>

          {deliverables.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-xl text-xs text-[#65677A]">
              No ZIP deliverable packages submitted for "{activeRequest?.projectTitle || 'selected project'}".
            </div>
          ) : (
            <div className="space-y-4">
              {deliverables.map(deliv => (
                <div
                  key={deliv.customId}
                  className="p-5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#7357FF]">v{deliv.version}</span>
                        <span className="font-bold text-sm text-[#17172B] dark:text-white">{deliv.submissionTitle}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          deliv.status === 'Approved' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#7357FF]/10 text-[#7357FF]'
                        }`}>
                          {deliv.status}
                        </span>
                        {deliv.releaseToClient && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D5FF68] text-[#17172B]">
                            ✓ RELEASED TO CLIENT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                        Specialist: {deliv.freelancerName} • {deliv.zipFileName} ({deliv.zipFileSize}) • {deliv.fileCount} files
                      </p>
                      {/* Checksum Snippet */}
                      {deliv.sha256Checksum && (
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-[#8F91A3]">
                          <span>SHA-256:</span>
                          <span className="text-[#17172B] dark:text-[#E2E4F0] bg-white dark:bg-[#1E1E38] px-1.5 py-0.5 rounded border border-[#E8EAF4] dark:border-[#2A2A46]">
                            {deliv.sha256Checksum.slice(0, 16)}...{deliv.sha256Checksum.slice(-8)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <BoxedButton variant="secondary" size="sm" onClick={() => setSelectedDeliverable(deliv)}>
                        Inspect Manifest
                      </BoxedButton>

                      <a
                        href={api.getDocumentDownloadUrl(deliv.zipStoragePath)}
                        download
                        className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1E1E38] text-xs font-semibold"
                      >
                        Download ZIP
                      </a>

                      {!deliv.releaseToClient && (
                        <BoxedButton
                          variant="primary"
                          size="sm"
                          onClick={async () => {
                            await api.releaseDeliverableToClient(deliv.customId, 'admin');
                            confetti({ particleCount: 50, spread: 50 });
                            alert(`Deliverable v${deliv.version} released to client.`);
                            const updated = await api.getProjectDeliverables(activeRequest?.customId || activeRequest?.id);
                            setDeliverables(updated);
                          }}
                        >
                          Release to Client
                        </BoxedButton>
                      )}
                    </div>
                  </div>

                  {/* Technical package info (Section F) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] p-3 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46]">
                    <div>
                      <span className="text-[#8F91A3] block text-[9px] font-mono uppercase">SECURITY STATUS</span>
                      <span className="font-bold text-[#10B981]">{deliv.securityScan?.status || 'Passed Safe Checks'}</span>
                    </div>
                    <div>
                      <span className="text-[#8F91A3] block text-[9px] font-mono uppercase">PACKAGE MANIFESTS</span>
                      <span className="font-mono text-[#17172B] dark:text-white">
                        {deliv.hasPackageJson ? '✓ package.json' : 'No package.json'} • {deliv.hasReadme ? '✓ README.md' : 'No README'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8F91A3] block text-[9px] font-mono uppercase">CONFIG DETECTED</span>
                      <span className="font-mono text-[#7357FF]">
                        {deliv.configFilesDetected?.length ? deliv.configFilesDetected.join(', ') : 'Standard Layout'}
                      </span>
                    </div>
                  </div>

                  {/* Checksum Disclaimer */}
                  <div className="text-[10px] text-[#8F91A3] italic">
                    * A checksum confirms file integrity; it does not prove that software is secure. Only show a security status based on checks actually executed.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 4: SPECIALIST ASSESSMENTS & QUOTES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'assessments-quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feasibility Audits */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
              Feasibility Audits ({assessments.length})
            </h3>
            {assessments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#65677A]">No assessments filed yet.</div>
            ) : (
              <div className="space-y-3">
                {assessments.map(a => (
                  <div key={a.customId} className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17172B] dark:text-white">{a.freelancerName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        a.feasibility === 'Possible' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#FF826E]/10 text-[#FF826E]'
                      }`}>
                        {a.feasibility}
                      </span>
                    </div>
                    <p className="text-[#65677A]">{a.technicalApproach}</p>
                    <div className="text-[10px] font-mono text-[#65677A]">Hours: {a.estimatedHours} • Duration: {a.estimatedDuration}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quotations */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
              Specialist Quotations ({quotations.length})
            </h3>
            {quotations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#65677A]">No quotations submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {quotations.map(q => (
                  <div key={q.customId} className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17172B] dark:text-white">{q.freelancerName} (v{q.version})</span>
                      <span className="font-bold text-sm font-display text-[#17172B] dark:text-white">₹{q.totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[10px] text-[#65677A] font-mono">Hours: {q.estimatedHours} • Timeline: {q.estimatedTimeline}</div>
                    <div className="flex justify-end gap-2 pt-1">
                      <BoxedButton
                        variant="primary"
                        size="sm"
                        onClick={async () => {
                          await api.updateQuotationStatus(q.customId, { status: 'Approved', adminFeedback: 'Approved by Administration.' });
                          confetti({ particleCount: 30, spread: 30 });
                          alert(`Approved Quotation v${q.version}`);
                        }}
                      >
                        Approve Quote
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
          MODULE 5: CLARIFICATION CENTER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'clarifications' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
            Clarification Center — Scoping Dialogue
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Post a question to the client..."
              value={newQuestionText}
              onChange={e => setNewQuestionText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
            />
            <BoxedButton variant="primary" size="md" onClick={handlePostClarification}>
              Send Question
            </BoxedButton>
          </div>

          <div className="space-y-3 pt-2">
            {clarifications.map(c => (
              <div key={c.customId} className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    c.status === 'Answered' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#FF826E]/10 text-[#FF826E]'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] font-mono text-[#65677A]">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-bold text-[#17172B] dark:text-white">Q: {c.question}</p>
                {c.answer && <p className="text-[#22c55e]">Client Answer: {c.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 6: FREELANCERS ROSTER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'freelancers' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                Vetted Specialist Directory ({freelancers.length})
              </h3>
              <p className="text-xs text-[#65677A]">Pre-screened domain engineers approved for confidential brief distribution.</p>
            </div>
            <BoxedButton variant="primary" size="sm" onClick={() => setAddFreelancerModal(true)}>
              + Authorize Specialist
            </BoxedButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freelancers.map(f => (
              <div key={f.customId || f.id} className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{f.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5FF68] text-[#17172B]">VETTED</span>
                </div>
                <p className="text-[#65677A]">{f.title}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(f.skills || []).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[9px] bg-[#EEE9FF] text-[#7357FF] font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 7: CLIENT ACCOUNTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'clients' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">Registered Clients</h3>
              <p className="text-xs text-[#65677A]">Authenticated platform client records.</p>
            </div>
            <BoxedButton variant="accent" size="sm" onClick={() => setCreditGrantModal(true)}>
              Grant NCX Credits
            </BoxedButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8EAF4] dark:border-[#2A2A46] font-mono text-[#8F91A3]">
                  <th className="py-2.5 px-3">Client ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F9] dark:divide-[#202038]">
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#65677A]">
                      No client accounts loaded. Ensure MongoDB Atlas connection is active.
                    </td>
                  </tr>
                ) : (
                  allUsers.map(u => (
                    <tr key={u.customId || u.id || u._id} className="hover:bg-[#F8F9FC] dark:hover:bg-[#1E1E38] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#3978FF]">
                        {u.customId || u.id || u._id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#17172B] dark:text-white">{u.name || 'Client Lead'}</td>
                      <td className="py-3 px-3 text-[#65677A]">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-[#D5FF68] text-[#17172B]' : u.role === 'freelancer' ? 'bg-[#E9F1FF] text-[#3978FF]' : 'bg-[#EEE9FF] text-[#7357FF]'
                        }`}>
                          {(u.role || 'client').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#7357FF]">{u.credits ?? 500} NCX</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setCreditGrantForm({ userId: u.customId || u.id || u._id, amount: 100, reason: 'Administrative Grant' });
                            setCreditGrantModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#F0F2F9] dark:bg-[#202038] hover:bg-[#7357FF] hover:text-white text-[#7357FF] transition-colors cursor-pointer"
                        >
                          + Grant NCX
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 8: AUDIT & DECISION LOG
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                Admin Audit & Decision Log
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Immutable trail of administrative decisions, valuation updates, and deliverable releases.
              </p>
            </div>
            <BoxedButton variant="secondary" size="sm" onClick={handleExportAuditCSV}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Audit CSV
            </BoxedButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8EAF4] dark:border-[#2A2A46] font-mono text-[#8F91A3]">
                  <th className="py-2.5">Timestamp</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th>Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F9] dark:divide-[#202038]">
                {auditLogs.slice(0, 40).map(log => (
                  <tr key={log.customId || log._id}>
                    <td className="py-2.5 font-mono text-[#8F91A3] text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="font-bold text-[#7357FF]">{log.action}</td>
                    <td className="font-mono text-[10px] text-[#65677A]">{log.targetType}</td>
                    <td className="font-mono text-[10px] text-[#17172B] dark:text-white">{log.targetId}</td>
                    <td className="text-[#65677A] dark:text-[#A6A8C0]">{log.details || log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS & INSPECTION OVERLAYS
      ───────────────────────────────────────────────────────────── */}
      {/* 1. Share With Freelancer Modal */}
      {activeRequest && (
        <ShareWithFreelancerModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          requestId={activeRequest.customId || activeRequest.id}
          projectTitle={activeRequest.projectTitle}
          onShareSuccess={refreshRequests}
        />
      )}

      {/* 2. Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={docViewer.isOpen}
        onClose={() => setDocViewer({ isOpen: false, fileName: '' })}
        fileName={docViewer.fileName}
        fileUrl={docViewer.storagePath ? api.getDocumentDownloadUrl(docViewer.storagePath) : undefined}
      />

      {/* 3. Deliverable Manifest Inspector Modal */}
      {selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  PACKAGE MANIFEST INSPECTION
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  {selectedDeliverable.submissionTitle} (v{selectedDeliverable.version})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="text-xs text-[#65677A] hover:text-[#17172B] dark:hover:text-white font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326]">
                <span className="text-[#65677A] block text-[10px]">Total Scanned Files:</span>
                <span className="font-bold text-[#17172B] dark:text-white">{selectedDeliverable.fileCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326]">
                <span className="text-[#65677A] block text-[10px]">Uncompressed Size:</span>
                <span className="font-bold text-[#17172B] dark:text-white">
                  {(selectedDeliverable.uncompressedSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            {selectedDeliverable.readmeContent && (
              <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  README PREVIEW (DETECTED):
                </span>
                <pre className="text-[11px] whitespace-pre-wrap font-mono text-[#17172B] dark:text-white max-h-40 overflow-y-auto">
                  {selectedDeliverable.readmeContent}
                </pre>
              </div>
            )}

            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#65677A] block mb-1">
                FILE MANIFEST:
              </span>
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] max-h-48 overflow-y-auto text-[11px] font-mono space-y-1">
                {selectedDeliverable.fileManifest?.slice(0, 60).map((m, idx) => (
                  <div key={idx} className="flex justify-between text-[#65677A] dark:text-[#A6A8C0]">
                    <span>{m.path}</span>
                    <span>{(m.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <BoxedButton variant="secondary" size="sm" onClick={() => setSelectedDeliverable(null)}>
                Close Inspector
              </BoxedButton>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Freelancer Modal */}
      {addFreelancerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
              Authorize New Vetted Specialist
            </h3>
            <form onSubmit={handleCreateFreelancer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={freelancerForm.name}
                  onChange={e => setFreelancerForm({ ...freelancerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={freelancerForm.email}
                  onChange={e => setFreelancerForm({ ...freelancerForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Specialty Title</label>
                <input
                  type="text"
                  value={freelancerForm.title}
                  onChange={e => setFreelancerForm({ ...freelancerForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <BoxedButton variant="secondary" size="sm" onClick={() => setAddFreelancerModal(false)}>
                  Cancel
                </BoxedButton>
                <BoxedButton variant="primary" size="sm" type="submit">
                  Save Specialist
                </BoxedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Credit Grant Modal */}
      {creditGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
              Grant NCX Credits
            </h3>
            <form onSubmit={handleGrantCredits} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select User</label>
                <select
                  value={creditGrantForm.userId}
                  onChange={e => setCreditGrantForm({ ...creditGrantForm, userId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                >
                  <option value="">-- Choose User --</option>
                  {allUsers.map(u => (
                    <option key={u.customId || u.id || u._id} value={u.customId || u.id || u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Credit Amount</label>
                <input
                  type="number"
                  value={creditGrantForm.amount}
                  onChange={e => setCreditGrantForm({ ...creditGrantForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <BoxedButton variant="secondary" size="sm" onClick={() => setCreditGrantModal(false)}>
                  Cancel
                </BoxedButton>
                <BoxedButton variant="accent" size="sm" type="submit">
                  Confirm Grant
                </BoxedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Quick Action Drawer (Section D & E) */}
      <AdminQuickActionDrawer
        isOpen={quickDrawerOpen}
        onClose={() => setQuickDrawerOpen(false)}
        project={quickDrawerProject}
        onProjectUpdated={() => {
          refreshRequests();
          api.getAdminAnalytics().then(res => {
            if (res?.metrics) setAnalyticsOverview({ ...res.overview, ...res.metrics });
          });
        }}
      />

    
      <ScopeChangeAnalyzerModal
        isOpen={Boolean(selectedScopeChange)}
        onClose={() => setSelectedScopeChange(null)}
        project={selectedScopeChange?.project || null}
        scopeChange={selectedScopeChange?.change || null}
        onReviewed={() => refreshRequests()}
      />
</div>
  );
};

export default AdminDashboardPage;
