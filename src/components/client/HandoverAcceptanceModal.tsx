import React, { useState } from 'react';
import { X, CheckCircle2, Star, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProjectRequest } from '../../types';
import confetti from 'canvas-confetti';

interface HandoverAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRequest | null;
  onAccepted: () => void;
}

export const HandoverAcceptanceModal: React.FC<HandoverAcceptanceModalProps> = ({
  isOpen,
  onClose,
  project,
  onAccepted
}) => {
  if (!isOpen || !project) return null;

  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [issueText, setIssueText] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIssue = () => {
    if (issueText.trim() && !issues.includes(issueText.trim())) {
      setIssues(prev => [...prev, issueText.trim()]);
      setIssueText('');
    }
  };

  const handleRemoveIssue = (iss: string) => {
    setIssues(prev => prev.filter(i => i !== iss));
  };

  const handleConfirm = async (status: 'Accepted' | 'Issues Raised') => {
    setIsSubmitting(true);
    const res = await api.recordHandoverAcceptance(project.customId || project.id, {
      status,
      rating,
      feedback,
      issues
    });
    setIsSubmitting(false);

    if (res.success) {
      if (status === 'Accepted') {
        confetti({ particleCount: 60, spread: 60 });
      }
      onAccepted();
      onClose();
    } else {
      alert(res.error || 'Failed to submit handover acceptance.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E9EAF0] space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#24A675] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[#222438]">
                Final Handover Acceptance
              </h3>
              <p className="text-xs text-[#777B8A]">
                Review deliverable package and formalize acceptance for <strong className="text-[#222438]">{project.projectTitle}</strong>
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

        {/* Rating */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#222438]">
            Quality & Execution Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-[#222438] ml-2">
              {rating === 5 ? 'Exceptional Delivery' : rating === 4 ? 'Very Good' : rating === 3 ? 'Satisfactory' : 'Needs Work'}
            </span>
          </div>
        </div>

        {/* Acceptance Feedback */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#222438]">
            Acceptance Feedback & Notes
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Share your experience with the deliverables, code quality, and delivery milestones..."
            className="w-full p-3 text-xs rounded-xl border border-[#E9EAF0] text-[#222438] outline-none focus:border-[#7357FF]"
          />
        </div>

        {/* Issues if any */}
        <div className="space-y-2 pt-2 border-t border-[#F0F2F8]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#222438] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Raise Outstanding Issues (Optional)</span>
            </label>
            <span className="text-[10px] text-[#777B8A]">Only if items are missing</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={issueText}
              onChange={e => setIssueText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddIssue(); } }}
              placeholder="e.g. Missing PostgreSQL seed script in /database folder"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E9EAF0] text-[#222438] outline-none focus:border-[#7357FF]"
            />
            <button
              type="button"
              onClick={handleAddIssue}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#F5F6FA] text-[#222438] hover:bg-[#E9EAF0]"
            >
              Add
            </button>
          </div>

          {issues.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {issues.map(iss => (
                <div
                  key={iss}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-xs text-amber-800"
                >
                  <span>• {iss}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(iss)}
                    className="text-red-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F8]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#777B8A] hover:bg-[#F5F6FA] rounded-xl"
          >
            Cancel
          </button>
          {issues.length > 0 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleConfirm('Issues Raised')}
              className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
            >
              Raise Issues & Request Fixes
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleConfirm('Accepted')}
            className="px-5 py-2.5 text-xs font-bold bg-[#24A675] hover:bg-[#1E8A61] text-white rounded-xl shadow-md shadow-[#24A675]/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Final Acceptance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
