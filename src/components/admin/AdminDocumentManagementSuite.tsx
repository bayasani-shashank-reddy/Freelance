import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  Upload,
  Eye,
  Trash2,
  Copy,
  Send,
  Layers,
  FileCheck,
  X,
  RefreshCw,
  Info,
  FileSpreadsheet,
  Edit
} from 'lucide-react';
import { api } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import confetti from 'canvas-confetti';

type DocTab = 'overview' | 'templates' | 'requirements' | 'reviews' | 'compliance';

export const AdminDocumentManagementSuite: React.FC = () => {
  const { user, projectRequests } = useUser();
  const [activeTab, setActiveTab] = useState<DocTab>('overview');
  const [loading, setLoading] = useState(false);

  // Requirements state
  const [requirements, setRequirements] = useState<any[]>([]);
  const [reqFilterCategory, setReqFilterCategory] = useState('All');
  const [reqFilterStatus, setReqFilterStatus] = useState('All');
  const [reqSearch, setReqSearch] = useState('');

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilterStatus, setReviewFilterStatus] = useState('All');

  // Compliance state
  const [complianceOverview, setComplianceOverview] = useState<any>({ summary: {}, projects: [] });

  // Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [reqForm, setReqForm] = useState({
    requirementName: '',
    category: 'Business',
    description: '',
    instructions: '',
    mandatory: true,
    allowedFormats: ['pdf', 'docx'],
    maxFileSize: 20,
    multipleFiles: false,
    maxFileCount: 1,
    dueDate: '',
    visibility: 'Client-visible',
    stage: 'Intake',
    projectId: '',
    status: 'Active',
    referenceFile: null as any
  });
  const [isUploadingRefFile, setIsUploadingRefFile] = useState(false);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Template Modal State (Assign Template)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<any | null>(null);
  const [assignProjectIds, setAssignProjectIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Global Intake Reference Template (Document format required for client project submission)
  const [intakeTemplate, setIntakeTemplate] = useState<any | null>(null);
  const [adminIntakeModalOpen, setAdminIntakeModalOpen] = useState(false);
  const [adminIntakeFile, setAdminIntakeFile] = useState<File | null>(null);
  const [adminIntakeTitle, setAdminIntakeTitle] = useState('');
  const [adminIntakeInstructions, setAdminIntakeInstructions] = useState('');
  const [isSavingIntakeTemplate, setIsSavingIntakeTemplate] = useState(false);
  const adminIntakeFileInputRef = useRef<HTMLInputElement>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState<any | null>(null);
  const [decisionType, setDecisionType] = useState<'approve' | 'revision' | 'reject'>('approve');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewInstructions, setReviewInstructions] = useState('');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Data fetchers
  const loadData = async () => {
    setLoading(true);
    try {
      const [reqsData, tmplsData, revsData, compData, intakeTmplData] = await Promise.all([
        api.getDocumentRequirements({
          category: reqFilterCategory !== 'All' ? reqFilterCategory : undefined,
          status: reqFilterStatus !== 'All' ? reqFilterStatus : undefined,
          search: reqSearch.trim() || undefined
        }),
        api.getDocumentTemplates({ search: templateSearch.trim() || undefined }),
        api.getDocumentReviews({
          status: reviewFilterStatus !== 'All' ? reviewFilterStatus : undefined
        }),
        api.getDocumentComplianceOverview(),
        api.getIntakeReferenceTemplate()
      ]);

      if (Array.isArray(reqsData)) setRequirements(reqsData);
      if (Array.isArray(tmplsData)) setTemplates(tmplsData);
      if (Array.isArray(revsData)) setReviews(revsData);
      if (compData && compData.projects) setComplianceOverview(compData);
      if (intakeTmplData && intakeTmplData.template) {
        setIntakeTemplate(intakeTmplData.template);
        setAdminIntakeTitle(intakeTmplData.template.title || '');
        setAdminIntakeInstructions(intakeTmplData.template.instructions || '');
      }
    } catch (err) {
      console.error('Error loading document suite data:', err);
    }
    setLoading(false);
  };

  const handleOpenAdminIntakeModal = () => {
    setAdminIntakeTitle(intakeTemplate?.title || 'Official Project Specification Template');
    setAdminIntakeInstructions(intakeTemplate?.instructions || '');
    setAdminIntakeFile(null);
    setAdminIntakeModalOpen(true);
  };

  const handleSaveAdminIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingIntakeTemplate(true);

    const formData = new FormData();
    if (adminIntakeFile) {
      formData.append('file', adminIntakeFile);
    }
    formData.append('title', adminIntakeTitle);
    formData.append('instructions', adminIntakeInstructions);
    formData.append('adminId', user?.customId || user?.id || 'admin');
    formData.append('adminName', user?.name || 'Administrator');

    const res = await api.updateIntakeReferenceTemplate(formData);
    setIsSavingIntakeTemplate(false);

    if (res.success && res.template) {
      setIntakeTemplate(res.template);
      setAdminIntakeModalOpen(false);
      confetti({ particleCount: 50, spread: 60 });
      alert('Official project intake reference document updated! Clients will now see this new format on the submission page.');
    } else {
      alert(res.error || 'Failed to update reference document.');
    }
  };

  useEffect(() => {
    loadData();
  }, [reqFilterCategory, reqFilterStatus, reqSearch, templateSearch, reviewFilterStatus]);

  // Handle Reference File Upload by Admin
  const handleRefFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRefFile(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.uploadDocument(formData);
    setIsUploadingRefFile(false);

    if (res.success && res.file) {
      setReqForm(prev => ({
        ...prev,
        referenceFile: {
          originalName: res.file.originalName,
          storagePath: res.file.storagePath,
          fileSize: res.file.size,
          mimeType: res.file.mimeType
        }
      }));
    } else {
      alert(res.error || 'Failed to upload reference document.');
    }
  };

  // Open Builder for Create
  const handleOpenCreateBuilder = () => {
    setEditingReqId(null);
    setReqForm({
      requirementName: '',
      category: 'Business',
      description: '',
      instructions: '',
      mandatory: true,
      allowedFormats: ['pdf', 'docx'],
      maxFileSize: 20,
      multipleFiles: false,
      maxFileCount: 1,
      dueDate: '',
      visibility: 'Client-visible',
      stage: 'Intake',
      projectId: projectRequests[0]?.customId || projectRequests[0]?.id || '',
      status: 'Active',
      referenceFile: null
    });
    setBuilderOpen(true);
  };

  // Open Builder for Edit
  const handleOpenEditBuilder = (req: any) => {
    setEditingReqId(req.customId);
    setReqForm({
      requirementName: req.requirementName,
      category: req.category || 'Business',
      description: req.description || '',
      instructions: req.instructions || '',
      mandatory: req.mandatory !== false,
      allowedFormats: req.allowedFormats || ['pdf', 'docx'],
      maxFileSize: req.maxFileSize || 20,
      multipleFiles: !!req.multipleFiles,
      maxFileCount: req.maxFileCount || 1,
      dueDate: req.dueDate ? new Date(req.dueDate).toISOString().split('T')[0] : '',
      visibility: req.visibility || 'Client-visible',
      stage: req.stage || 'Intake',
      projectId: req.projectId,
      status: req.status || 'Active',
      referenceFile: req.referenceFile || null
    });
    setBuilderOpen(true);
  };

  // Save Requirement Form
  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.requirementName.trim()) {
      alert('Requirement name is required.');
      return;
    }
    if (!reqForm.projectId) {
      alert('Please select an applicable project.');
      return;
    }

    const payload = {
      ...reqForm,
      actorName: user?.name || 'Administrator'
    };

    if (editingReqId) {
      const res = await api.updateDocumentRequirement(editingReqId, payload);
      if (res.success) {
        setBuilderOpen(false);
        loadData();
      } else {
        alert(res.error || 'Failed to update requirement.');
      }
    } else {
      const res = await api.createDocumentRequirement(payload);
      if (res.success) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setBuilderOpen(false);
        loadData();
      } else {
        alert(res.error || 'Failed to create requirement.');
      }
    }
  };

  // Delete Requirement
  const handleDeleteRequirement = async (reqId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document requirement and its submissions?')) return;
    const res = await api.deleteDocumentRequirement(reqId, user?.name || 'Admin');
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to delete requirement.');
    }
  };

  // Duplicate Requirement
  const handleDuplicateRequirement = async (reqId: string) => {
    const res = await api.duplicateDocumentRequirement(reqId);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to duplicate requirement.');
    }
  };

  // Send Reminder
  const handleSendReminder = async (reqId: string) => {
    const res = await api.sendDocumentReminder(reqId, user?.name || 'Admin');
    if (res.success) {
      alert('Reminder notification dispatched to client!');
    } else {
      alert(res.error || 'Failed to dispatch reminder.');
    }
  };

  // Assign Template
  const handleOpenAssignTemplate = (tmpl: any) => {
    setSelectedTemplateForAssign(tmpl);
    setAssignProjectIds([]);
    setAssignModalOpen(true);
  };

  const handleExecuteAssignTemplate = async () => {
    if (!selectedTemplateForAssign || !assignProjectIds.length) {
      alert('Please select at least one project.');
      return;
    }

    setIsAssigning(true);
    const res = await api.assignTemplateToProjects(
      selectedTemplateForAssign.customId,
      assignProjectIds,
      user?.name || 'Administrator'
    );
    setIsAssigning(false);

    if (res.success) {
      confetti({ particleCount: 50, spread: 60 });
      alert(`Successfully generated ${res.count} project document requirements across selected projects!`);
      setAssignModalOpen(false);
      loadData();
    } else {
      alert(res.error || 'Failed to assign template.');
    }
  };

  // Open Review Workspace
  const handleOpenReview = (item: any) => {
    setActiveReviewItem(item);
    setDecisionType('approve');
    setReviewReason('');
    setReviewInstructions('');
    setReviewDeadline('');
    setInternalNotes('');
    setReviewModalOpen(true);
  };

  // Submit Review Decision
  const handleSubmitReviewDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem) return;

    setIsSubmittingReview(true);
    const revId = activeReviewItem.customId;
    const reviewerData = {
      reviewerId: user?.customId || user?.id || 'admin',
      reviewerName: user?.name || 'Administrator',
      internalNotes
    };

    let res: any;
    if (decisionType === 'approve') {
      res = await api.approveDocumentReview(revId, reviewerData);
    } else if (decisionType === 'revision') {
      if (!reviewReason.trim()) {
        alert('Please provide a reason for the revision request.');
        setIsSubmittingReview(false);
        return;
      }
      res = await api.requestDocumentRevision(revId, {
        ...reviewerData,
        reason: reviewReason.trim(),
        instructions: reviewInstructions.trim() || 'Please revise per technical notes and re-upload.',
        revisionDeadline: reviewDeadline ? new Date(reviewDeadline).toISOString() : null
      });
    } else {
      if (!reviewReason.trim()) {
        alert('Please provide a rejection reason.');
        setIsSubmittingReview(false);
        return;
      }
      res = await api.rejectDocumentReview(revId, {
        ...reviewerData,
        reason: reviewReason.trim(),
        instructions: reviewInstructions.trim()
      });
    }

    setIsSubmittingReview(false);

    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setReviewModalOpen(false);
      loadData();
    } else {
      alert(res.error || 'Failed to record review decision.');
    }
  };

  // Metrics computation
  const totalReqs = requirements.length;
  const approvedReqs = requirements.filter(r => r.submissionStatus === 'Approved').length;
  const pendingReviewReqs = reviews.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;
  const revisionReqs = requirements.filter(r => r.submissionStatus === 'Revision Requested').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
              DOCUMENT GOVERNANCE & INTAKE ARCHITECTURE
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-1">
            Document Requirement Management & Review Center
          </h2>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
            Configure dynamic document requirements, manage reusable templates, review client submissions, and audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38] text-[#65677A] dark:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreateBuilder}
            className="px-4 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Document Requirement</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
        {[
          { key: 'overview', label: 'Document Overview', icon: Layers },
          { key: 'templates', label: `Requirement Templates (${templates.length})`, icon: FileSpreadsheet },
          { key: 'requirements', label: `Project Requirements (${requirements.length})`, icon: FileText },
          { key: 'reviews', label: `Pending Reviews (${pendingReviewReqs})`, icon: Clock, badge: pendingReviewReqs > 0 ? pendingReviewReqs : undefined },
          { key: 'compliance', label: 'Compliance Telemetry', icon: FileCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as DocTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#7357FF] text-[#7357FF] bg-[#EEE9FF]/30 dark:bg-[#201F3E]/30'
                  : 'border-transparent text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#7357FF] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-[#65677A] dark:text-[#A6A8C0]">Total Requirements</span>
              <div className="text-3xl font-display font-bold text-[#17172B] dark:text-white mt-1">{totalReqs}</div>
              <span className="text-[10px] text-[#8F91A3]">Across active client projects</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-500">Awaiting Review</span>
              <div className="text-3xl font-display font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingReviewReqs}</div>
              <span className="text-[10px] text-[#8F91A3]">Submissions needing audit</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-500">Approved Documents</span>
              <div className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-1">{approvedReqs}</div>
              <span className="text-[10px] text-[#8F91A3]">Verified & authorized</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-500">Revisions Requested</span>
              <div className="text-3xl font-display font-bold text-rose-600 dark:text-rose-400 mt-1">{revisionReqs}</div>
              <span className="text-[10px] text-[#8F91A3]">Action pending client</span>
            </div>
          </div>

          {/* CLIENT PROJECT INTAKE REFERENCE DOCUMENT (ADMIN MANAGED) */}
          <div className="p-5 rounded-2xl bg-[#F0F4FF] dark:bg-[#151D33] border border-[#3978FF]/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3978FF] text-white">
                    CLIENT SUBMISSION REFERENCE FORMAT
                  </span>
                  <span className="text-[10px] font-mono text-[#8F91A3]">
                    Active on Project Intake Portal (/submit-request)
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white mt-1">
                  {intakeTemplate?.title || 'Official Project Intake Specification Template'}
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5 max-w-2xl leading-relaxed">
                  {intakeTemplate?.instructions || 'This reference template is provided to clients on the project submission portal. Clients download this file to prepare their project specifications according to this exact format.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={api.getDocumentDownloadUrl(intakeTemplate?.storagePath || '/uploads/NexusCraft_Project_Intake_Specification_Template.docx')}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E1E38] border border-[#3978FF]/30 text-[#3978FF] text-xs font-bold hover:bg-[#F5F2FF] transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Format</span>
                </a>
                <button
                  type="button"
                  onClick={handleOpenAdminIntakeModal}
                  className="px-3.5 py-1.5 rounded-xl bg-[#3978FF] hover:bg-[#2D60CC] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Change Reference Document</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0] pt-2 border-t border-[#D5E2FF] dark:border-[#202945]">
              <span>Active File: <strong className="text-[#17172B] dark:text-white">{intakeTemplate?.originalName || 'NexusCraft_Project_Intake_Specification_Template.docx'}</strong></span>
              <span>Size: <strong>{intakeTemplate?.fileSize || '32.5 KB'}</strong></span>
              <span>Last Updated: <strong>{intakeTemplate?.updatedAt ? new Date(intakeTemplate.updatedAt).toLocaleDateString() : 'Initial Setup'}</strong></span>
            </div>
          </div>

          {/* Quick Actions & Recent Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Quick Launcher */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                    Standard Requirement Templates
                  </h3>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                    Deploy pre-vetted document intake suites directly to projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className="text-xs font-semibold text-[#7357FF] hover:underline"
                >
                  View All ({templates.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {templates.slice(0, 3).map(tmpl => (
                  <div
                    key={tmpl.customId}
                    className="p-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#17172B] dark:text-white">{tmpl.name}</h4>
                      <p className="text-[11px] text-[#8F91A3] mt-0.5">
                        {tmpl.requirements?.length || 0} required documents • {tmpl.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignTemplate(tmpl)}
                      className="px-3 py-1.5 rounded-lg bg-[#7357FF] text-white text-xs font-semibold hover:bg-[#6042EE] transition-colors"
                    >
                      Assign to Project
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Submissions Queue */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                    Submissions Requiring Review
                  </h3>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                    Client uploaded files awaiting technical evaluation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs font-semibold text-[#7357FF] hover:underline"
                >
                  Open Review Workspace →
                </button>
              </div>

              {pendingReviewReqs === 0 ? (
                <div className="p-8 text-center text-xs text-[#8F91A3] border border-dashed rounded-xl">
                  No submissions pending review. All documents are reviewed.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews
                    .filter(r => r.status === 'Submitted' || r.status === 'Under Review')
                    .slice(0, 3)
                    .map(item => {
                      return (
                        <div
                          key={item.customId}
                          className="p-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#17172B] dark:text-white">
                                {item.requirementName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-100 text-blue-700">
                                v{item.currentVersionNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8F91A3] mt-0.5 truncate max-w-[220px]">
                              {item.projectTitle} • by {item.clientName || 'Client'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: REQUIREMENT TEMPLATES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F91A3]" />
              <input
                type="text"
                placeholder="Search templates by title or description..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs outline-none focus:border-[#7357FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tmpl => (
              <div
                key={tmpl.customId}
                className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                      {tmpl.category} TEMPLATE
                    </span>
                    <span className="text-[10px] font-mono text-[#8F91A3]">v{tmpl.version || 1}.0</span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono font-bold text-[#8F91A3] uppercase block">
                      Included Requirements ({tmpl.requirements?.length || 0}):
                    </span>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {tmpl.requirements?.map((req: any, i: number) => (
                        <div
                          key={req.reqId || i}
                          className="p-2 rounded-lg bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] text-xs flex items-center justify-between"
                        >
                          <span className="font-medium text-[#17172B] dark:text-white truncate">
                            {req.requirementName}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            req.mandatory ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {req.mandatory ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8F91A3]">
                    Created by {tmpl.createdBy || 'Admin'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAssignTemplate(tmpl)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign to Project</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 3: PROJECT REQUIREMENTS (BUILDER LIST)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F91A3]" />
                <input
                  type="text"
                  placeholder="Search requirement, project, client..."
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF] w-64"
                />
              </div>

              <select
                value={reqFilterCategory}
                onChange={(e) => setReqFilterCategory(e.target.value)}
                aria-label="Filter requirements by category"
                className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Technical">Technical</option>
                <option value="Legal">Legal</option>
                <option value="Financial">Financial</option>
              </select>

              <select
                value={reqFilterStatus}
                onChange={(e) => setReqFilterStatus(e.target.value)}
                aria-label="Filter requirements by status"
                className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateBuilder}
              className="px-3.5 py-1.5 rounded-xl bg-[#7357FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Requirement</span>
            </button>
          </div>

          {/* Requirements Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[10px] font-mono uppercase text-[#65677A] dark:text-[#A6A8C0]">
                  <th className="py-3 px-4">Requirement ID & Name</th>
                  <th className="py-3 px-4">Target Project</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Category & Stage</th>
                  <th className="py-3 px-4">Formats & Max</th>
                  <th className="py-3 px-4">Submission Status</th>
                  <th className="py-3 px-4">Reference File</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF4] dark:divide-[#2A2A46]">
                {requirements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#8F91A3]">
                      No document requirements found. Click "+ Add Requirement" to create one.
                    </td>
                  </tr>
                ) : (
                  requirements.map(req => (
                    <tr key={req.customId} className="hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#17172B] dark:text-white">{req.requirementName}</div>
                        <div className="font-mono text-[10px] text-[#7357FF]">#{req.customId}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#17172B] dark:text-white truncate max-w-[140px]">
                        {req.projectTitle}
                      </td>
                      <td className="py-3 px-4 text-[#65677A] dark:text-[#A6A8C0]">
                        {req.clientName || 'Client'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#17172B] dark:text-white">{req.category}</div>
                        <div className="text-[10px] text-[#8F91A3]">{req.stage}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                        <div>{(req.allowedFormats || ['pdf']).join(', ')}</div>
                        <div className="text-[9px] text-[#8F91A3]">{req.maxFileSize} MB max</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          req.submissionStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.submissionStatus === 'Revision Requested'
                            ? 'bg-amber-100 text-amber-700'
                            : req.submissionStatus === 'Submitted'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.submissionStatus || 'Not Submitted'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {req.referenceFile?.storagePath ? (
                          <a
                            href={api.getDocumentDownloadUrl(req.referenceFile.storagePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#3978FF] hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span className="truncate max-w-[90px]">{req.referenceFile.originalName}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#8F91A3] italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendReminder(req.customId)}
                            title="Send Client Reminder"
                            className="p-1.5 rounded-lg border border-[#E8EAF4] hover:bg-white text-[#7357FF]"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateRequirement(req.customId)}
                            title="Duplicate Requirement"
                            className="p-1.5 rounded-lg border border-[#E8EAF4] hover:bg-white text-[#65677A]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditBuilder(req)}
                            title="Edit Requirement"
                            className="p-1.5 rounded-lg border border-[#E8EAF4] hover:bg-white text-[#17172B]"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequirement(req.customId)}
                            title="Delete Requirement"
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
          SUB-TAB 4: REVIEWS WORKSPACE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#65677A]">Filter Decisions:</span>
              {['All', 'Submitted', 'Approved', 'Revision Requested', 'Rejected'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setReviewFilterStatus(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    reviewFilterStatus === st
                      ? 'bg-[#7357FF] text-white'
                      : 'bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#17172B] border border-dashed text-xs text-[#8F91A3]">
                No document reviews found matching current filter.
              </div>
            ) : (
              reviews.map(item => {
                const latest = item.versions?.[item.versions.length - 1];
                return (
                  <div
                    key={item.customId}
                    className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                          #{item.customId}
                        </span>
                        <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                          {item.requirementName}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          v{item.currentVersionNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'Revision Requested'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                        Project: <strong className="text-[#17172B] dark:text-white">{item.projectTitle}</strong> • Submitted by: <strong>{item.clientName || 'Client'}</strong>
                      </div>

                      {latest && (
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <a
                            href={api.getDocumentDownloadUrl(latest.storagePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#7357FF] font-semibold hover:bg-[#EEE9FF]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {latest.originalName}</span>
                            <span className="font-mono text-[10px] text-[#8F91A3]">({latest.fileSize})</span>
                          </a>
                          <span className="text-[10px] font-mono text-[#8F91A3]">
                            Uploaded {new Date(latest.uploadedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(item)}
                        className="px-4 py-2 rounded-xl bg-[#7357FF] text-white text-xs font-semibold hover:bg-[#6042EE] flex items-center gap-1.5 shadow-xs"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Audit & Decision</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 5: COMPLIANCE TELEMETRY & CSV
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                Project Document Compliance Matrix
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Monitor completion percentage, overdue requirements, and export audit reports.
              </p>
            </div>
            <a
              href={api.getDocumentComplianceExportUrl()}
              target="_blank"
              rel="noreferrer"
              download
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Compliance CSV Report</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceOverview.projects?.map((proj: any) => (
              <div
                key={proj.projectId}
                className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#7357FF] font-bold">#{proj.projectId}</span>
                    <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{proj.projectTitle}</h4>
                    <p className="text-xs text-[#8F91A3]">Client: {proj.clientName || 'Client'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                    proj.isCompliant ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {proj.isCompliant ? 'COMPLIANT' : 'PENDING DOCS'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="text-[#65677A]">Completion Progress</span>
                    <span className="text-[#7357FF]">{proj.completionPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E8EAF4] dark:bg-[#202038] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7357FF] to-emerald-500"
                      style={{ width: `${proj.completionPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-center">
                  <div className="p-2 rounded-lg bg-[#F7F8FC] dark:bg-[#131326]">
                    <div className="font-bold text-xs text-[#17172B] dark:text-white">{proj.totalRequirements}</div>
                    <div className="text-[#8F91A3]">Total</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700">
                    <div className="font-bold text-xs">{proj.approvedDocuments}</div>
                    <div>Approved</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700">
                    <div className="font-bold text-xs">{proj.pendingReview}</div>
                    <div>Under Review</div>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700">
                    <div className="font-bold text-xs">{proj.overdue}</div>
                    <div>Overdue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BUILDER MODAL: CREATE / EDIT REQUIREMENT
      ───────────────────────────────────────────────────────────── */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  REQUIREMENT ARCHITECT
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  {editingReqId ? 'Edit Document Requirement' : 'Create Document Requirement'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBuilderOpen(false)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequirement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Requirement Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Requirement Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Business Requirements Document (BRD)"
                    value={reqForm.requirementName}
                    onChange={(e) => setReqForm({ ...reqForm, requirementName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none focus:border-[#7357FF]"
                  />
                </div>

                {/* Applicable Project */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Applicable Project *
                  </label>
                  <select
                    value={reqForm.projectId}
                    onChange={(e) => setReqForm({ ...reqForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  >
                    {projectRequests.map(p => (
                      <option key={p.customId || p.id} value={p.customId || p.id}>
                        {p.projectTitle} (#{p.customId || p.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Document Category
                  </label>
                  <select
                    value={reqForm.category}
                    onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  >
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Technical">Technical</option>
                    <option value="Legal">Legal</option>
                    <option value="Financial">Financial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Project Stage */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Project Stage
                  </label>
                  <select
                    value={reqForm.stage}
                    onChange={(e) => setReqForm({ ...reqForm, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  >
                    <option value="Intake">Intake</option>
                    <option value="Planning">Planning</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Submission Deadline (Due Date)
                  </label>
                  <input
                    type="date"
                    value={reqForm.dueDate}
                    onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  />
                </div>

                {/* Max File Size (MB) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={reqForm.maxFileSize}
                    onChange={(e) => setReqForm({ ...reqForm, maxFileSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  />
                </div>

                {/* Mandatory Checkbox */}
                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="mandatoryCheck"
                    checked={reqForm.mandatory}
                    onChange={(e) => setReqForm({ ...reqForm, mandatory: e.target.checked })}
                    className="w-4 h-4 text-[#7357FF] rounded cursor-pointer"
                  />
                  <label htmlFor="mandatoryCheck" className="text-xs font-semibold text-[#17172B] dark:text-white cursor-pointer">
                    Mandatory (Compulsory for project completion)
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain what the client must provide..."
                  value={reqForm.description}
                  onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Instructions for Client
                </label>
                <textarea
                  rows={2}
                  placeholder="Step-by-step instructions on preparation, formatting, or sections..."
                  value={reqForm.instructions}
                  onChange={(e) => setReqForm({ ...reqForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* Admin Reference Document Attachment (Separate Entity!) */}
              <div className="p-4 rounded-xl bg-[#F0F4FF] dark:bg-[#151D33] border border-[#3978FF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#3978FF]">
                      Attach Admin Reference Sample or Template
                    </span>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      Attach a sample PDF, Word document, or spec for the client to download as reference.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => refFileInputRef.current?.click()}
                    disabled={isUploadingRefFile}
                    className="px-3 py-1.5 rounded-lg bg-[#3978FF] text-white text-xs font-semibold hover:bg-[#2D60CC] transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingRefFile ? 'Uploading...' : 'Upload File'}</span>
                  </button>
                  <input
                    ref={refFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleRefFileUpload}
                  />
                </div>

                {reqForm.referenceFile && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] text-xs">
                    <span className="font-semibold text-[#17172B] dark:text-white truncate">
                      {reqForm.referenceFile.originalName} ({reqForm.referenceFile.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => setReqForm({ ...reqForm, referenceFile: null })}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setBuilderOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A] hover:bg-[#F5F6FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  {editingReqId ? 'Save Changes' : 'Create Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ASSIGN TEMPLATE MODAL
      ───────────────────────────────────────────────────────────── */}
      {assignModalOpen && selectedTemplateForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  TEMPLATE DEPLOYMENT
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Assign: {selectedTemplateForAssign.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Select the projects where this template's {selectedTemplateForAssign.requirements?.length || 0} requirements should be deployed.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto p-2 border rounded-xl border-[#E8EAF4] dark:border-[#2A2A46]">
                {projectRequests.map(proj => {
                  const id = proj.customId || proj.id;
                  const isChecked = assignProjectIds.includes(id);

                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-[#7357FF] bg-[#F7F5FF] dark:bg-[#1E1B38]'
                          : 'border-transparent hover:bg-[#F7F8FC] dark:hover:bg-[#131326]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setAssignProjectIds(prev =>
                            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                          );
                        }}
                        className="w-4 h-4 text-[#7357FF] rounded"
                      />
                      <div className="truncate">
                        <span className="font-bold text-xs text-[#17172B] dark:text-white block truncate">
                          {proj.projectTitle}
                        </span>
                        <span className="font-mono text-[10px] text-[#8F91A3]">
                          #{id} • {proj.clientName}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAssigning || !assignProjectIds.length}
                onClick={handleExecuteAssignTemplate}
                className="px-5 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isAssigning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Deploy Template Requirements</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REVIEW WORKSPACE MODAL: APPROVE / REVISION / REJECT
      ───────────────────────────────────────────────────────────── */}
      {reviewModalOpen && activeReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  DOCUMENT AUDIT & DECISION WORKSPACE
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  {activeReviewItem.requirementName}
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Project: {activeReviewItem.projectTitle} • Submitted by: {activeReviewItem.clientName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Submitted Version File Card */}
            {activeReviewItem.versions?.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">
                  Latest Uploaded Submission (v{activeReviewItem.currentVersionNumber})
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#7357FF]" />
                    <div>
                      <span className="font-bold text-xs text-[#17172B] dark:text-white block">
                        {activeReviewItem.versions[activeReviewItem.versions.length - 1].originalName}
                      </span>
                      <span className="text-[10px] font-mono text-[#8F91A3]">
                        {activeReviewItem.versions[activeReviewItem.versions.length - 1].fileSize}
                      </span>
                    </div>
                  </div>
                  <a
                    href={api.getDocumentDownloadUrl(
                      activeReviewItem.versions[activeReviewItem.versions.length - 1].storagePath
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#7357FF] text-white text-xs font-semibold hover:bg-[#6042EE] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitReviewDecision} className="space-y-4">
              {/* Decision Type Buttons */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Audit Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType('approve')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      decisionType === 'approve'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-[#E8EAF4] hover:bg-[#F7F8FC] text-[#65677A]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('revision')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      decisionType === 'revision'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                        : 'border-[#E8EAF4] hover:bg-[#F7F8FC] text-[#65677A]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Revision</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('reject')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      decisionType === 'reject'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                        : 'border-[#E8EAF4] hover:bg-[#F7F8FC] text-[#65677A]'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Conditional fields based on decision */}
              {decisionType !== 'approve' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                      Reason for {decisionType === 'revision' ? 'Revision Request' : 'Rejection'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Missing security section, architecture diagrams unreadable..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                      Detailed Correction Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain specifically what changes the client needs to make..."
                      value={reviewInstructions}
                      onChange={(e) => setReviewInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                    />
                  </div>

                  {decisionType === 'revision' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                        New Revision Deadline (Optional)
                      </label>
                      <input
                        type="date"
                        value={reviewDeadline}
                        onChange={(e) => setReviewDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Internal Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Internal Staff Notes (Admin-only, not visible to client)
                </label>
                <textarea
                  rows={2}
                  placeholder="Private observations for operations team..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className={`px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 ${
                    decisionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : decisionType === 'revision'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingReview && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADMIN MODAL: CHANGE GLOBAL INTAKE REFERENCE DOCUMENT TEMPLATE
      ───────────────────────────────────────────────────────────── */}
      {adminIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF]">
                  INTAKE PORTAL GOVERNANCE
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Change Project Intake Reference Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminIntakeModalOpen(false)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminIntake} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  value={adminIntakeTitle}
                  onChange={(e) => setAdminIntakeTitle(e.target.value)}
                  placeholder="e.g. Official Project Intake Specification Template"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none focus:border-[#7357FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Client Instructions (Displayed on /submit-request)
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminIntakeInstructions}
                  onChange={(e) => setAdminIntakeInstructions(e.target.value)}
                  placeholder="Explain the required format, sections, or expectations..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Upload Replacement Reference Document (.docx, .pdf, .zip, etc.)
                </label>

                <input
                  ref={adminIntakeFileInputRef}
                  type="file"
                  accept=".docx,.doc,.pdf,.zip,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAdminIntakeFile(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onClick={() => adminIntakeFileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-[#3978FF]/40 hover:border-[#3978FF] rounded-xl text-center cursor-pointer bg-[#F0F4FF] dark:bg-[#151D33] transition-colors"
                >
                  {adminIntakeFile ? (
                    <div className="text-xs font-bold text-[#3978FF] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{adminIntakeFile.name} ({(adminIntakeFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      <Upload className="w-5 h-5 mx-auto text-[#3978FF]" />
                      <p className="font-semibold text-[#17172B] dark:text-white">Click to select new reference file</p>
                      <p className="text-[10px] text-[#8F91A3]">
                        Current active: {intakeTemplate?.originalName || 'Default DOCX Template'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setAdminIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingIntakeTemplate}
                  className="px-5 py-2 rounded-xl bg-[#3978FF] hover:bg-[#2D60CC] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSavingIntakeTemplate && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Publish Format</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
