import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

type WorkspaceTab = 'client' | 'admin' | 'freelancer';

export const ProductWorkspacePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('client');

  return (
    <section className="py-24 bg-white border-b border-[#E9EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7357FF] bg-[#E9E3FF] px-3.5 py-1 rounded-full">
            INTEGRATED WORKSPACES
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] tracking-tight">
            One Workspace. Your Entire Project Journey.
          </h2>
          <p className="text-sm sm:text-base text-[#777B8A]">
            Experience specialized interfaces tailored to Clients, Administrators, and Technical Specialists.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex justify-center">
          <div className="p-1.5 rounded-2xl bg-[#F5F6FA] border border-[#E9EAF0] flex flex-wrap gap-2 shadow-inner">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'client'
                  ? 'bg-white text-[#7357FF] shadow-sm'
                  : 'text-[#777B8A] hover:text-[#222438]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Client Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-white text-[#7357FF] shadow-sm'
                  : 'text-[#777B8A] hover:text-[#222438]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('freelancer')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'freelancer'
                  ? 'bg-white text-[#7357FF] shadow-sm'
                  : 'text-[#777B8A] hover:text-[#222438]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Freelancer Workspace</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Client Workspace Preview */}
        {activeTab === 'client' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F5F6FA] border border-[#E9EAF0] shadow-xl animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9EAF0] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded">
                  CLIENT PORTAL VIEW
                </span>
                <h3 className="text-xl font-display font-extrabold text-[#222438] mt-1">
                  Project Passport & Delivery Command
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#777B8A]">NCX Utility Balance:</span>
                <span className="px-3 py-1 rounded-xl bg-[#E9E3FF] text-[#7357FF] font-mono font-bold text-xs">
                  500 NCX
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-1">
                <span className="text-[10px] text-[#777B8A] uppercase font-bold">Active Requests</span>
                <h4 className="text-2xl font-black text-[#222438]">3 Projects</h4>
                <p className="text-[11px] text-[#24A675] font-semibold">1 In Active Build</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-1">
                <span className="text-[10px] text-[#777B8A] uppercase font-bold">AI Blueprint Status</span>
                <h4 className="text-2xl font-black text-[#7357FF]">Approved</h4>
                <p className="text-[11px] text-[#777B8A]">17-Section Specification</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-1">
                <span className="text-[10px] text-[#777B8A] uppercase font-bold">Current Milestone</span>
                <h4 className="text-2xl font-black text-[#3978FF]">Phase 2 / 4</h4>
                <p className="text-[11px] text-[#777B8A]">Due in 11 Days</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-1">
                <span className="text-[10px] text-[#777B8A] uppercase font-bold">Verified Deliverables</span>
                <h4 className="text-2xl font-black text-[#24A675]">2 Released</h4>
                <p className="text-[11px] text-[#777B8A]">SHA-256 Validated</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Blueprint Card */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E9EAF0] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#222438]">
                    Generated AI Blueprint: Telehealth Patient Suite
                  </h4>
                  <span className="text-[10px] font-mono text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded">
                    Version 2.1 (Admin Approved)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1">
                    <span className="font-bold text-[#222438]">Suggested Modules</span>
                    <ul className="text-[#777B8A] space-y-0.5 list-disc pl-4 text-[11px]">
                      <li>Patient Encrypted Records Vault</li>
                      <li>Smart Appointment Scheduling</li>
                      <li>WebRTC Real-Time Teleconsultation</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1">
                    <span className="font-bold text-[#222438]">Proposed Milestones</span>
                    <ul className="text-[#777B8A] space-y-0.5 list-disc pl-4 text-[11px]">
                      <li>Sprint 1: Schema & Auth Matrix</li>
                      <li>Sprint 2: Video Room & Dashboard</li>
                      <li>Sprint 3: Compliance & QA Release</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Verified Documents Panel */}
              <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <h4 className="font-bold text-sm text-[#222438]">
                  Exportable Project Dossier
                </h4>
                <p className="text-xs text-[#777B8A]">
                  Full technical contracts, milestone CSV spreadsheets, and printable executive briefs.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-between text-xs">
                    <span className="font-mono text-[#222438]">project-blueprint.md</span>
                    <span className="text-[10px] font-bold text-[#7357FF]">17 Sections</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-between text-xs">
                    <span className="font-mono text-[#222438]">passport-records.csv</span>
                    <span className="text-[10px] font-bold text-[#3978FF]">Financial Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Admin Command Center Preview */}
        {activeTab === 'admin' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F5F6FA] border border-[#E9EAF0] shadow-xl animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9EAF0] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF] bg-[#E9F1FF] px-2 py-0.5 rounded">
                  ADMIN COMMAND CENTER
                </span>
                <h3 className="text-xl font-display font-extrabold text-[#222438] mt-1">
                  Intake Attention Queue & Talent Triage
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E45D6D] bg-[#FDECEC] px-3 py-1 rounded-xl">
                  ● 2 Requests Need Triage
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Attention Queue */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#222438]">Attention Queue</h4>
                  <span className="text-[10px] font-mono text-[#E45D6D] font-bold">24h SLA</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#222438]">AI Logistics Dispatch</span>
                      <span className="text-[#E45D6D]">Urgent</span>
                    </div>
                    <p className="text-[11px] text-[#777B8A]">Submitted 4 hours ago · Review Deadline: 20h remaining</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#222438]">Fintech Mobile Ledger</span>
                      <span className="text-[#3978FF]">Normal</span>
                    </div>
                    <p className="text-[11px] text-[#777B8A]">Submitted 12 hours ago · Review Deadline: 12h remaining</p>
                  </div>
                </div>
              </div>

              {/* Smart Freelancer Matching */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <h4 className="font-bold text-sm text-[#222438]">Smart Specialist Matching</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#222438]">Priya Sharma (Backend / DB)</span>
                      <span className="text-[10px] font-bold text-[#24A675] bg-[#E9F9F2] px-2 py-0.5 rounded">98% Fit</span>
                    </div>
                    <p className="text-[10px] text-[#777B8A]">Skill Score: 95/100 · 14 completed deliveries</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#222438]">Alex Rivera (Full-Stack)</span>
                      <span className="text-[10px] font-bold text-[#3978FF] bg-[#E9F1FF] px-2 py-0.5 rounded">91% Fit</span>
                    </div>
                    <p className="text-[10px] text-[#777B8A]">Skill Score: 88/100 · 9 completed deliveries</p>
                  </div>
                </div>
              </div>

              {/* Commercial Pricing Drawer */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <h4 className="font-bold text-sm text-[#222438]">Commercial Margin Drawer</h4>
                <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#777B8A]">Specialist Quotation:</span>
                    <span className="font-bold text-[#222438]">₹1,50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777B8A]">Platform Take-Rate:</span>
                    <span className="font-bold text-[#3978FF]">20% (₹37,500)</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E9EAF0] pt-1.5 font-bold">
                    <span className="text-[#222438]">Final Client Invoice:</span>
                    <span className="text-[#24A675]">₹1,87,500</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#777B8A] block">
                  Automatic audit trail logging to immutable ledger.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Freelancer Workspace Preview */}
        {activeTab === 'freelancer' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F5F6FA] border border-[#E9EAF0] shadow-xl animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9EAF0] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#24A675] bg-[#E9F9F2] px-2 py-0.5 rounded">
                  SPECIALIST WORKSPACE VIEW
                </span>
                <h3 className="text-xl font-display font-extrabold text-[#222438] mt-1">
                  Feasibility Assessment & Deliverable Pipeline
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-[#E9F9F2] text-[#24A675] font-bold text-xs">
                  ● Status: Available for Projects
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feasibility Review */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <h4 className="font-bold text-sm text-[#222438]">Feasibility Assessment</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#222438]">Technical Verdict</span>
                      <span className="text-[#24A675]">Feasible (94/100)</span>
                    </div>
                    <p className="text-[11px] text-[#777B8A]">Stack compatibility verified. Architecture risk low.</p>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[#F8F9FD]">
                    <span className="text-[#777B8A]">Estimated Hours:</span>
                    <span className="font-bold text-[#222438]">140 Hours</span>
                  </div>
                </div>
              </div>

              {/* Task Sprint Board */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <h4 className="font-bold text-sm text-[#222438]">Delivery Timeline</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex justify-between items-center">
                    <span className="font-bold text-[#222438]">Milestone 1: DB Contracts</span>
                    <span className="text-[10px] text-[#24A675] font-bold">Completed</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex justify-between items-center">
                    <span className="font-bold text-[#222438]">Milestone 2: API Gateway</span>
                    <span className="text-[10px] text-[#3978FF] font-bold">In Progress</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex justify-between items-center">
                    <span className="font-bold text-[#222438]">Milestone 3: UI Integration</span>
                    <span className="text-[10px] text-[#777B8A]">Next</span>
                  </div>
                </div>
              </div>

              {/* ZIP Package Submissions */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] space-y-3">
                <h4 className="font-bold text-sm text-[#222438]">Package ZIP Submissions</h4>
                <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-[#222438]">deliverable-v2.0.zip</span>
                    <span className="text-[#777B8A]">38 MB</span>
                  </div>
                  <div className="text-[10px] text-[#777B8A] font-mono">
                    SHA-256: 4a2e...91fc
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#24A675] font-bold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Manifest Passed & Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductWorkspacePreview;
