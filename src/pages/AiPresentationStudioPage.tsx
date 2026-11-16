import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Presentation,
  Download,
  FileText,
  Globe,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  FolderDown
} from 'lucide-react';
import { TEMPLATE_THEMES, exportPresentationToPptx, type SlideData, type TemplateTheme } from '../lib/pptxExport';
import { BoxedButton } from '../components/shared/BoxedButton';
import confetti from 'canvas-confetti';

type PresentationMode = 'generate' | 'editable-ppt' | 'redesign' | 'freestyle';
type InputSource = 'text' | 'url' | 'file';
type AspectRatio = '16:9' | '4:3';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Can I create a PowerPoint presentation from text with AI?',
    answer: 'Yes. Simply describe your topic, target audience, paste existing meeting notes, or submit a URL. Our Gemini AI engine extracts core concepts, structures them into a logical multi-slide narrative, and generates native PowerPoint slides.'
  },
  {
    question: 'Can I choose the template, language, size, and slide count?',
    answer: 'Absolutely. Choose from 12 curated designer templates (Clinic Line, Concept Cards, Harbor Print, Neon Sport, etc.), select 16:9 widescreen or 4:3 traditional aspect ratio, target slide counts (8–12, Auto, Company Overview), and multiple languages.'
  },
  {
    question: 'How does the AI presentation workflow work?',
    answer: 'The workflow has 3 transparent steps: 1) Add your content or topic; 2) Review and refine the AI outline (reorder or add slides); 3) Edit slides live and download a production-ready PPTX with real shapes and editable text boxes.'
  },
  {
    question: 'Is the generated PowerPoint fully editable?',
    answer: 'Yes. Unlike static AI image generators that flatten slides into non-editable JPEGs, NexusCraft builds native PPTX elements using real text boxes, vectors, shapes, and color layers. You can edit text, move shapes, change fonts, and adjust layouts directly in Microsoft PowerPoint, Apple Keynote, or Google Slides.'
  },
  {
    question: "Why can't I edit slides made by standard AI image models?",
    answer: 'Most image generation models output a single flattened raster image where text is part of the pixels. NexusCraft reconstructs presentations into semantic XML shapes and text hierarchies so you have total granular control.'
  },
  {
    question: 'Do I need an account to generate presentations?',
    answer: 'You can explore templates, generate live outlines, and preview editable slides directly as a visitor. Creating a free NexusCraft account enables saving your presentations to your workspace, cloud synchronizing revisions, and advanced Gemini model quotas.'
  }
];

const PREDEFINED_PROMPTS = [
  {
    title: 'AI-Powered SaaS Pitch Deck',
    audience: 'Venture Capital & Angel Investors',
    category: 'Technology',
    template: 'concept-cards'
  },
  {
    title: 'Healthcare Clinical Intelligence Platform',
    audience: 'Hospital CIOs & Medical Directors',
    category: 'Medical',
    template: 'clinic-line'
  },
  {
    title: 'Q4 Strategic Business Review & Roadmap',
    audience: 'Executive Board & Shareholders',
    category: 'Business',
    template: 'harbor-print'
  },
  {
    title: 'Adaptive Learning Mobile App Launch',
    audience: 'Educators & EdTech Accelerators',
    category: 'Education',
    template: 'toy-town'
  },
  {
    title: 'High-Performance Sports & Fitness Telemetry',
    audience: 'Athletic Directors & Athletes',
    category: 'Technology',
    template: 'neon-sport'
  }
];

export const AiPresentationStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode and Step state
  const [mode, setMode] = useState<PresentationMode>('generate');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Content Input state
  const [sourceType, setSourceType] = useState<InputSource>('text');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [audience, setAudience] = useState(searchParams.get('audience') || 'Key Stakeholders & Clients');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [slideCount, setSlideCount] = useState<string>('8–12');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('concept-cards');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [language] = useState<string>('English');
  const [urlInput, setUrlInput] = useState<string>('');
  const [rawNotesInput, setRawNotesInput] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideCanvasRef = useRef<HTMLDivElement>(null);

  // Auto-fill from URL params if coming from Client Project Export
  useEffect(() => {
    const paramTopic = searchParams.get('topic');
    const paramCategory = searchParams.get('category');
    if (paramTopic) {
      setTopic(paramTopic);
      if (paramCategory) setCategory(paramCategory);
    }
  }, [searchParams]);

  // Handle template selection
  const activeTheme: TemplateTheme = TEMPLATE_THEMES[selectedTemplate] || TEMPLATE_THEMES['concept-cards'];

  // Categories list
  const categories = ['All', 'Business', 'Consulting', 'Technology', 'Research', 'Education', 'Marketing', 'Medical'];

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawNotesInput(content || '');
        if (!topic) {
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTopic(baseName);
        }
      };
      reader.readAsText(file);
    }
  };

  // Generate Outline API Call
  const handleGenerateOutline = async () => {
    if (!topic.trim() && !rawNotesInput.trim() && !urlInput.trim()) {
      alert('Please enter a presentation topic, describe your ideas, or provide source notes.');
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        topic: topic || 'Strategic Digital Product Presentation',
        audience,
        category: category === 'All' ? 'Technology' : category,
        slideCount,
        templateKey: selectedTemplate,
        aspectRatio,
        language,
        sourceType,
        rawContent: sourceType === 'url' ? urlInput : rawNotesInput
      };

      const res = await fetch('/api/ai/presentation/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        setSlides(data.slides);
        setActiveSlideIndex(0);
        setCurrentStep(2); // Move to outline review
      } else {
        throw new Error('No slides returned');
      }
    } catch (err: any) {
      console.warn('API error, using local high-fidelity generator:', err.message);
      // Fallback local deck
      generateLocalDeck();
      setCurrentStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  // Local fallback generator
  const generateLocalDeck = () => {
    const cleanTitle = topic.trim() || 'AI Digital Platform Presentation';
    const generated: SlideData[] = [
      {
        slideNumber: 1,
        title: cleanTitle,
        subtitle: `Strategic Presentation Prepared for ${audience}`,
        layout: 'title',
        bullets: [
          'Executive Opportunity & Problem Statement',
          'Intelligent Architecture & Solution Pillars',
          'Go-to-Market Milestones & Commercial Model'
        ],
        stats: [
          { label: 'Market Opportunity', value: '$48B+' },
          { label: 'Time to Value', value: '< 90 Days' },
          { label: 'Projected Growth', value: '3.8x YoY' }
        ],
        visualNotes: 'Bold visual cover slide with distinct accent colors.'
      },
      {
        slideNumber: 2,
        title: 'The Core Problem & Market Friction',
        subtitle: 'Why existing approaches fail to meet modern user expectations',
        layout: 'split',
        bullets: [
          'Legacy tools force teams into costly context switching and data siloing',
          'Lack of real-time state synchronization leads to user churn and delays',
          'Teams struggle to adopt generative AI models without exposing proprietary data',
          'High operational overhead erodes project margins and slows delivery cycles'
        ],
        stats: [
          { label: 'Annual Productivity Loss', value: '32%' },
          { label: 'Fragmented Tools', value: '12+ Apps' }
        ],
        visualNotes: 'Split comparison layout highlighting friction vs modern opportunities.'
      },
      {
        slideNumber: 3,
        title: 'Our Solution & Strategic Advantage',
        subtitle: `Reinventing ${cleanTitle} through unified automation`,
        layout: 'cards',
        bullets: [
          'Unified Workspace: Seamless intake, automated scoping, and clear delivery',
          'AI-Native Core: Real-time requirement synthesis with zero client key exposure',
          'Governed Workflows: Role separation between Clients, Specialists, and Admins',
          'Fast Velocity: Modular design system accelerating time-to-market'
        ],
        stats: [
          { label: 'Execution Velocity', value: '4x Faster' },
          { label: 'Cost Reduction', value: '45%' },
          { label: 'Accuracy Rating', value: '98.5%' }
        ],
        visualNotes: '3-card grid highlighting core value pillars.'
      },
      {
        slideNumber: 4,
        title: 'Addressable Market & Growth Dynamics',
        subtitle: `Market sizing and expansion runway in ${category}`,
        layout: 'stats',
        bullets: [
          'Rapidly expanding sector with 26% Compound Annual Growth Rate',
          'Immediate initial beachhead in high-growth digital businesses',
          'Strong unit retention driven by indispensable operational utility',
          'Expansion vectors into enterprise automated governance'
        ],
        stats: [
          { label: 'TAM', value: '$54 Billion' },
          { label: 'SAM', value: '$14.2 Billion' },
          { label: 'SOM', value: '$650 Million' }
        ],
        visualNotes: 'Key metric cards with market size breakdown.'
      },
      {
        slideNumber: 5,
        title: 'Modern Technical Architecture',
        subtitle: 'Engineered for resilience, low latency, and bank-grade data security',
        layout: 'cards',
        bullets: [
          'Frontend: React 19 + TypeScript + Vite with sub-second bundle compilation',
          'Backend Engine: Stateless Node.js REST services with strict schema guards',
          'Intelligence Layer: Google Gemini 1.5 Flash orchestrator with server-side caching',
          'Database: Cloud MongoDB Atlas compound clusters with AES-256 encryption'
        ],
        stats: [
          { label: 'API Response', value: '< 80ms' },
          { label: 'Uptime SLA', value: '99.95%' }
        ],
        visualNotes: '4-pillar architecture visual breakdown.'
      },
      {
        slideNumber: 6,
        title: 'Execution Roadmap & Delivery Milestones',
        subtitle: 'Phase-by-phase delivery schedule from concept to scale',
        layout: 'timeline',
        bullets: [
          'Phase 1 — Discovery & System Contracts: Wireframes, schemas, and API definitions',
          'Phase 2 — Core Platform Build: Authenticated dashboards and core workflows',
          'Phase 3 — AI Intelligence Suite: Automated synthesis and export studios',
          'Phase 4 — Hardening & Global Release: Security auditing and production deployment'
        ],
        stats: [
          { label: 'Pilot Cohorts', value: '30+ Teams' },
          { label: 'CSAT Score', value: '96%' }
        ],
        visualNotes: 'Sequential horizontal milestone progression.'
      },
      {
        slideNumber: 7,
        title: 'Business Model & Unit Economics',
        subtitle: 'Scalable monetization and defensible operating margins',
        layout: 'split',
        bullets: [
          'Dual-revenue monetization: Subscription SaaS tier + utility token transactions',
          'Enterprise custom model deployment with dedicated SLAs and compliance guards',
          'Predictable customer lifetime value (LTV) exceeding CAC by 4.2x',
          'Target operating gross margins exceeding 78% at steady-state'
        ],
        stats: [
          { label: 'LTV / CAC Ratio', value: '4.2x' },
          { label: 'Gross Margin', value: '78%' }
        ],
        visualNotes: 'Pillars and financial projections side-by-side.'
      },
      {
        slideNumber: 8,
        title: 'Call to Action & Next Steps',
        subtitle: 'Join us in transforming ambitious digital concepts into reality',
        layout: 'conclusion',
        bullets: [
          'Schedule an interactive executive demonstration with our product team',
          'Access technical repository, security audit logs, and financial projections',
          'Lock in strategic pilot onboarding allocation for early access',
          'Direct inquiries: hello@nexuscraft.app · https://nexuscraft.app'
        ],
        stats: [
          { label: 'Response Window', value: '< 24 Hours' },
          { label: 'Platform Status', value: 'Live & Ready' }
        ],
        visualNotes: 'Closing slide with clear contact actions.'
      }
    ];

    setSlides(generated);
    setActiveSlideIndex(0);
  };

  // Convert Deck Mode Handler
  const handleConvertDeck = async () => {
    if (!rawNotesInput.trim()) {
      alert('Please enter or paste your existing notes, outline, or document text.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/presentation/convert-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawNotesInput,
          templateKey: selectedTemplate,
          targetSlideCount: 8
        })
      });
      const data = await res.json();
      if (Array.isArray(data.slides)) {
        setSlides(data.slides);
        setActiveSlideIndex(0);
        setCurrentStep(3); // Jump straight to slide editor
      } else {
        generateLocalDeck();
        setCurrentStep(3);
      }
    } catch {
      generateLocalDeck();
      setCurrentStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  // Slide Editing Handlers
  const handleUpdateSlideTitle = (newTitle: string) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeSlideIndex ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateSlideSubtitle = (newSub: string) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeSlideIndex ? { ...s, subtitle: newSub } : s))
    );
  };

  const handleUpdateBullet = (bIndex: number, newText: string) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== activeSlideIndex) return s;
        const nextBullets = [...(s.bullets || [])];
        nextBullets[bIndex] = newText;
        return { ...s, bullets: nextBullets };
      })
    );
  };

  const handleAddBullet = () => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== activeSlideIndex) return s;
        return { ...s, bullets: [...(s.bullets || []), 'New key point or metric'] };
      })
    );
  };

  const handleRemoveBullet = (bIndex: number) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== activeSlideIndex) return s;
        return { ...s, bullets: (s.bullets || []).filter((_, idx) => idx !== bIndex) };
      })
    );
  };

  const handleAddSlide = () => {
    const newSlide: SlideData = {
      slideNumber: slides.length + 1,
      title: 'New Presentation Slide',
      subtitle: 'Add a supporting description or context',
      layout: 'cards',
      bullets: ['First strategic observation', 'Second core milestone', 'Third impact metric'],
      stats: [
        { label: 'Key Metric', value: '100%' },
        { label: 'Efficiency', value: '+35%' }
      ]
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (slides.length <= 1) {
      alert('A presentation must have at least one slide.');
      return;
    }
    const filtered = slides
      .filter((_, i) => i !== indexToDelete)
      .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setSlides(filtered);
    if (activeSlideIndex >= filtered.length) {
      setActiveSlideIndex(filtered.length - 1);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    const renumbered = reordered.map((s, i) => ({ ...s, slideNumber: i + 1 }));
    setSlides(renumbered);
    setActiveSlideIndex(targetIndex);
  };

  // Export to Real Editable PowerPoint (.pptx)
  const handleExportPptx = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    try {
      await exportPresentationToPptx(topic || 'NexusCraft_Presentation', slides, selectedTemplate, aspectRatio);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(`Error generating PPTX: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export JSON Outline
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(slides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(topic || 'presentation').toLowerCase().replace(/\s+/g, '_')}_outline.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0A0A16] text-[#17172B] dark:text-[#F7F8FC] transition-colors duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP BAR & MODE NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111124] border-b border-[#E8EAF4] dark:border-[#22223D] sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1E1E38] transition-all"
              title="Return to NexusCraft Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center shadow-sm">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-sm sm:text-base text-[#17172B] dark:text-white leading-tight">
                  AI PPT Generator
                </h1>
                <p className="text-[11px] text-[#8F91A3] font-medium hidden sm:block">
                  Create Slides You Can Actually Edit · Native PPTX Export
                </p>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#17172B]">
            {[
              { id: 'generate', label: 'Generate Slides' },
              { id: 'editable-ppt', label: 'Editable PPT' },
              { id: 'redesign', label: 'Redesign Slides' },
              { id: 'freestyle', label: 'Freestyle' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id as PresentationMode);
                  if (tab.id === 'editable-ppt' || tab.id === 'freestyle') {
                    if (slides.length === 0) generateLocalDeck();
                    setCurrentStep(3);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === tab.id
                    ? 'bg-[#7357FF] text-white shadow-sm shadow-[#7357FF]/30'
                    : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Standalone HTML link */}
          <a
            href="/slides.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs font-bold text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] hover:border-[#7357FF]/40 transition-all"
            title="Open zero-framework standalone version"
          >
            <Eye className="w-3.5 h-3.5 text-[#7357FF]" />
            <span>Standalone Web View</span>
          </a>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">

        {/* 3-Step Breadcrumb Progress Bar */}
        <div className="flex items-center justify-between max-w-2xl mx-auto p-2 rounded-2xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm">
          {[
            { num: 1, label: 'Add Your Content' },
            { num: 2, label: 'Review the Outline' },
            { num: 3, label: 'Edit & Download PPTX' }
          ].map((step, idx) => (
            <React.Fragment key={step.num}>
              <button
                onClick={() => {
                  if (step.num === 1 || slides.length > 0) {
                    setCurrentStep(step.num as any);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === step.num
                    ? 'bg-[#7357FF] text-white shadow-sm'
                    : currentStep > step.num
                    ? 'text-[#10B981] hover:bg-[#F0FDF4] dark:hover:bg-[#132A1C]'
                    : 'text-[#8F91A3] opacity-60 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === step.num
                    ? 'bg-white text-[#7357FF]'
                    : currentStep > step.num
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#E8EAF4] dark:bg-[#252542] text-[#8F91A3]'
                }`}>
                  {currentStep > step.num ? '✓' : step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < 2 && <div className="h-0.5 w-6 bg-[#E8EAF4] dark:bg-[#252542]" />}
            </React.Fragment>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STEP 1: ADD YOUR CONTENT
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-10 animate-fadeIn">
            
            {/* Hero Pitch Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#EDE9FE] dark:bg-[#232047] text-[#7357FF] border border-[#DDD6FE] dark:border-[#3D3575]">
                <Sparkles className="w-3.5 h-3.5 text-[#7357FF]" />
                <span>AI PPT GENERATOR · CREATE SLIDES YOU CAN ACTUALLY EDIT</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-[#17172B] dark:text-white tracking-tight">
                Turn your ideas, text, URLs, or files into designer-grade presentations.
              </h2>
              <p className="text-sm sm:text-base text-[#65677A] dark:text-[#A6A8C0]">
                Download a real PowerPoint PPTX with native editable text boxes, separate shapes, and vector layers.
              </p>
            </div>

            {/* Input Container Box */}
            <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm space-y-6">
              
              {/* Source Tabs */}
              <div className="flex items-center justify-between border-b border-[#F0F2F9] dark:border-[#202038] pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSourceType('text')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sourceType === 'text'
                        ? 'bg-[#7357FF] text-white shadow-sm'
                        : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ideas and text</span>
                  </button>

                  <button
                    onClick={() => setSourceType('url')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sourceType === 'url'
                        ? 'bg-[#7357FF] text-white shadow-sm'
                        : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Web pages (URL)</span>
                  </button>

                  <button
                    onClick={() => setSourceType('file')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sourceType === 'file'
                        ? 'bg-[#7357FF] text-white shadow-sm'
                        : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Documents and files</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono font-bold text-[#8F91A3] hidden sm:block">
                  STEP 1 OF 3
                </span>
              </div>

              {/* Source Mode Inputs */}
              {sourceType === 'text' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[#17172B] dark:text-white">
                    What do you want to present?
                  </label>
                  <textarea
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI-powered clinical operations platform to automate medical coding and billing for hospital networks..."
                    className="w-full p-4 rounded-2xl bg-[#F7F8FC] dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-sm text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] transition-all resize-none font-medium"
                  />

                  {/* Predefined prompt chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#8F91A3] uppercase tracking-wider">
                      Or try an example brief:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_PROMPTS.map((chip) => (
                        <button
                          key={chip.title}
                          onClick={() => {
                            setTopic(chip.title);
                            setAudience(chip.audience);
                            setCategory(chip.category);
                            setSelectedTemplate(chip.template);
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] hover:border-[#7357FF] hover:text-[#7357FF] transition-all text-[#65677A] dark:text-[#A6A8C0]"
                        >
                          {chip.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sourceType === 'url' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[#17172B] dark:text-white">
                    Public Web Page URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/product-overview or article..."
                      className="flex-1 p-3.5 rounded-2xl bg-[#F7F8FC] dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-sm text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] transition-all font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-[#8F91A3]">
                    NexusCraft will extract the article outline and synthesize it into a coherent slide presentation.
                  </p>
                </div>
              )}

              {sourceType === 'file' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[#17172B] dark:text-white">
                    Attach Source Document (Word, Markdown, TXT, PDF, Notes)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-[#F7F8FC]/50 dark:bg-[#1A1A30]/50"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-[#7357FF] mb-2" />
                    <span className="text-xs font-bold text-[#17172B] dark:text-white">
                      {uploadedFileName ? uploadedFileName : 'Click to select or drop your document here'}
                    </span>
                    <span className="text-[11px] text-[#8F91A3] mt-1">
                      Supports .txt, .md, .docx, .json outlines
                    </span>
                  </div>
                  {rawNotesInput && (
                    <div className="p-3 rounded-xl bg-[#F0FDF4] dark:bg-[#132A1C] border border-[#86EFAC]/40 text-xs text-[#15803D] dark:text-[#86EFAC] font-mono">
                      ✓ Document loaded ({rawNotesInput.length} characters parsed)
                    </div>
                  )}
                </div>
              )}

              {/* Target Audience & Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#F0F2F9] dark:border-[#202038]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17172B] dark:text-white">
                    Target Audience & Purpose
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. Venture Capitalists, Healthcare Executives, Students"
                    className="w-full p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17172B] dark:text-white">
                    Slide Count Target
                  </label>
                  <div className="flex gap-2">
                    {['8–12', 'Auto', 'Company overview'].map((countOption) => (
                      <button
                        key={countOption}
                        type="button"
                        onClick={() => setSlideCount(countOption)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          slideCount === countOption
                            ? 'bg-[#17172B] dark:bg-white text-white dark:text-[#17172B] shadow-sm'
                            : 'border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0]'
                        }`}
                      >
                        {countOption}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#17172B] dark:text-white block">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        category === cat
                          ? 'bg-[#7357FF] text-white shadow-sm shadow-[#7357FF]/30'
                          : 'border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#8F91A3]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Real native text boxes · Never flattened images</span>
                </div>

                <div className="flex items-center gap-3">
                  {(sourceType === 'file' || mode === 'redesign') && rawNotesInput && (
                    <BoxedButton
                      variant="secondary"
                      size="lg"
                      onClick={handleConvertDeck}
                      disabled={isGenerating}
                      icon={<Sparkles className="w-4 h-4 text-[#7357FF]" />}
                    >
                      Instant Convert Deck
                    </BoxedButton>
                  )}
                  <BoxedButton
                    variant="primary"
                    size="lg"
                    onClick={handleGenerateOutline}
                    disabled={isGenerating}
                    icon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {isGenerating ? 'Synthesizing Narrative...' : 'Continue to Outline Review'}
                  </BoxedButton>
                </div>
              </div>

            </div>

            {/* Template Gallery */}
            <div className="max-w-6xl mx-auto space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-xl text-[#17172B] dark:text-white">
                    Choose a Presentation Template
                  </h3>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
                    12 designer themes with custom color palettes, card shapes, and typography.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#7357FF]">
                  Selected: {activeTheme.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.values(TEMPLATE_THEMES).map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#7357FF] ring-2 ring-[#7357FF]/30 bg-white dark:bg-[#17172B] shadow-md'
                          : 'border-[#E8EAF4] dark:border-[#22223D] bg-white dark:bg-[#131326] hover:border-[#7357FF]/40'
                      }`}
                    >
                      {/* Mini Visual Slide Swatch */}
                      <div
                        className="w-full h-24 rounded-xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden"
                        style={{ backgroundColor: `#${tmpl.bgColor}` }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-3 h-1 rounded-full"
                            style={{ backgroundColor: `#${tmpl.accentColor}` }}
                          />
                          <span
                            className="text-[9px] font-bold font-mono uppercase"
                            style={{ color: `#${tmpl.subtextColor}` }}
                          >
                            {tmpl.category}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div
                            className="h-2 rounded w-3/4"
                            style={{ backgroundColor: `#${tmpl.textColor}`, opacity: 0.85 }}
                          />
                          <div
                            className="h-1 rounded w-1/2"
                            style={{ backgroundColor: `#${tmpl.subtextColor}`, opacity: 0.6 }}
                          />
                        </div>

                        {/* Mini Card Shape */}
                        <div
                          className="p-1 rounded-md text-[8px] font-bold flex items-center justify-between"
                          style={{
                            backgroundColor: `#${tmpl.cardBg}`,
                            color: `#${tmpl.accentColor}`,
                            border: `1px solid #${tmpl.accentColor}30`
                          }}
                        >
                          <span>Metric</span>
                          <span>98%</span>
                        </div>
                      </div>

                      {/* Info & Select Button */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <h4 className="font-display font-bold text-xs text-[#17172B] dark:text-white leading-tight">
                            {tmpl.name}
                          </h4>
                          <span className="text-[10px] text-[#8F91A3] font-medium">
                            {tmpl.category}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(tmpl.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isSelected
                              ? 'bg-[#7357FF] text-white'
                              : 'bg-[#F0F2F9] dark:bg-[#202038] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF]'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Use'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 2: REVIEW THE OUTLINE
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
                  STEP 2 OF 3 · STRUCTURE REVIEW
                </span>
                <h2 className="font-display font-black text-2xl text-[#17172B] dark:text-white mt-1">
                  Review & Refine Slide Outline ({slides.length} Slides)
                </h2>
                <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                  Reorder, tweak titles, add talking points, or add custom slides before generating the full deck.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <BoxedButton
                  variant="secondary"
                  size="md"
                  onClick={() => setCurrentStep(1)}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Edit Brief
                </BoxedButton>

                <BoxedButton
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Open Slide Studio
                </BoxedButton>
              </div>
            </div>

            {/* Slide Outline Cards List */}
            <div className="space-y-3">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#22223D] hover:border-[#7357FF]/40 shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#EDE9FE] dark:bg-[#232047] text-[#7357FF] flex items-center justify-center font-display font-black text-xs">
                        {s.slideNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#F0F2F9] dark:bg-[#202038] text-[#65677A] dark:text-[#A6A8C0]">
                        {s.layout || 'standard'} layout
                      </span>
                    </div>

                    {/* Reorder and Delete controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSlide(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-[#8F91A3] hover:text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1F1F38] disabled:opacity-30"
                        title="Move slide up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(idx, 'down')}
                        disabled={idx === slides.length - 1}
                        className="p-1 rounded-lg text-[#8F91A3] hover:text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1F1F38] disabled:opacity-30"
                        title="Move slide down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-1 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1414]"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Editable Title */}
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setSlides((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, title: newTitle } : item))
                      );
                    }}
                    className="w-full font-display font-bold text-base text-[#17172B] dark:text-white bg-transparent border-b border-transparent hover:border-[#E8EAF4] focus:border-[#7357FF] focus:outline-none transition-all pb-1"
                  />

                  {/* Editable Subtitle */}
                  <input
                    type="text"
                    value={s.subtitle || ''}
                    placeholder="Add subtitle or executive highlight..."
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setSlides((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, subtitle: newSub } : item))
                      );
                    }}
                    className="w-full text-xs text-[#65677A] dark:text-[#A6A8C0] bg-transparent border-b border-transparent hover:border-[#E8EAF4] focus:border-[#7357FF] focus:outline-none transition-all pb-0.5"
                  />

                  {/* Bullets List */}
                  {s.bullets && s.bullets.length > 0 && (
                    <div className="space-y-1.5 pl-2 pt-1 border-l-2 border-[#E8EAF4] dark:border-[#22223D]">
                      {s.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7357FF] flex-shrink-0" />
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSlides((prev) =>
                                prev.map((item, i) => {
                                  if (i !== idx) return item;
                                  const nextB = [...(item.bullets || [])];
                                  nextB[bIdx] = val;
                                  return { ...item, bullets: nextB };
                                })
                              );
                            }}
                            className="flex-1 text-xs text-[#17172B] dark:text-[#E2E4F0] bg-transparent focus:outline-none focus:border-b focus:border-[#7357FF]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}

              {/* Add Slide Button */}
              <button
                onClick={handleAddSlide}
                className="w-full py-4 border-2 border-dashed border-[#E8EAF4] dark:border-[#22223D] hover:border-[#7357FF] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1A1A30] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Slide to Outline</span>
              </button>
            </div>

            {/* Bottom Proceed Bar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] flex items-center justify-between">
              <span className="text-xs text-[#8F91A3]">
                Template Theme: <strong className="text-[#17172B] dark:text-white">{activeTheme.name}</strong> ({aspectRatio})
              </span>

              <BoxedButton
                variant="accent"
                size="lg"
                onClick={() => setCurrentStep(3)}
                icon={<ArrowRight className="w-4 h-4 text-[#17172B]" />}
                iconPosition="right"
              >
                Generate Full Deck & Edit Slides
              </BoxedButton>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 3: INTERACTIVE SLIDE DECK STUDIO & PPTX DOWNLOAD
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Studio Toolbar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <BoxedButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Outline View
                </BoxedButton>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F2F9] dark:bg-[#202038] text-xs font-bold text-[#17172B] dark:text-white">
                  <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
                </div>

                {/* Aspect ratio toggle */}
                <div className="flex items-center p-0.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#1A1A30]">
                  {(['16:9', '4:3'] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        aspectRatio === ratio
                          ? 'bg-[#7357FF] text-white'
                          : 'text-[#65677A] dark:text-[#A6A8C0]'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                {/* Template theme switcher */}
                <div className="relative">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="p-1.5 px-3 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs font-bold text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                  >
                    {Object.values(TEMPLATE_THEMES).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons: PPTX Download, JSON, Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  className="p-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1E1E38] transition-all"
                  title="Export JSON outline"
                >
                  <FolderDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1E1E38] transition-all"
                  title="Print / Save as PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>

                <BoxedButton
                  variant="accent"
                  size="md"
                  onClick={handleExportPptx}
                  disabled={isExporting}
                  icon={isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-[#17172B]" />}
                >
                  {isExporting ? 'Generating PPTX...' : 'Download Editable PPTX'}
                </BoxedButton>
              </div>

            </div>

            {/* Slide Editor Workspace: Left Sidebar + Center Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Slide Thumbnails Sidebar (3 cols) */}
              <div className="lg:col-span-3 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#8F91A3]">
                    SLIDES DECK
                  </span>
                  <button
                    onClick={handleAddSlide}
                    className="text-xs font-bold text-[#7357FF] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {slides.map((s, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isActive
                          ? 'border-[#7357FF] ring-2 ring-[#7357FF]/30 bg-white dark:bg-[#17172B] shadow-sm'
                          : 'border-[#E8EAF4] dark:border-[#22223D] bg-white/70 dark:bg-[#131326]/70 hover:border-[#7357FF]/40'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-[#EDE9FE] dark:bg-[#232047] text-[#7357FF] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {s.slideNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#17172B] dark:text-white truncate">
                          {s.title}
                        </h4>
                        <p className="text-[10px] text-[#8F91A3] truncate">
                          {s.subtitle || `${s.bullets?.length || 0} key points`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Canvas (9 cols) */}
              <div className="lg:col-span-9 space-y-4">
                
                {/* Visual Slide Stage */}
                <div
                  ref={slideCanvasRef}
                  className={`w-full rounded-3xl p-8 sm:p-12 shadow-xl border relative flex flex-col justify-between transition-all ${
                    aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-video'
                  }`}
                  style={{
                    backgroundColor: `#${activeTheme.bgColor}`,
                    borderColor: `#${activeTheme.accentColor}30`,
                    color: `#${activeTheme.textColor}`
                  }}
                >
                  {/* Decorative Header Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-1 rounded-full"
                          style={{ backgroundColor: `#${activeTheme.accentColor}` }}
                        />
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider"
                          style={{ color: `#${activeTheme.subtextColor}` }}
                        >
                          SLIDE {activeSlide.slideNumber} · {activeTheme.name.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `#${activeTheme.cardBg}`,
                            color: `#${activeTheme.accentColor}`,
                            border: `1px solid #${activeTheme.accentColor}40`
                          }}
                        >
                          Click to Edit Any Text
                        </span>
                      </div>
                    </div>

                    {/* Editable Slide Title */}
                    <input
                      type="text"
                      value={activeSlide.title}
                      onChange={(e) => handleUpdateSlideTitle(e.target.value)}
                      className="w-full font-display font-black text-2xl sm:text-3xl lg:text-4xl bg-transparent border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-all leading-tight mb-2"
                      style={{ color: `#${activeTheme.textColor}` }}
                    />

                    {/* Editable Slide Subtitle */}
                    <input
                      type="text"
                      value={activeSlide.subtitle || ''}
                      placeholder="Add an executive description..."
                      onChange={(e) => handleUpdateSlideSubtitle(e.target.value)}
                      className="w-full text-xs sm:text-sm italic bg-transparent border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-all"
                      style={{ color: `#${activeTheme.subtextColor}` }}
                    />
                  </div>

                  {/* Body Content based on layout */}
                  <div className="my-auto py-4">
                    {/* Stats Layout */}
                    {activeSlide.layout === 'stats' && activeSlide.stats && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {activeSlide.stats.map((st, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl shadow-sm text-center border"
                            style={{
                              backgroundColor: `#${activeTheme.cardBg}`,
                              borderColor: `#${activeTheme.accentColor}30`
                            }}
                          >
                            <span
                              className="font-display font-black text-2xl sm:text-3xl block"
                              style={{ color: `#${activeTheme.accentColor}` }}
                            >
                              {st.value}
                            </span>
                            <span
                              className="text-[11px] font-bold uppercase tracking-wider block mt-1"
                              style={{ color: `#${activeTheme.subtextColor}` }}
                            >
                              {st.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cards / Split Layout Container */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Bullet Points */}
                      <div
                        className="p-5 rounded-2xl border shadow-sm space-y-3"
                        style={{
                          backgroundColor: `#${activeTheme.cardBg}`,
                          borderColor: `#${activeTheme.accentColor}30`
                        }}
                      >
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider block"
                          style={{ color: `#${activeTheme.accentColor}` }}
                        >
                          KEY TAKEAWAYS & WORKFLOW
                        </span>
                        <div className="space-y-2">
                          {(activeSlide.bullets || []).map((b, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-2 group">
                              <span
                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ backgroundColor: `#${activeTheme.accentColor}` }}
                              />
                              <input
                                type="text"
                                value={b}
                                onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                                className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-none border-b border-transparent hover:border-current focus:border-current"
                                style={{ color: `#${activeTheme.textColor}` }}
                              />
                              <button
                                onClick={() => handleRemoveBullet(bIdx)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                                title="Remove bullet"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleAddBullet}
                          className="text-[11px] font-bold hover:underline flex items-center gap-1 mt-2"
                          style={{ color: `#${activeTheme.accentColor}` }}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Key Point</span>
                        </button>
                      </div>

                      {/* Right: Metrics or Strategic Note */}
                      <div
                        className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between"
                        style={{
                          backgroundColor: `#${activeTheme.cardBg}`,
                          borderColor: `#${activeTheme.secondaryColor}30`
                        }}
                      >
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider block"
                          style={{ color: `#${activeTheme.secondaryColor}` }}
                        >
                          STRATEGIC HIGHLIGHTS
                        </span>

                        <div className="space-y-3 my-auto py-2">
                          {activeSlide.stats && activeSlide.stats.length > 0 ? (
                            activeSlide.stats.slice(0, 2).map((st, i) => (
                              <div key={i} className="border-b pb-2" style={{ borderColor: `#${activeTheme.accentColor}20` }}>
                                <span
                                  className="font-display font-black text-xl block"
                                  style={{ color: `#${activeTheme.secondaryColor}` }}
                                >
                                  {st.value}
                                </span>
                                <span className="text-[10px]" style={{ color: `#${activeTheme.subtextColor}` }}>
                                  {st.label}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs italic" style={{ color: `#${activeTheme.subtextColor}` }}>
                              {activeSlide.visualNotes || 'Native PowerPoint elements formatted for executive presentations.'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px]" style={{ color: `#${activeTheme.subtextColor}` }}>
                          <span>Editable Shapes</span>
                          <span>Vector Layers</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Slide Footer */}
                  <div
                    className="flex items-center justify-between pt-4 border-t text-[10px] font-medium"
                    style={{
                      borderColor: `#${activeTheme.accentColor}20`,
                      color: `#${activeTheme.subtextColor}`
                    }}
                  >
                    <span>NexusCraft Studio · AI Generated Presentation (Editable PowerPoint)</span>
                    <span>Slide {activeSlide.slideNumber} of {slides.length}</span>
                  </div>

                </div>

                {/* Slide Navigation & Canvas Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                      disabled={activeSlideIndex === 0}
                      className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                      disabled={activeSlideIndex === slides.length - 1}
                      className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteSlide(activeSlideIndex)}
                      className="px-3 py-1.5 rounded-xl border border-[#EF4444]/30 text-xs font-bold text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1414] transition-all"
                    >
                      Delete Slide
                    </button>
                    <button
                      onClick={handleAddSlide}
                      className="px-3 py-1.5 rounded-xl border border-[#7357FF]/30 text-xs font-bold text-[#7357FF] hover:bg-[#F5F2FF] dark:hover:bg-[#1E1E38] transition-all"
                    >
                      + Add Slide
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            FEATURE HIGHLIGHTS: POWERPOINT SLIDES YOU CAN ACTUALLY EDIT
        ───────────────────────────────────────────────────────────── */}
        <section className="py-12 border-t border-[#E8EAF4] dark:border-[#22223D] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7357FF]">
              POWERPOINT SLIDES YOU CAN KEEP EDITING
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#17172B] dark:text-white">
              Real Text Boxes, Separate Shapes, and Multi-Layer Controls
            </h3>
            <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0]">
              A presentation always needs final changes: an updated number, a shorter headline, or a custom font. NexusCraft rebuilds content as native PowerPoint elements so you can adjust everything yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] dark:bg-[#232047] text-[#7357FF] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Real Text Boxes
              </h4>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
                Rewrite a headline, correct a typo, translate the copy, or apply your company typography directly in the exported PPTX.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] dark:bg-[#172554] text-[#0284C7] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Separate Shapes & Layers
              </h4>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
                Move, resize, and restyle individual cards, background grids, and divider elements. Never locked inside a flattened picture.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#252542] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] dark:bg-[#451A03] text-[#D97706] flex items-center justify-center font-bold">
                <Presentation className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Works in Your Favorite App
              </h4>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
                Open the PPTX natively in Microsoft PowerPoint, Apple Keynote, or upload directly into Google Slides with 100% fidelity.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            EDITABLE AI PRESENTATION FAQS ACCORDION
        ───────────────────────────────────────────────────────────── */}
        <section className="py-8 border-t border-[#E8EAF4] dark:border-[#22223D] space-y-6">
          <div className="max-w-xl">
            <h3 className="font-display font-black text-xl text-[#17172B] dark:text-white">
              Editable AI Presentation FAQs
            </h3>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
              Common questions on generation, PowerPoint compatibility, and file ownership.
            </p>
          </div>

          <div className="space-y-3 max-w-4xl">
            {FAQS.map((faq, i) => {
              const isOpen = expandedFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[#E8EAF4] dark:border-[#22223D] bg-white dark:bg-[#131326] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-[#17172B] dark:text-white hover:text-[#7357FF]"
                  >
                    <span>{faq.question}</span>
                    <span className="text-base font-mono font-normal ml-2">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed border-t border-[#F0F2F9] dark:border-[#202038]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

    </div>
  );
};

export default AiPresentationStudioPage;
