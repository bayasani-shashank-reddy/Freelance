import React, { useState } from 'react';
import { X, Sparkles, Send, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface ScopeChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onSubmitted: () => void;
}

export const ScopeChangeRequestModal: React.FC<ScopeChangeRequestModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSubmitted
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [requirementTag, setRequirementTag] = useState('');
  const [affectedRequirements, setAffectedRequirements] = useState<string[]>([]);
  const [budgetImpact, setBudgetImpact] = useState<number>(0);
  const [timelineImpact, setTimelineImpact] = useState('No change');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    if (requirementTag.trim() && !affectedRequirements.includes(requirementTag.trim())) {
      setAffectedRequirements(prev => [...prev, requirementTag.trim()]);
      setRequirementTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setAffectedRequirements(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description for this scope change.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const res = await api.submitScopeChange(projectId, {
      title,
      description,
      reason,
      affectedRequirements,
      estimatedBudgetImpact: budgetImpact,
      estimatedTimelineImpact: timelineImpact
    });

    setIsSubmitting(false);
    if (res.success) {
      onSubmitted();
      onClose();
    } else {
      setError(res.error || 'Failed to submit scope change request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E9EAF0] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[#222438]">
                Request Scope Change
              </h3>
              <p className="text-xs text-[#777B8A]">
                Propose additions or adjustments to <strong className="text-[#222438]">{projectTitle}</strong>
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

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Change Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Add Multi-Tenant Clinic Permissions & SMS Alerts"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E9EAF0] text-xs font-semibold text-[#222438] outline-none focus:border-[#7357FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Description of Changes *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what features need to be added, removed, or modified..."
              className="w-full p-3 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Business Reason / Motivation
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Stakeholder feedback requires support for Twilio SMS notifications"
              className="w-full px-4 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Affected Modules & Requirements
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirementTag}
                onChange={e => setRequirementTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Type requirement name and press enter..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-[#F5F6FA] text-xs font-bold rounded-xl text-[#222438] hover:bg-[#E9EAF0]"
              >
                Add
              </button>
            </div>

            {affectedRequirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {affectedRequirements.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#E9E3FF] text-[#7357FF] font-semibold"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">
                Estimated Budget Impact (₹)
              </label>
              <input
                type="number"
                value={budgetImpact}
                onChange={e => setBudgetImpact(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">
                Target Timeline Impact
              </label>
              <input
                type="text"
                value={timelineImpact}
                onChange={e => setTimelineImpact(e.target.value)}
                placeholder="e.g. +1 Week"
                className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#777B8A] hover:bg-[#F5F6FA] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#7357FF] hover:bg-[#5E42E6] text-white text-xs font-bold rounded-xl shadow-md shadow-[#7357FF]/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Scope Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
