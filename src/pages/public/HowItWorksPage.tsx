import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lightbulb, FileCode2, Users, Lock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';
import { BoxedButton } from '../../components/shared/BoxedButton';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Idea Intake & Scoping Intake',
      subtitle: 'Describe your vision with zero technical jargon required',
      icon: Lightbulb,
      badge: 'Step 1 · Client Intake',
      color: 'from-[#7357FF] to-[#917AFF]',
      details: [
        'Enter project title, target industry, and core problem to solve.',
        '50 NCX tokens deducted from client vault upon intake validation.',
        'Supports attachments, initial user sketches, and sample competitors.'
      ],
      output: 'Intake Dossier Registered in Nexus Engine'
    },
    {
      step: '02',
      title: 'AI 17-Section Architecture Blueprint',
      subtitle: 'Google Gemini AI synthesizes a production-grade blueprint in seconds',
      icon: FileCode2,
      badge: 'Step 2 · AI Intelligence',
      color: 'from-[#3978FF] to-[#5993FF]',
      details: [
        'Complete 17-section specification: Architecture, Database ERD, REST APIs, Security, and CI/CD.',
        'Risk matrix and milestone recommendations computed automatically.',
        'Interactive Blueprint Studio lets clients review and propose edits.'
      ],
      output: '17-Section Approved Project Blueprint'
    },
    {
      step: '03',
      title: 'Administrative Triage & Capacity Matching',
      subtitle: 'Human engineering leads review specifications and assign vetted talent',
      icon: Users,
      badge: 'Step 3 · Human Governance',
      color: 'from-[#00C2A0] to-[#20D9B8]',
      details: [
        'Admin reviews blueprint through the Nexus SLA & Bottleneck Radar.',
        'Specialist Capacity Planner evaluates workload to prevent burnout.',
        'Confidential DocumentShare dispatches encrypted briefs to top talent.'
      ],
      output: 'Confidential Specialist Assignment'
    },
    {
      step: '04',
      title: 'Milestone Build & Protected Escrow',
      subtitle: 'Development commences with 100% financial protection in NCX escrow',
      icon: Lock,
      badge: 'Step 4 · Execution & Escrow',
      color: 'from-[#FF9900] to-[#FFB74D]',
      details: [
        'Specialist submits technical feasibility assessment and formal quotation.',
        'Client approves quote and funds lock safely in milestone escrow.',
        'Progress tracked via Kanban boards, worklogs, and effort variance gauges.'
      ],
      output: 'Protected Escrow Lock & Live Task Tracking'
    },
    {
      step: '05',
      title: 'Cryptographic SHA-256 Handover',
      subtitle: 'Deliverables verified with checksum integrity before final sign-off',
      icon: CheckCircle2,
      badge: 'Step 5 · Verified Delivery',
      color: 'from-[#7357FF] to-[#3978FF]',
      details: [
        'Specialist runs Pre-Submission Readiness Inspector and uploads ZIP archive.',
        'System computes immutable SHA-256 cryptographic hash server-side.',
        'Client tests deliverable, rates quality (1–5 stars), and releases payout.'
      ],
      output: 'SHA-256 Verified Release & Escrow Payout'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Hero Header */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>The NexusCraft 5-Step Lifecycle</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          How Vague Concepts Become <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Verified Software</span>
        </h1>
        <p className="text-base sm:text-lg text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          No endless bidding wars. No scope ambiguity. NexusCraft pairs automated AI scoping with rigorous administrative governance and escrow protection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <NavLink to="/submit-request">
            <BoxedButton variant="primary" size="lg" className="flex items-center gap-2">
              <span>Start Your Project (50 NCX)</span>
              <ArrowRight className="w-4 h-4" />
            </BoxedButton>
          </NavLink>
          <NavLink to="/blueprint-sample">
            <BoxedButton variant="secondary" size="lg">
              View Sample 17-Section Blueprint
            </BoxedButton>
          </NavLink>
        </div>
      </section>

      {/* 5-Step Deep Dive */}
      <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        {steps.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            >
              {/* Step Number Background Accent */}
              <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-slate-100/80 select-none pointer-events-none font-display">
                {s.step}
              </div>

              <div className="space-y-4 max-w-2xl relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center font-bold text-lg shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF] block">
                      {s.badge}
                    </span>
                    <h3 className="font-display font-bold text-2xl text-[#17172B]">
                      {s.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm font-medium text-[#777B8A]">
                  {s.subtitle}
                </p>

                <ul className="space-y-2 pt-2">
                  {s.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#525468]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7357FF] mt-1.5 flex-shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full lg:w-72 p-5 rounded-2xl bg-[#F7F8FC] border border-[#E9EAF0] space-y-3 relative z-10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777B8A]">
                  Guaranteed Output
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-[#17172B]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{s.output}</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Comparison Strip */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-white border border-[#E9EAF0] text-center space-y-6">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#17172B]">
            Why Traditional Freelance Platforms Fail Founders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left pt-6">
            <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-rose-600">
                Traditional Marketplaces (Upwork / Fiverr)
              </span>
              <ul className="space-y-2 text-xs text-rose-950/80">
                <li>❌ 50+ copy-pasted bot bids with unrealistic rates</li>
                <li>❌ Vague requirements leading to constant mid-project disputes</li>
                <li>❌ No code auditing or architectural verification</li>
                <li>❌ Client pays 100% upfront or gets locked in escrow disputes</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-emerald-600">
                The NexusCraft Standard
              </span>
              <ul className="space-y-2 text-xs text-emerald-950/80">
                <li>✅ 17-section AI blueprint ensures crystal-clear scope</li>
                <li>✅ Direct matching with vetted specialists based on verified capacity</li>
                <li>✅ SHA-256 cryptographic deliverable verification</li>
                <li>✅ Milestone escrow funds release only upon client inspection</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default HowItWorksPage;
