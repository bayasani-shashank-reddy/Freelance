import React, { useState } from 'react';
import { Check, Clock, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProjectDecisionItem, ProjectRequest } from '../../types';

interface DecisionCenterCardProps {
  project: ProjectRequest | null;
  onDecisionUpdated: () => void;
}

export const DecisionCenterCard: React.FC<DecisionCenterCardProps> = ({ project, onDecisionUpdated }) => {
  if (!project) return null;

  const decisions: ProjectDecisionItem[] = project.decisions || [];
  const pendingDecisions = decisions.filter(d => d.status === 'Pending');

  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleAction = async (decisionId: string, status: 'Approved' | 'Rejected' | 'Changes Requested') => {
    setSubmittingId(decisionId);
    const feedback = feedbackMap[decisionId] || '';
    const res = await api.respondToDecision(project.customId || project.id, decisionId, {
      status,
      clientFeedback: feedback
    });
    setSubmittingId(null);
    if (res.success) {
      onDecisionUpdated();
    } else {
      alert(res.error || 'Failed to record decision.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#222438]">
              Project Decision Center
            </h3>
            <p className="text-xs text-[#777B8A]">
              Decisions requiring your review and authorization for <strong className="text-[#222438]">{project.projectTitle}</strong>
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          pendingDecisions.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#E8F8F0] text-[#24A675]'
        }`}>
          {pendingDecisions.length > 0 ? `${pendingDecisions.length} Action Required` : 'All Decisions Settled'}
        </span>
      </div>

      {decisions.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#777B8A] space-y-1">
          <p className="font-medium text-[#222438]">No pending approval gates at this stage.</p>
          <p>When engineering milestones, technical choices, or revised estimates require sign-off, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map(d => {
            const isPending = d.status === 'Pending';
            return (
              <div
                key={d.customId}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isPending
                    ? 'bg-amber-50/30 border-amber-200/80'
                    : 'bg-[#F9FAFC] border-[#E9EAF0]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white border border-[#E9EAF0] text-[#777B8A]">
                        {d.decisionType}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        d.status === 'Approved' ? 'bg-[#24A675]/15 text-[#24A675]' : d.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#222438]">{d.title}</h4>
                  </div>

                  {d.deadline && (
                    <span className="text-[11px] text-[#777B8A] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#A0A4B8]" />
                      Target: {new Date(d.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#55586A] leading-relaxed">{d.description}</p>

                {d.clientFeedback && (
                  <div className="p-2.5 rounded-lg bg-white border border-[#E9EAF0] text-xs text-[#222438]">
                    <span className="font-bold text-[#7357FF]">Your Feedback:</span> {d.clientFeedback}
                  </div>
                )}

                {isPending && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/50">
                    <input
                      type="text"
                      placeholder="Optional feedback or requested revisions..."
                      value={feedbackMap[d.customId] || ''}
                      onChange={e => setFeedbackMap(prev => ({ ...prev, [d.customId]: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E9EAF0] text-xs bg-white text-[#222438] outline-none focus:border-[#7357FF]"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={submittingId === d.customId}
                        onClick={() => handleAction(d.customId, 'Changes Requested')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-gray-50 border border-[#E9EAF0] text-amber-700"
                      >
                        Request Changes
                      </button>
                      <button
                        type="button"
                        disabled={submittingId === d.customId}
                        onClick={() => handleAction(d.customId, 'Rejected')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={submittingId === d.customId}
                        onClick={() => handleAction(d.customId, 'Approved')}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#24A675] hover:bg-[#1E8A61] text-white shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
