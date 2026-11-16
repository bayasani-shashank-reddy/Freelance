import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  FileCheck2,
  Activity
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { BoxedButton } from '../shared/BoxedButton';

export const NexusCraftHero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const handleStartProject = () => {
    if (isAuthenticated) {
      navigate('/submit-request');
    } else {
      navigate('/login?redirect=/submit-request');
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#F5F6FA] text-[#222438]">
      {/* Background Decorative Soft Lavender & Blue Ambient Glows (Kothok SaaS style) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#E9E3FF]/80 via-[#E9F1FF]/70 to-[#E9E3FF]/80 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute -top-24 right-10 w-96 h-96 bg-[#7357FF]/8 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── Hero Heading & Value Proposition ─── */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Small Introductory Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9E3FF] border border-[#7357FF]/20 text-[#7357FF] text-xs font-semibold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#7357FF]" />
            <span>AI-POWERED PROJECT INTELLIGENCE PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-6xl text-[#222438] tracking-tight leading-[1.12]">
            Turn Your Ideas <br className="hidden sm:block" />
            Into <span className="text-[#7357FF]">Real Projects.</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-[#777B8A] leading-relaxed max-w-2xl mx-auto">
            Transform your ideas into structured project blueprints, connect with skilled freelancers, understand development costs and manage your complete project journey with NexusCraft.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <BoxedButton
              variant="primary"
              size="lg"
              onClick={handleStartProject}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="bg-[#7357FF] hover:bg-[#5B42D6] text-white shadow-lg shadow-[#7357FF]/25 font-bold"
            >
              Start Your Project
            </BoxedButton>

            <button
              onClick={handleScrollToHowItWorks}
              className="px-6 py-3 rounded-2xl bg-white border border-[#E9EAF0] text-[#222438] hover:text-[#7357FF] hover:border-[#7357FF]/40 text-sm font-bold shadow-sm transition-all"
            >
              Explore How It Works
            </button>
          </div>

          {/* Supporting Trust Line */}
          <p className="text-xs text-[#777B8A] font-medium pt-1">
            From initial idea to approved software delivery — all in one workspace.
          </p>
        </div>

        {/* ─── Hero Visual: Realistic NexusCraft Software Dashboard Mockup ─── */}
        <div className="mt-14 relative max-w-6xl mx-auto">
          
          {/* Outer Browser/App Window Shell */}
          <div className="rounded-3xl bg-white border border-[#E9EAF0] shadow-2xl shadow-[#7357FF]/10 overflow-hidden">
            
            {/* Window Top Titlebar */}
            <div className="bg-[#F8F9FD] border-b border-[#E9EAF0] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E45D6D]" />
                <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                <div className="w-3 h-3 rounded-full bg-[#24A675]" />
                <span className="text-xs font-mono font-semibold text-[#777B8A] ml-2 hidden sm:inline">
                  nexuscraft.app / workspace / PRJ-2026-CLINIC
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E9F1FF] text-[#3978FF]">
                  <Activity className="w-3 h-3 text-[#3978FF]" />
                  Active Milestone 3 of 4
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E9E3FF] text-[#7357FF]">
                  <Cpu className="w-3 h-3" />
                  Gemini Scoped
                </span>
              </div>
            </div>

            {/* Dashboard Content Mockup Grid (Flowly / Jaida style) */}
            <div className="p-6 sm:p-8 bg-[#F5F6FA] space-y-6">
              
              {/* 1. Project Overview & Progress Indicator Bar */}
              <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded">
                      HEALTHCARE SAAS
                    </span>
                    <span className="text-xs text-[#777B8A] font-mono font-medium">ID: PRJ-8842-NX</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#222438]">
                    Clinical EHR & Telehealth Patient Intelligence System
                  </h3>
                  <p className="text-xs text-[#777B8A]">
                    Target Scope: Encrypted health records, WebRTC peer teleconsultation, and automated billing intake.
                  </p>
                </div>

                {/* Progress Bar & KPI Stats */}
                <div className="flex items-center gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#E9EAF0]">
                  <div className="space-y-1 min-w-[140px]">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#777B8A]">Project Progress</span>
                      <span className="text-[#7357FF]">68%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E9EAF0] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#7357FF] to-[#3978FF] rounded-full w-[68%]" />
                    </div>
                    <span className="text-[10px] text-[#777B8A] block">2 of 3 Sprints Verified</span>
                  </div>

                  <div className="text-right border-l border-[#E9EAF0] pl-6 hidden sm:block">
                    <span className="text-[10px] font-bold text-[#777B8A] uppercase block">Token Reserve</span>
                    <span className="font-display font-extrabold text-lg text-[#7357FF]">500 NCX</span>
                  </div>
                </div>
              </div>

              {/* 3-Column Feature Cards: AI Blueprint Preview, Freelancer Card, Cost Intel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 2. AI Blueprint Preview Card */}
                <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#24A675] bg-[#E9F9F2] px-2 py-0.5 rounded-full">
                        ✓ 17-Section Approved
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-[#222438]">
                        AI Architectural Blueprint
                      </h4>
                      <p className="text-[11px] text-[#777B8A] mt-0.5">
                        Synthesized by Gemini 1.5 Flash with full stack requirements.
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-between">
                        <span className="text-[#222438]">Frontend Stack</span>
                        <span className="font-bold text-[#7357FF]">React 19 + Vite</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-between">
                        <span className="text-[#222438]">Backend API</span>
                        <span className="font-bold text-[#3978FF]">Node.js Express</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-between">
                        <span className="text-[#222438]">Database</span>
                        <span className="font-bold text-[#24A675]">MongoDB Atlas</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#7357FF] font-bold flex items-center gap-1 pt-1">
                    <span>Exportable in Passport & Markdown</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* 3. Freelancer Assignment Card */}
                <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#E9F1FF] text-[#3978FF] flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#3978FF] bg-[#E9F1FF] px-2 py-0.5 rounded-full">
                        Private Allocation
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-[#222438]">
                        Assigned Specialist
                      </h4>
                      <p className="text-[11px] text-[#777B8A] mt-0.5">
                        Matched via Nexus Private Talent Intelligence.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-bold text-xs">
                        MC
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-[#222438] truncate">Marcus Chen</h5>
                        <p className="text-[10px] text-[#777B8A]">Principal Full-Stack Engineer</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#24A675] block">96% Fit</span>
                        <span className="text-[9px] text-[#777B8A]">Available</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#777B8A]">
                      <div className="flex justify-between">
                        <span>Technical Assessment:</span>
                        <span className="font-bold text-[#24A675]">Feasible (Score 94)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quotation Status:</span>
                        <span className="font-bold text-[#222438]">₹1,85,000 (Approved)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#3978FF] font-bold flex items-center gap-1 pt-1">
                    <span>Direct Admin-Mediated Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* 4. Cost Estimation & Commercial Ledger Panel */}
                <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#E9F9F2] text-[#24A675] flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded-full">
                        Transparent Margin
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-[#222438]">
                        Cost Intelligence
                      </h4>
                      <p className="text-[11px] text-[#777B8A] mt-0.5">
                        Granular component pricing with safe buffer allocation.
                      </p>
                    </div>

                    <div className="space-y-2 p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#777B8A]">Base Specialist Fee:</span>
                        <span className="font-bold text-[#222438]">₹1,85,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777B8A]">Platform Take-Rate (20%):</span>
                        <span className="font-bold text-[#3978FF]">₹46,250</span>
                      </div>
                      <div className="flex justify-between border-t border-[#E9EAF0] pt-1.5 font-bold">
                        <span className="text-[#222438]">Total Client Price:</span>
                        <span className="text-[#24A675]">₹2,31,250</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#777B8A]">
                      <Clock className="w-3.5 h-3.5 text-[#7357FF]" />
                      <span>Estimated Timeline: 6-8 Weeks Delivery</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#24A675] font-bold flex items-center gap-1 pt-1">
                    <span>Milestone Escrow Protected</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

              </div>

              {/* 5. Bottom Row: Requirements Checklist & Verified Deliverable Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                
                {/* Requirements Checklist */}
                <div className="p-4 rounded-xl bg-white border border-[#E9EAF0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#222438] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#24A675]" />
                      Verified Scoping Requirements (MoSCoW)
                    </span>
                    <span className="text-[10px] font-mono text-[#777B8A]">6 Items</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F9FD]">
                      <span className="text-[#222438]">P0: Role-Based Access Control (Client, Specialist, Admin)</span>
                      <span className="text-[10px] font-bold text-[#24A675] bg-[#E9F9F2] px-2 py-0.5 rounded">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F9FD]">
                      <span className="text-[#222438]">P1: Real-time WebSockets state synchronization</span>
                      <span className="text-[10px] font-bold text-[#3978FF] bg-[#E9F1FF] px-2 py-0.5 rounded">In Review</span>
                    </div>
                  </div>
                </div>

                {/* Deliverable Approval Status */}
                <div className="p-4 rounded-xl bg-white border border-[#E9EAF0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#222438] flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#7357FF]" />
                      Verified Deliverable Center (Package Integrity)
                    </span>
                    <span className="text-[10px] font-mono text-[#24A675] font-bold">Admin Verified</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8F9FD] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#222438] font-bold">clinical-suite-v1.4.zip</span>
                      <span className="text-[10px] text-[#777B8A]">42.8 MB</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#777B8A] font-mono">
                      <span>SHA-256: 7f8a92c...e43b</span>
                      <span className="text-[#24A675] font-bold">Checksum Match ✓</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default NexusCraftHero;
