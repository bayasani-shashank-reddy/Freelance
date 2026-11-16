import React from 'react';
import { ShieldCheck, Lock, FileCheck, Database, Key, Server } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';

export const TrustSecurityPage: React.FC = () => {
  const securityPillars = [
    {
      title: 'Cryptographic SHA-256 Code Checksums',
      desc: 'When a specialist uploads a deliverable ZIP archive, the server immediately calculates an immutable SHA-256 cryptographic hash. The client can verify this checksum independently before extracting the package.',
      icon: Key
    },
    {
      title: 'Milestone Escrow State Machine',
      desc: 'Funds are securely locked in NCX token escrow upon quotation approval. Payouts are released strictly upon client deliverable sign-off or administrative dispute resolution.',
      icon: Lock
    },
    {
      title: 'Immutable Administrative Audit Log',
      desc: 'Every project status transition, credit deduction, scope change proposal, and deliverable release is permanently logged with actor IDs, IP timestamps, and state diffs.',
      icon: Database
    },
    {
      title: 'Automatic IP Assignment & NDA Protection',
      desc: 'All project briefs and intellectual property are shared under strict confidentiality. Specialists agree to full IP assignment upon accepting milestone payments.',
      icon: FileCheck
    },
    {
      title: 'Pre-Submission Readiness & Zip-Bomb Safeguards',
      desc: 'Our file ingestion pipeline enforces strict MIME-type validation, rejects path-traversal directory exploits, and limits archive sizes to prevent buffer overflows.',
      icon: Server
    },
    {
      title: 'DPDP (India) & GDPR Privacy Readiness',
      desc: 'Data isolation by role, zero PHI/PII leakage in telemetry logs, and complete account data export and deletion endpoints.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Enterprise Security & Trust Centre</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          Engineering Trust into Every <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Milestone & Delivery</span>
        </h1>
        <p className="text-base sm:text-lg text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          How NexusCraft protects client capital, intellectual property, and deliverable code integrity through cryptographic hashing and escrow state machines.
        </p>
      </section>

      {/* 6 Security Pillars */}
      <section className="pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {securityPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="p-8 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7357FF]/10 to-[#3978FF]/10 text-[#7357FF] flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#17172B]">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#65677A] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Escrow State Machine Visual */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#17172B] text-white space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D5FF68]">
              Automated Financial Protocol
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              The NexusCraft Escrow State Machine
            </h2>
            <p className="text-xs text-white/70">
              Zero manual payment manipulation. Every transition is cryptographically logged.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-[#D5FF68]">01. Quote Approved</span>
              <p className="text-[11px] text-white/70">Client signs off quotation; milestone NCX is deducted and locked in Escrow Vault.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-[#D5FF68]">02. Sprint Execution</span>
              <p className="text-[11px] text-white/70">Specialist executes tasks with live effort tracking and worklogs. Funds remain locked.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-[#D5FF68]">03. SHA-256 Vault</span>
              <p className="text-[11px] text-white/70">ZIP deliverable uploaded with server-computed checksum. Readiness checked.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">04. Client Acceptance</span>
              <p className="text-[11px] text-white/70">Client inspects code, submits rating & feedback; escrow automatically releases to specialist.</p>
            </div>
          </div>
        </div>
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default TrustSecurityPage;
