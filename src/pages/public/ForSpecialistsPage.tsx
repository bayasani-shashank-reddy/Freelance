import React from 'react';
import { NavLink } from 'react-router-dom';
import { Terminal, Shield, FileCheck, DollarSign, Clock, ArrowRight, Zap, Code, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';
import { BoxedButton } from '../../components/shared/BoxedButton';

export const ForSpecialistsPage: React.FC = () => {
  const pillars = [
    {
      title: 'Zero Bidding Wars',
      desc: 'Never spend 20 hours a week submitting free proposals against low-balling competitors. Projects are assigned directly based on your verified skills and bandwidth.',
      icon: Terminal
    },
    {
      title: '17-Section Architecture Briefs',
      desc: 'Every assigned project comes with a comprehensive 17-section blueprint specifying database schemas, API payload structures, UI states, and definition of done.',
      icon: FileCheck
    },
    {
      title: '100% Guaranteed Escrow Payouts',
      desc: 'Client funds are locked securely in milestone escrow before sprint kickoff. When your deliverable passes SHA-256 verification and client sign-off, funds release automatically.',
      icon: DollarSign
    },
    {
      title: 'Effort vs Estimate Tracker',
      desc: 'Log hours transparently against your original quotation. Catch variance early so scope modifications can be routed through the Admin Scope Change Analyzer.',
      icon: Clock
    },
    {
      title: 'Pre-Submission Readiness Inspector',
      desc: 'Client-side ZIP validator checks package sizes, filenames, and release documentation before upload, preventing rejected deliveries.',
      icon: Shield
    },
    {
      title: '1-Click Technical Runbook Generator',
      desc: 'Generate clean, production-grade Markdown handbooks documenting environment variables, installation steps, and test scripts with a single click.',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Code className="w-4 h-4" />
          <span>For Senior Software Engineers & Product Designers</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          Build Great Software Without <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Marketplace Chaos</span>
        </h1>
        <p className="text-base sm:text-lg text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          Receive clear, architecture-approved 17-section briefs, enjoy guaranteed milestone escrow funding, and build with professional engineering tooling.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <NavLink to="/register?role=freelancer">
            <BoxedButton variant="primary" size="lg" className="flex items-center gap-2">
              <span>Apply as a Specialist</span>
              <ArrowRight className="w-4 h-4" />
            </BoxedButton>
          </NavLink>
          <NavLink to="/how-it-works">
            <BoxedButton variant="secondary" size="lg">
              How the Execution Works
            </BoxedButton>
          </NavLink>
        </div>
      </section>

      {/* 6 Specialist Pillars */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="p-8 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7357FF]/10 to-[#3978FF]/10 text-[#7357FF] flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#17172B]">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#65677A] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What Done Looks Like */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#17172B] text-white space-y-6">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#D5FF68]" />
            <h2 className="font-display font-extrabold text-2xl text-white">
              The Specialist Code of Delivery
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            When you complete a milestone on NexusCraft, you deliver a clean, audited package. Here is what is included with every delivery:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D5FF68]">01. Source Code</span>
              <p className="text-xs text-white/80">Clean, typed, linted source code matching the 17-section blueprint architecture.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D5FF68]">02. Runbook & Env</span>
              <p className="text-xs text-white/80">Automated Markdown technical runbook documenting dependencies, env vars, and start commands.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D5FF68]">03. SHA-256 Vault</span>
              <p className="text-xs text-white/80">Cryptographic hash generated automatically on ZIP upload, guaranteeing package integrity.</p>
            </div>
          </div>
        </div>
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default ForSpecialistsPage;
