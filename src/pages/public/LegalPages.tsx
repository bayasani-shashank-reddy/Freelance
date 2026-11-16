import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';

export const LegalPages: React.FC<{ initialTab?: 'terms' | 'privacy' | 'refund' | 'cookies' }> = ({ initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'cookies'>(initialTab);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
            Legal & Governance Framework
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17172B]">
            Platform Policies & Agreements
          </h1>
          <p className="text-xs sm:text-sm text-[#777B8A]">
            Last updated: November 2026 · Compliant with DPDP (India), GDPR and International Commercial Software Standards
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm max-w-xl mx-auto">
          {[
            { id: 'terms', label: 'Terms of Service' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'refund', label: 'Escrow & Refund Policy' },
            { id: 'cookies', label: 'Cookie Policy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7357FF] text-white shadow-sm'
                  : 'text-[#777B8A] hover:text-[#17172B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Policy Body */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9EAF0] shadow-sm text-xs sm:text-sm text-[#45475E] leading-relaxed space-y-6">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-[#17172B]">1. Terms of Service</h2>
              <p>Welcome to NexusCraft. By registering an account, submitting project ideas, or accepting specialist assignments, you agree to these Terms of Service.</p>
              <h3 className="font-bold text-[#17172B] pt-2">1.1 Role Definitions</h3>
              <p>NexusCraft operates as a closed product development and governance ecosystem. Clients commission software specifications and development; Specialists build approved milestones; Administrators triage, verify, and resolve disputes.</p>
              <h3 className="font-bold text-[#17172B] pt-2">1.2 Intellectual Property</h3>
              <p>Upon final milestone deliverable acceptance and escrow release, 100% of the rights, title, source code, and design assets automatically transfer to the Client. Specialists retain no residual claims to client software deliverables.</p>
              <h3 className="font-bold text-[#17172B] pt-2">1.3 Token Rules</h3>
              <p>NCX tokens serve as the platform's accounting unit for scoping and escrow. Tokens are non-transferable outside the platform and hold no speculative financial value.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-[#17172B]">2. Privacy Policy</h2>
              <p>NexusCraft is committed to safeguarding client confidentiality and specialist personal information under the Digital Personal Data Protection (DPDP) Act and GDPR.</p>
              <h3 className="font-bold text-[#17172B] pt-2">2.1 Information Collected</h3>
              <p>We collect account email addresses, hashed passwords, wallet balances, project briefs, and technical deliverables. We do not sell user data to advertising third parties.</p>
              <h3 className="font-bold text-[#17172B] pt-2">2.2 AI Scoping Data Isolation</h3>
              <p>Project ideas processed through the Google Gemini Scoping Gateway are subject to zero-retention enterprise privacy terms. Client proprietary descriptions are not used for public model training.</p>
              <h3 className="font-bold text-[#17172B] pt-2">2.3 Data Rights</h3>
              <p>Users may request a complete export of their account history or request account deletion by emailing compliance@nexuscraft.com.</p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-[#17172B]">3. Escrow & Refund Policy</h2>
              <p>NexusCraft maintains a 100% milestone escrow system designed to eliminate financial risk for both clients and technical specialists.</p>
              <h3 className="font-bold text-[#17172B] pt-2">3.1 Milestone Escrow Protection</h3>
              <p>When a client approves a quotation, the required NCX tokens are locked into milestone escrow. The specialist cannot withdraw funds until the client inspects and accepts the deliverable.</p>
              <h3 className="font-bold text-[#17172B] pt-2">3.2 Deliverable Rejection & Revisions</h3>
              <p>If a submitted ZIP deliverable fails acceptance criteria or deviates from the approved 17-section blueprint, the client may request revisions. If unresolved, the Admin Dispute Center performs code inspection and can issue a full escrow refund to the client's wallet.</p>
              <h3 className="font-bold text-[#17172B] pt-2">3.3 50 NCX Intake Fee</h3>
              <p>The 50 NCX fee consumed for immediate AI blueprint generation is non-refundable once the 17-section blueprint has been synthesized.</p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-[#17172B]">4. Cookie & Local Storage Policy</h2>
              <p>NexusCraft uses essential cookies and local storage tokens strictly required for user authentication, theme preference retention, and session persistence.</p>
              <h3 className="font-bold text-[#17172B] pt-2">4.1 Essential Session Tokens</h3>
              <p>We use JWT session tokens stored securely in local browser storage to keep you authenticated across portal routes.</p>
              <h3 className="font-bold text-[#17172B] pt-2">4.2 Analytics</h3>
              <p>Telemetry events track route navigation and feature usage without recording keystrokes or proprietary project text.</p>
            </div>
          )}
        </div>
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default LegalPages;
