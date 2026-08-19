import React, { useState } from 'react';
import { X, Sparkles, Send, Paperclip, CheckCircle2, Clock, DollarSign, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../context/UserContext';

interface SubmitProposalModalProps {
  jobId: string;
  jobTitle: string;
  maxBudget: number;
  onClose: () => void;
}

export const SubmitProposalModal: React.FC<SubmitProposalModalProps> = ({
  jobId: _jobId,
  jobTitle,
  maxBudget,
  onClose,
}) => {
  const { submitProposal, user } = useUser();

  const [coverLetter, setCoverLetter] = useState(
    `Hello! I have extensive experience building scalable dark-mode Web3 & SaaS applications. For this project, I will deliver a clean architecture, modular components, and smooth 3D interactions on schedule.`
  );
  const [proposedBudget, setProposedBudget] = useState(maxBudget);
  const [deliveryTime, setDeliveryTime] = useState('3 Weeks');
  const [milestones, setMilestones] = useState([
    { title: 'UX Architecture & Wireframe Spec', amount: Math.round(maxBudget * 0.3) },
    { title: 'Frontend UI & 3D Interaction Handoff', amount: Math.round(maxBudget * 0.4) },
    { title: 'Final Polish & API Integration', amount: Math.round(maxBudget * 0.3) },
  ]);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAIPolish = () => {
    setIsPolishing(true);
    setTimeout(() => {
      setCoverLetter(
        `Dear Hiring Lead,\n\nI am thrilled to submit my proposal for "${jobTitle}". With a proven track record delivering top 1% UI/UX systems (98% Job Success Rate & 96/100 NexusScore), I will construct an optimal solution using modern TypeScript and dark-mode glassmorphic aesthetics.\n\nKey Deliverables Included:\n• Modular component structure\n• High-performance WebGL / 3D telemetry\n• 100% Escrow Milestone Protection\n\nLooking forward to discussing the milestone timeline with your engineering team.`
      );
      setIsPolishing(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProposal({
      id: `prop-${Date.now()}`,
      jobId: _jobId,
      jobTitle,
      freelancerId: user?.id || 'free-1',
      freelancerName: user?.name || 'Elena Rostova',
      freelancerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      freelancerTitle: user?.title || 'Senior Full Stack Architect',
      proposedBudget,
      proposedDeliveryTime: deliveryTime,
      coverLetter,
      milestonesProposed: milestones,
      submittedAt: 'Just now',
      status: 'Submitted',
    });
    setIsSubmitted(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Proposal Submitted Successfully!</h2>
            <p className="text-sm text-slate-400">
              The client has been notified. You can track proposal status under <strong className="text-cyan-300">My Proposals</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FREELANCER PROPOSAL SUBMISSION</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1">{jobTitle}</h2>
            </div>

            {/* Cover Letter Box with AI Assistant button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-semibold text-slate-300">Cover Letter</label>
                <button
                  type="button"
                  onClick={handleAIPolish}
                  disabled={isPolishing}
                  className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
                  <span>{isPolishing ? 'Nexus AI Optimizing...' : 'AI Proposal Polish'}</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>

            {/* Proposed Budget & Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Proposed Total Budget ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={proposedBudget}
                    onChange={(e) => setProposedBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Estimated Delivery Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Milestone Schedule */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-2">
                Proposed Milestone Breakdown
              </label>
              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950 border border-slate-800/80 p-3 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => {
                        const copy = [...milestones];
                        copy[idx].title = e.target.value;
                        setMilestones(copy);
                      }}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center text-xs font-mono font-bold text-emerald-400">
                      <span>$</span>
                      <input
                        type="number"
                        value={m.amount}
                        onChange={(e) => {
                          const copy = [...milestones];
                          copy[idx].amount = Number(e.target.value);
                          setMilestones(copy);
                        }}
                        className="w-16 bg-transparent text-right text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach Portfolio PDF / Work</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Proposal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitProposalModal;
