import React from 'react';
import {
  FileText,
  Cpu,
  UserCheck,
  Users,
  TrendingUp,
  PackageCheck,
  ArrowRight
} from 'lucide-react';

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
}

const STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Submit Your Idea',
    description: 'Clients describe their idea using a simple project submission form. You only need a title and a basic description to begin.',
    icon: <FileText className="w-5 h-5 text-[#7357FF]" />,
    badge: 'Low Friction Intake'
  },
  {
    number: '02',
    title: 'AI Creates Your Blueprint',
    description: 'AI generates project summaries, requirements, suggested features and a development roadmap with 4 engineering phases.',
    icon: <Cpu className="w-5 h-5 text-[#3978FF]" />,
    badge: 'Gemini 1.5 Scoping'
  },
  {
    number: '03',
    title: 'Admin Reviews Your Project',
    description: 'Administrators verify requirements, improve specifications, clarify ambiguities and approve the comprehensive project brief.',
    icon: <UserCheck className="w-5 h-5 text-[#24A675]" />,
    badge: 'Quality Governed'
  },
  {
    number: '04',
    title: 'Connect With Freelancers',
    description: 'Administrators privately assign suitable vetted freelancers based on exact project requirements, tech stack and domain skills.',
    icon: <Users className="w-5 h-5 text-[#7357FF]" />,
    badge: 'Zero Public Bidding'
  },
  {
    number: '05',
    title: 'Develop and Track',
    description: 'Freelancers submit technical feasibility assessments, binding quotations, milestone progress updates and code deliverables.',
    icon: <TrendingUp className="w-5 h-5 text-[#3978FF]" />,
    badge: 'Milestone Escrow'
  },
  {
    number: '06',
    title: 'Verified Final Delivery',
    description: 'Administrators inspect ZIP packages with automated manifest checks, verify SHA-256 hashes, approve deliverables and release to clients.',
    icon: <PackageCheck className="w-5 h-5 text-[#24A675]" />,
    badge: 'Tamper-Evident Delivery'
  }
];

export const HowItWorksWorkflow: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-[#E9EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7357FF] bg-[#E9E3FF] px-3.5 py-1 rounded-full">
            WORKFLOW & LIFECYCLE
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] tracking-tight">
            From One Simple Idea to a Complete Project.
          </h2>
          <p className="text-sm sm:text-base text-[#777B8A]">
            NexusCraft orchestrates every stage of the software delivery lifecycle so nothing falls through the cracks.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-[#F8F9FD] border border-[#E9EAF0] hover:border-[#7357FF]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E9EAF0] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    {step.icon}
                  </div>
                  <span className="font-display font-black text-2xl text-[#E9EAF0] group-hover:text-[#7357FF]/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="inline-block">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded">
                    {step.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-[#222438]">
                  {step.title}
                </h3>

                <p className="text-xs text-[#777B8A] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E9EAF0] flex items-center justify-between text-[11px] font-bold text-[#777B8A] group-hover:text-[#7357FF] transition-colors">
                <span>Stage {idx + 1} of 6</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksWorkflow;

