import React from 'react';
import {
  Sparkles,
  Layers,
  ListOrdered,
  Code2,
  AlertTriangle,
  ShieldAlert,
  Milestone,
  DollarSign,
  Scale
} from 'lucide-react';
import { PublicAiBlueprintSandbox } from './PublicAiBlueprintSandbox';

const AI_CAPABILITIES = [
  {
    title: 'Idea Enhancement',
    description: 'Expands raw one-sentence concepts into crisp product vision pitches.',
    icon: <Sparkles className="w-4 h-4 text-[#7357FF]" />
  },
  {
    title: 'Blueprint Generation',
    description: 'Synthesizes complete 17-section software architectural plans in seconds.',
    icon: <Layers className="w-4 h-4 text-[#3978FF]" />
  },
  {
    title: 'Feature Prioritization',
    description: 'Structures proposed features into actionable P0/P1/P2 MoSCoW matrices.',
    icon: <ListOrdered className="w-4 h-4 text-[#24A675]" />
  },
  {
    title: 'Technology Stack Advisory',
    description: 'Recommends production-tested frontend, backend, and database frameworks.',
    icon: <Code2 className="w-4 h-4 text-[#7357FF]" />
  },
  {
    title: 'Requirement Gap Detection',
    description: 'Uncovers missing edge-cases, error states, and unstated assumptions.',
    icon: <AlertTriangle className="w-4 h-4 text-[#E45D6D]" />
  },
  {
    title: 'Risk & Complexity Analysis',
    description: 'Evaluates architectural complexity and third-party dependency vulnerabilities.',
    icon: <ShieldAlert className="w-4 h-4 text-[#3978FF]" />
  },
  {
    title: 'Development Roadmap',
    description: 'Maps chronological milestones, dependencies, and delivery stages.',
    icon: <Milestone className="w-4 h-4 text-[#24A675]" />
  },
  {
    title: 'Cost Estimation',
    description: 'Estimates component hours and realistic software engineering budgets.',
    icon: <DollarSign className="w-4 h-4 text-[#7357FF]" />
  },
  {
    title: 'Budget Feasibility',
    description: 'Analyzes client budget alignment and advises on phased MVP staging.',
    icon: <Scale className="w-4 h-4 text-[#3978FF]" />
  }
];

export const AiIntelligenceSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#F5F6FA] border-b border-[#E9EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7357FF] bg-[#E9E3FF] px-3.5 py-1 rounded-full">
            INTELLIGENT SCOPING ENGINE
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#222438] tracking-tight">
            Make Better Project Decisions With AI.
          </h2>
          <p className="text-sm sm:text-base text-[#777B8A]">
            NexusCraft leverages Google Gemini models via server-side orchestration to eliminate ambiguity before engineering begins.
          </p>
        </div>

        {/* 9 Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_CAPABILITIES.map((cap, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm flex items-start gap-3 hover:border-[#7357FF]/30 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-center flex-shrink-0 mt-0.5">
                {cap.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#222438]">
                  {cap.title}
                </h4>
                <p className="text-[11px] text-[#777B8A] leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Interactive Blueprint Sandbox */}
        <div className="pt-6">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#7357FF]">
              INTERACTIVE DEMONSTRATION SANDBOX
            </span>
            <h3 className="font-display font-bold text-xl text-[#222438] mt-1">
              Explore Live Scoping Before Registering
            </h3>
          </div>
          <PublicAiBlueprintSandbox />
        </div>

      </div>
    </section>
  );
};

export default AiIntelligenceSection;

