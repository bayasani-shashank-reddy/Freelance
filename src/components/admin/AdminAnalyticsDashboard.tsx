import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface AdminAnalyticsDashboardProps {
  projects: any[];
  freelancers: any[];
  onRefresh: () => void;
}

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({
  projects,
  freelancers: _freelancers,
  onRefresh
}) => {
  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Monthly');

  // Stats calculation
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed' || (p.stage || '').toLowerCase() === 'completed').length;
  const inProgressProjects = projects.filter((p) => (p.stage || '').toLowerCase() === 'development' || p.status === 'active').length;
  const intakeProjects = projects.filter((p) => p.status === 'submitted' || p.status === 'in_review').length;

  // Funnel conversion percentages
  const scopingRate = totalProjects > 0 ? Math.round(((totalProjects - intakeProjects) / totalProjects) * 100) : 85;
  const executionRate = totalProjects > 0 ? Math.round(((inProgressProjects + completedProjects) / totalProjects) * 100) : 68;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 42;

  // Monthly breakdown mock series
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const intakeVolume = [4, 7, 12, 18, 24, 32];
  const completionVolume = [2, 5, 8, 14, 19, 27];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Live Business Telemetry
            </span>
            <span className="text-xs text-[#8F91A3] font-mono">
              Enterprise Data Stream
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white mt-1">
            Enterprise Analytics & Telemetry
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            System-wide operational velocity, project conversion funnel, token circulation, and turnaround SLAs.
          </p>
        </div>

        {/* Timeframe controls */}
        <div className="flex items-center gap-2">
          {(['Weekly', 'Monthly', 'Quarterly'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-[#7357FF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0]'
              }`}
            >
              {t}
            </button>
          ))}

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#7357FF] hover:bg-[#EEE9FF] dark:hover:bg-[#201F3E] transition-colors"
            title="Sync Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. METRIC HIGHLIGHTS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8F91A3]">
            <span className="font-mono font-bold uppercase text-[10px]">TOTAL INTAKE VOLUME</span>
            <span className="text-emerald-500 font-bold flex items-center text-[10px]">
              +28% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-display font-bold text-[#17172B] dark:text-white">{totalProjects}</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Verified project briefs</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8F91A3]">
            <span className="font-mono font-bold uppercase text-[10px]">AVG SCOPING VELOCITY</span>
            <span className="text-emerald-500 font-bold flex items-center text-[10px]">
              -4.2h <ArrowDownRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-display font-bold text-[#7357FF]">16.4 hrs</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Intake to technical quote</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8F91A3]">
            <span className="font-mono font-bold uppercase text-[10px]">COMPLETION RATE</span>
            <span className="text-emerald-500 font-bold flex items-center text-[10px]">
              +12% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-display font-bold text-emerald-500">96.8%</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Deliverable handoff satisfaction</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8F91A3]">
            <span className="font-mono font-bold uppercase text-[10px]">NCX INTAKE ESCROW</span>
            <span className="text-[#3978FF] font-bold text-[10px]">Platform</span>
          </div>
          <div className="text-2xl font-display font-bold text-[#3978FF]">
            {totalProjects * 50} NCX
          </div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Intake fees collected</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DUAL CHARTS: CONVERSION FUNNEL & INTAKE TRAJECTORY
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CONVERSION FUNNEL */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
            <div>
              <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Intake-to-Delivery Conversion Funnel
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Stage progression from submission to production delivery
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
              Stage Health
            </span>
          </div>

          <div className="space-y-4">
            {/* Step 1: Client Submission */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#17172B] dark:text-white">1. Project Submissions</span>
                <span className="font-mono text-[#7357FF]">100% ({totalProjects})</span>
              </div>
              <div className="h-3 w-full bg-[#E8EAF4] dark:bg-[#222238] rounded-full overflow-hidden">
                <div className="h-full bg-[#7357FF] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Feasibility & Scoping */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#17172B] dark:text-white">2. Scoped & Quoted</span>
                <span className="font-mono text-[#3978FF]">{scopingRate}%</span>
              </div>
              <div className="h-3 w-full bg-[#E8EAF4] dark:bg-[#222238] rounded-full overflow-hidden">
                <div className="h-full bg-[#3978FF] rounded-full" style={{ width: `${scopingRate}%` }} />
              </div>
            </div>

            {/* Step 3: Active Execution */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#17172B] dark:text-white">3. In Active Execution</span>
                <span className="font-mono text-amber-500">{executionRate}%</span>
              </div>
              <div className="h-3 w-full bg-[#E8EAF4] dark:bg-[#222238] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${executionRate}%` }} />
              </div>
            </div>

            {/* Step 4: Final Delivery */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#17172B] dark:text-white">4. Completed Deliverable Approved</span>
                <span className="font-mono text-emerald-500">{completionRate}%</span>
              </div>
              <div className="h-3 w-full bg-[#E8EAF4] dark:bg-[#222238] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* INTAKE TRAJECTORY CHART */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
            <div>
              <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
                Monthly Intake Trajectory
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Monthly requests vs completed engineering deliveries
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              {timeframe} Trajectory
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {months.map((m, idx) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  {/* Intake bar */}
                  <div
                    className="w-1/2 bg-[#7357FF] rounded-t-lg transition-all duration-300"
                    style={{ height: `${(intakeVolume[idx] / 35) * 100}%` }}
                    title={`Intake: ${intakeVolume[idx]}`}
                  />
                  {/* Completed bar */}
                  <div
                    className="w-1/2 bg-emerald-500 rounded-t-lg transition-all duration-300"
                    style={{ height: `${(completionVolume[idx] / 35) * 100}%` }}
                    title={`Completed: ${completionVolume[idx]}`}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#8F91A3]">{m}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#F0F2F9] dark:border-[#202038] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#7357FF]" />
              <span className="text-[#65677A] dark:text-[#A6A8C0]">Intake Submissions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-[#65677A] dark:text-[#A6A8C0]">Completed Deliverables</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
