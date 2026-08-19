import React, { useState, useRef } from 'react';
import type { BriefInput, ProjectBrief } from '../types';
import {
  SAMPLE_PROJECT_TEMPLATES,
  generateClarificationQuestions,
  structureProjectBrief,
  type SampleTemplate,
} from '../lib/geminiService';
import {
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  FileCheck,
  LayoutDashboard,
  MessageSquare,
  Wand2,
  Globe,
  Briefcase,
  Upload,
  FileText,
  Zap,
  FileUp,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import mammoth from 'mammoth';
import { useUser, IDEA_SUBMISSION_COST } from '../context/UserContext';
import { NcxCoinIcon, NcxCreditBadge, NcxCostTag, NcxDeductionRow, NcxCreditCard } from '../components/NcxCredit';

type SubmissionMode = 'select' | 'quick' | 'upload' | 'detailed';

export const BriefBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { postNewJob, user, submitIdea } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('select');

  // Quick Idea Mode State
  const [quickIdeaText, setQuickIdeaText] = useState('');
  const [quickIdeaSuccess, setQuickIdeaSuccess] = useState(false);
  const [quickIdeaError, setQuickIdeaError] = useState<string | null>(null);

  // Document Upload Mode State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<BriefInput>({
    rawIdea: '',
    projectTypes: ['Website'],
    customProjectType: '',
    businessIndustry: 'E-commerce',
    customIndustry: '',
    selectedFeatures: ['Home page', 'About page', 'Contact page'],
    customFeatures: '',
    stylePreference: 'Modern',
    customStyleDetails: '',
    referenceUrls: ['https://example.com'],
    referenceNotes: '',
    targetAudience: 'General Public & Customers',
    budget: '₹25,000 – ₹50,000 ($300 - $600)',
    timeline: '2–4 weeks',
    requiredRoles: ['Full Stack Developer', 'UI/UX Designer'],
    customRequiredRole: '',
    experiencePreference: 'Experienced',
    additionalDetails: '',
    clarificationAnswers: {},
  });

  // AI & Flow States
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [postedProject, setPostedProject] = useState<ProjectBrief | null>(null);

  // Selectable Options Definitions
  const projectTypeOptions = [
    'Website',
    'Web Application',
    'Mobile Application',
    'E-commerce Store',
    'Business Website',
    'SaaS Product',
    'Restaurant / Food Website',
    'Hotel / Hospitality Website',
    'Portfolio',
    'Landing Page',
    'AI / ML Application',
    'Software / Tool',
    'Game',
    'Branding / Design',
    'Marketing',
    'Content',
  ];

  const industryOptions = [
    'E-commerce',
    'Restaurant',
    'Fast Food',
    'Hotel',
    'Healthcare',
    'Education',
    'Finance',
    'Real Estate',
    'Travel',
    'Entertainment',
    'Technology',
    'SaaS',
    'Retail',
    'Food Delivery',
    'Fitness',
    'Gaming',
    'Professional Services',
    'Startup',
    'Personal Brand',
  ];

  const featureOptions = [
    'Home page',
    'About page',
    'Contact page',
    'Product catalog',
    'Shopping cart',
    'Online payments',
    'User accounts',
    'Booking system',
    'Order management',
    'Search & Filters',
    'Reviews & Testimonials',
    'Blog',
    'Gallery',
    'Live chat',
    'Notifications',
    'Admin dashboard',
    'Analytics telemetry',
    'Maps / location',
    'Social media integration',
    'WhatsApp/contact integration',
    'Custom functionality',
  ];

  const styleOptions = [
    'Modern',
    'Minimal',
    'Premium',
    'Professional',
    'Luxury',
    'Dark',
    'Light',
    'Colorful',
    'Corporate',
    'Creative',
    'Futuristic',
    '3D / Interactive',
    'Simple',
    'Elegant',
    'Playful',
  ];

  const targetUserOptions = [
    'Customers',
    'Students',
    'Businesses',
    'Developers',
    'Restaurant customers',
    'Online shoppers',
    'Patients',
    'Travelers',
    'Employees',
    'General public',
  ];

  const budgetOptions = [
    'Not decided yet',
    'Under ₹10,000 ($150)',
    '₹10,000 – ₹25,000 ($150 - $300)',
    '₹25,000 – ₹50,000 ($300 - $600)',
    '₹50,000 – ₹1,00,000 ($600 - $1,200)',
    '₹1,00,000+ ($1,200+)',
  ];

  const timelineOptions = [
    'As soon as possible',
    'Within 1 week',
    '2–4 weeks',
    '1–2 months',
    '2–3 months',
    'Flexible',
  ];

  const roleOptions = [
    'Web Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'UI/UX Designer',
    'Graphic Designer',
    '3D Designer',
    'AI/ML Developer',
    'Data Analyst',
    'Digital Marketer',
    'Content Writer',
    'Video Editor',
    'WordPress Developer',
    'Shopify Developer',
    'Game Developer',
    'Cybersecurity Specialist',
  ];

  const experienceOptions = ['Beginner', 'Intermediate', 'Experienced', 'Expert', 'No preference'];

  // Template Click Handler
  const applyTemplate = (tmpl: SampleTemplate) => {
    setFormData({
      ...formData,
      rawIdea: tmpl.ideaText,
      projectTypes: tmpl.projectTypes,
      businessIndustry: tmpl.businessIndustry,
      selectedFeatures: tmpl.suggestedFeatures,
      stylePreference: tmpl.stylePreference,
      targetAudience: tmpl.targetAudience,
      budget: tmpl.budget,
      timeline: tmpl.timeline,
      requiredRoles: tmpl.requiredRoles,
    });
  };

  // Toggle Helpers
  const toggleSelection = (list: string[], item: string): string[] => {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  };

  // Add Reference URL
  const addReferenceUrl = () => {
    setFormData({ ...formData, referenceUrls: [...formData.referenceUrls, ''] });
  };

  const updateReferenceUrl = (index: number, val: string) => {
    const copy = [...formData.referenceUrls];
    copy[index] = val;
    setFormData({ ...formData, referenceUrls: copy });
  };

  const removeReferenceUrl = (index: number) => {
    setFormData({
      ...formData,
      referenceUrls: formData.referenceUrls.filter((_, i) => i !== index),
    });
  };

  // Quick Idea Submit Handler
  const handleQuickIdeaSubmit = () => {
    if (!quickIdeaText.trim()) return;
    const result = submitIdea({
      clientId: user?.id || 'usr-1',
      clientName: user?.name || 'Client',
      clientAvatar: user?.avatar || '',
      clientEmail: user?.email || '',
      rawIdea: quickIdeaText,
      submissionType: 'text',
      creditsCost: IDEA_SUBMISSION_COST,
    });
    if (result.success) {
      setQuickIdeaSuccess(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    } else {
      setQuickIdeaError(result.error || 'Submission failed.');
    }
  };

  // Document Upload Submit Handler
  const handleDocumentSubmit = async () => {
    if (!uploadedFile) return;

    let docHtml = '';
    let extractedText = '';

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        docHtml = result.value;
      }
      const rawRes = await mammoth.extractRawText({ arrayBuffer });
      if (rawRes.value) {
        extractedText = rawRes.value;
      }
    } catch (err) {
      console.log('Doc parsing notice:', err);
    }

    const result = submitIdea({
      clientId: user?.id || 'usr-1',
      clientName: user?.name || 'Client',
      clientAvatar: user?.avatar || '',
      clientEmail: user?.email || '',
      rawIdea: extractedText.trim() || `[Document Upload] ${uploadedFile.name}`,
      docFileName: uploadedFile.name,
      docContentHtml: docHtml || undefined,
      submissionType: 'document',
      creditsCost: IDEA_SUBMISSION_COST,
    });

    if (result.success) {
      setUploadSuccess(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    } else {
      setUploadError(result.error || 'Submission failed.');
    }
  };

  // Generate AI Questions & Structure
  const handleProceedToClarification = async () => {
    setIsAiProcessing(true);
    setCurrentStep(9);

    const questions = await generateClarificationQuestions(
      formData.rawIdea,
      formData.projectTypes.join(', '),
      formData.businessIndustry
    );

    setClarificationQuestions(questions);
    setIsAiProcessing(false);
  };

  // Final Project Post Handler
  const handlePostProject = () => {
    const summary = structureProjectBrief({
      ...formData,
      clarificationAnswers: answers,
    });

    const newJob = {
      id: `job-${Date.now()}`,
      title: formData.rawIdea.slice(0, 50) || `${formData.projectTypes[0]} Requirement`,
      clientName: user?.name || 'Alex Rivera',
      clientAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      clientRating: 4.9,
      category: formData.projectTypes[0] || 'Web Development',
      description: formData.rawIdea,
      budgetType: 'Fixed' as const,
      minBudget: 250,
      maxBudget: 1500,
      duration: formData.timeline,
      experienceLevel: (formData.experiencePreference === 'Expert' ? 'Expert' : 'Intermediate') as any,
      skills: formData.requiredRoles,
      proposalsCount: 0,
      postedAt: 'Just now',
      status: 'Open' as const,
      isRemote: true,
    };

    postNewJob(newJob);

    // Send idea report to Admin
    submitIdea({
      clientId: user?.id || 'usr-client-1',
      clientName: user?.name || 'Alex Rivera',
      clientEmail: user?.email || '',
      clientAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rawIdea: `${newJob.title}: ${formData.rawIdea}`,
      submissionType: 'detailed_brief' as any,
      creditsCost: IDEA_SUBMISSION_COST,
    });

    const newProject: ProjectBrief = {
      id: newJob.id,
      title: newJob.title,
      clientId: user?.id || 'usr-1',
      clientName: user?.name || 'Alex Rivera',
      briefData: formData,
      aiSummary: summary,
      status: 'Open',
      createdAt: 'Just now',
      proposalsCount: 0,
    };

    setPostedProject(newProject);
    setCurrentStep(11);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── MODE SELECTION SCREEN ── */}
        {submissionMode === 'select' && (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>NEXUSCRAFT PROJECT SUBMISSION PORTAL</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                How would you like to <span className="gradient-text">share your idea?</span>
              </h1>
              <p className="text-slate-400 text-sm">Choose the method that works best for you. Each submission costs <NcxCostTag amount={IDEA_SUBMISSION_COST} label="" />. You have <NcxCreditBadge amount={user?.credits ?? 0} />.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {/* Quick Idea */}
              <button
                onClick={() => setSubmissionMode('quick')}
                className="group p-6 rounded-3xl border-2 border-slate-800 bg-slate-900/80 hover:border-cyan-500/60 hover:bg-slate-900 transition-all text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">Quick Idea</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Just type your idea in plain words — no forms, no steps. Submit instantly and our admin will reach out.</p>
                </div>
                <NcxCostTag amount={IDEA_SUBMISSION_COST} />
              </button>

              {/* Upload Document */}
              <button
                onClick={() => setSubmissionMode('upload')}
                className="group p-6 rounded-3xl border-2 border-slate-800 bg-slate-900/80 hover:border-indigo-500/60 hover:bg-slate-900 transition-all text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">Upload Document</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Already have a Word doc (.docx) or PDF with your requirements? Upload it directly and we'll review it.</p>
                </div>
                <NcxCostTag amount={IDEA_SUBMISSION_COST} />
              </button>

              {/* Detailed Brief */}
              <button
                onClick={() => setSubmissionMode('detailed')}
                className="group p-6 rounded-3xl border-2 border-slate-800 bg-slate-900/80 hover:border-purple-500/60 hover:bg-slate-900 transition-all text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">AI Brief Builder</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Answer guided questions to build a detailed project brief with AI assistance for precise matching.</p>
                </div>
                <NcxCostTag amount={IDEA_SUBMISSION_COST} />
              </button>
            </div>
          </div>
        )}

        {/* ── QUICK IDEA MODE ── */}
        {submissionMode === 'quick' && !quickIdeaSuccess && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setSubmissionMode('select')} className="text-slate-400 hover:text-white text-xs font-mono transition-colors">← Back</button>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">QUICK IDEA MODE</span>
            </div>
            <div className="glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Share Your Idea</h2>
                  <p className="text-xs text-slate-400">Describe what you want to build — our admin will review and contact you.</p>
                </div>
              </div>

              <NcxCreditCard
                amount={user?.credits ?? 0}
                label="Your NCX Balance"
                subtitle={`This submission costs NCX ${IDEA_SUBMISSION_COST}. Submit your idea and admin will reach out within 24 hours.`}
              />

              {quickIdeaError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  ⚠ {quickIdeaError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-2">Your Project Idea *</label>
                <textarea
                  rows={7}
                  value={quickIdeaText}
                  onChange={(e) => setQuickIdeaText(e.target.value)}
                  placeholder="e.g. I want a website for my bakery where customers can see our menu, place orders online, and book custom cakes. I need it to be mobile-friendly and have a nice, warm design..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 leading-relaxed placeholder:text-slate-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] font-mono text-slate-500">Min. 20 characters</span>
                  <span className="text-[10px] font-mono text-slate-500">{quickIdeaText.length} chars</span>
                </div>
              </div>

              <button
                disabled={quickIdeaText.trim().length < 20}
                onClick={handleQuickIdeaSubmit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <NcxCoinIcon size="sm" />
                Submit Idea — <NcxCreditBadge amount={IDEA_SUBMISSION_COST} />
              </button>
            </div>
          </div>
        )}

        {submissionMode === 'quick' && quickIdeaSuccess && (
          <div className="max-w-lg mx-auto">
            <div className="glass-card border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 bg-slate-900/95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Idea Submitted! 🎉</h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Your idea has been sent directly to our admin team. They'll review it and reach out to you via the platform chat within 24 hours.
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <NcxDeductionRow label="NCX USED:" amount={IDEA_SUBMISSION_COST} variant="deduct" />
                <NcxDeductionRow label="NCX REMAINING:" amount={user?.credits ?? 0} variant="reward" />
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-cyan-300 font-bold">Sent to Admin ✓</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/client/dashboard')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ── DOCUMENT UPLOAD MODE ── */}
        {submissionMode === 'upload' && !uploadSuccess && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setSubmissionMode('select')} className="text-slate-400 hover:text-white text-xs font-mono transition-colors">← Back</button>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">DOCUMENT UPLOAD MODE</span>
            </div>
            <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Upload Your Document</h2>
                  <p className="text-xs text-slate-400">Upload a Word document (.docx) or PDF with your project requirements.</p>
                </div>
              </div>

              <NcxCreditCard
                amount={user?.credits ?? 0}
                label="Your NCX Balance"
                subtitle={`This submission costs NCX ${IDEA_SUBMISSION_COST}. Upload your document and admin will review it and contact you.`}
              />

              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  ⚠ {uploadError}
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-10 text-center cursor-pointer transition-all group"
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">{uploadedFile.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{(uploadedFile.size / 1024).toFixed(1)} KB — click to change</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto group-hover:bg-indigo-500/15 group-hover:text-indigo-400 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-300 font-semibold">Click to upload or drag & drop</p>
                    <p className="text-[10px] font-mono text-slate-500">.docx, .doc, .pdf — Max 10MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFile(file);
                }}
              />

              <button
                disabled={!uploadedFile}
                onClick={handleDocumentSubmit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <NcxCoinIcon size="sm" />
                Submit Document — <NcxCreditBadge amount={IDEA_SUBMISSION_COST} />
              </button>
            </div>
          </div>
        )}

        {submissionMode === 'upload' && uploadSuccess && (
          <div className="max-w-lg mx-auto">
            <div className="glass-card border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 bg-slate-900/95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Document Submitted! 🎉</h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Your document <strong className="text-indigo-300">{uploadedFile?.name}</strong> has been sent to our admin team. They'll review it and contact you shortly.
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <NcxDeductionRow label="NCX USED:" amount={IDEA_SUBMISSION_COST} variant="deduct" />
                <NcxDeductionRow label="NCX REMAINING:" amount={user?.credits ?? 0} variant="reward" />
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-cyan-300 font-bold">Sent to Admin ✓</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/client/dashboard')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ── DETAILED BRIEF (Original Multi-step Wizard) ── */}
        {submissionMode === 'detailed' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubmissionMode('select')} className="text-slate-400 hover:text-white text-xs font-mono transition-colors">← Back to options</button>
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">AI BRIEF BUILDER</span>
            </div>

        {/* Wizard Progress Header */}
        {currentStep <= 10 && (
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI PROJECT BRIEF BUILDER // STEP {currentStep} OF 10</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: Tell Us About Your Idea ── */}
        {currentStep === 1 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Tell us about your <span className="gradient-text">project idea</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Briefly describe what you want to build. You don't need technical knowledge — just tell us what you have in mind.
              </p>
            </div>

            {/* Clickable Quick Sample Templates */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
                💡 Quick Idea Templates (Click to Pre-fill):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SAMPLE_PROJECT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => applyTemplate(tmpl)}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{tmpl.icon}</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {tmpl.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{tmpl.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Idea Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold text-slate-300">Describe your project idea in detail...</label>
                <span className="text-xs font-mono text-slate-500">{formData.rawIdea.length} / 3000 chars</span>
              </div>
              <textarea
                rows={6}
                value={formData.rawIdea}
                onChange={(e) => setFormData({ ...formData, rawIdea: e.target.value })}
                placeholder="e.g. I want to create a modern website for my restaurant where customers can view the menu, order food online, book tables, and view our location..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 leading-relaxed placeholder:text-slate-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                disabled={!formData.rawIdea.trim()}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <span>Next: Project Type</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Project Type ── */}
        {currentStep === 2 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">What are you looking to create?</h2>
              <p className="text-cyan-300 text-xs font-mono font-medium">Select all project formats that apply to your idea.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {projectTypeOptions.map((type) => {
                const selected = formData.projectTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, projectTypes: toggleSelection(formData.projectTypes, type) })}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all ${
                      selected
                        ? 'bg-indigo-600 border-cyan-400 text-white font-bold shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{type}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-cyan-300" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">Or enter custom project type:</label>
              <input
                type="text"
                value={formData.customProjectType || ''}
                onChange={(e) => setFormData({ ...formData, customProjectType: e.target.value })}
                placeholder="e.g. Blockchain Audit Tool, Custom ERP, AR Shopping Experience..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <span>Next: Industry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Business / Industry ── */}
        {currentStep === 3 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">What type of business or project is this for?</h2>
              <p className="text-cyan-300 text-xs font-mono font-medium">Select your industry or business sector.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {industryOptions.map((ind) => {
                const selected = formData.businessIndustry === ind;
                return (
                  <button
                    key={ind}
                    onClick={() => setFormData({ ...formData, businessIndustry: ind })}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all ${
                      selected
                        ? 'bg-indigo-600 border-cyan-400 text-white font-bold shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{ind}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Industry Input */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Or enter custom business sector:</label>
              <input
                type="text"
                value={formData.customIndustry || ''}
                onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                placeholder="e.g. Quantum Computing, Renewable Energy, Fine Dining..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <span>Next: Features</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Product Features Checklist ── */}
        {currentStep === 4 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">What should your website or product do?</h2>
              <p className="text-slate-400 text-xs font-mono">Select key features required for your project.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featureOptions.map((feat) => {
                const selected = formData.selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    onClick={() => setFormData({ ...formData, selectedFeatures: toggleSelection(formData.selectedFeatures, feat) })}
                    className={`p-3 rounded-2xl border text-xs font-medium text-left transition-all ${
                      selected
                        ? 'bg-indigo-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{feat}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Other custom requirements or features:</label>
              <textarea
                rows={2}
                value={formData.customFeatures || ''}
                onChange={(e) => setFormData({ ...formData, customFeatures: e.target.value })}
                placeholder="e.g. Integration with Swiggy API, custom POS thermal printer output, SMS OTP verification..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <span>Next: Style & References</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Design Style & Reference URLs ── */}
        {currentStep === 5 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">How do you want it to look & feel?</h2>
              <p className="text-slate-400 text-xs font-mono">Select aesthetic style choices and provide reference links.</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Visual Style Preference:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {styleOptions.map((st) => {
                  const selected = formData.stylePreference === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setFormData({ ...formData, stylePreference: st })}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        selected
                          ? 'bg-indigo-600/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference URLs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-slate-400">Do you have any websites or designs you like? (Reference URLs)</label>
                <button
                  type="button"
                  onClick={addReferenceUrl}
                  className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Link
                </button>
              </div>
              <div className="space-y-2">
                {formData.referenceUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateReferenceUrl(i, e.target.value)}
                      placeholder="https://example-inspiration.com"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                    />
                    {formData.referenceUrls.length > 1 && (
                      <button type="button" onClick={() => removeReferenceUrl(i)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(6)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <span>Next: Target Users</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Target Users ── */}
        {currentStep === 6 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Who is this website or product for?</h2>
              <p className="text-slate-400 text-xs font-mono">Specify your target audience.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {targetUserOptions.map((tgt) => {
                const selected = formData.targetAudience === tgt;
                return (
                  <button
                    key={tgt}
                    onClick={() => setFormData({ ...formData, targetAudience: tgt })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      selected
                        ? 'bg-indigo-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tgt}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(7)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <span>Next: Budget & Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 7: Budget & Timeline ── */}
        {currentStep === 7 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Budget & Delivery Timeline</h2>
              <p className="text-slate-400 text-xs font-mono">Set your approximate financial expectations and deadline.</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Approximate Budget Range:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {budgetOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFormData({ ...formData, budget: b })}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all ${
                      formData.budget === b
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Target Timeline:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timelineOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, timeline: t })}
                    className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                      formData.timeline === t
                        ? 'bg-indigo-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(6)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(8)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <span>Next: Freelancer Roles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 8: Required Freelancer Roles & Experience ── */}
        {currentStep === 8 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">What type of freelancer are you looking for?</h2>
              <p className="text-slate-400 text-xs font-mono">Select required skills or role specialties.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {roleOptions.map((rl) => {
                const selected = formData.requiredRoles.includes(rl);
                return (
                  <button
                    key={rl}
                    onClick={() => setFormData({ ...formData, requiredRoles: toggleSelection(formData.requiredRoles, rl) })}
                    className={`p-3 rounded-2xl border text-xs font-medium text-left transition-all ${
                      selected
                        ? 'bg-indigo-600/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{rl}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Experience Preference:</label>
              <div className="flex flex-wrap gap-2">
                {experienceOptions.map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setFormData({ ...formData, experiencePreference: exp })}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      formData.experiencePreference === exp
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(7)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleProceedToClarification}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <Wand2 className="w-4 h-4" />
                <span>AI Requirement Clarification</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 9: Gemini AI Clarification Questions ── */}
        {currentStep === 9 && (
          <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Nexus AI Clarification Assistant</h2>
                <p className="text-xs text-slate-400">A few quick questions to sharpen your project requirements before posting.</p>
              </div>
            </div>

            {isAiProcessing ? (
              <div className="py-12 text-center text-xs font-mono text-cyan-300 animate-pulse space-y-2">
                <div>Analyzing project scope & formulating requirement questions...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {clarificationQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{q}</span>
                    </div>
                    <input
                      type="text"
                      value={answers[q] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                      placeholder="Your answer (or leave blank to skip)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(8)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(10)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <span>Review Structured Brief</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 10: Final Review Screen ── */}
        {currentStep === 10 && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">PROJECT BRIEF READY</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">Review Your Project Specification</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  Edit Brief
                </button>
              </div>
            </div>

            {/* Brief Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
                <h3 className="font-mono text-cyan-400 uppercase font-bold">Client Provided Requirements</h3>
                <div>
                  <span className="text-slate-500 block">Project Idea:</span>
                  <p className="text-slate-200 font-semibold mt-1">{formData.rawIdea}</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Project Formats:</span>
                  <span className="text-white font-semibold">{formData.projectTypes.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Industry Sector:</span>
                  <span className="text-white font-semibold">{formData.businessIndustry}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Features ({formData.selectedFeatures.length}):</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.selectedFeatures.map((f) => (
                      <span key={f} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
                <h3 className="font-mono text-purple-400 uppercase font-bold">Scope & Execution Parameters</h3>
                <div>
                  <span className="text-slate-500 block">Financial Budget:</span>
                  <span className="text-emerald-400 font-extrabold font-mono text-sm">{formData.budget}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Timeline:</span>
                  <span className="text-cyan-300 font-bold">{formData.timeline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Required Freelancer Roles:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.requiredRoles.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded bg-indigo-600/20 text-cyan-300 border border-indigo-500/30">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Post CTA */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              <button
                onClick={handlePostProject}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>Post Project to NexusCraft Marketplace</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 11: After Posting Screen (NO DESIGNER MATCH CARDS) ── */}
        {currentStep === 11 && postedProject && (
          <div className="glass-card border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Your Project Has Been Posted!</h1>
            <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
              Your project is now available to qualified freelancers on NexusCraft. Freelancers can view your requirements and submit proposals.
            </p>

            {/* Posted Summary Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-2.5 max-w-xl mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">PROJECT ID:</span>
                <span className="text-cyan-400 font-bold">{postedProject.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PROJECT TITLE:</span>
                <span className="text-white font-bold">{postedProject.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">STATUS:</span>
                <span className="text-emerald-400 font-bold">OPEN FOR PROPOSALS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BUDGET:</span>
                <span className="text-emerald-400 font-bold">{postedProject.briefData.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TIMELINE:</span>
                <span className="text-slate-200">{postedProject.briefData.timeline}</span>
              </div>
            </div>

            {/* Primary Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate('/client/dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Client Dashboard (My Posted Projects)</span>
              </button>

              <button
                onClick={() => navigate(`/workspace/${postedProject.id}`)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Open Project Workspace</span>
              </button>

              <button
                onClick={() => navigate('/proposals')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>View Proposals</span>
              </button>

              <button
                onClick={() => navigate('/inbox')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Go to Messages</span>
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default BriefBuilderPage;

