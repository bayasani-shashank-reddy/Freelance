import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ChevronRight, ShieldAlert, Sparkles } from 'lucide-react';

interface SlaItem {
  id: string;
  title: string;
  clientName: string;
  status: string;
  ageHours: number;
  slaStatus: 'On Track' | 'At Risk' | 'Breached';
  bottleneck: string | null;
  assignedFreelancer: string;
  priority: string;
  submittedAt: string;
}

interface SlaRadarData {
  summary: {
    total: number;
    onTrack: number;
    atRisk: number;
    breaches: number;
  };
  items: SlaItem[];
}

interface NexusSlaRadarProps {
  data: SlaRadarData | null;
  onSelectProject?: (projectId: string) => void;
  onOpenDrawer?: (projectId: string) => void;
}

export const NexusSlaRadar: React.FC<NexusSlaRadarProps> = ({ data, onSelectProject, onOpenDrawer }) => {
  if (!data || data.items.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#24A675] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#222438]">
                Nexus SLA & Bottleneck Radar
              </h3>
              <p className="text-xs text-[#777B8A]">Zero SLA bottlenecks detected across pipeline operations.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#24A675]">
            100% On Track
          </span>
        </div>
      </div>
    );
  }

  const { summary, items } = data;
  const criticalItems = items.filter(i => i.slaStatus === 'Breached' || i.slaStatus === 'At Risk');

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm space-y-5">
      {/* Header & Operational Radar Summary Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F8]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
            summary.breaches > 0 ? 'bg-red-50 text-red-600' : summary.atRisk > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-[#222438]">
                Nexus SLA & Bottleneck Radar
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E9E3FF] text-[#7357FF]">
                LIVE MONITOR
              </span>
            </div>
            <p className="text-xs text-[#777B8A] mt-0.5">
              Service-level delivery targets: 24h intake triage, 48h scoping approval, 24h specialist dispatch.
            </p>
          </div>
        </div>

        {/* Radar Summary KPI Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{summary.breaches} SLA Breaches</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{summary.atRisk} At Risk</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{summary.onTrack} On Track</span>
          </div>
        </div>
      </div>

      {/* Critical Bottlenecks Queue */}
      <div className="space-y-3">
        {criticalItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#777B8A]">
            All active project tickets are within their operational SLA thresholds.
          </div>
        ) : (
          criticalItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.slaStatus === 'Breached'
                  ? 'bg-red-50/40 border-red-200/80 hover:border-red-300'
                  : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    item.slaStatus === 'Breached'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.slaStatus}
                  </span>
                  <span className="text-xs font-bold text-[#222438]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#777B8A] font-medium">
                    · Client: {item.clientName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#55586A]">
                  <span className="font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {item.bottleneck}
                  </span>
                  <span className="text-[#A0A4B8]">|</span>
                  <span className="text-[#777B8A]">
                    Elapsed: <strong className="text-[#222438]">{item.ageHours}h</strong> (Submitted: {item.submittedAt})
                  </span>
                  <span className="text-[#A0A4B8]">|</span>
                  <span className="text-[#777B8A]">
                    Specialist: <strong className="text-[#222438]">{item.assignedFreelancer}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {onOpenDrawer && (
                  <button
                    onClick={() => onOpenDrawer(item.id)}
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-[#F5F6FA] border border-[#E9EAF0] text-[#222438] shadow-xs flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#7357FF]" />
                    <span>Scoping Actions</span>
                  </button>
                )}
                {onSelectProject && (
                  <button
                    onClick={() => onSelectProject(item.id)}
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#3978FF] hover:bg-[#2B6AF5] text-white shadow-xs flex items-center gap-1 transition-all"
                  >
                    <span>Inspect Pipeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
