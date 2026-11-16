import React, { useState } from 'react';
import { X, Clock, Check, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface EffortTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  onLogged: () => void;
}

export const EffortTrackerModal: React.FC<EffortTrackerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  freelancerId,
  freelancerName,
  onLogged
}) => {
  if (!isOpen) return null;

  const [taskTitle, setTaskTitle] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(10);
  const [actualHours, setActualHours] = useState<number>(8);
  const [workCompleted, setWorkCompleted] = useState('');
  const [remainingWork, setRemainingWork] = useState('');
  const [deviationReason, setDeviationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const varianceHours = actualHours - estimatedHours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await api.logFreelancerWork(projectId, {
      freelancerId,
      freelancerName,
      taskTitle,
      estimatedHours,
      actualHours,
      workCompleted,
      remainingWork,
      deviationReason
    });

    setIsSubmitting(false);
    if (res.success) {
      onLogged();
      onClose();
    } else {
      alert(res.error || 'Failed to record work log.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E9EAF0] space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9F1FF] text-[#3978FF] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[#222438]">
                Effort vs Estimate Tracker
              </h3>
              <p className="text-xs text-[#777B8A]">
                Record actual development hours for <strong className="text-[#222438]">{projectTitle}</strong>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Task or Milestone Title *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement WebRTC Video Signaling & Audio Mixer"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E9EAF0] text-xs font-semibold text-[#222438] outline-none focus:border-[#3978FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1.5">
                Estimated Hours
              </label>
              <input
                type="number"
                min="1"
                required
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#3978FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1.5">
                Actual Hours Spent
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={actualHours}
                onChange={e => setActualHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#3978FF]"
              />
            </div>
          </div>

          {/* Variance Gauge */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            varianceHours > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span>Effort Variance:</span>
            <span className="font-bold">
              {varianceHours > 0 ? `+${varianceHours}h over estimate` : `${Math.abs(varianceHours)}h under estimate`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Work Completed *
            </label>
            <textarea
              required
              rows={2}
              value={workCompleted}
              onChange={e => setWorkCompleted(e.target.value)}
              placeholder="Summary of code commits, modules developed, or test cases passed..."
              className="w-full p-3 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#3978FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1.5">
              Remaining Work in Module
            </label>
            <input
              type="text"
              value={remainingWork}
              onChange={e => setRemainingWork(e.target.value)}
              placeholder="e.g. End-to-end load testing and mobile Safari layout check"
              className="w-full px-4 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#3978FF]"
            />
          </div>

          {varianceHours > 2 && (
            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Reason for Significant Deviation (&gt;2h)</span>
              </label>
              <input
                type="text"
                value={deviationReason}
                onChange={e => setDeviationReason(e.target.value)}
                placeholder="e.g. Third-party OAuth API schema change required extra adapter logic"
                className="w-full px-4 py-2 rounded-xl border border-amber-200 text-xs text-[#222438] outline-none focus:border-amber-400 bg-amber-50/30"
              />
            </div>
          )}

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
              className="px-5 py-2.5 bg-[#3978FF] hover:bg-[#2B6AF5] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3978FF]/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Log Effort'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
