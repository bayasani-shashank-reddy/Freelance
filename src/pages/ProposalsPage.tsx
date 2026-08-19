import React, { useState } from 'react';
import type { Proposal } from '../types';
import { FileCheck, ArrowRight, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';

export const ProposalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { dynamicProposals, user, role, awardProposalWorkByAdmin } = useUser();
  const [filter, setFilter] = useState<'All' | 'Submitted' | 'Shortlisted' | 'Accepted'>('All');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const baseProposals = role === 'admin' ? dynamicProposals : dynamicProposals.filter(p => p.freelancerId === user?.id);
  const filteredProposals = baseProposals.filter((p) => filter === 'All' || p.status === filter);

  const handleAwardWork = (proposal: Proposal) => {
    awardProposalWorkByAdmin(proposal.id);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    setActionNotice(`🎉 Admin awarded contract for "${proposal.jobTitle}" to ${proposal.freelancerName}! Work is assigned and workspace is open.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✓ Accepted & Assigned</span>;
      case 'Shortlisted':
        return <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">★ Shortlisted</span>;
      case 'Viewed':
        return <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">👁 Viewed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">Submitted</span>;
    }
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                {role === 'admin' ? 'ADMIN PROPOSAL REVIEW & WORK AWARD CENTER' : 'FREELANCER PROPOSAL TRACKER'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {role === 'admin' ? 'All Platform Proposals' : 'My Proposals'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {role === 'admin'
                ? 'Review freelancer proposals and award contracts directly to assign project work.'
                : 'Track the status of your submitted job proposals, bid amounts, and contract approvals.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Find New Jobs</span>
          </button>
        </div>

        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-4 rounded-2xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">TOTAL PROPOSALS</div>
            <div className="text-2xl font-extrabold text-white font-mono">{dynamicProposals.length}</div>
          </div>
          <div className="glass-card border border-slate-800 p-4 rounded-2xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">VIEWED / REVIEWED</div>
            <div className="text-2xl font-extrabold text-cyan-300 font-mono">
              {dynamicProposals.filter((p) => p.status === 'Viewed' || p.status === 'Shortlisted' || p.status === 'Accepted').length}
            </div>
          </div>
          <div className="glass-card border border-slate-800 p-4 rounded-2xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">SHORTLISTED</div>
            <div className="text-2xl font-extrabold text-indigo-300 font-mono">
              {dynamicProposals.filter((p) => p.status === 'Shortlisted').length}
            </div>
          </div>
          <div className="glass-card border border-slate-800 p-4 rounded-2xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">AWARDED CONTRACTS</div>
            <div className="text-2xl font-extrabold text-emerald-300 font-mono">
              {dynamicProposals.filter((p) => p.status === 'Accepted').length}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6">
          {(['All', 'Submitted', 'Shortlisted', 'Accepted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="glass-card border border-slate-800 rounded-2xl p-6 bg-slate-900/95 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(proposal.status)}
                  <span className="text-xs font-mono text-cyan-300 font-bold">Freelancer: {proposal.freelancerName}</span>
                  <span className="text-xs font-mono text-slate-400">• Submitted {proposal.submittedAt}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{proposal.jobTitle}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 mb-4">{proposal.coverLetter}</p>

                {/* Milestones proposed preview */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  {proposal.milestonesProposed.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-cyan-300 font-semibold">
                      M{i + 1}: {m.title} (${m.amount.toLocaleString()})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/60 gap-3">
                <div className="text-left md:text-right">
                  <div className="text-xs font-mono text-slate-400 font-bold">PROPOSED BID</div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    ${proposal.proposedBudget.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-slate-300">{proposal.proposedDeliveryTime}</div>
                </div>

                <div className="flex items-center gap-2">
                  {role === 'admin' && proposal.status !== 'Accepted' && (
                    <button
                      onClick={() => handleAwardWork(proposal)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:scale-105 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition-all"
                    >
                      <Award className="w-4 h-4 text-cyan-300" />
                      <span>Award Contract & Assign Work</span>
                    </button>
                  )}

                  {proposal.status === 'Accepted' ? (
                    <button
                      onClick={() => navigate('/workspace/proj-1')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/jobs/${proposal.jobId}`)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>View Job</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProposalsPage;
