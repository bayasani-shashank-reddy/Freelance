import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Upload,
  FileText,
  X,
  AlertCircle,
  Check,
  Coins,
  Cpu,
  Link as LinkIcon
} from 'lucide-react';
import { useUser, PROJECT_SUBMISSION_COST } from '../context/UserContext';
import { api } from '../lib/api';
import { BoxedButton } from '../components/shared/BoxedButton';
import confetti from 'canvas-confetti';

export const SubmitRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, submitProjectRequest, credits } = useUser();

  // Form Fields
  const [projectTitle, setProjectTitle] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState<{ originalName: string; size: string; mimeType: string; storagePath: string } | null>(null);

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

    // Upload to server via multer
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.uploadDocument(formData);
    if (res.success && res.file) {
      setUploadMetadata(res.file);
    } else {
      setUploadMetadata({
        originalName: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type,
        storagePath: ''
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadMetadata(null);
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

    if (credits < PROJECT_SUBMISSION_COST) {
      setSubmitError(`Not enough NCX credits. You have ${credits} NCX, but 50 NCX is required.`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      projectTitle: projectTitle.trim(),
      referenceUrl: referenceUrl.trim(),
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

        {/* SECTION 2: OPTIONAL REFERENCE MATERIALS */}
        <div className="space-y-4 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold text-xs font-mono">
              02
            </span>
            <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
              Reference Link & Documents (Optional)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reference URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#65677A] dark:text-[#A6A8C0]">
                Reference URL / Figma / PRD Link
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
              <label className="block text-xs font-bold text-[#65677A] dark:text-[#A6A8C0]">
                Attach Specification (.pdf, .docx, .txt up to 20MB)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="p-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#7357FF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#7357FF]" />
                    <span className="font-bold text-[#17172B] dark:text-white truncate">{uploadedFile.name}</span>
                    <span className="text-[10px] text-[#8F91A3]">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" onClick={removeFile} className="p-1 text-[#FF826E] hover:bg-[#FFF0ED] rounded-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2.5 rounded-xl border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF] text-xs text-[#65677A] dark:text-[#A6A8C0] flex items-center justify-center gap-2 transition-all hover:bg-[#F5F2FF] dark:hover:bg-[#1C1C33]"
                >
                  <Upload className="w-4 h-4 text-[#7357FF]" />
                  <span>Choose Document to Upload</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: AI SYNTHESIS PREVIEW (FREE PREVIEW ACTION) */}
        <div className="space-y-4 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold text-xs font-mono">
                03
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

    </div>
  );
};

export default SubmitRequestPage;
