import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';

export const CaseStudiesPage: React.FC = () => {
  const caseStudies = [
    {
      id: 'aura-dynamics',
      title: 'Aura Dynamics: Telemedicine & AI Triage Engine',
      client: 'Aura Dynamics Healthcare',
      industry: 'HealthTech & Telehealth',
      timeToMvp: '18 Days',
      escrowBudget: '₹4,85,000 / $5,800',
      heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      before: 'The founder had a 3-sentence description: "We need an Uber for emergency room triage where patients report symptoms and hop on video with on-call doctors."',
      after: 'NexusCraft generated a 17-section HIPAA-compliant architecture. Admin matched a senior WebRTC specialist. Deployed on AWS with HL7/FHIR EHR sync and zero scope disputes.',
      metrics: [
        { label: 'Time from Idea to First Code', value: '36 Hours' },
        { label: 'Agency Cost Savings', value: '62%' },
        { label: 'Deliverable Integrity', value: '100% SHA-256 Verified' }
      ]
    },
    {
      id: 'finflow-escrow',
      title: 'FinFlow: Multi-Currency Escrow & Ledger Core',
      client: 'FinFlow Technologies',
      industry: 'FinTech & Payments',
      timeToMvp: '24 Days',
      escrowBudget: '₹7,20,000 / $8,600',
      heroImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      before: 'FinFlow was quoted $45,000 and 4 months by a traditional agency for an automated escrow and double-entry transaction engine.',
      after: 'Using NexusCraft, their prompt was synthesized into an immutable double-entry ledger architecture. Developed in 3 phased milestone escrows with automated reconciliation tests.',
      metrics: [
        { label: 'Cost Reduction', value: '81%' },
        { label: 'Dispute Rate', value: '0.0%' },
        { label: 'Audit Compliance', value: 'ISO 27001 Ready' }
      ]
    },
    {
      id: 'logitrack-ai',
      title: 'LogiTrack: Autonomous Fleet Telemetry Platform',
      client: 'LogiTrack Logistics',
      industry: 'Supply Chain & IoT',
      timeToMvp: '14 Days',
      escrowBudget: '₹3,50,000 / $4,200',
      heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      before: 'A regional logistics fleet needed real-time driver telemetry and fuel consumption heatmaps but had no in-house technical architect.',
      after: 'NexusCraft produced complete WebSocket streaming architecture specs, database indexing strategies, and matched a distributed systems engineer who delivered ahead of schedule.',
      metrics: [
        { label: 'Delivery Speed', value: '4 Days Early' },
        { label: 'Telemetry Throughput', value: '10k events/sec' },
        { label: 'Client Satisfaction', value: '5.0 / 5.0' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Real Transformation Case Studies</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          From Rough Prompts to <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Production Software</span>
        </h1>
        <p className="text-base sm:text-lg text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          See how ambitious founders and engineering leaders transformed high-level concepts into verified software products without agency price gouging.
        </p>
      </section>

      {/* Case Studies Cards */}
      <section className="pb-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-16">
        {caseStudies.map((cs) => (
          <div
            key={cs.id}
            className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF] px-2.5 py-1 rounded-full bg-[#E9E3FF]">
                    {cs.industry}
                  </span>
                  <span className="text-xs text-[#777B8A]">· {cs.client}</span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B]">
                  {cs.title}
                </h3>
              </div>

              {/* Before vs After */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                    The Initial Raw Concept:
                  </span>
                  <p className="text-xs text-amber-950 leading-relaxed italic">
                    "{cs.before}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                    The NexusCraft Outcome:
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                    {cs.after}
                  </p>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {cs.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E9EAF0] text-center">
                    <span className="font-display font-extrabold text-base text-[#17172B] block">
                      {m.value}
                    </span>
                    <span className="text-[10px] text-[#777B8A] leading-tight block mt-0.5">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image / Snapshot */}
            <div className="lg:col-span-5 h-72 sm:h-96 rounded-2xl overflow-hidden relative shadow-sm border border-[#E9EAF0]">
              <img
                src={cs.heroImage}
                alt={cs.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D5FF68]">
                    Verified Delivery
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Delivered in {cs.timeToMvp} · Escrow: {cs.escrowBudget}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default CaseStudiesPage;
