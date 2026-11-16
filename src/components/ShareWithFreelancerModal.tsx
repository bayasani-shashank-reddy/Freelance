import React, { useState } from 'react';
import { X, Shield, Check, Search, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BoxedButton } from './shared/BoxedButton';
import confetti from 'canvas-confetti';

interface ShareWithFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  projectTitle: string;
  onShareSuccess?: () => void;
}

export const ShareWithFreelancerModal: React.FC<ShareWithFreelancerModalProps> = ({
  isOpen,
  onClose,
  requestId,
  projectTitle,
  onShareSuccess
}) => {
  const { freelancers, shareDocumentWithFreelancers } = useUser();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [adminInstructions, setAdminInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeFreelancers = freelancers.filter(f => f.status !== 'archived');
  const filtered = activeFreelancers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmShare = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one freelancer to share with.');
      return;
    }

    setSharing(true);
    setError(null);
    const success = await shareDocumentWithFreelancers(requestId, selectedIds, adminInstructions, dueDate);
    setSharing(false);

    if (success) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      if (onShareSuccess) onShareSuccess();
      onClose();
    } else {
      setError('Failed to share document. Please verify active permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b" style={{ borderColor: 'var(--border-main)' }}>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--text-main)' }} />
              <span>Admin Controlled Distribution</span>
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>
              Share Project Brief
            </h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Discretely route "{projectTitle}" to vetted engineers for technical assessment.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {error && (
            <div
              className="p-3 border text-xs flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specialists by name, discipline, or skills..."
              className="w-full pl-9 pr-4 py-2.5 border text-xs focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          {/* Freelancer Checklist */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-xs py-4 text-center font-mono" style={{ color: 'var(--text-muted)' }}>
                No active freelancers match your criteria. Add freelancers in the Directory tab.
              </p>
            ) : (
              filtered.map((f) => {
                const isSelected = selectedIds.includes(f.customId || f.id);
                return (
                  <div
                    key={f.customId || f.id}
                    onClick={() => toggleSelect(f.customId || f.id)}
                    className="p-3 border cursor-pointer transition-all flex items-center justify-between"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-canvas)' : 'var(--bg-surface)',
                      borderColor: isSelected ? 'var(--text-main)' : 'var(--border-main)',
                      outline: isSelected ? '1px solid var(--text-main)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 border flex items-center justify-center text-[10px]"
                        style={{
                          backgroundColor: isSelected ? 'var(--text-main)' : 'transparent',
                          borderColor: isSelected ? 'var(--text-main)' : 'var(--border-main)',
                          color: isSelected ? 'var(--bg-canvas)' : 'inherit'
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{f.name}</p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {f.title || 'Engineer'} · {f.availability || 'Available'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      {(f.skills || []).slice(0, 2).join(', ')}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Instructions and Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-mono uppercase mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>
                Admin Directive / Instructions
              </label>
              <input
                type="text"
                value={adminInstructions}
                onChange={(e) => setAdminInstructions(e.target.value)}
                placeholder="e.g. Focus review on high-concurrency architecture"
                className="w-full px-3 py-2 border text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>
                Response Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-main)' }}>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {selectedIds.length} Engineer{selectedIds.length === 1 ? '' : 's'} Selected
          </span>

          <div className="flex items-center gap-2">
            <BoxedButton
              onClick={onClose}
              variant="secondary"
              size="sm"
            >
              Cancel
            </BoxedButton>
            <BoxedButton
              onClick={handleConfirmShare}
              variant="primary"
              size="sm"
              loading={sharing}
              disabled={sharing || selectedIds.length === 0}
            >
              Confirm Dispatch
            </BoxedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWithFreelancerModal;
