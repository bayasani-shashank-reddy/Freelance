import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Star
} from 'lucide-react';
import { BoxedButton } from '../shared/BoxedButton';

export const HomeValueAndFaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const trustMetrics = [
    { label: 'Deliverable Verification', value: '100% SHA-256', sub: 'Cryptographically hashed code' },
    { label: 'Scoping Architecture', value: '17 Sections', sub: 'Production-grade specification' },
    { label: 'Scope Dispute Rate', value: '0.0%', sub: 'Zero mid-project surprises' },
    { label: 'Milestone Escrow', value: '100% Protected', sub: 'Released upon client inspection' }
  ];

  const quickSteps = [
    {
      num: '01',
      title: 'Submit Raw Concept',
      desc: 'Describe your idea with zero technical jargon. 50 NCX tokens deducted from your client vault.',
      link: '/submit-request'
    },
    {
      num: '02',
      title: '17-Section AI Blueprint',
      desc: 'Google Gemini AI synthesizes schemas, REST APIs, architecture diagrams, and milestones in seconds.',
      link: '/blueprint-sample'
    },
    {
      num: '03',
      title: 'Capacity-Matched Execution',
      desc: 'Admin matches vetted specialists. Funds locked in milestone escrow and released on SHA-256 verified code.',
      link: '/how-it-works'
    }
  ];

  const testimonials = [
    {
      quote: 'Traditional agencies wanted $40k and 3 months of discovery just to spec our telemedicine portal. NexusCraft gave us an approved 17-section blueprint in 48 hours and matched a specialist who delivered ahead of schedule.',
      author: 'Dr. Marcus Vance',
      role: 'Founder & CEO, TeleHealth Global',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: 'Verified Client'
    },
    {
      quote: 'As a distributed systems engineer, NexusCraft is a breath of fresh air. No bidding against 60 spam bots. You receive a complete 17-section blueprint, client funds are locked in escrow, and you build with confidence.',
      author: 'Elena Rostova',
      role: 'Principal Full Stack Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      badge: 'Lead Specialist'
    }
  ];

  const faqs = [
    {
      q: 'What happens immediately after I submit an idea?',
      a: 'When you submit an idea at /submit-request, 50 NCX tokens are deducted from your vault. Google Gemini immediately parses your concept and generates a 17-section technical blueprint covering problem definition, database ERD, API specs, and CI/CD pipelines. The project dossier is then sent to Administrative Triage for specialist capacity matching.'
    },
    {
      q: 'How does the NCX token wallet and escrow work?',
      a: 'Every newly registered client receives a 500 NCX welcome bonus. Submitting an idea costs 50 NCX. When you approve a specialist quote, milestone funds are locked in protected escrow and release only after you inspect the code, review test results, and click Accept.'
    },
    {
      q: 'What is the 17-Section AI Blueprint standard?',
      a: 'It is our proprietary specification framework. It details Executive Overview, Personas, Functional Requirements, System Architecture, Tech Stack Justification, Database ERD, REST APIs, RBAC, Integrations, HIPAA/Security, Scalability, CI/CD, Milestones, Risks, Testing Plan, Definition of Done, and Operational Runbooks.'
    },
    {
      q: 'What is SHA-256 Deliverable Verification?',
      a: 'When a specialist finishes a milestone and uploads a ZIP archive, our server calculates an immutable SHA-256 cryptographic hash. This checksum is permanently stored in the audit log, proving that the exact code tested and verified by our Admin team is what you receive.'
    },
    {
      q: 'Can I propose changes after the blueprint is created?',
      a: 'Yes! The Client Workspace includes a built-in Scope Change Center. If you want to modify features or add integrations, our Scope Change Impact Analyzer calculates estimated budget and timeline deltas before administrative approval.'
    }
  ];

  return (
    <div className="space-y-24 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* ─── 1. Core Value Statement & Dual CTAs ─── */}
      <section className="p-8 sm:p-14 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>From Idea to Reality</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          The Engineering Platform That Eliminates <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Freelance Uncertainty</span>
        </h2>

        <p className="text-sm sm:text-base text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          NexusCraft replaces vague proposals and chaotic bidding with automated 17-section AI blueprints, capacity-matched specialists, and cryptographic SHA-256 deliverable verification.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <NavLink to="/submit-request">
            <BoxedButton variant="primary" size="lg" className="flex items-center gap-2">
              <span>Start Your Idea (50 NCX)</span>
              <ArrowRight className="w-4 h-4" />
            </BoxedButton>
          </NavLink>

          <NavLink to="/register?role=freelancer">
            <BoxedButton variant="secondary" size="lg" className="flex items-center gap-2">
              <span>Become a Specialist</span>
              <ArrowRight className="w-4 h-4" />
            </BoxedButton>
          </NavLink>

          <NavLink to="/blueprint-sample" className="w-full sm:w-auto text-xs font-bold text-[#7357FF] hover:underline pt-2 sm:pt-0 sm:ml-2">
            View Sample 17-Section Blueprint →
          </NavLink>
        </div>

        {/* 3-Step Quick Intake Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#F2F3F8] text-left">
          {quickSteps.map(step => (
            <NavLink
              key={step.num}
              to={step.link}
              className="p-6 rounded-2xl bg-[#F7F8FC] hover:bg-[#E9E3FF]/20 border border-[#E9EAF0] transition-colors group block space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-2xl text-[#7357FF]">
                  {step.num}
                </span>
                <ArrowRight className="w-4 h-4 text-[#777B8A] group-hover:translate-x-1 group-hover:text-[#7357FF] transition-all" />
              </div>
              <h3 className="font-display font-bold text-base text-[#17172B]">
                {step.title}
              </h3>
              <p className="text-xs text-[#65677A] leading-relaxed">
                {step.desc}
              </p>
            </NavLink>
          ))}
        </div>
      </section>

      {/* ─── 2. Live Trust Metrics & Security Strip ─── */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#17172B] text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D5FF68]">
              Platform Guarantees
            </span>
            <h3 className="font-display font-extrabold text-2xl text-white mt-1">
              Engineered for Enterprise Reliability
            </h3>
          </div>
          <NavLink to="/trust">
            <button className="text-xs font-bold text-[#D5FF68] hover:underline flex items-center gap-1.5">
              <span>Read Full Security Whitepaper</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </NavLink>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          {trustMetrics.map((tm, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-display font-extrabold text-2xl text-[#D5FF68] block">
                {tm.value}
              </span>
              <span className="text-xs font-bold text-white block">
                {tm.label}
              </span>
              <span className="text-[10px] text-white/60 block">
                {tm.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. Testimonials from Founders & Specialists ─── */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
            Platform Social Proof
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#17172B]">
            Loved by Founders & Lead Engineers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#45475E] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F2F3F8]">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-[#E9EAF0]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#17172B]">{t.author}</h4>
                    <span className="text-[10px] text-[#777B8A]">{t.role}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  {t.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. Interactive FAQ Accordion ─── */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
            Got Questions?
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#17172B]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#E9EAF0] bg-white overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#17172B] hover:text-[#7357FF] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#777B8A] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#7357FF]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#65677A] leading-relaxed border-t border-[#F2F3F8] animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default HomeValueAndFaqSection;
