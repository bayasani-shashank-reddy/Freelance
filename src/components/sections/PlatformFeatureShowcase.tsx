import React from 'react';
import {
  Layers,
  Sparkles,
  DollarSign,
  FolderLock,
  UserCheck2,
  PackageCheck,
  CheckCircle2
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  bullets: string[];
}

const FEATURES: FeatureItem[] = [
  {
    id: 'blueprint',
    title: 'Nexus AI Blueprint',
    description: 'Turn a simple project idea into an organized software blueprint with architecture diagrams, technology stack recommendations, and milestone breakdowns.',
    icon: <Layers className="w-5 h-5 text-[#7357FF]" />,
    iconBg: 'bg-[#E9E3FF]',
    accent: '#7357FF',
    bullets: [
      '17-Section complete architectural specification',
      'Recommended frameworks for Frontend, Backend, & DB',
      'Downloadable as Markdown, Passport CSV, or PDF'
    ]
  },
  {
    id: 'requirements',
    title: 'AI Requirement Intelligence',
    description: 'Identify missing requirements, suggest features, prioritize launch blockers with MoSCoW matrices, and analyze technical edge-case risks.',
    icon: <Sparkles className="w-5 h-5 text-[#3978FF]" />,
    iconBg: 'bg-[#E9F1FF]',
    accent: '#3978FF',
    bullets: [
      'Automated MVP vs Post-MVP feature prioritization',
      'Edge-case scoping gap detector with mitigation advice',
      'Technical explanation translator for business founders'
    ]
  },
  {
    id: 'cost',
    title: 'Nexus Cost Intelligence',
    description: 'Understand project budgets, estimated engineering hours, platform margins, and freelancer quotations with 100% financial transparency.',
    icon: <DollarSign className="w-5 h-5 text-[#24A675]" />,
    iconBg: 'bg-[#E9F9F2]',
    accent: '#24A675',
    bullets: [
      'Granular hourly breakdown by component module',
      'Standardized 20% platform margin with threshold alerts',
      'Audited NCX virtual tokens + INR commercial pricing'
    ]
  },
  {
    id: 'documents',
    title: 'Nexus Document Studio',
    description: 'Manage project briefs, document versions, approvals, and secure sharing permissions between clients, admins, and verified specialists.',
    icon: <FolderLock className="w-5 h-5 text-[#E45D6D]" />,
    iconBg: 'bg-[#FDECEC]',
    accent: '#E45D6D',
    bullets: [
      'Automated HTML sanitization & secure doc storage',
      'Admin-governed sharing with watermark audit logs',
      'Revision history with immutable timestamp trails'
    ]
  },
  {
    id: 'freelancer',
    title: 'Freelancer Coordination',
    description: 'Manage private freelancer assignments, technical feasibility assessments, binding milestone quotations, and task delivery pipelines.',
    icon: <UserCheck2 className="w-5 h-5 text-[#7357FF]" />,
    iconBg: 'bg-[#E9E3FF]',
    accent: '#7357FF',
    bullets: [
      'Private assignment without public marketplace spam',
      'Feasibility scorecards (0-100) before work starts',
      'Structured Q&A Clarification Center with threaded logs'
    ]
  },
  {
    id: 'deliverables',
    title: 'Nexus Deliverable Center',
    description: 'Inspect ZIP submissions with automated package manifests, verify cryptographic SHA-256 integrity checksums, and release verified deliverables.',
    icon: <PackageCheck className="w-5 h-5 text-[#3978FF]" />,
    iconBg: 'bg-[#E9F1FF]',
    accent: '#3978FF',
    bullets: [
      'Automated AdmZip inspection for package.json & README',
      'Tamper-evident SHA-256 cryptographic checksum matching',
      'Role-gated release gate: only admin-approved code reaches client'
    ]
  }
];

export const PlatformFeatureShowcase: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-[#F5F6FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7357FF] bg-[#E9E3FF] px-3.5 py-1 rounded-full">
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] tracking-tight">
            Everything You Need to Move Your Project Forward.
          </h2>
          <p className="text-sm sm:text-base text-[#777B8A]">
            NexusCraft combines generative AI intelligence, governed talent allocation, and verified code delivery in a single platform.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="p-7 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-lg hover:border-[#7357FF]/30 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center shadow-sm`}>
                  {feature.icon}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-xl text-[#222438]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#777B8A] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-[#F0F2F9]">
                  {feature.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#222438]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#24A675] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PlatformFeatureShowcase;

