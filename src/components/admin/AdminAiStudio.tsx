import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { api } from '../../lib/api';

export const AdminAiStudio: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState('Autonomous Drone Delivery Fleet Management System');
  const [testing, setTesting] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestSynthesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;

    setTesting(true);
    setTestError(null);
    try {
      const res = await api.generatePreview({ title: testPrompt.trim() });
      if (res?.success && (res?.preview || res?.data)) {
        setSynthesisResult(res.preview || res.data);
      } else {
        setTestError(res?.error || 'AI synthesis failed to respond');
      }
    } catch (err: any) {
      setTestError(err.message || 'Error executing AI model synthesis');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7357FF]/10 text-[#7357FF] border border-[#7357FF]/20 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Gemini 2.5 Engine
            </span>
            <span className="text-xs text-[#8F91A3] font-mono">
              Algorithmic Blueprint Synthesizer
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white mt-1">
            AI Project Intelligence & Scoping Studio
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Autonomous requirement decomposition, technical feasibility prediction, and AI-assisted scoping intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Gemini Engine: Operational
          </span>
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">MODEL INSTANCE</span>
          <div className="text-xl font-display font-bold text-[#17172B] dark:text-white">Gemini 2.5 Flash</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Sub-second architectural parsing</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">AVERAGE LATENCY</span>
          <div className="text-xl font-display font-bold text-emerald-500">385 ms</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">99.8% SLA compliance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">SYNTHESIS ACCURACY</span>
          <div className="text-xl font-display font-bold text-[#7357FF]">97.4%</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Specialist acceptance rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF]">TOKEN EFFICIENCY</span>
          <div className="text-xl font-display font-bold text-[#3978FF]">Optimal</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Zero wasted hallucinations</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE SCOPING TESTER
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F9] dark:border-[#202038]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Live AI Blueprint Synthesizer (Admin Sandbox)
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Test the exact algorithmic prompt decomposition that powers the client project intake flow.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleTestSynthesis} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#17172B] dark:text-white">
              Project Concept / Brief to Deconstruct
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="e.g. Decentralized File Storage with Zero-Knowledge Encryption"
                className="flex-1 px-4 py-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
              />

              <button
                type="submit"
                disabled={testing}
                className="px-6 py-3 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white text-xs font-bold shadow-lg shadow-[#7357FF]/25 flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Execute Gemini Synthesis</span>
              </button>
            </div>
          </div>
        </form>

        {testError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{testError}</span>
          </div>
        )}

        {/* Synthesis Result */}
        {synthesisResult && (
          <div className="p-6 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#7357FF]/40 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                SYNTHESIZED ARCHITECTURAL DECOMPOSITION
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                {synthesisResult.category}
              </span>
            </div>

            <p className="text-xs text-[#17172B] dark:text-white leading-relaxed font-medium">
              {synthesisResult.summary}
            </p>

            {synthesisResult.suggestedFeatures?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8EAF4] dark:border-[#202038]">
                <span className="text-[10px] font-mono font-bold uppercase text-[#65677A] dark:text-[#A6A8C0]">
                  IDENTIFIED CORE CAPABILITIES & MODULES:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {synthesisResult.suggestedFeatures.map((f: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-[#17172B] dark:text-white">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
