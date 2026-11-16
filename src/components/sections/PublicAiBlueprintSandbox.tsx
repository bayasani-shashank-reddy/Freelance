import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Cpu, Layers, CheckCircle, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Code2, Clock } from 'lucide-react';
import { api } from '../../lib/api';

const PREDEFINED_CHIPS = [
  { id: 'ai-powered crm', label: 'AI-Powered CRM', icon: '🤖' },
  { id: 'e-commerce platform', label: 'E-Commerce Platform', icon: '🛒' },
  { id: 'healthcare management system', label: 'Healthcare Management System', icon: '🏥' },
  { id: 'freelancer management platform', label: 'Freelancer Management Platform', icon: '💼' },
  { id: 'ai-powered education application', label: 'AI-Powered Education Application', icon: '🎓' }
];

export const PublicAiBlueprintSandbox: React.FC = () => {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState('ai-powered crm');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);

  const fetchBlueprint = async (chipKey: string, promptText?: string) => {
    setLoading(true);
    try {
      const res = await api.getPublicAiSandbox(promptText || undefined, chipKey || undefined);
      if (res && !res.error) {
        setBlueprint(res);
      }
    } catch (err) {
      console.error('Failed to load sandbox blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprint('ai-powered crm');
  }, []);

  const handleChipClick = (chipId: string) => {
    setActiveChip(chipId);
    setCustomInput('');
    fetchBlueprint(chipId);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setActiveChip('');
    fetchBlueprint('', customInput.trim());
  };

  return (
    <section id="ai-sandbox" className="py-20 px-4 sm:px-8 lg:px-12 bg-white dark:bg-[#131326] border-y border-[#E8EAF4] dark:border-[#2A2A46] relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7357FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#3978FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF] dark:text-[#9C8AFF] border border-[#DDD5FF] dark:border-[#333160]">
            <Sparkles className="w-3.5 h-3.5 text-[#7357FF]" />
            <span>PUBLIC DEMONSTRATION SANDBOX · NO ACCOUNT REQUIRED</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#17172B] dark:text-white tracking-tight">
            Explore Instant AI Project Blueprinting
          </h2>
          <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
            Test drive our Gemini AI architectural synthesis engine. Select an industry benchmark or test your own custom concept before registering.
          </p>
        </div>

        {/* Predefined Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PREDEFINED_CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                activeChip === chip.id
                  ? 'bg-[#17172B] text-white border-[#17172B] dark:bg-[#7357FF] dark:border-[#7357FF] shadow-md scale-[1.02]'
                  : 'bg-[#F7F8FC] dark:bg-[#1A1A30] text-[#65677A] dark:text-[#A6A8C0] border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF] hover:text-[#17172B]'
              }`}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Input Bar */}
        <form onSubmit={handleCustomSubmit} className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Or type custom concept... e.g., AI micro-learning app for sales teams"
              className="w-full px-4 py-3 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#1A1A30] text-[#17172B] dark:text-white placeholder-[#8F91A3] text-xs font-medium focus:outline-none focus:border-[#7357FF] focus:ring-2 focus:ring-[#7357FF]/15 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !customInput.trim()}
            className="px-5 py-3 rounded-xl bg-[#7357FF] hover:bg-[#5E3FFF] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md hover:scale-[1.02] flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            <span>Synthesize</span>
          </button>
        </form>

        {/* Blueprint Display Card */}
        {blueprint && (
          <div className="rounded-3xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC]/60 dark:bg-[#17172B]/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
            
            {/* Header / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-[#D5FF68]/30 text-[#2B5400] dark:text-[#D5FF68]">
                    {blueprint.isAiGenerated ? '✨ Real-time AI Generated' : '📋 Demonstration Blueprint'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                    Complexity: {blueprint.projectComplexity || 'Medium'}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#17172B] dark:text-white">
                  {blueprint.title}
                </h3>
              </div>

              {/* Indicative Feasibility Score Meter */}
              <div className="flex items-center gap-4 bg-white dark:bg-[#1E1E36] p-3 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46]">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-display font-black text-lg">
                  {blueprint.indicativeFeasibilityScore || 90}%
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">
                    Indicative Feasibility
                  </div>
                  <div className="text-xs font-bold text-[#17172B] dark:text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Technically Sound</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
                Executive Product Overview
              </span>
              <p className="text-xs sm:text-sm text-[#4A4C63] dark:text-[#C5C7DE] leading-relaxed">
                {blueprint.projectOverview}
              </p>
            </div>

            {/* Technologies & Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Suggested Technologies */}
              <div className="space-y-3 bg-white dark:bg-[#1A1A32] p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#17172B] dark:text-white">
                  <Code2 className="w-4 h-4 text-[#3978FF]" />
                  <span>Suggested Technology Stack</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(blueprint.suggestedTechnologies || []).map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#F0F2FA] dark:bg-[#252542] text-[#17172B] dark:text-[#E2E4F0] border border-[#E2E4F0] dark:border-[#323254]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Suggested Modules */}
              <div className="space-y-3 bg-white dark:bg-[#1A1A32] p-5 rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#17172B] dark:text-white">
                  <Layers className="w-4 h-4 text-[#7357FF]" />
                  <span>Proposed Core System Modules</span>
                </div>
                <ul className="space-y-2">
                  {(blueprint.suggestedModules || []).map((mod: string, i: number) => (
                    <li key={i} className="text-xs text-[#65677A] dark:text-[#A6A8C0] flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                      <span>{mod}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Proposed Milestones */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
                Proposed Phased Delivery Milestones
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(blueprint.proposedMilestones || []).map((ms: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#1A1A32] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8F91A3]">
                      <span>STAGE 0{i + 1}</span>
                      <span className="flex items-center gap-1 text-[#3978FF]">
                        <Clock className="w-3 h-3" />
                        {ms.duration}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#17172B] dark:text-white leading-snug">
                      {ms.title}
                    </h4>
                    <div className="text-[10px] text-[#65677A] dark:text-[#A6A8C0] space-y-0.5 pt-1 border-t border-[#F0F2F9] dark:border-[#252542]">
                      {(ms.deliverables || []).map((d: string, j: number) => (
                        <div key={j} className="truncate">• {d}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer Bar */}
            <div className="p-3.5 rounded-xl bg-[#FFF8EB] dark:bg-[#2A2214] border border-[#FFE2A8] dark:border-[#524120] flex items-start gap-2.5 text-[11px] text-[#8C5D00] dark:text-[#FFD166] leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Exploratory Disclaimer:</strong> {blueprint.disclaimer}
              </div>
            </div>

            {/* Conversion CTA Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E8EAF4] dark:border-[#2A2A46]">
              <div className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Ready to turn this initial blueprint into an active development project?
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7357FF] hover:bg-[#5E3FFF] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  <span>Build This Project (+500 NCX)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default PublicAiBlueprintSandbox;
