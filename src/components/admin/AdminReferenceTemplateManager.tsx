import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Upload,
  Edit3,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Eye,
  AlertCircle,
  Sparkles,
  FileDown,
  Save,
  Clock,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import confetti from 'canvas-confetti';

interface TemplateSection {
  title: string;
  placeholder: string;
}

const DEFAULT_SECTIONS: TemplateSection[] = [
  {
    title: '1. Executive Summary & Vision',
    placeholder: '[Describe what your digital product or initiative is, the core business problem it solves, and your primary target audience.]'
  },
  {
    title: '2. Core Features & Capabilities (Priority Breakdown)',
    placeholder: '• Priority 1 (Must Have): [List non-negotiable MVP features]\n• Priority 2 (Important): [List secondary phase capabilities]\n• Priority 3 (Nice to Have): [Future enhancements or stretch goals]'
  },
  {
    title: '3. Target Platforms & Technological Preferences',
    placeholder: '[Select / Specify: Web Application (React/Next.js), Mobile App (iOS / Android / Flutter), AI/ML Pipeline, Blockchain/Web3, Backend API / Microservices]'
  },
  {
    title: '4. Design, Branding & UI/UX Expectations',
    placeholder: '[Provide benchmark websites, aesthetic style, existing brand color palette or attach brand guideline package.]'
  },
  {
    title: '5. Budget Tier & Target Delivery Timeline',
    placeholder: '[Target launch date, milestone schedule requirements, and anticipated budgetary range.]'
  }
];

export const AdminReferenceTemplateManager: React.FC = () => {
  const { user } = useUser();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('NEXUSCRAFT — PROJECT INTAKE SPECIFICATION TEMPLATE');
  const [editSubtitle, setEditSubtitle] = useState('Official Reference Format for Project Submission & Scoping Dossier');
  const [editInstructions, setEditInstructions] = useState(
    'Please fill out this document following the structured sections below. Once complete, upload your finalized version (.docx or .pdf) to the NexusCraft Project Submission Portal.'
  );
  const [editSections, setEditSections] = useState<TemplateSection[]>(DEFAULT_SECTIONS);

  // Upload Custom File state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch active template from backend
  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await api.getIntakeReferenceTemplate();
      if (res?.success && res?.template) {
        setTemplate(res.template);
        setEditTitle(res.template.title || 'NEXUSCRAFT — PROJECT INTAKE SPECIFICATION TEMPLATE');
        setEditSubtitle(res.template.subtitle || 'Official Reference Format for Project Submission & Scoping Dossier');
        setEditInstructions(res.template.instructions || '');
        if (res.template.sections && res.template.sections.length > 0) {
          setEditSections(res.template.sections);
        } else {
          setEditSections(DEFAULT_SECTIONS);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load reference document template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Save changes to sections and regenerate DOCX
  const handleSaveSections = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('subtitle', editSubtitle);
      formData.append('instructions', editInstructions);
      formData.append('sections', JSON.stringify(editSections));
      formData.append('adminId', user?.id || 'admin');
      formData.append('adminName', user?.name || 'Administrator');

      const res = await api.updateIntakeReferenceTemplate(formData);
      if (res?.success) {
        setTemplate(res.template);
        setIsEditing(false);
        showNotification('Reference document format & sections updated and live DOCX generated!');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else {
        showNotification(res?.error || 'Failed to update template', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating template', true);
    } finally {
      setSaving(false);
    }
  };

  // Upload Custom Replacement File
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', editTitle);
      formData.append('instructions', editInstructions);
      formData.append('adminId', user?.id || 'admin');
      formData.append('adminName', user?.name || 'Administrator');

      const res = await api.updateIntakeReferenceTemplate(formData);
      if (res?.success) {
        setTemplate(res.template);
        showNotification(`Successfully uploaded ${file.name} as the official client reference document!`);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } else {
        showNotification(res?.error || 'Failed to upload replacement document', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error uploading file', true);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (!window.confirm('Reset the official reference document template to the standard NexusCraft format?')) {
      return;
    }
    setSaving(true);
    try {
      const res = await api.resetIntakeReferenceTemplate(user?.id || 'admin', user?.name || 'Administrator');
      if (res?.success) {
        setTemplate(res.template);
        setEditTitle(res.template.title);
        setEditSubtitle(res.template.subtitle);
        setEditInstructions(res.template.instructions);
        setEditSections(res.template.sections || DEFAULT_SECTIONS);
        setIsEditing(false);
        showNotification('Template restored to official default format.');
      } else {
        showNotification(res?.error || 'Failed to reset template', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error resetting template', true);
    } finally {
      setSaving(false);
    }
  };

  // Download raw text format
  const handleDownloadTxt = () => {
    let content = `${template?.title || editTitle}\n`;
    content += `${template?.subtitle || editSubtitle}\n\n`;
    content += `Instructions for Client:\n${template?.instructions || editInstructions}\n\n`;
    (template?.sections || editSections).forEach((s: TemplateSection) => {
      content += `--------------------------------------------------\n${s.title}\n--------------------------------------------------\n`;
      content += `${s.placeholder}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NexusCraft_Intake_Specification_Template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#7357FF] animate-spin" />
        <p className="text-sm font-semibold text-[#65677A] dark:text-[#A6A8C0]">
          Loading Official Reference Document Format...
        </p>
      </div>
    );
  }

  const sectionsToRender: TemplateSection[] = isEditing ? editSections : (template?.sections && template.sections.length > 0 ? template.sections : DEFAULT_SECTIONS);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          HEADER BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#17172B] via-[#1E1E38] to-[#17172B] text-white border border-[#2E2E50] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#7357FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#7357FF] text-white tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Global Platform Standard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                ● Live & Synced with Client Intake
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Project Intake Reference Document Manager
            </h1>

            <p className="text-xs sm:text-sm text-[#A6A8C0] leading-relaxed">
              This is the official document format that clients download on the project submission portal. 
              Any change made here instantly updates the live download for all clients across NexusCraft.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <a
              href={api.getDocumentDownloadUrl(template?.storagePath || '/uploads/NexusCraft_Project_Intake_Specification_Template.docx')}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#3978FF] hover:bg-[#2D60CC] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#3978FF]/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Active DOCX</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Plain Text</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#7357FF]/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Document Online'}</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-[#A6A8C0] gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#7357FF]" />
              <span className="font-mono text-white font-semibold">{template?.fileName || 'NexusCraft_Project_Intake_Specification_Template.docx'}</span>
            </div>
            <div className="hidden sm:block text-[#4E4E70]">•</div>
            <div className="font-mono text-emerald-400">{template?.fileSize || '32.5 KB'}</div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#7357FF]" />
            <span>Updated: {template?.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Active'}</span>
            <span>by {template?.updatedByAdminName || 'Administration'}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN DUAL PANE: LIVE PREVIEW & CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: LIVE DOCUMENT FORMAT VIEW / EDITOR (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">

          {isEditing ? (
            /* IN-PLACE LIVE EDITOR */
            <form onSubmit={handleSaveSections} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#17172B] border border-[#7357FF]/40 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F9] dark:border-[#202038]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                      Edit Official Reference Document Specification
                    </h3>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      Saving will update platform settings and regenerate the official Word (.docx) file.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#17172B] dark:text-white">
                    Document Main Title (HEADING 1)
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#17172B] dark:text-white">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#17172B] dark:text-white">
                    Instructions for Client
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />
                </div>
              </div>

              {/* Sections Editor */}
              <div className="space-y-4 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs font-mono uppercase text-[#7357FF]">
                    Structured Document Sections ({editSections.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setEditSections([
                        ...editSections,
                        {
                          title: `${editSections.length + 1}. Additional Section`,
                          placeholder: '[Describe additional technical or design constraints.]'
                        }
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] text-xs font-bold hover:bg-[#7357FF] hover:text-white transition-all cursor-pointer"
                  >
                    + Add Section
                  </button>
                </div>

                <div className="space-y-4">
                  {editSections.map((sec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const updated = [...editSections];
                            updated[idx].title = e.target.value;
                            setEditSections(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                        />
                        {editSections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editSections.filter((_, i) => i !== idx);
                              setEditSections(updated);
                            }}
                            className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={3}
                        value={sec.placeholder}
                        onChange={(e) => {
                          const updated = [...editSections];
                          updated[idx].placeholder = e.target.value;
                          setEditSections(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-mono text-[#65677A] dark:text-[#A6A8C0] focus:outline-none focus:border-[#7357FF]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65677A] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white text-xs font-bold shadow-lg shadow-[#7357FF]/25 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save & Generate Official DOCX</span>
                </button>
              </div>
            </form>
          ) : (
            /* PRETTY DOCUMENT RENDERING CARD (Exact match to requested specification) */
            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
              
              <div className="text-center pb-6 border-b border-[#F0F2F9] dark:border-[#202038] space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                  OFFICIAL REFERENCE SPECIFICATION
                </span>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#17172B] dark:text-white tracking-tight">
                  {template?.title || 'NEXUSCRAFT — PROJECT INTAKE SPECIFICATION TEMPLATE'}
                </h2>
                <p className="text-xs font-medium text-[#65677A] dark:text-[#A6A8C0]">
                  {template?.subtitle || 'Official Reference Format for Project Submission & Scoping Dossier'}
                </p>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-2xl bg-[#F0F4FF] dark:bg-[#151D33] border border-[#3978FF]/30 space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Instructions for Client:
                </span>
                <p className="text-xs italic text-[#17172B] dark:text-white leading-relaxed">
                  {template?.instructions || 'Please fill out this document following the structured sections below. Once complete, upload your finalized version (.docx or .pdf) to the NexusCraft Project Submission Portal.'}
                </p>
              </div>

              {/* Structured Sections Listing */}
              <div className="space-y-4">
                {sectionsToRender.map((sec, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#202038] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#7357FF] text-white flex items-center justify-center font-bold text-[10px] font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                        {sec.title}
                      </h4>
                    </div>

                    <div className="text-xs font-mono text-[#65677A] dark:text-[#A6A8C0] whitespace-pre-line pl-7 leading-relaxed bg-white/60 dark:bg-[#1A1A30]/60 p-3 rounded-xl border border-[#E8EAF4]/60 dark:border-[#2A2A46]/60">
                      {sec.placeholder}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#F0F2F9] dark:border-[#202038] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#8F91A3]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Enforced across all client project submission portals</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#1A1A30] hover:bg-[#EEE9FF] dark:hover:bg-[#252445] text-[#7357FF] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Template Sections</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTIONS, UPLOAD REPLACEMENT, & CLIENT PREVIEW (1 COL) */}
        <div className="space-y-6">

          {/* CARD 1: UPLOAD CUSTOM REPLACEMENT FILE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div className="w-7 h-7 rounded-lg bg-[#EBF1FF] dark:bg-[#202945] text-[#3978FF] flex items-center justify-center font-bold">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                Upload Custom Template File
              </h3>
            </div>

            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
              If you have already prepared an official Word, PDF, or ZIP document with your company branding, upload it directly. It will become the active reference document.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.pdf,.zip,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-[#3978FF]/30 hover:border-[#3978FF] rounded-2xl text-center cursor-pointer bg-[#F0F4FF] dark:bg-[#151D33] hover:bg-[#EBF1FF] transition-all space-y-2"
            >
              <Upload className="w-6 h-6 mx-auto text-[#3978FF]" />
              <div className="text-xs font-bold text-[#17172B] dark:text-white">
                {isUploading ? 'Uploading file to server...' : 'Choose File to Upload'}
              </div>
              <p className="text-[10px] text-[#8F91A3]">
                Supports .docx, .pdf, .zip, .txt (up to 50MB)
              </p>
            </div>

            {template?.storagePath && (
              <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#17172B] dark:text-white truncate">{template.fileName}</div>
                    <div className="text-[10px] text-[#8F91A3]">{template.fileSize}</div>
                  </div>
                </div>
                <a
                  href={api.getDocumentDownloadUrl(template.storagePath)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-2.5 py-1 rounded-lg bg-[#3978FF] text-white font-bold text-[11px] hover:bg-[#2D60CC] transition-colors"
                >
                  Download
                </a>
              </div>
            )}
          </div>

          {/* CARD 2: CLIENT PORTAL LIVE PREVIEW */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#7357FF]" />
                <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                  Client View Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8F91A3]">
                Section 02 Card
              </span>
            </div>

            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
              This is the exact interactive card rendered for clients on <span className="font-mono text-[#7357FF]">#/submit-request</span>:
            </p>

            {/* Render Client Submission Mock Card */}
            <div className="p-4 rounded-2xl bg-[#F0F4FF] dark:bg-[#151D33] border border-[#3978FF]/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#3978FF] text-white">
                  Official Reference Format
                </span>
                <span className="text-[9px] font-mono text-[#8F91A3]">
                  Configured by Administration
                </span>
              </div>

              <h4 className="font-bold text-xs text-[#17172B] dark:text-white">
                {template?.title || editTitle}
              </h4>

              <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
                {template?.instructions || editInstructions}
              </p>

              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-[#1A2238] border border-[#D5E2FF] dark:border-[#222E4D]">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#3978FF] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[11px] text-[#17172B] dark:text-white truncate">
                      {template?.originalName || 'NexusCraft_Project_Intake_Specification_Template.docx'}
                    </div>
                    <div className="text-[9px] font-mono text-[#8F91A3]">
                      {template?.fileSize || '32.5 KB'} • Word Document (.docx)
                    </div>
                  </div>
                </div>

                <a
                  href={api.getDocumentDownloadUrl(template?.storagePath || '/uploads/NexusCraft_Project_Intake_Specification_Template.docx')}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-2.5 py-1 rounded-lg bg-[#3978FF] text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>

            <div className="pt-2 text-center">
              <a
                href="#/submit-request"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#7357FF] hover:underline flex items-center justify-center gap-1"
              >
                <span>Open Project Submission Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* CARD 3: TEMPLATE AUDIT TELEMETRY */}
          <div className="p-5 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#8F91A3] block">
              TEMPLATE GOVERNANCE
            </span>
            <div className="flex justify-between text-[#65677A] dark:text-[#A6A8C0]">
              <span>Storage Key</span>
              <span className="font-mono text-[#17172B] dark:text-white">INTAKE-REFERENCE-DOC</span>
            </div>
            <div className="flex justify-between text-[#65677A] dark:text-[#A6A8C0]">
              <span>Format Types</span>
              <span className="font-mono text-[#17172B] dark:text-white">.docx, .pdf, .txt, .zip</span>
            </div>
            <div className="flex justify-between text-[#65677A] dark:text-[#A6A8C0]">
              <span>Intake Fee Sync</span>
              <span className="font-bold text-emerald-600">50 NCX (Fixed)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
