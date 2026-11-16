import React, { useState } from 'react';
import { X, Check, Layers, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { ScopeChangeItem, ProjectRequest } from '../../types';

interface ScopeChangeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRequest | null;
  scopeChange: ScopeChangeItem | null;
  onReviewed: () => void;
}

export const ScopeChangeAnalyzerModal: React.FC<ScopeChangeAnalyzerModalProps> = ({
  isOpen,
  onClose,
  project,
  scopeChange,
  onReviewed
}) => {
  if (!isOpen || !project || !scopeChange) return null;

  const [adminNotes, setAdminNotes] = useState('');
  const [budgetImpact, setBudgetImpact] = useState(scopeChange.estimatedBudgetImpact || 0);
  const [timelineImpact, setTimelineImpact] = useState(scopeChange.estimatedTimelineImpact || 'No change');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    setIsSubmitting(true);
    const res = await api.reviewScopeChange(project.customId || project.id, scopeChange.customId, {
      status,
      adminNotes,
      budgetImpact,
      timelineImpact
    });
    setIsSubmitting(false);
    if (res.success) {
      onReviewed();
      onClose();
    } else {
      alert(res.error || 'Failed to update scope change.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E9EAF0] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[#222438]">
                Scope Change Impact Analyzer
              </h3>
              <p className="text-xs text-[#777B8A]">
                AI-assisted requirement delta analysis for project: <strong className="text-[#222438]">{project.projectTitle}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777B8A] hover:bg-[#F5F6FA] hover:text-[#222438] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Request Details */}
        <div className="p-5 rounded-2xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#7357FF]">
              Change Request ID: {scopeChange.customId}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {scopeChange.status}
            </span>
          </div>
          <h4 className="font-bold text-base text-[#222438]">{scopeChange.title}</h4>
          <p className="text-xs text-[#55586A] leading-relaxed">{scopeChange.description}</p>
          {scopeChange.reason && (
            <div className="text-xs text-[#777B8A] pt-1">
              <strong>Business Reason:</strong> {scopeChange.reason}
            </div>
          )}
        </div>

        {/* Impact Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#E9EAF0] bg-white space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#777B8A]">
              <DollarSign className="w-4 h-4 text-[#24A675]" />
              <span>Commercial Budget Delta (₹)</span>
            </div>
            <input
              type="number"
              value={budgetImpact}
              onChange={e => setBudgetImpact(Number(e.target.value))}
              className="w-full text-lg font-extrabold text-[#222438] outline-none border-b border-[#E9EAF0] focus:border-[#7357FF] py-1"
            />
            <span className="text-[10px] text-[#777B8A]">Estimated client price adjustment</span>
          </div>

          <div className="p-4 rounded-xl border border-[#E9EAF0] bg-white space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#777B8A]">
              <Calendar className="w-4 h-4 text-[#3978FF]" />
              <span>Timeline Impact</span>
            </div>
            <input
              type="text"
              value={timelineImpact}
              onChange={e => setTimelineImpact(e.target.value)}
              className="w-full text-sm font-bold text-[#222438] outline-none border-b border-[#E9EAF0] focus:border-[#7357FF] py-1"
            />
            <span className="text-[10px] text-[#777B8A]">e.g. +1 Week, +3 Days, No change</span>
          </div>
        </div>

        {/* Affected Requirements */}
        {scopeChange.affectedRequirements && scopeChange.affectedRequirements.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#222438] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#7357FF]" />
              <span>Impacted Architecture Modules & Requirements</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {scopeChange.affectedRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs bg-[#E9E3FF] text-[#7357FF] font-semibold border border-[#7357FF]/20"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#222438]">
            Admin Review Notes & Guidance to Client
          </label>
          <textarea
            rows={3}
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            placeholder="Explain why this change is accepted or rejected, and any architectural considerations..."
            className="w-full p-3 text-xs rounded-xl border border-[#E9EAF0] outline-none focus:border-[#7357FF] text-[#222438]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F8]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E9EAF0] text-xs font-semibold text-[#777B8A] hover:bg-[#F5F6FA]"
          >
            Cancel
          </button>
          <button
            onClick={() => handleReview('Rejected')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all disabled:opacity-50"
          >
            Reject Scope Change
          </button>
          <button
            onClick={() => handleReview('Approved')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#24A675] hover:bg-[#1E8A61] text-white text-xs font-bold shadow-md shadow-[#24A675]/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Update Scope</span>
          </button>
        </div>
      </div>
    </div>
  );
};
