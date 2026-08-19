import React, { useState } from 'react';
import { X, Bot, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface NexusAIAssistantModalProps {
  onClose: () => void;
}

export const NexusAIAssistantModal: React.FC<NexusAIAssistantModalProps> = ({ onClose }) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = (type: string) => {
    setActiveAction(type);
    setLoading(true);
    setOutput(null);

    setTimeout(() => {
      setLoading(false);
      if (type === 'summarize') {
        setOutput(
          `📌 **Project Discussion Summary**:\n• Glassmorphic 3D canvas approved by client\n• Milestone 2 payment ($3,000) released to escrow\n• Delivery deadline on track for August 28, 2026\n• ⚠ Note: Dark mode contrast refinement requested for watch HUD`
        );
      } else if (type === 'risk') {
        setOutput(
          `🛡 **Nexus Risk Analysis**:\n• Budget: Optimal ($6,200 vs market rate $5,500 - $7,500)\n• Timeline: Balanced (3 weeks for React WebGL handoff)\n• Risk Rating: LOW (98% match with contractor experience)`
        );
      } else if (type === 'tasks') {
        setOutput(
          `✅ **Generated Milestone Task List**:\n1. [ ] Figma Token & Glassmorphic Asset Handoff\n2. [ ] R3F Telemetry Canvas Component Build\n3. [ ] WebGL Performance Profiling (60 FPS test)\n4. [ ] Stripe/Escrow Release Checklist`
        );
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-xl w-full p-6 relative shadow-2xl animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nexus AI Project Co-Pilot</h3>
            <p className="text-xs text-slate-400">Contextual intelligence for requirements, risks, & summaries</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => handleAction('summarize')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              activeAction === 'summarize' ? 'bg-indigo-600/20 border-indigo-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Summarize Scope</span>
          </button>
          <button
            onClick={() => handleAction('risk')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              activeAction === 'risk' ? 'bg-indigo-600/20 border-indigo-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Risk Detection</span>
          </button>
          <button
            onClick={() => handleAction('tasks')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              activeAction === 'tasks' ? 'bg-indigo-600/20 border-indigo-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Generate Tasks</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-cyan-300 animate-pulse">
            Nexus AI analyzing workspace telemetry...
          </div>
        ) : output ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed">
            {output}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
            Select an action above to trigger Nexus AI analysis on your active project.
          </div>
        )}
      </div>
    </div>
  );
};
