import React from 'react';
import {
  FileEdit,
  Cpu,
  CheckCircle,
  UserCheck,
  DollarSign,
  Lock,
  PackageCheck,
  History
} from 'lucide-react';

const BENEFITS = [
  {
    title: 'Simple Project Submission',
    description: 'Start with just a project title and working description. No exhausting 40-question forms or upfront technical commitments.',
    icon: <FileEdit className="w-5 h-5 text-[#7357FF]" />
  },
  {
    title: 'AI-Assisted Planning',
    description: 'Google Gemini intelligence generates full 17-section software blueprints, suggests tech stacks, and plans modular development sprints.',
    icon: <Cpu className="w-5 h-5 text-[#3978FF]" />
  },
  {
    title: 'Structured Requirements',
    description: 'Transform ambiguous wishlists into prioritized MoSCoW requirement matrices (Must-Have, Should-Have, Could-Have) before code is written.',
    icon: <CheckCircle className="w-5 h-5 text-[#24A675]" />
  },
  {
    title: 'Private Freelancer Coordination',
    description: 'Direct administrative assignment of vetted specialists based on verified skills. Zero public bidding noise or unvetted applicants.',
    icon: <UserCheck className="w-5 h-5 text-[#7357FF]" />
  },
  {
    title: 'Transparent Cost Analysis',
    description: 'Clear visibility into base engineering rates, contingency buffers, and platform take-rates with zero hidden charges or surprise markups.',
    icon: <DollarSign className="w-5 h-5 text-[#24A675]" />
  },
  {
    title: 'Controlled Document Sharing',
    description: 'Fine-grained access controls for project documents and briefs with immutable audit logs recording every view and share action.',
    icon: <Lock className="w-5 h-5 text-[#E45D6D]" />
  },
  {
    title: 'Verified Deliverable Workflow',
    description: 'Automated package inspection verifies README and package.json files, calculates SHA-256 checksums, and gates client releases.',
    icon: <PackageCheck className="w-5 h-5 text-[#3978FF]" />
  },
  {
    title: 'Complete Project History',
    description: 'Immutable timeline tracking every stage: initial submission, blueprint revisions, feasibility verdicts, quotation approvals, and code handovers.',
    icon: <History className="w-5 h-5 text-[#7357FF]" />
  }
];

export const WhyNexusCraft: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#F5F6FA] border-b border-[#E9EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7357FF] bg-[#E9E3FF] px-3.5 py-1 rounded-full">
            BUILT FOR RELIABILITY
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] tracking-tight">
            Why Teams Build With NexusCraft.
          </h2>
          <p className="text-sm sm:text-base text-[#777B8A]">
            Software projects fail from poor scoping, miscommunication, and unverified handovers. NexusCraft eliminates friction with architectural rigor.
          </p>
        </div>

        {/* 8 Product Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md hover:border-[#7357FF]/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-center">
                  {b.icon}
                </div>
                <h3 className="font-display font-bold text-base text-[#222438]">
                  {b.title}
                </h3>
                <p className="text-xs text-[#777B8A] leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyNexusCraft;

