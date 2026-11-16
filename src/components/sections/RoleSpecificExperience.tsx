import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldAlert,
  Code2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { BoxedButton } from '../shared/BoxedButton';

export const RoleSpecificExperience: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const handleStartIdea = () => {
    if (isAuthenticated) {
      navigate('/submit-request');
    } else {
      navigate('/login?redirect=/submit-request');
    }
  };

  return (
    <section className="py-24 bg-white border-b border-[#E9EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7357FF] bg-[#E9E3FF] px-3.5 py-1 rounded-full">
            ROLE-SPECIFIC EXPERIENCES
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] tracking-tight">
            Designed for Every Stakeholder in the Project Lifecycle.
          </h2>
          <p className="text-sm sm:text-base text-[#777B8A]">
            Whether you are bringing an idea, managing project quality, or building production code, NexusCraft gives you a dedicated workspace.
          </p>
        </div>

        {/* 1. For Clients */}
        <div id="for-clients" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold uppercase">
              <User className="w-3.5 h-3.5" />
              <span>FOR CLIENTS & PRODUCT FOUNDERS</span>
            </div>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] leading-tight">
              Your Idea Deserves a Clear Path.
            </h3>
            <p className="text-sm sm:text-base text-[#777B8A] leading-relaxed">
              Don't let complex technical questionnaires or marketplace chaos stop your product idea. Submit what you have in mind, receive an automated AI blueprint, review clear milestone costs, and track delivery progress without technical confusion.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Title-only low-friction intake — start with just a project concept</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Instant 17-section AI blueprint outlining suggested architecture and modules</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Full financial clarity: transparent platform margins and milestone escrows</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Guaranteed code quality: receive only administrator-approved ZIP releases</span>
              </div>
            </div>

            <div className="pt-4">
              <BoxedButton
                variant="primary"
                size="md"
                onClick={handleStartIdea}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Start Your Project
              </BoxedButton>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#F5F6FA] border border-[#E9EAF0] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EAF0]">
              <span className="text-xs font-bold text-[#222438]">Client Workspace Telemetry</span>
              <span className="text-[10px] font-mono text-[#24A675] bg-[#E9F9F2] px-2 py-0.5 rounded font-bold">● Active Project</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-2">
                <span className="text-[10px] font-bold text-[#7357FF] uppercase">Stage 02: AI Blueprint</span>
                <h5 className="font-bold text-sm text-[#222438]">SaaS Billing & Subscription Engine</h5>
                <p className="text-xs text-[#777B8A]">4 Modules Proposed · Estimated Duration: 5 Weeks</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#777B8A] uppercase">Commercial Estimate</span>
                  <div className="font-display font-extrabold text-base text-[#222438]">₹1,65,000</div>
                </div>
                <span className="text-xs font-bold text-[#24A675] bg-[#E9F9F2] px-3 py-1 rounded-xl">20% Protected Take-Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. For Administrators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 p-8 rounded-3xl bg-[#F5F6FA] border border-[#E9EAF0] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EAF0]">
              <span className="text-xs font-bold text-[#222438]">Governance & Control Queue</span>
              <span className="text-[10px] font-mono text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded font-bold">Admin Authority</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#222438]">Triage Drawer</span>
                  <span className="text-[#3978FF]">Active Scoping</span>
                </div>
                <p className="text-xs text-[#777B8A]">Review client input, trigger Gemini synthesis, and assign vetted specialists.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#222438]">Deliverable Gatekeeper</span>
                  <span className="text-[#24A675]">Pass</span>
                </div>
                <p className="text-xs text-[#777B8A]">Automated ZIP package manifest inspector: package.json verified, SHA-256 integrity match.</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#E9F1FF] text-[#3978FF] text-xs font-mono font-bold uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>FOR ADMINISTRATORS & GOVERNANCE</span>
            </div>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] leading-tight">
              Complete Control Over Project Delivery.
            </h3>
            <p className="text-sm sm:text-base text-[#777B8A] leading-relaxed">
              Administrators act as the central quality engine. Ensure requirements meet enterprise engineering standards, assign vetted talent privately, control document sharing with secure audit logging, and verify code packages before releasing to clients.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>24-Hour Attention Queue with automated review deadline countdowns</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Smart 100-point freelancer recommendation engine based on proven stack skills</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Commercial margin calculator with under-20% margin alerts and audit logs</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Release gate authorization preventing unverified code from reaching clients</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. For Freelancers */}
        <div id="for-freelancers" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#E9F9F2] text-[#24A675] text-xs font-mono font-bold uppercase">
              <Code2 className="w-3.5 h-3.5" />
              <span>FOR FREELANCERS & SPECIALISTS</span>
            </div>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] leading-tight">
              Turn Your Skills Into Real Deliverables.
            </h3>
            <p className="text-sm sm:text-base text-[#777B8A] leading-relaxed">
              No proposal bidding wars or racing to the bottom. Receive direct, governed private project allocations matched to your core competencies. Submit technical assessments, milestone quotations, and verified deliverables with protected payments.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Private project briefs matched directly to your technology profile</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Feasibility assessment scorecards and binding milestone quotations</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Today's Delivery Timeline with overdue alerts and milestone tracking</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#222438]">
                <CheckCircle2 className="w-4 h-4 text-[#24A675] flex-shrink-0" />
                <span>Automated ZIP deliverable verification with SHA-256 cryptographic proof</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#F5F6FA] border border-[#E9EAF0] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EAF0]">
              <span className="text-xs font-bold text-[#222438]">Specialist Portal Telemetry</span>
              <span className="text-[10px] font-mono text-[#24A675] bg-[#E9F9F2] px-2 py-0.5 rounded font-bold">● Available (100% Profile)</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-2">
                <span className="text-[10px] font-bold text-[#24A675] uppercase">Feasibility Assessment</span>
                <h5 className="font-bold text-sm text-[#222438]">Technical Verdict: High Feasibility (92/100)</h5>
                <p className="text-xs text-[#777B8A]">Estimated Hours: 120h · Stack: React 19, TypeScript, Node.js</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#777B8A] uppercase">Approved Quotation</span>
                  <div className="font-display font-extrabold text-base text-[#24A675]">₹1,44,000</div>
                </div>
                <span className="text-xs font-bold text-[#7357FF] bg-[#E9E3FF] px-3 py-1 rounded-xl">Escrow Protected</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default RoleSpecificExperience;
