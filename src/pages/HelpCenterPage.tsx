import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Zap,
  Shield,
  CreditCard,
  ChevronDown,
  Mail,
  ArrowRight,
  FileText
} from 'lucide-react';
import { BoxedButton } from '../components/shared/BoxedButton';

const categories = [
  { id: 'intake', label: 'Idea Intake & AI', icon: Zap },
  { id: 'credits', label: 'NCX Credit Protocol', icon: CreditCard },
  { id: 'governance', label: 'Private Review', icon: Shield },
  { id: 'deliverables', label: 'Specs & Codebase', icon: FileText },
  { id: 'security', label: 'Data Security', icon: BookOpen },
  { id: 'contact', label: 'Studio Direct', icon: MessageCircle },
];

const faqs: Record<string, Array<{ q: string; a: string }>> = {
  intake: [
    {
      q: 'How does the AI requirement structuring work?',
      a: 'When you submit a raw concept, our Gemini AI models analyze your submission against industry architecture standards. It breaks the concept into Executive Summaries, Functional Modules, High-Level Architecture, Risk Assessment, and recommended milestones.',
    },
    {
      q: 'Can I upload existing PRDs or wireframe documents?',
      a: 'Yes. The submission portal accepts PDF, DOCX, and TXT files up to 25MB. The system automatically ingests and parses them to augment the generated project brief.',
    },
    {
      q: 'Does submitting an idea require upfront commitment?',
      a: 'No. Submitting an idea requires a one-time fee of 50 NCX Credits from your balance (new accounts receive 500 NCX complimentary). There is no financial obligation until you approve an active development scope.',
    },
  ],
  credits: [
    {
      q: 'What are NCX Credits and how are they used?',
      a: 'NCX Credits are the native utility currency of the NexusCraft ecosystem. They are consumed for AI requirements decomposition (50 NCX per submission) and administrative triage. Every newly registered client receives 500 NCX Credits immediately upon sign-up.',
    },
    {
      q: 'How can I acquire additional NCX Credits?',
      a: 'Credits can be requested via the NCX Credit Vault or granted directly by platform administrators. Administrators can award promotional, test, or enterprise allotments through the governance console.',
    },
    {
      q: 'Do NCX Credits expire?',
      a: 'Standard NCX credits awarded upon registration or purchased do not expire as long as your account remains in good standing.',
    },
  ],
  governance: [
    {
      q: 'Is my project visible on a public marketplace or job board?',
      a: 'Never. NexusCraft operates on a strict non-marketplace model. Your project details are strictly private between your team and NexusCraft administrators. We do not permit public bidding or scraping.',
    },
    {
      q: 'How are freelancers selected and involved?',
      a: 'Administrators privately review vetted, verified domain specialists and selectively dispatch sanitized project briefs for technical feasibility and architecture assessment. Freelancers cannot view client contact details or unassigned projects.',
    },
    {
      q: 'Can freelancers contact clients directly?',
      a: 'No. To ensure client confidentiality, rigorous quality control, and NDA compliance, all communications are stewarded through the NexusCraft admin layer.',
    },
  ],
  deliverables: [
    {
      q: 'What artifacts do I receive upon completion of scoping?',
      a: 'You receive an interactive project dossier including the structured Markdown brief, technical architecture blueprint, component checklist, estimated sprint roadmap, and downloadable DOCX documentation.',
    },
    {
      q: 'Who owns the intellectual property and code produced?',
      a: 'You retain 100% intellectual property ownership of your submitted ideas, specifications, generated architectures, and subsequent codebases developed under NexusCraft contracts.',
    },
  ],
  security: [
    {
      q: 'How is confidential data and IP protected?',
      a: 'All documents, inputs, and database records are encrypted at rest and in transit. Document sharing requires cryptographic session tokens and role-based permissions (RBAC).',
    },
    {
      q: 'Do you offer non-disclosure agreements (NDAs)?',
      a: 'Yes. Enterprise projects can execute bespoke mutual NDAs before requirements deep-dives or code audits begin.',
    },
  ],
  contact: [
    {
      q: 'How do I escalate an urgent project deadline?',
      a: 'Contact administrators directly via the Help Center inquiry form or email founders@nexuscraft.studio. Enterprise clients have direct access to their assigned project lead.',
    },
    {
      q: 'What is the standard response time for project intake triage?',
      a: 'Initial AI requirements structuring is instant. Administrator review and freelancer feasibility assessments are completed within 24 to 48 business hours.',
    },
  ],
};

export const HelpCenterPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('intake');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const currentFaqs = faqs[activeCategory] || [];

  const filteredFaqs = searchQuery
    ? Object.values(faqs)
        .flat()
        .filter(
          (f) =>
            f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : currentFaqs;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSubject('');
      setContactMessage('');
    }, 2000);
  };

  return (
    <div
      className="min-h-screen pt-28 pb-20 transition-colors font-mono"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] uppercase tracking-widest"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)'
            }}
          >
            <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-main)' }} />
            <span>KNOWLEDGE BASE & PROTOCOLS</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>
            Studio Documentation
          </h1>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Authoritative answers on AI intake, NCX credit governance, private freelancer coordination, and intellectual property.
          </p>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto pt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search guides, protocols, or credit rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border text-xs focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>
        </div>

        {/* Categories Grid (Segmented Controls) */}
        {!searchQuery && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex flex-col items-center gap-2 p-3.5 border transition-all text-center"
                  style={{
                    backgroundColor: isActive ? 'var(--text-main)' : 'var(--bg-surface)',
                    borderColor: 'var(--border-main)',
                    color: isActive ? 'var(--bg-canvas)' : 'var(--text-main)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-main)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <BookOpen className="w-3.5 h-3.5" />
              {searchQuery ? `Search Results (${filteredFaqs.length})` : 'Frequently Addressed Queries'}
            </h2>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              NEXUS PROTOCOL v3.2
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No matching records found for "{searchQuery}". Try a different keyword or contact studio leadership.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const key = `${activeCategory}-${idx}`;
              const isOpen = openFaq === key;
              return (
                <div
                  key={key}
                  className="border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-main)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : key)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider pr-4" style={{ color: 'var(--text-main)' }}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--border-main)' }}>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Direct Studio Inquiry Panel */}
        <div
          className="max-w-3xl mx-auto mt-14 p-8 border transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div className="text-center max-w-md mx-auto mb-6">
            <Mail className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-main)' }} />
            <h3 className="font-display font-black text-lg uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>
              Direct Studio Inquiry
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Require bespoke architecture triage or custom enterprise volume? Transmit your query directly to leadership.
            </p>
          </div>

          {contactSent ? (
            <div
              className="p-4 border text-center text-xs space-y-2"
              style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-main)' }}
            >
              <p className="font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                Inquiry Logged Successfully
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                Our leadership team reviews all technical transmissions within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Inquiry Subject
                </label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="e.g. Enterprise Credit Allocation or Architecture Advisory"
                  className="w-full px-3 py-2 border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Message Specification
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Provide context regarding your concept, timeline, or query..."
                  className="w-full px-3 py-2 border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <BoxedButton
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Transmit Inquiry
                </BoxedButton>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default HelpCenterPage;
