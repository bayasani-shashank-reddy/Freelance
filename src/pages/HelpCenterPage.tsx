import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Zap,
  Shield,
  CreditCard,
  Users,
  ChevronDown,
  Mail,
  ArrowRight,
} from 'lucide-react';

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap, color: 'text-cyan-400' },
  { id: 'projects', label: 'Projects & Briefs', icon: BookOpen, color: 'text-indigo-400' },
  { id: 'payments', label: 'Payments & Escrow', icon: CreditCard, color: 'text-emerald-400' },
  { id: 'designers', label: 'Working with Designers', icon: Users, color: 'text-purple-400' },
  { id: 'security', label: 'Security & Privacy', icon: Shield, color: 'text-amber-400' },
  { id: 'support', label: 'Contact Support', icon: MessageCircle, color: 'text-rose-400' },
];

const faqs: Record<string, Array<{ q: string; a: string }>> = {
  'getting-started': [
    {
      q: 'How do I create my first project brief?',
      a: 'Navigate to the AI Brief Builder from the main navigation. Our AI-powered tool will guide you through a series of questions to create a comprehensive design brief that attracts top talent.',
    },
    {
      q: 'How does the matching system work?',
      a: 'NexusCraft uses an AI algorithm that analyzes your project requirements, budget, timeline, and style preferences to match you with the most suitable designers from our vetted network.',
    },
    {
      q: 'Is there a free tier available?',
      a: 'Yes! You can browse designer portfolios and create project briefs for free. Fees only apply when you hire a designer and fund the escrow for a project.',
    },
  ],
  projects: [
    {
      q: 'How do I manage project milestones?',
      a: 'Each project is broken into milestones that you define during the brief creation. You can track progress, approve deliverables, and release payments milestone-by-milestone from your Dashboard.',
    },
    {
      q: 'Can I modify a brief after posting?',
      a: 'Absolutely. You can edit your brief at any time before a designer accepts the project. After acceptance, changes require mutual agreement between you and the designer.',
    },
  ],
  payments: [
    {
      q: 'How does escrow work?',
      a: 'When you start a project, funds are held securely in escrow. Payment is only released to the designer when you approve the completed milestone. This protects both parties.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and bank transfers. Cryptocurrency payments are coming soon.',
    },
    {
      q: 'What is the platform fee?',
      a: 'NexusCraft charges a 5% platform fee on each transaction. This covers escrow protection, dispute resolution, and platform maintenance.',
    },
  ],
  designers: [
    {
      q: 'How are designers vetted?',
      a: 'Every designer on NexusCraft goes through a rigorous review process including portfolio evaluation, skill assessment, and identity verification. Only the top 3% of applicants are accepted.',
    },
    {
      q: 'Can I hire multiple designers for one project?',
      a: 'Yes! You can create separate briefs or invite multiple designers to collaborate on different aspects of your project.',
    },
  ],
  security: [
    {
      q: 'How is my data protected?',
      a: 'All data is encrypted at rest and in transit using AES-256 encryption. We are SOC 2 Type II certified and comply with GDPR, CCPA, and other privacy regulations.',
    },
    {
      q: 'What happens in case of a dispute?',
      a: 'Our dedicated dispute resolution team mediates between clients and designers. If no agreement is reached, an independent arbitrator reviews the case and makes a final decision.',
    },
  ],
  support: [
    {
      q: 'How do I reach customer support?',
      a: 'You can reach us via live chat (available 24/7), email at support@nexuscraft.io, or through the contact form below. Priority support is available for Professional plan members.',
    },
    {
      q: 'What is the average response time?',
      a: 'Our average first response time is under 2 hours during business hours. Live chat responses are typically under 5 minutes.',
    },
  ],
};

const HelpCenterPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentFaqs = faqs[activeCategory] || [];

  // Filter FAQs by search
  const filteredFaqs = searchQuery
    ? Object.values(faqs)
        .flat()
        .filter(
          (f) =>
            f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : currentFaqs;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-cyan-400 mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How can we <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">help you?</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Find answers to common questions, explore our guides, or get in touch with our support team.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Categories Grid */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                    isActive
                      ? 'bg-gradient-to-b from-indigo-600/20 to-cyan-600/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? cat.color : 'text-slate-500'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {searchQuery ? (
              <>
                <Search className="w-5 h-5 text-cyan-400" />
                Search Results ({filteredFaqs.length})
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Frequently Asked Questions
              </>
            )}
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const key = `${activeCategory}-${idx}`;
              const isOpen = openFaq === key;
              return (
                <div
                  key={key}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-slate-900/80 border-cyan-500/30'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : key)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className={`text-sm font-medium pr-4 ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-5 pb-5"
                    >
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto mt-12"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-cyan-600/20 border border-indigo-500/20 text-center">
            <Mail className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              Our support team is available 24/7. Get in touch and we'll get back to you within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Start Live Chat
              </button>
              <button className="px-6 py-3 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white transition-all flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Support
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
