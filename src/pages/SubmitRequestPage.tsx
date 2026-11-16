import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Upload,
  X,
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  Coins,
  Cpu,
  Link as LinkIcon,
  Download,
  Edit,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useUser, PROJECT_SUBMISSION_COST } from '../context/UserContext';
import { api } from '../lib/api';
import { BoxedButton } from '../components/shared/BoxedButton';
import confetti from 'canvas-confetti';

export const SubmitRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, submitProjectRequest, credits } = useUser();

  // Form Fields
  const [projectTitle, setProjectTitle] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [clientCountryCode, setClientCountryCode] = useState(user?.countryCode || '+91');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState<{ originalName: string; size: string; mimeType: string; storagePath: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Admin-managed Intake Reference Document Template
  const [intakeTemplate, setIntakeTemplate] = useState<{
    title?: string;
    fileName?: string;
    originalName?: string;
    storagePath?: string;
    fileSize?: string;
    instructions?: string;
    updatedAt?: string;
  } | null>(null);

  const [adminTemplateModalOpen, setAdminTemplateModalOpen] = useState(false);
  const [adminNewTemplateFile, setAdminNewTemplateFile] = useState<File | null>(null);
  const [adminNewTitle, setAdminNewTitle] = useState('');
  const [adminNewInstructions, setAdminNewInstructions] = useState('');
  const [isSavingAdminTemplate, setIsSavingAdminTemplate] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const fetchIntakeTemplate = async () => {
    try {
      const res = await api.getIntakeReferenceTemplate();
      if (res.success && res.template) {
        setIntakeTemplate(res.template);
        setAdminNewTitle(res.template.title || '');
        setAdminNewInstructions(res.template.instructions || '');
      }
    } catch (err) {
      console.error('Failed to load intake reference template:', err);
    }
  };

  React.useEffect(() => {
    fetchIntakeTemplate();
  }, []);

  const handleOpenAdminTemplateModal = () => {
    setAdminNewTitle(intakeTemplate?.title || 'Official Project Specification Template');
    setAdminNewInstructions(intakeTemplate?.instructions || '');
    setAdminNewTemplateFile(null);
    setAdminTemplateModalOpen(true);
  };

  const handleSaveAdminTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdminTemplate(true);

    const formData = new FormData();
    if (adminNewTemplateFile) {
      formData.append('file', adminNewTemplateFile);
    }
    formData.append('title', adminNewTitle);
    formData.append('instructions', adminNewInstructions);
    formData.append('adminId', user?.customId || user?.id || 'admin');
    formData.append('adminName', user?.name || 'Administrator');

    const res = await api.updateIntakeReferenceTemplate(formData);
    setIsSavingAdminTemplate(false);

    if (res.success && res.template) {
      setIntakeTemplate(res.template);
      setAdminTemplateModalOpen(false);
      confetti({ particleCount: 40, spread: 50 });
      alert('Official reference document updated successfully! Clients will now see this new format.');
    } else {
      alert(res.error || 'Failed to update reference document.');
    }
  };

  React.useEffect(() => {
    if (user?.phone) setClientPhone(user.phone);
    if (user?.countryCode) setClientCountryCode(user.countryCode);
  }, [user]);

  // AI Scoping State (FREE Preview)
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<{
    summary: string;
    suggestedFeatures: string[];
    assumptions: string[];
    category: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested Examples for quick start
  const suggestions = [
    'Autonomous Logistics Drone Mesh',
    'Aetheria - AI 3D Model Generator via WebGPU',
    'PulseFlow - Encrypted Telehealth Telemetry',
    'Spatial Audio Kernel for WebAssembly'
  ];

  // Authentication Guard
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7357FF] block mb-1">
              AUTHENTICATION REQUIRED
            </span>
            <h2 className="font-display font-bold text-2xl text-[#17172B] dark:text-white">
              Sign In to Launch Your Project Scope
            </h2>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-2 leading-relaxed">
              Log in or register an account to receive 500 NCX Starter Credits and commission your project brief.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <BoxedButton
              variant="primary"
              size="md"
              onClick={() => navigate('/login?redirect=/submit-request')}
            >
              Sign In
            </BoxedButton>
            <BoxedButton
              variant="accent"
              size="md"
              onClick={() => navigate('/register?redirect=/submit-request')}
            >
              Sign Up (+500 NCX)
            </BoxedButton>
          </div>
        </div>
      </div>
    );
  }

  // Handle File Selection & Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20 MB limit.');
      return;
    }

    setUploadedFile(file);
    setIsUploadingFile(true);
    setFileUploadError(null);

    try {
      // Upload to server via multer
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.uploadDocument(formData);
      if (res.success && res.file) {
        setUploadMetadata(res.file);
      } else {
        setFileUploadError(res.error || 'Failed to upload document to server.');
      }
    } catch (err: any) {
      setFileUploadError(err.message || 'Network error uploading document.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadMetadata(null);
    setFileUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Generate FREE AI Preview
  const handleGeneratePreview = async () => {
    if (!projectTitle.trim()) {
      setAiError('Please enter a project title first.');
      return;
    }

    setAiGenerating(true);
    setAiError(null);

    const res = await api.generatePreview({
      title: projectTitle.trim(),
      referenceUrl: referenceUrl.trim(),
      docText: uploadMetadata ? `Uploaded document: ${uploadMetadata.originalName}` : ''
    });

    setAiGenerating(false);
    if (res.success) {
      setAiPreview({
        summary: res.summary,
        suggestedFeatures: res.suggestedFeatures || [],
        assumptions: res.assumptions || [],
        category: res.category || 'Digital Product'
      });
    } else {
      setAiError(res.error || 'Failed to generate AI preview. You can still submit with your title.');
    }
  };

  // Final Submission (costs 50 NCX)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setSubmitError('Project title is required.');
      return;
    }

    if (isUploadingFile) {
      setSubmitError('Please wait for your reference document to finish uploading before submitting.');
      return;
    }

    if (credits < PROJECT_SUBMISSION_COST) {
      setSubmitError(`Not enough NCX credits. You have ${credits} NCX, but 50 NCX is required.`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      projectTitle: projectTitle.trim(),
      referenceUrl: referenceUrl.trim(),
      clientPhone: clientPhone.trim(),
      clientCountryCode: clientCountryCode.trim(),
      docFileName: uploadMetadata?.originalName || null,
      docFileSize: uploadMetadata?.size || null,
      docFileType: uploadMetadata?.mimeType || null,
      docStoragePath: uploadMetadata?.storagePath || null,
      aiSummary: aiPreview?.summary || '',
      aiSuggestedFeatures: aiPreview?.suggestedFeatures || [],
      aiAssumptions: aiPreview?.assumptions || [],
      aiCategory: aiPreview?.category || 'Digital Product',
      submissionType: uploadedFile ? 'document' : 'title_only'
    };

    const result = await submitProjectRequest(payload);
    setSubmitting(false);

    if (result.success && result.request) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSubmittedRequest(result.request);
    } else {
      setSubmitError(result.error || 'Submission failed. Please check your credit balance.');
    }
  };

  // Submission Success Confirmation Modal / Card
  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#D5FF68] text-[#17172B] flex items-center justify-center mx-auto shadow-md">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7357FF] block mb-1">
              REQUEST REGISTERED: #{submittedRequest.customId || submittedRequest.id}
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
              Project Intake Successfully Dispatched
            </h2>
            <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0] max-w-md mx-auto mt-2 leading-relaxed">
              50 NCX fee deducted. Your project is now queued in the administrator command center for technical triage.
            </p>
          </div>

          {/* Details summary */}
          <div className="p-6 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] text-left space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#65677A] font-bold block">PROJECT INITIATIVE</span>
              <p className="font-display font-bold text-base text-[#17172B] dark:text-white mt-0.5">{submittedRequest.projectTitle}</p>
            </div>
            {submittedRequest.aiSummary && (
              <div className="pt-2 border-t border-[#E8EAF4] dark:border-[#202038]">
                <span className="text-[10px] font-mono uppercase text-[#65677A] font-bold block">AI SCOPING SYNTHESIS</span>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5 leading-relaxed">{submittedRequest.aiSummary}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#E8EAF4] dark:border-[#202038]">
              <span className="text-[#65677A]">Current Pipeline Stage:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#3978FF]">
                {submittedRequest.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <BoxedButton
              variant="primary"
              size="md"
              onClick={() => navigate(`/requests/${submittedRequest.customId || submittedRequest.id}`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View Request Workspace
            </BoxedButton>
            <BoxedButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/client/dashboard')}
            >
              Return to Dashboard
            </BoxedButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* ─────────────────────────────────────────────────────────────
          1. COLORFUL HEADER BANNER (STITCH DESIGN)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] dark:text-[#9C8AFF]">
              PROJECT INTAKE PORTAL · STAGE 01
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
            Transform Your Concept into a Production Spec
          </h1>
          <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0] mt-1">
            Submit with just a title. Our Gemini AI engine synthesizes requirements and prepares a structured dossier.
          </p>
        </div>

        {/* Balance & Fee Indicator */}
        <div className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex flex-col items-end flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>{credits} NCX Available</span>
          </div>
          <span className="text-[11px] font-mono text-[#7357FF] font-bold mt-1">
            Intake Fee: 50 NCX
          </span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-[#FFF0ED] border border-[#FF826E]/40 text-xs text-[#FF826E] font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN FORM CARD
      ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-8">
        
        {/* SECTION 1: PROJECT TITLE (REQUIRED) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#7357FF] text-white flex items-center justify-center font-bold text-xs font-mono">
              01
            </span>
            <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
              Working Project Title *
            </h3>
          </div>

          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            A clear, descriptive name for your initiative. You do not need to fill out a lengthy questionnaire.
          </p>

          <input
            type="text"
            required
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Autonomous Logistics Drone Mesh"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-sm text-[#17172B] dark:text-white font-medium focus:outline-none focus:border-[#7357FF] focus:ring-2 focus:ring-[#7357FF]/15 transition-all"
          />

          {/* Quick Suggestions Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-[#8F91A3] font-bold uppercase mr-1">QUICK START:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setProjectTitle(s)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F7F8FC] dark:bg-[#1C1C33] text-[#65677A] dark:text-[#A6A8C0] border border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF] hover:text-[#7357FF] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2: REFERENCE SPECIFICATION & DOCUMENT FORMAT */}
        <div className="space-y-4 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold text-xs font-mono">
              02
            </span>
            <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
              Reference Format & Specification Documents
            </h3>
          </div>

          {/* PART 1: OFFICIAL ADMIN REFERENCE DOCUMENT FORMAT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F0F4FF] dark:bg-[#151D33] border border-[#3978FF]/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3978FF] text-white">
                    Official Reference Format
                  </span>
                  <span className="text-[10px] font-mono text-[#8F91A3]">
                    Configured by Administration
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#17172B] dark:text-white mt-1">
                  {intakeTemplate?.title || 'Project Intake Specification Template'}
                </h4>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5 leading-relaxed">
                  {intakeTemplate?.instructions || 'Please download this reference document format. Fill in your project specifications following this exact template, then upload your completed document below.'}
                </p>
              </div>

              {/* Admin Button to Replace / Change the Reference Document */}
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={handleOpenAdminTemplateModal}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1E38] border border-[#3978FF]/40 text-[#3978FF] hover:bg-[#3978FF] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
                  title="Admin: Change or replace the reference document format"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Change Reference Document</span>
                </button>
              )}
            </div>

            {/* Template Download Card for Client */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#1A2238] border border-[#D5E2FF] dark:border-[#222E4D]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#EBF1FF] dark:bg-[#202945] text-[#3978FF] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-[#17172B] dark:text-white truncate">
                    {intakeTemplate?.originalName || 'NexusCraft_Project_Intake_Specification_Template.docx'}
                  </div>
                  <div className="text-[10px] font-mono text-[#8F91A3]">
                    {intakeTemplate?.fileSize || '32.5 KB'} • Word Document (.docx)
                  </div>
                </div>
              </div>

              <a
                href={api.getDocumentDownloadUrl(intakeTemplate?.storagePath || '/uploads/NexusCraft_Project_Intake_Specification_Template.docx')}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 rounded-xl bg-[#3978FF] hover:bg-[#2D60CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Reference Template</span>
              </a>
            </div>
          </div>

          {/* PART 2: CLIENT UPLOAD & OPTIONAL URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reference URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#65677A] dark:text-[#A6A8C0]">
                Reference URL / Figma / PRD Link (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-[#8F91A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://figma.com/@project or github repo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                />
              </div>
            </div>

            {/* Document Upload Dropzone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#65677A] dark:text-[#A6A8C0]">
                  Attach Specification Reference Document (.pdf, .docx, .txt, .zip, images)
                </label>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.zip,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {isUploadingFile ? (
                <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#7357FF] flex items-center justify-center gap-2 text-xs text-[#7357FF] font-semibold animate-pulse">
                  <Upload className="w-4 h-4 animate-bounce" />
                  <span>Uploading specification document to server...</span>
                </div>
              ) : uploadedFile ? (
                <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-emerald-400 dark:border-emerald-600 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-[#17172B] dark:text-white truncate">{uploadedFile.name}</div>
                      <div className="text-[10px] text-[#8F91A3] flex items-center gap-2">
                        <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                        <span className="text-emerald-600 font-bold">✓ Attached for Submission</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {uploadMetadata?.storagePath && (
                      <a
                        href={api.getDocumentDownloadUrl(uploadMetadata.storagePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-[#7357FF] hover:bg-[#EEE9FF] dark:hover:bg-[#201F3E]"
                        title="Download / View file"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 text-[#FF826E] hover:bg-[#FFF0ED] dark:hover:bg-[#2A1717] rounded-lg cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF] text-xs text-[#65677A] dark:text-[#A6A8C0] flex items-center justify-center gap-2 transition-all hover:bg-[#F5F2FF] dark:hover:bg-[#1C1C33] cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#7357FF]" />
                  <span>Choose Reference Document to Upload with Project</span>
                </button>
              )}

              {fileUploadError && (
                <p className="text-[11px] text-red-500 font-medium">{fileUploadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: CONTACT TELEMETRY (PHONE & WHATSAPP) */}
        <div className="space-y-4 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold text-xs font-mono">
              03
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Contact Phone & WhatsApp Outreach
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Provided directly to administrator triage for real-time WhatsApp updates, clarification calls, and engineering quotes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#65677A] dark:text-[#A6A8C0]">
                Direct Contact Phone Number
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={clientCountryCode}
                  onChange={(e) => setClientCountryCode(e.target.value)}
                  className="w-24 px-2.5 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+49">🇩🇪 +49</option>
                </select>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g. 7569630270 or 555-0142"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#65677A] dark:text-[#A6A8C0]">
                Contact Email (Account Default)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#111122] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#65677A] opacity-75 font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: AI SYNTHESIS PREVIEW (FREE PREVIEW ACTION) */}
        <div className="space-y-4 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold text-xs font-mono">
                04
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                  AI Scoping Preview (Optional & Free)
                </h3>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                  Generate an instant algorithmic feature breakdown before submitting.
                </p>
              </div>
            </div>

            <BoxedButton
              type="button"
              variant="tertiary"
              size="sm"
              loading={aiGenerating}
              onClick={handleGeneratePreview}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Generate AI Preview
            </BoxedButton>
          </div>

          {aiError && (
            <p className="text-xs text-[#FF826E]">{aiError}</p>
          )}

          {/* AI Preview Result Box */}
          {aiPreview && (
            <div className="p-5 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#7357FF]/30 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  SYNTHESIZED ARCHITECTURAL BLUEPRINT
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEE9FF] text-[#7357FF]">
                  {aiPreview.category}
                </span>
              </div>

              <p className="text-xs text-[#17172B] dark:text-white leading-relaxed">
                {aiPreview.summary}
              </p>

              {aiPreview.suggestedFeatures.length > 0 && (
                <div className="pt-2 border-t border-[#E8EAF4] dark:border-[#202038]">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#65677A] block mb-2">
                    IDENTIFIED CORE MODULES & FEATURES:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiPreview.suggestedFeatures.map((f, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                        <span className="text-[#17172B] dark:text-white">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: FINAL SUBMISSION & FEE CONFIRMATION */}
        <div className="pt-6 border-t border-[#E8EAF4] dark:border-[#2A2A46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-display font-bold text-sm text-[#17172B] dark:text-white">
              <Coins className="w-4 h-4 text-[#7357FF]" />
              <span>Project Intake Fee: 50 NCX</span>
            </div>
            <p className="text-[11px] text-[#65677A] dark:text-[#8F91A3]">
              Your remaining balance after submission will be {credits - 50} NCX.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BoxedButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/client/dashboard')}
            >
              Cancel
            </BoxedButton>

            <BoxedButton
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Project Request (50 NCX)
            </BoxedButton>
          </div>
        </div>

      </form>

      {/* ─────────────────────────────────────────────────────────────
          ADMIN MODAL: CHANGE OFFICIAL REFERENCE DOCUMENT TEMPLATE
      ───────────────────────────────────────────────────────────── */}
      {adminTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  ADMINISTRATION CONTROL
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  Change Official Reference Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminTemplateModalOpen(false)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminTemplate} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  value={adminNewTitle}
                  onChange={(e) => setAdminNewTitle(e.target.value)}
                  placeholder="e.g. Official Project Intake Specification Template"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none focus:border-[#7357FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Client Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminNewInstructions}
                  onChange={(e) => setAdminNewInstructions(e.target.value)}
                  placeholder="Explain what format clients should follow..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* Upload New Reference File */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                  Upload Replacement Reference File (.docx, .pdf, .zip, etc.)
                </label>

                <input
                  ref={adminFileInputRef}
                  type="file"
                  accept=".docx,.doc,.pdf,.zip,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAdminNewTemplateFile(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onClick={() => adminFileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-[#3978FF]/40 hover:border-[#3978FF] rounded-xl text-center cursor-pointer bg-[#F0F4FF] dark:bg-[#151D33] transition-colors"
                >
                  {adminNewTemplateFile ? (
                    <div className="text-xs font-bold text-[#3978FF] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{adminNewTemplateFile.name} ({(adminNewTemplateFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      <Upload className="w-5 h-5 mx-auto text-[#3978FF]" />
                      <p className="font-semibold text-[#17172B] dark:text-white">Click to select new reference document</p>
                      <p className="text-[10px] text-[#8F91A3]">
                        Current active: {intakeTemplate?.originalName || 'Default Template'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setAdminTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdminTemplate}
                  className="px-5 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSavingAdminTemplate && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Publish Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubmitRequestPage;
