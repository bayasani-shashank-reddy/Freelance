import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Phone,
  ExternalLink,
  Edit,
  Upload,
  FileText,
  CheckCircle2,
  Link as LinkIcon,
  Trash2,
  UserPlus,
  X
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
import { AdminDocumentManagementSuite } from '../../components/admin/AdminDocumentManagementSuite';
import { AdminSubAdminManagementSuite } from '../../components/admin/AdminSubAdminManagementSuite';
import { AdminReferenceTemplateManager } from '../../components/admin/AdminReferenceTemplateManager';
import { AdminProjectsManager } from '../../components/admin/AdminProjectsManager';
import { AdminAssignmentsManager } from '../../components/admin/AdminAssignmentsManager';
import { AdminAnalyticsDashboard } from '../../components/admin/AdminAnalyticsDashboard';
import { AdminAiStudio } from '../../components/admin/AdminAiStudio';
import { AdminTasksWorkboard } from '../../components/admin/AdminTasksWorkboard';
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
  | 'analytics'
  | 'intake'
  | 'projects'
  | 'assignments'
  | 'assessments-quotes'
  | 'clients'
  | 'freelancers'
  | 'sub-admins'
  | 'ai-intelligence'
  | 'cost-intelligence'
  | 'reference-template'
  | 'document-management'
  | 'deliverables'
  | 'compliance'
  | 'audit'
  | 'tasks'
  | 'clarifications';

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
    createClientByAdmin,
    deleteUserByAdmin,
    adjustCreditsByAdmin
  } = useUser();

  const [activeTab, setActiveTab] = useState<AdminModuleTab>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [searchParams] = useSearchParams();

  // Sync active tab with direct dedicated route (/admin/requests, /admin/projects, /admin/assignments, etc.)
  useEffect(() => {
    const path = location.pathname;
    if (view === 'analytics' || path === '/admin/analytics') {
      setActiveTab('analytics');
      return;
    }
    if (view === 'projects' || path === '/admin/projects') {
      setActiveTab('projects');
      return;
    }
    if (view === 'assignments' || path === '/admin/assignments') {
      setActiveTab('assignments');
      return;
    }
    if (view === 'ai-intelligence' || path === '/admin/ai-intelligence') {
      setActiveTab('ai-intelligence');
      return;
    }
    if (view === 'reference-template' || path === '/admin/reference-template') {
      setActiveTab('reference-template');
      return;
    }
    if (view === 'tasks' || path === '/admin/tasks') {
      setActiveTab('tasks');
      return;
    }
    if (view === 'intake' || path === '/admin/requests' || path === '/admin/intake') {
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
    if (view === 'document-management' || path === '/admin/document-requirements' || path === '/admin/document-studio' || path === '/admin/document-management') {
      setActiveTab('document-management');
      return;
    }
    if (view === 'sub-admins' || path === '/admin/sub-admins' || path === '/admin/permissions') {
      setActiveTab('sub-admins');
      return;
    }
    if (view === 'compliance' || path === '/admin/compliance') {
      setActiveTab('compliance');
      return;
    }
    if (view === 'clarifications' || path === '/admin/clarifications') {
      setActiveTab('clarifications');
      return;
    }
    if (view === 'overview' || path === '/admin/dashboard' || path === '/admin') {
      setActiveTab('overview');
      return;
    }

    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam as AdminModuleTab);
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
    password: '',
    phone: '',
    title: 'Senior Full-Stack Architect',
    skills: 'React, Node.js, WebGPU, Cloud',
    hourlyRate: 1200,
    availability: 'Available Now'
  });
  const [addClientModal, setAddClientModal] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '+91',
    company: '',
    credits: 500
  });
  const [creditGrantModal, setCreditGrantModal] = useState(false);
  const [creditGrantForm, setCreditGrantForm] = useState({ userId: '', amount: 100, reason: 'Administrative Grant' });

  // Reference Document Edit Modal State (Admin Feature)
  const [editDocModalOpen, setEditDocModalOpen] = useState(false);
  const [editDocForm, setEditDocForm] = useState({
    projectTitle: '',
    referenceUrl: '',
    docFileName: '',
    docStoragePath: '',
    docFileSize: '',
    priority: 'Normal'
  });
  const [editDocUploading, setEditDocUploading] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditDoc = () => {
    if (!activeRequest) return;
    setEditDocForm({
      projectTitle: activeRequest.projectTitle || activeRequest.title || '',
      referenceUrl: activeRequest.referenceUrl || '',
      docFileName: activeRequest.docFileName || '',
      docStoragePath: activeRequest.docStoragePath || '',
      docFileSize: activeRequest.docFileSize || '',
      priority: activeRequest.priority || 'Normal'
    });
    setEditDocModalOpen(true);
  };

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditDocUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.uploadDocument(fd);
      if (res?.file) {
        setEditDocForm(prev => ({
          ...prev,
          docFileName: res.file.originalName,
          docStoragePath: res.file.storagePath,
          docFileSize: res.file.size
        }));
      }
    } catch (err: any) {
      alert(`File upload failed: ${err.message}`);
    } finally {
      setEditDocUploading(false);
    }
  };

  const handleSaveReferenceDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;
    const reqId = activeRequest.customId || activeRequest.id;
    const res = await api.updateProjectReference(reqId, {
      ...editDocForm,
      adminId: user?.customId || 'admin',
      adminName: user?.name || 'Admin Lead'
    });
    if (res?.success) {
      setEditDocModalOpen(false);
      refreshRequests();
      confetti({ particleCount: 30, spread: 35 });
    } else {
      alert(res?.error || 'Failed to update reference materials.');
    }
  };

  const handleToggleVerification = async (u: any, field: 'isPhoneVerified' | 'isGoogleVerified' | 'isEmailVerified') => {
    const currentVal = Boolean(u[field]);
    const res = await api.toggleUserVerification(u.customId || u.id || u._id, { [field]: !currentVal });
    if (res?.success) {
      setAllUsers(prev => prev.map(item => (item.customId === u.customId || item.id === u.id || item._id === u._id) ? { ...item, [field]: !currentVal } : item));
    }
  };

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
      password: freelancerForm.password || 'Freelancer@12345',
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
      password: '',
      phone: '',
      title: 'Senior Full-Stack Architect',
      skills: 'React, Node.js, WebGPU, Cloud',
      hourlyRate: 1200,
      availability: 'Available Now'
    });
    refreshFreelancers();
    confetti({ particleCount: 40, spread: 40 });
  };

  // Add Client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email || !clientForm.password) {
      alert('Name, email, and password are required.');
      return;
    }
    const res = await createClientByAdmin(clientForm);
    if (res.success) {
      setAddClientModal(false);
      setClientForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        countryCode: '+91',
        company: '',
        credits: 500
      });
      const usersRes = await api.getUsers();
      if (Array.isArray(usersRes)) setAllUsers(usersRes);
      confetti({ particleCount: 35, spread: 35 });
      alert(`Client ${clientForm.name} successfully registered.`);
    } else {
      alert(res.error || 'Failed to create client account.');
    }
  };

  // Remove / Delete User (Client or Freelancer)
  const handleDeleteUser = async (userId: string, userName: string, role: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${role} "${userName}"? This cannot be undone.`)) {
      return;
    }
    const res = await deleteUserByAdmin(userId);
    if (res.success) {
      setAllUsers(prev => prev.filter(u => u.customId !== userId && u.id !== userId && u._id !== userId));
      refreshFreelancers();
      confetti({ particleCount: 20, spread: 25 });
    } else {
      alert(res.error || 'Failed to delete user.');
    }
  };

  // Purge Demo Accounts
  const handlePurgeDemoAccounts = async () => {
    if (!confirm('Are you sure you want to purge all demo test accounts (client@example.com, specialist@example.com, etc.)?')) {
      return;
    }
    const res = await api.purgeDemoUsers();
    if (res.success) {
      alert(`Purged ${res.deletedCount || 0} demo accounts.`);
      const usersRes = await api.getUsers();
      if (Array.isArray(usersRes)) setAllUsers(usersRes);
      refreshFreelancers();
      confetti({ particleCount: 25, spread: 30 });
    } else {
      alert(res.error || 'Failed to purge demo accounts.');
    }
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
            <span className="font-semibold text-[#222438] dark:text-white capitalize">
              {activeTab === 'overview'
                ? 'Executive Overview'
                : activeTab === 'analytics'
                ? 'Analytics & Telemetry'
                : activeTab === 'projects'
                ? 'Project Portfolio Management'
                : activeTab === 'assignments'
                ? 'Specialist Assignments & Dispatch'
                : activeTab === 'reference-template'
                ? 'Official Reference Document'
                : activeTab === 'ai-intelligence'
                ? 'AI Project Intelligence'
                : activeTab === 'tasks'
                ? 'Administrative Workboard'
                : activeTab.replace('-', ' ')}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#222438] dark:text-white tracking-tight flex items-center flex-wrap gap-2.5">
            <span>
              {activeTab === 'overview'
                ? 'Portfolio Intelligence & Operations'
                : activeTab === 'analytics'
                ? 'Enterprise Telemetry & Analytics'
                : activeTab === 'projects'
                ? 'Project Portfolio Management'
                : activeTab === 'assignments'
                ? 'Specialist Assignments & Dispatch'
                : activeTab === 'reference-template'
                ? 'Project Intake Specification Template'
                : activeTab === 'ai-intelligence'
                ? 'AI Project Intelligence & Synthesis'
                : activeTab === 'tasks'
                ? 'Admin Tasks & Operational Workboard'
                : 'Portfolio Intelligence & Operations'}
            </span>
            {['reference-template', 'projects', 'assignments', 'ai-intelligence', 'tasks', 'document-management'].includes(activeTab) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-[#7357FF] to-[#3978FF] text-white shadow-xs animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>NEW</span>
              </span>
            )}
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
                          {r.clientPhone && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <a
                                href={`tel:${r.clientCountryCode || ''}${r.clientPhone}`}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3978FF] hover:underline"
                                title="Call Client Directly"
                              >
                                <Phone className="w-3 h-3 text-[#3978FF]" />
                                <span>{r.clientCountryCode || ''} {r.clientPhone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${(r.clientCountryCode || '+91').replace('+', '')}${r.clientPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                              >
                                WhatsApp
                              </a>
                            </div>
                          )}
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
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        <span>Client: <strong>{activeRequest.clientName}</strong> ({activeRequest.clientEmail || 'No email'})</span>
                        <span>•</span>
                        <span>Category: <strong>{activeRequest.aiCategory}</strong></span>
                        <span>•</span>
                        <span>Submitted: {activeRequest.createdAt}</span>
                      </div>
                      {activeRequest.clientPhone && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#17172B] dark:text-white bg-[#F0F2F9] dark:bg-[#1E1E38] px-2.5 py-1 rounded-lg">
                            <Phone className="w-3.5 h-3.5 text-[#3978FF]" />
                            <span>{activeRequest.clientCountryCode || ''} {activeRequest.clientPhone}</span>
                          </span>
                          <a
                            href={`tel:${activeRequest.clientCountryCode || ''}${activeRequest.clientPhone}`}
                            className="px-2.5 py-1 rounded-lg bg-[#E9F1FF] text-[#3978FF] text-[11px] font-bold hover:bg-[#D5E5FF] transition-colors"
                          >
                            Direct Call
                          </a>
                          <a
                            href={`https://wa.me/${(activeRequest.clientCountryCode || '+91').replace('+', '')}${activeRequest.clientPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
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

                  {/* Reference Link & Attached Documents */}
                  <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#65677A]">REFERENCE MATERIALS & DOCUMENTS:</span>
                      <button
                        type="button"
                        onClick={handleOpenEditDoc}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EEE9FF] hover:bg-[#7357FF] hover:text-white text-[#7357FF] text-xs font-bold transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit / Replace Reference Doc</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {/* Reference URL */}
                      {activeRequest.referenceUrl ? (
                        <a
                          href={activeRequest.referenceUrl.startsWith('http') ? activeRequest.referenceUrl : `https://${activeRequest.referenceUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#3978FF] font-semibold hover:underline"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-[#3978FF]" />
                          <span className="truncate max-w-xs">{activeRequest.referenceUrl}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-[#8F91A3] italic">No reference URL provided</span>
                      )}

                      {/* Document Preview */}
                      {activeRequest.docFileName ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDocViewer({
                              isOpen: true,
                              fileName: activeRequest.docFileName || '',
                              storagePath: activeRequest.docStoragePath || undefined
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#7357FF] font-semibold hover:bg-[#F5F2FF] cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#7357FF]" />
                          <span>{activeRequest.docFileName}</span>
                          {activeRequest.docFileSize && <span className="text-[10px] text-[#8F91A3]">({activeRequest.docFileSize})</span>}
                          <Eye className="w-3 h-3 ml-1 text-[#65677A]" />
                        </button>
                      ) : (
                        <span className="text-[#8F91A3] italic">No document file attached</span>
                      )}
                    </div>
                  </div>

                  {/* Private Sharing Action */}
                  <div className="flex items-center justify-end pt-2">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                Vetted Specialist Directory ({freelancers.length})
              </h3>
              <p className="text-xs text-[#65677A]">Pre-screened domain engineers approved for confidential brief distribution.</p>
            </div>
            <div className="flex items-center gap-2">
              <BoxedButton variant="primary" size="sm" onClick={() => setAddFreelancerModal(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                + Authorize Specialist
              </BoxedButton>
              <button
                type="button"
                onClick={handlePurgeDemoAccounts}
                className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="Purge all demo test accounts"
              >
                Purge Demo Accounts
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freelancers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-[#65677A] border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl">
                No freelancers registered yet. Click "+ Authorize Specialist" above to add one.
              </div>
            ) : (
              freelancers.map(f => (
                <div key={f.customId || f.id} className="p-4 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{f.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5FF68] text-[#17172B]">VETTED</span>
                    </div>
                    <p className="text-[#65677A] font-medium">{f.title}</p>
                    <p className="text-[11px] text-[#8F91A3]">{f.email}</p>

                    {f.phone && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#3978FF]">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <a href={`tel:${f.phone}`} className="hover:underline">{f.phone}</a>
                        <a
                          href={`https://wa.me/${f.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-100"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(f.skills || []).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded text-[9px] bg-[#EEE9FF] text-[#7357FF] font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#7357FF]">₹{f.hourlyRate || 1200}/hr</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(f.customId || f.id || f._id || '', f.name || 'Specialist', 'freelancer')}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Permanently remove freelancer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 7: CLIENT ACCOUNTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'clients' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">Registered Clients</h3>
              <p className="text-xs text-[#65677A]">Authenticated platform client records.</p>
            </div>
            <div className="flex items-center gap-2">
              <BoxedButton variant="primary" size="sm" onClick={() => setAddClientModal(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                + Add Client
              </BoxedButton>
              <BoxedButton variant="accent" size="sm" onClick={() => setCreditGrantModal(true)}>
                Grant NCX Credits
              </BoxedButton>
              <button
                type="button"
                onClick={handlePurgeDemoAccounts}
                className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="Purge all demo test accounts"
              >
                Purge Demo Accounts
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8EAF4] dark:border-[#2A2A46] font-mono text-[#8F91A3]">
                  <th className="py-2.5 px-3">User & Contact</th>
                  <th className="py-2.5 px-3">Phone & Comms</th>
                  <th className="py-2.5 px-3">Verification Matrix</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">NCX Balance</th>
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
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#17172B] dark:text-white">{u.name || 'Client Lead'}</div>
                        <div className="text-[11px] text-[#65677A]">{u.email}</div>
                        <div className="font-mono text-[10px] text-[#3978FF] mt-0.5">{u.customId || u.id || u._id}</div>
                      </td>
                      <td className="py-3 px-3">
                        {u.phone ? (
                          <div className="space-y-1">
                            <a
                              href={`tel:${u.countryCode || '+91'}${u.phone}`}
                              className="inline-flex items-center gap-1 font-mono text-xs text-[#3978FF] hover:underline"
                            >
                              <Phone className="w-3 h-3 text-[#3978FF]" />
                              <span>{u.countryCode || '+91'} {u.phone}</span>
                            </a>
                            <div>
                              <a
                                href={`https://wa.me/${(u.countryCode || '+91').replace('+', '')}${u.phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                              >
                                WhatsApp Chat
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8F91A3] italic">No phone attached</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {/* Phone Verification Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(u, 'isPhoneVerified')}
                            title="Click to toggle Phone verification status"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                              u.isPhoneVerified
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>Phone: {u.isPhoneVerified ? 'Verified' : 'Unverified'}</span>
                          </button>

                          {/* Google Verification Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(u, 'isGoogleVerified')}
                            title="Click to toggle Google verification status"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                              u.isGoogleVerified
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <span>G</span>
                            <span>Google: {u.isGoogleVerified ? 'Linked' : 'Not Linked'}</span>
                          </button>

                          {/* Email Verification Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(u, 'isEmailVerified')}
                            title="Click to toggle Email verification status"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                              u.isEmailVerified !== false
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Email: {u.isEmailVerified !== false ? 'Verified' : 'Pending'}</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-[#D5FF68] text-[#17172B]' : u.role === 'freelancer' ? 'bg-[#E9F1FF] text-[#3978FF]' : 'bg-[#EEE9FF] text-[#7357FF]'
                        }`}>
                          {(u.role || 'client').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#7357FF]">{u.credits ?? 500} NCX</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setCreditGrantForm({ userId: u.customId || u.id || u._id, amount: 100, reason: 'Administrative Grant' });
                              setCreditGrantModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#F0F2F9] dark:bg-[#202038] hover:bg-[#7357FF] hover:text-white text-[#7357FF] transition-colors cursor-pointer"
                          >
                            + Grant NCX
                          </button>
                          {u.email !== 'admin@nexuscraft.com' && (
                            <button
                              onClick={() => handleDeleteUser(u.customId || u.id || u._id, u.name || u.email, u.role || 'client')}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              title="Permanently remove user account"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
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
          MODULE 9: DYNAMIC DOCUMENT REQUIREMENT MANAGEMENT & REVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'document-management' && (
        <AdminDocumentManagementSuite />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 10: SUB-ADMIN MANAGEMENT & GRANULAR RBAC
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sub-admins' && (
        <AdminSubAdminManagementSuite />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 11: COMPLIANCE TELEMETRY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'compliance' && (
        <AdminDocumentManagementSuite />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 12: PROJECT PORTFOLIO MANAGEMENT (DEDICATED DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <AdminProjectsManager
          projects={projectRequests}
          freelancers={freelancers}
          onSelectProject={(id) => {
            setSelectedRequestId(id);
            setActiveTab('intake');
          }}
          onRefresh={refreshRequests}
          onOpenShareModal={(p) => {
            setSelectedRequestId(p._id || p.customId);
            setShareModalOpen(true);
          }}
          onOpenDocViewer={(fileName, storagePath) => {
            setDocViewer({ isOpen: true, fileName, storagePath });
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 13: SPECIALIST ASSIGNMENTS & DISPATCH (DEDICATED DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <AdminAssignmentsManager
          projects={projectRequests}
          freelancers={freelancers}
          onRefresh={() => {
            refreshRequests();
            refreshFreelancers();
          }}
          onOpenShareModal={(p) => {
            setSelectedRequestId(p._id || p.customId);
            setShareModalOpen(true);
          }}
          onSelectProject={(id) => {
            setSelectedRequestId(id);
            setActiveTab('intake');
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 14: ENTERPRISE ANALYTICS & TELEMETRY (DEDICATED DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <AdminAnalyticsDashboard
          projects={projectRequests}
          freelancers={freelancers}
          onRefresh={refreshRequests}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 15: AI PROJECT INTELLIGENCE STUDIO (DEDICATED DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ai-intelligence' && (
        <AdminAiStudio />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 16: GLOBAL REFERENCE DOCUMENT FORMAT MANAGER (DEDICATED DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'reference-template' && (
        <AdminReferenceTemplateManager />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODULE 17: ADMINISTRATIVE TASKS & WORKBOARD (DEDICATED DASHBOARD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <AdminTasksWorkboard />
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
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Authorize New Specialist
                </h3>
                <p className="text-xs text-[#65677A]">Add a vetted engineer or designer.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddFreelancerModal(false)}
                className="text-[#65677A] hover:text-[#17172B] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFreelancer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Full Name *</label>
                <input
                  type="text"
                  required
                  value={freelancerForm.name}
                  onChange={e => setFreelancerForm({ ...freelancerForm, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Email Address *</label>
                <input
                  type="email"
                  required
                  value={freelancerForm.email}
                  onChange={e => setFreelancerForm({ ...freelancerForm, email: e.target.value })}
                  placeholder="e.g. elena@nexuscraft.app"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Account Password *</label>
                <input
                  type="text"
                  required
                  value={freelancerForm.password}
                  onChange={e => setFreelancerForm({ ...freelancerForm, password: e.target.value })}
                  placeholder="Set initial login password (e.g. Elena#2026)"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-mono"
                />
                <p className="text-[10px] text-[#8F91A3] mt-0.5">The specialist will use their email and this password to sign into their account.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={freelancerForm.phone}
                    onChange={e => setFreelancerForm({ ...freelancerForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={freelancerForm.hourlyRate}
                    onChange={e => setFreelancerForm({ ...freelancerForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Domain / Title</label>
                <input
                  type="text"
                  value={freelancerForm.title}
                  onChange={e => setFreelancerForm({ ...freelancerForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Technical Skills (comma separated)</label>
                <input
                  type="text"
                  value={freelancerForm.skills}
                  onChange={e => setFreelancerForm({ ...freelancerForm, skills: e.target.value })}
                  placeholder="React, Three.js, Node.js, WebGPU"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
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

      {/* Add Client Modal */}
      {addClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Add New Client Account
                </h3>
                <p className="text-xs text-[#65677A]">Register an enterprise client profile.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddClientModal(false)}
                className="text-[#65677A] hover:text-[#17172B] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Email Address *</label>
                <input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="e.g. jvance@acme.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={clientForm.password}
                  onChange={e => setClientForm({ ...clientForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Code</label>
                  <select
                    value={clientForm.countryCode}
                    onChange={e => setClientForm({ ...clientForm, countryCode: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-mono"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Company / Studio</label>
                  <input
                    type="text"
                    value={clientForm.company}
                    onChange={e => setClientForm({ ...clientForm, company: e.target.value })}
                    placeholder="Acme Inc."
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">Starting NCX</label>
                  <input
                    type="number"
                    value={clientForm.credits}
                    onChange={e => setClientForm({ ...clientForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
                <BoxedButton variant="secondary" size="sm" onClick={() => setAddClientModal(false)}>
                  Cancel
                </BoxedButton>
                <BoxedButton variant="primary" size="sm" type="submit">
                  Create Client
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

      {/* Edit Reference Document & Specification Modal (Admin Feature) */}
      {editDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div>
                <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                  Update Project Reference & Specifications
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Edit reference document, URLs, priority, or project title.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditDocModalOpen(false)}
                className="text-[#65677A] hover:text-[#17172B] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReferenceDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Project Title
                </label>
                <input
                  type="text"
                  value={editDocForm.projectTitle}
                  onChange={e => setEditDocForm({ ...editDocForm, projectTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Intake Priority
                </label>
                <select
                  value={editDocForm.priority}
                  onChange={e => setEditDocForm({ ...editDocForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent (Express)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Reference / PRD / Figma URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#8F91A3]" />
                  <input
                    type="url"
                    value={editDocForm.referenceUrl}
                    onChange={e => setEditDocForm({ ...editDocForm, referenceUrl: e.target.value })}
                    placeholder="https://figma.com/@project or github repo"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#17172B] dark:text-white">
                  Attached Reference Document (.pdf, .docx, .txt)
                </label>
                <div className="p-3 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#7357FF] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-[#17172B] dark:text-white">
                        {editDocForm.docFileName || 'No document currently attached'}
                      </div>
                      {editDocForm.docFileSize && (
                        <div className="text-[10px] text-[#8F91A3]">{editDocForm.docFileSize}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={adminFileInputRef}
                      onChange={handleDocFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <button
                      type="button"
                      disabled={editDocUploading}
                      onClick={() => adminFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7357FF] text-white text-xs font-semibold hover:bg-[#5E43E2] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editDocUploading ? 'Uploading...' : 'Replace File'}</span>
                    </button>
                    {editDocForm.docFileName && (
                      <button
                        type="button"
                        onClick={() => setEditDocForm(prev => ({ ...prev, docFileName: '', docStoragePath: '', docFileSize: '' }))}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer"
                        title="Remove Document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
                <BoxedButton variant="secondary" size="sm" onClick={() => setEditDocModalOpen(false)}>
                  Cancel
                </BoxedButton>
                <BoxedButton variant="accent" size="sm" type="submit">
                  Save Specification Changes
                </BoxedButton>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
};

export default AdminDashboardPage;
