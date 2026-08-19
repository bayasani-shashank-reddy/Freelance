import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  Briefcase,
  FileCheck,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FreelancerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, dynamicJobs, dynamicProposals } = useUser();
  const [deliverableModal, setDeliverableModal] = useState(false);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic calculations
  const assignedJobs = dynamicJobs.filter(
    (j) => j.assignedFreelancerId === user?.id || j.clientName === 'Alex Rivera'
  );
  const myProposals = dynamicProposals.filter((p) => p.freelancerName === (user?.name || 'Elena Rostova'));

  const handleUploadDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliverableModal(false);
    setDeliverSuccessMsg(`Deliverable "${deliverableTitle}" submitted successfully! Client notified for milestone review.`);
    setDeliverableTitle('');
    setDeliverableUrl('');
    setTimeout(() => setDeliverSuccessMsg(null), 4000);
  };

  const setDeliverSuccessMsg = (msg: string | null) => setSuccessMsg(msg);

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>FREELANCER PORTAL // ACTIVE ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name || 'Elena Rostova'}</span>
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              {user?.title || 'Senior Full Stack & AI Specialist'} • {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDeliverableModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Deliverable</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Key Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">TOTAL EARNINGS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ${(user?.balance || 18400).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">Cleared payouts</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">PENDING ESCROW</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              ${(user?.escrowBalance || 4200).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-1">Held in milestones</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">ACTIVE CONTRACTS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
              {assignedJobs.length}
            </div>
            <div className="text-[10px] font-mono text-indigo-300 font-semibold mt-1">In progress</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">PROPOSAL WIN RATE</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              94%
            </div>
            <div className="text-[10px] font-mono text-purple-300 font-semibold mt-1">★ 4.98 Rating</div>
          </div>
        </div>

        {/* Assigned Projects & Active Workflows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <span>My Active Client Contracts</span>
              </h2>
              <button onClick={() => navigate('/jobs')} className="text-xs text-cyan-400 font-bold hover:underline">
                Find More Work →
              </button>
            </div>

            {assignedJobs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 font-mono">
                No active assigned contracts. Browse the marketplace to submit proposals.
              </div>
            ) : (
              <div className="space-y-4">
                {assignedJobs.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{job.title}</h3>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ● CONTRACT ACTIVE
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{job.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs font-mono">
                      <span className="text-slate-400">Client: <strong className="text-white">{job.clientName}</strong></span>
                      <span className="text-emerald-400 font-bold">${job.maxBudget.toLocaleString()} Escrow</span>
                      <button
                        onClick={() => navigate(`/workspace/${job.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        Open Workspace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal Tracker */}
          <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95 space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <span>Submitted Proposals</span>
            </h2>

            <div className="space-y-3">
              {myProposals.slice(0, 4).map((prop) => (
                <div key={prop.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span className="truncate max-w-[180px]">{prop.jobTitle}</span>
                    <span className="text-emerald-400 font-mono">${prop.proposedBudget}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>{prop.submittedAt}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {prop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Deliverable Modal */}
      {deliverableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-5 bg-slate-900/95 text-xs">
            <h2 className="text-xl font-bold text-white">Submit Project Deliverable</h2>
            <form onSubmit={handleUploadDeliverable} className="space-y-4">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Deliverable Name / Milestone Title:</label>
                <input
                  type="text"
                  required
                  value={deliverableTitle}
                  onChange={(e) => setDeliverableTitle(e.target.value)}
                  placeholder="e.g. Master Figma Design & Shader v2.4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Deliverable URL / Storage Link:</label>
                <input
                  type="url"
                  required
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://github.com/org/repo or Figma link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliverableModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold"
                >
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboardPage;
