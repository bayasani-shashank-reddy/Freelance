import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileCheck,
  History,
  Info,
  RefreshCw,
  Calendar,
  X,
  Eye
} from 'lucide-react';
import { api } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import confetti from 'canvas-confetti';

interface Requirement {
  customId: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  requirementName: string;
  category: string;
  description: string;
  instructions: string;
  mandatory: boolean;
  allowedFormats: string[];
  maxFileSize: number;
  multipleFiles: boolean;
  maxFileCount: number;
  referenceFile?: {
    originalName: string;
    storagePath: string;
    fileSize: string;
    mimeType: string;
  } | null;
  dueDate?: string | null;
  stage: string;
  visibility: string;
  status: string;
  submissionStatus: 'Not Submitted' | 'Submitted' | 'Under Review' | 'Approved' | 'Revision Requested' | 'Rejected' | 'Overdue';
  submission?: any;
  latestVersionNumber?: number;
}

interface Metrics {
  total: number;
  submitted: number;
  approved: number;
  pending: number;
  revision: number;
  rejected: number;
  overdue: number;
  completionPercent: number;
}

export const ClientDocumentRequirementsPortal: React.FC = () => {
  const { user, projectRequests } = useUser();
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
    revision: 0,
    rejected: 0,
    overdue: 0,
    completionPercent: 0
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Upload modal state
  const [uploadModalReq, setUploadModalReq] = useState<Requirement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientNotes, setClientNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History modal state
  const [historyModalReq, setHistoryModalReq] = useState<Requirement | null>(null);
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch client requirements
  const fetchRequirements = async () => {
    if (!user) return;
    setLoading(true);
    const clientId = user.customId || user.id;
    const projId = selectedProjectId !== 'all' ? selectedProjectId : undefined;
    const res = await api.getClientDocumentRequirements(clientId, projId);

    if (res && res.requirements) {
      setRequirements(res.requirements);
      setMetrics(res.metrics || {
        total: 0,
        submitted: 0,
        approved: 0,
        pending: 0,
        revision: 0,
        rejected: 0,
        overdue: 0,
        completionPercent: 0
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequirements();
  }, [user, selectedProjectId]);

  // Open Upload Modal
  const handleOpenUpload = (req: Requirement) => {
    setUploadModalReq(req);
    setSelectedFile(null);
    setClientNotes('');
    setUploadError(null);
    setUploadSuccess(null);
  };

  // Handle file drop or selection
  const handleFileSelect = (file: File) => {
    if (!uploadModalReq) return;

    // Check size
    const maxBytes = (uploadModalReq.maxFileSize || 20) * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File exceeds maximum size of ${uploadModalReq.maxFileSize} MB.`);
      setSelectedFile(null);
      return;
    }

    // Check format
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (uploadModalReq.allowedFormats && uploadModalReq.allowedFormats.length) {
      const allowed = uploadModalReq.allowedFormats.map(f => f.toLowerCase().trim());
      if (!allowed.includes(ext) && !allowed.includes('*')) {
        setUploadError(`Format .${ext} is not allowed. Administrator requires: ${uploadModalReq.allowedFormats.join(', ')}`);
        setSelectedFile(null);
        return;
      }
    }

    setUploadError(null);
    setSelectedFile(file);
  };

  // Submit file upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalReq || !selectedFile || !user) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('requirementId', uploadModalReq.customId);
    formData.append('clientId', user.customId || user.id);
    formData.append('uploaderName', user.name || 'Client');
    formData.append('uploaderEmail', user.email || '');
    formData.append('clientNotes', clientNotes);

    const res = await api.uploadClientDocumentSubmission(formData);
    setIsUploading(false);

    if (res.success) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      setUploadSuccess(`Version ${res.submission?.currentVersionNumber || 1} submitted successfully! Awaiting admin review.`);
      await fetchRequirements();
      setTimeout(() => {
        setUploadModalReq(null);
      }, 1500);
    } else {
      setUploadError(res.error || 'Failed to upload document.');
    }
  };

  // Open History modal
  const handleOpenHistory = async (req: Requirement) => {
    setHistoryModalReq(req);
    setLoadingHistory(true);
    const data = await api.getDocumentSubmissionHistory(req.customId);
    setHistoryData(data);
    setLoadingHistory(false);
  };

  // Filter requirements by status
  const filteredRequirements = requirements.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.submissionStatus === 'Not Submitted' || r.submissionStatus === 'Overdue';
    if (activeFilter === 'submitted') return r.submissionStatus === 'Submitted' || r.submissionStatus === 'Under Review';
    if (activeFilter === 'approved') return r.submissionStatus === 'Approved';
    if (activeFilter === 'revision') return r.submissionStatus === 'Revision Requested';
    if (activeFilter === 'rejected') return r.submissionStatus === 'Rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Revision Requested
          </span>
        );
      case 'Submitted':
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#1E1E38] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#2A2A46]">
            <Clock className="w-3.5 h-3.5" /> Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Project Filter Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
              Project Intake & Compliance
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-1">
            My Documents & Project Requirements
          </h2>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
            Submit required project documentation requested by your project administrators. Separate from admin reference templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#65677A] dark:text-[#A6A8C0]">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              aria-label="Filter documents by project"
              className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
            >
              <option value="all">All My Projects ({projectRequests.length})</option>
              {projectRequests.map(p => (
                <option key={p.customId || p.id} value={p.customId || p.id}>
                  {p.projectTitle}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchRequirements}
            className="p-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38] text-[#65677A] dark:text-white transition-colors"
            title="Refresh Requirements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4.1 Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#65677A] dark:text-[#A6A8C0] uppercase">Required</div>
          <div className="text-2xl font-bold font-display text-[#17172B] dark:text-white mt-1">{metrics.total}</div>
          <div className="text-[10px] text-[#8F91A3] mt-0.5">Assigned to projects</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="text-[10px] font-mono font-bold text-blue-500 uppercase">Under Review</div>
          <div className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400 mt-1">{metrics.submitted}</div>
          <div className="text-[10px] text-[#8F91A3] mt-0.5">Submitted by you</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Approved</div>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">{metrics.approved}</div>
          <div className="text-[10px] text-[#8F91A3] mt-0.5">Verified & accepted</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="text-[10px] font-mono font-bold text-amber-500 uppercase">Revision Req.</div>
          <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">{metrics.revision}</div>
          <div className="text-[10px] text-[#8F91A3] mt-0.5">Changes requested</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="text-[10px] font-mono font-bold text-rose-500 uppercase">Rejected</div>
          <div className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">{metrics.rejected}</div>
          <div className="text-[10px] text-[#8F91A3] mt-0.5">Non-compliant</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="text-[10px] font-mono font-bold text-red-500 uppercase">Overdue</div>
          <div className="text-2xl font-bold font-display text-red-600 dark:text-red-400 mt-1">{metrics.overdue}</div>
          <div className="text-[10px] text-[#8F91A3] mt-0.5">Past deadline</div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#17172B] dark:text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#7357FF]" />
            Document Completion Status:
            <span className="font-mono text-[#7357FF]">{metrics.approved} / {metrics.total} Documents Approved</span>
          </span>
          <span className="font-mono text-sm text-[#7357FF]">{metrics.completionPercent}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#E8EAF4] dark:bg-[#202038] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7357FF] to-[#22c55e] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, metrics.completionPercent))}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: `All Requirements (${requirements.length})` },
          { key: 'pending', label: `Pending Action (${metrics.pending + metrics.overdue})` },
          { key: 'revision', label: `Revision Requested (${metrics.revision})` },
          { key: 'submitted', label: `Under Review (${metrics.submitted})` },
          { key: 'approved', label: `Approved (${metrics.approved})` }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-[#7357FF] text-white shadow-xs'
                : 'bg-white dark:bg-[#17172B] text-[#65677A] dark:text-[#A6A8C0] border border-[#E8EAF4] dark:border-[#2A2A46] hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4.2 Document Requirement Cards Grid */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7357FF]" />
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-2">Loading document requirements...</p>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#17172B] border border-dashed border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
          <FileText className="w-10 h-10 mx-auto text-[#8F91A3]" />
          <h4 className="font-bold text-sm text-[#17172B] dark:text-white">No Document Requirements in this View</h4>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] max-w-md mx-auto">
            {requirements.length === 0
              ? 'Your project administrators have not assigned any document requirements yet. When requested, documents will appear here with instructions and templates.'
              : 'No requirements match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequirements.map(req => {
            const hasSubmission = !!req.submission || req.submissionStatus !== 'Not Submitted';
            const isRevisionRequested = req.submissionStatus === 'Revision Requested';
            const isApproved = req.submissionStatus === 'Approved';

            return (
              <div
                key={req.customId}
                className={`p-5 rounded-2xl bg-white dark:bg-[#17172B] border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                  isRevisionRequested
                    ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50/20'
                    : isApproved
                    ? 'border-emerald-300 dark:border-emerald-700/50'
                    : 'border-[#E8EAF4] dark:border-[#2A2A46]'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Tags & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                        #{req.customId}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F2F9] dark:bg-[#202038] text-[#65677A] dark:text-[#A6A8C0]">
                        {req.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F2F9] dark:bg-[#202038] text-[#65677A] dark:text-[#A6A8C0]">
                        {req.stage}
                      </span>
                      {req.mandatory ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                          COMPULSORY
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#202038] text-slate-500">
                          OPTIONAL
                        </span>
                      )}
                    </div>
                    {getStatusBadge(req.submissionStatus)}
                  </div>

                  {/* Requirement Title & Project */}
                  <div>
                    <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                      {req.requirementName}
                    </h3>
                    <p className="text-[11px] font-mono text-[#7357FF] mt-0.5 truncate">
                      Project: {req.projectTitle}
                    </p>
                  </div>

                  {/* Description & Instructions */}
                  {req.description && (
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
                      {req.description}
                    </p>
                  )}

                  {req.instructions && (
                    <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] text-xs text-[#65677A] dark:text-[#A6A8C0] flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#7357FF] flex-shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="text-[#17172B] dark:text-white font-semibold block mb-0.5">Instructions:</strong>
                        {req.instructions}
                      </div>
                    </div>
                  )}

                  {/* Admin Reference Document (Separate Entity!) */}
                  {req.referenceFile && req.referenceFile.storagePath && (
                    <div className="p-3 rounded-xl bg-[#F0F4FF] dark:bg-[#151D33] border border-[#3978FF]/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#3978FF] flex-shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] font-mono uppercase font-bold text-[#3978FF] block">
                            Admin Reference Sample
                          </span>
                          <span className="text-xs font-semibold text-[#17172B] dark:text-white truncate block">
                            {req.referenceFile.originalName}
                          </span>
                        </div>
                      </div>
                      <a
                        href={api.getDocumentDownloadUrl(req.referenceFile.storagePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#3978FF] text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#2D60CC] transition-colors flex-shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Sample
                      </a>
                    </div>
                  )}

                  {/* Submission Restrictions: Formats, Max Size, Due Date */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-[#65677A] dark:text-[#A6A8C0]">
                    <div>
                      <span className="block text-[9px] uppercase text-[#8F91A3]">Formats:</span>
                      <span className="font-bold text-[#17172B] dark:text-white uppercase">
                        {(req.allowedFormats || ['pdf']).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-[#8F91A3]">Max Size:</span>
                      <span className="font-bold text-[#17172B] dark:text-white">
                        {req.maxFileSize || 20} MB
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-[#8F91A3]">Due Date:</span>
                      <span className={`font-bold ${req.submissionStatus === 'Overdue' ? 'text-red-500' : 'text-[#17172B] dark:text-white'}`}>
                        {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'No Deadline'}
                      </span>
                    </div>
                  </div>

                  {/* Revision Feedback Alert Banner */}
                  {isRevisionRequested && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        Administrator Revision Requested
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Please review administrator feedback in submission history and upload an updated version (v{(req.latestVersionNumber || 1) + 1}).
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between gap-2">
                  {hasSubmission ? (
                    <button
                      type="button"
                      onClick={() => handleOpenHistory(req)}
                      className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-semibold text-[#17172B] dark:text-white hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-[#7357FF]" />
                      <span>History (v{req.latestVersionNumber || 1})</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#8F91A3] italic">No submission yet</span>
                  )}

                  <div className="flex items-center gap-2">
                    {isApproved ? (
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Approved File
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenUpload(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{hasSubmission ? 'Upload Revision' : 'Upload Document'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4.3 DOCUMENT UPLOAD MODAL */}
      {uploadModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  DOCUMENT SUBMISSION PORTAL
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Upload: {uploadModalReq.requirementName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalReq(null)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Rules & Allowed specs */}
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#65677A]">Allowed Formats:</span>
                  <span className="font-bold text-[#17172B] dark:text-white uppercase">
                    {(uploadModalReq.allowedFormats || ['pdf']).join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#65677A]">Max File Size:</span>
                  <span className="font-bold text-[#17172B] dark:text-white">
                    {uploadModalReq.maxFileSize || 20} MB
                  </span>
                </div>
                {uploadModalReq.dueDate && (
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#65677A]">Target Deadline:</span>
                    <span className="font-bold text-[#7357FF]">
                      {new Date(uploadModalReq.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Drag & Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-[#7357FF]/40 hover:border-[#7357FF] bg-[#F7F8FC] dark:bg-[#131326]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-bold text-xs text-[#17172B] dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="font-mono text-[10px] text-[#8F91A3]">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose a different file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-[#7357FF] mx-auto stroke-[1.5]" />
                    <p className="font-semibold text-xs text-[#17172B] dark:text-white">
                      Drag & drop your document here, or <span className="text-[#7357FF] underline">browse files</span>
                    </p>
                    <p className="font-mono text-[10px] text-[#8F91A3]">
                      Supported: {(uploadModalReq.allowedFormats || ['pdf']).join(', ')} up to {uploadModalReq.maxFileSize}MB
                    </p>
                  </div>
                )}
              </div>

              {/* Notes input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Submission Notes / Version Comments (Optional)
                </label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="e.g. Added section 4 per architect comments..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* Alerts */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalReq(null)}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'Uploading...' : 'Confirm & Submit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.4 CLIENT DOCUMENT HISTORY DRAWER / MODAL */}
      {historyModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  VERSION AUDIT TRAIL
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  {historyModalReq.requirementName}
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Project: {historyModalReq.projectTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalReq(null)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7357FF]" />
                <p className="text-xs text-[#65677A] mt-2">Loading version history...</p>
              </div>
            ) : !historyData || !historyData.versions || historyData.versions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8F91A3] border border-dashed rounded-xl">
                No versions have been submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17172B] dark:text-white">
                    Historical Versions ({historyData.versions.length})
                  </span>
                  <span className="text-[11px] font-mono text-[#7357FF] font-bold">
                    Current Active: v{historyData.currentVersionNumber}
                  </span>
                </div>

                <div className="space-y-3">
                  {historyData.versions
                    .slice()
                    .reverse()
                    .map((ver: any, index: number) => {
                      const isLatest = ver.versionNumber === historyData.currentVersionNumber;

                      return (
                        <div
                          key={ver.versionNumber || index}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isLatest
                              ? 'border-[#7357FF] bg-[#F7F5FF] dark:bg-[#1E1B38]'
                              : 'border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#7357FF] text-white">
                                v{ver.versionNumber}
                              </span>
                              <span className="font-bold text-xs text-[#17172B] dark:text-white truncate">
                                {ver.originalName}
                              </span>
                              <span className="font-mono text-[10px] text-[#8F91A3]">
                                ({ver.fileSize || 'N/A'})
                              </span>
                            </div>
                            {getStatusBadge(ver.reviewStatus || 'Submitted')}
                          </div>

                          <div className="flex items-center gap-4 text-[10px] font-mono text-[#8F91A3]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ver.uploadedAt).toLocaleString()}
                            </span>
                            <span>Uploaded by: {ver.uploadedBy?.name || 'Client'}</span>
                          </div>

                          {ver.clientNotes && (
                            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] italic bg-white dark:bg-[#131326] p-2.5 rounded-xl border border-[#EEF0F8] dark:border-[#202038]">
                              "{ver.clientNotes}"
                            </p>
                          )}

                          {/* Review feedback section if reviewed */}
                          {ver.reviewFeedback && ver.reviewFeedback.reviewedAt && (
                            <div className="p-3 rounded-xl bg-white dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="font-bold text-[#7357FF]">
                                  REVIEWED BY: {ver.reviewFeedback.reviewerName || 'Administrator'}
                                </span>
                                <span className="text-[#8F91A3]">
                                  {new Date(ver.reviewFeedback.reviewedAt).toLocaleString()}
                                </span>
                              </div>

                              {ver.reviewFeedback.reason && (
                                <p className="text-xs font-semibold text-[#17172B] dark:text-white">
                                  Decision Note: {ver.reviewFeedback.reason}
                                </p>
                              )}

                              {ver.reviewFeedback.instructions && (
                                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                                  Required Action: {ver.reviewFeedback.instructions}
                                </p>
                              )}

                              {ver.reviewFeedback.revisionDeadline && (
                                <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                                  Revision Target Deadline: {new Date(ver.reviewFeedback.revisionDeadline).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Download link for this version */}
                          <div className="pt-2 flex justify-end">
                            <a
                              href={api.getDocumentDownloadUrl(ver.storagePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1E38] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-semibold text-[#7357FF] hover:bg-[#F5F2FF] transition-all inline-flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download v{ver.versionNumber} File</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setHistoryModalReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors"
              >
                Close
              </button>

              {historyModalReq.submissionStatus !== 'Approved' && (
                <button
                  type="button"
                  onClick={() => {
                    const req = historyModalReq;
                    setHistoryModalReq(null);
                    handleOpenUpload(req);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7357FF] text-white font-semibold text-xs hover:bg-[#6042EE] transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Revised Version</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
