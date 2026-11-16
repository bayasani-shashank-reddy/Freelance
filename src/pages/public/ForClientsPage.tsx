import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Sparkles, FileText, CheckCircle2, ArrowRight, Layers, Lock, Building } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';
import { BoxedButton } from '../../components/shared/BoxedButton';

export const ForClientsPage: React.FC = () => {
  const benefits = [
    {
      title: 'Zero Scope Ambiguity',
      desc: 'Never receive surprise bills or "out of scope" delays. Google Gemini AI turns your initial description into a comprehensive 17-section technical blueprint before coding starts.',
      icon: FileText
    },
    {
      title: 'No Freelancer Bidding Chaos',
      desc: 'Skip reading 50 generic proposals. Our Admin Governance team matches your project directly with pre-vetted specialists who have verified bandwidth on our Capacity Planner.',
      icon: UsersIcon
    },
    {
      title: '100% Protected Escrow',
      desc: 'Your funds are secured in NCX token milestone escrow. Freelancers are paid only after you inspect the code deliverable, review test results, and click Accept.',
      icon: Lock
    },
    {
      title: 'Cryptographic Code Integrity',
      desc: 'Every code deliverable is packaged as a ZIP archive with a server-computed SHA-256 hash, ensuring the codebase you tested is exactly what is delivered.',
      icon: ShieldCheck
    },
    {
      title: 'Interactive Decision Center',
      desc: 'Stay in control with clean one-click cards for approving technical trade-offs, third-party vendor choices, and design variations.',
      icon: CheckCircle2
    },
    {
      title: 'Full Intellectual Property Transfer',
      desc: 'All source code, design assets, and architecture blueprints are 100% client-owned from the moment milestones are approved.',
      icon: Sparkles
    }
  ];

  function UsersIcon(props: any) {
    return <Layers {...props} />;
  }

  const comparison = [
    {
      metric: 'Scoping Quality',
      nexus: '17-Section AI Architecture Blueprint',
      traditionalMarket: 'Vague 2-paragraph client brief',
      agency: 'High-fee 4-week manual discovery'
    },
    {
      metric: 'Bidding Process',
      nexus: 'Direct assignment based on capacity radar',
      traditionalMarket: 'Chaotic bidding war with 50+ bots',
      agency: 'Opaque staffing without client choice'
    },
    {
      metric: 'Payment Safety',
      nexus: 'Milestone escrow with SHA-256 verification',
      traditionalMarket: 'Arbitration risks and manual disputes',
      agency: 'Large upfront non-refundable retainer'
    },
    {
      metric: 'Time to First Sprint',
      nexus: '< 48 Hours',
      traditionalMarket: '2–3 weeks of screening and interviews',
      agency: '4–8 weeks of onboarding and contracts'
    },
    {
      metric: 'Scope Flexibility',
      nexus: 'Integrated Scope Change Impact Analyzer',
      traditionalMarket: 'Uncontrolled scope creep or abandoned work',
      agency: 'Heavy change-order fee multipliers'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Building className="w-4 h-4" />
          <span>Built for Startup Founders & Product Teams</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          Commission Custom Software with <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Complete Predictability</span>
        </h1>
        <p className="text-base sm:text-lg text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          Transform your product idea into an approved 17-section blueprint, match with verified specialists, and release payments only after verified deliverable inspection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <NavLink to="/submit-request">
            <BoxedButton variant="primary" size="lg" className="flex items-center gap-2">
              <span>Submit Your Idea (50 NCX)</span>
              <ArrowRight className="w-4 h-4" />
            </BoxedButton>
          </NavLink>
          <NavLink to="/blueprint-sample">
            <BoxedButton variant="secondary" size="lg">
              Explore Blueprint Sample
            </BoxedButton>
          </NavLink>
        </div>
      </section>

      {/* 6 Core Client Pillars */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="p-8 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7357FF]/10 to-[#3978FF]/10 text-[#7357FF] flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#17172B]">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#65677A] leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Head-to-Head Comparison Table */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#17172B]">
            How NexusCraft Compares
          </h2>
          <p className="text-xs sm:text-sm text-[#777B8A]">
            Why founders are migrating away from traditional marketplaces and high-overhead agencies.
          </p>
        </div>

        <div className="rounded-3xl border border-[#E9EAF0] bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] border-b border-[#E9EAF0] text-[#777B8A] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-4 px-6">Evaluation Metric</th>
                <th className="py-4 px-6 text-[#7357FF] font-bold bg-[#E9E3FF]/30">NexusCraft Standard</th>
                <th className="py-4 px-6">Traditional Marketplaces</th>
                <th className="py-4 px-6">Boutique Agencies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0] text-[#222438]">
              {comparison.map((c, i) => (
                <tr key={i} className="hover:bg-[#FBFBFA]">
                  <td className="py-4 px-6 font-bold">{c.metric}</td>
                  <td className="py-4 px-6 font-semibold text-[#7357FF] bg-[#E9E3FF]/15">
                    {c.nexus}
                  </td>
                  <td className="py-4 px-6 text-[#777B8A]">{c.traditionalMarket}</td>
                  <td className="py-4 px-6 text-[#777B8A]">{c.agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default ForClientsPage;
