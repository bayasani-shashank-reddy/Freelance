import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, type Toast } from '../context/ToastContext';

const ICONS: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
  error:   <XCircle      className="w-5 h-5 text-red-400    flex-shrink-0" />,
  info:    <Info         className="w-5 h-5 text-cyan-400   flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
};

const BAR_COLORS: Record<Toast['type'], string> = {
  success: 'bg-emerald-400',
  error:   'bg-red-400',
  info:    'bg-cyan-400',
  warning: 'bg-amber-400',
};

const BORDERS: Record<Toast['type'], string> = {
  success: 'border-emerald-500/40',
  error:   'border-red-500/40',
  info:    'border-cyan-500/40',
  warning: 'border-amber-500/40',
};

const ToastCard: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { dismissToast } = useToast();
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`relative w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border ${BORDERS[toast.type]} rounded-2xl shadow-2xl overflow-hidden`}
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4 pr-10">
        {ICONS[toast.type]}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white leading-tight">{toast.title}</div>
          {toast.message && (
            <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</div>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => dismissToast(toast.id)}
        className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-800">
        <div
          className={`h-full ${BAR_COLORS[toast.type]} transition-all ease-linear`}
          style={{ width: `${progress}%`, transitionDuration: '30ms' }}
        />
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};
