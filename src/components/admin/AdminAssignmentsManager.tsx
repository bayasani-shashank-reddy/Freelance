import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Briefcase,
  Send,
  RefreshCw
} from 'lucide-react';

interface AdminAssignmentsManagerProps {
  projects: any[];
  freelancers: any[];
  onRefresh: () => void;
  onOpenShareModal: (project: any) => void;
  onSelectProject: (projectId: string) => void;
}

export const AdminAssignmentsManager: React.FC<AdminAssignmentsManagerProps> = ({
  projects,
  freelancers,
  onRefresh,
  onOpenShareModal,
  onSelectProject
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'unassigned' | 'active' | 'roster'>('unassigned');
  const [searchQuery, setSearchQuery] = useState('');

  // Unassigned projects
  const unassignedProjects = projects.filter(
    (p) => !p.assignedFreelancerId && p.status !== 'completed'
  );

  // Assigned projects
  const assignedProjects = projects.filter(
    (p) => p.assignedFreelancerId && p.status !== 'completed'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#3978FF]/10 text-[#3978FF] border border-[#3978FF]/20">
              Talent Dispatch & Workload
            </span>
            <span className="text-xs text-[#8F91A3] font-mono">
              Specialist Matching Matrix
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white mt-1">
            Specialist Assignments & Dispatch
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Match client requirements to vetted domain specialists, monitor active workloads, and dispatch project briefs.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white hover:border-[#7357FF] flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#7357FF]" />
          <span>Sync Matrix</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-500">AWAITING ASSIGNMENT</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-display font-bold text-[#17172B] dark:text-white mt-1">
            {unassignedProjects.length}
          </div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Projects needing specialist lead</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">ACTIVE DISPATCHES</span>
          <div className="text-2xl font-display font-bold text-emerald-500 mt-1">
            {assignedProjects.length}
          </div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Currently paired & in execution</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">VETTED SPECIALISTS</span>
          <div className="text-2xl font-display font-bold text-[#7357FF] mt-1">
            {freelancers.length}
          </div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Engineers & architects in talent pool</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SUB-TABS & SEARCH
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('unassigned')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'unassigned'
                ? 'bg-[#7357FF] text-white shadow-xs'
                : 'text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F7F8FC] dark:hover:bg-[#131326]'
            }`}
          >
            Awaiting Specialist ({unassignedProjects.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'active'
                ? 'bg-[#7357FF] text-white shadow-xs'
                : 'text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F7F8FC] dark:hover:bg-[#131326]'
            }`}
          >
            Active Pairings ({assignedProjects.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'roster'
                ? 'bg-[#7357FF] text-white shadow-xs'
                : 'text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F7F8FC] dark:hover:bg-[#131326]'
            }`}
          >
            Specialist Capacity ({freelancers.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8F91A3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or specialists..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs outline-none focus:border-[#7357FF]"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CONTENT BY SUB-TAB
      ───────────────────────────────────────────────────────────── */}

      {/* VIEW 1: UNASSIGNED PROJECTS */}
      {activeSubTab === 'unassigned' && (
        <div className="space-y-4">
          {unassignedProjects.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <h3 className="font-bold text-base text-[#17172B] dark:text-white">
                All Projects Successfully Dispatched
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                No pending requests are currently awaiting specialist assignment.
              </p>
            </div>
          ) : (
            unassignedProjects.map((p) => (
              <div
                key={p._id || p.customId}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#7357FF]/40 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                      NEEDS SPECIALIST LEAD
                    </span>
                    <span className="text-[10px] font-mono text-[#8F91A3]">
                      {p.customId || p._id}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#17172B] dark:text-white">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] line-clamp-2">
                    {p.concept || p.aiSynthesis?.summary || 'Client submitted initiative awaiting administrative triage and specialist match.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8F91A3] pt-1">
                    <span>Client: <strong className="text-[#17172B] dark:text-white">{p.clientName || p.clientEmail}</strong></span>
                    <span>Category: <strong className="text-[#7357FF]">{p.category || 'Software'}</strong></span>
                    <span>Submitted: {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectProject(p._id || p.customId)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#65677A] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]"
                  >
                    View Dossier
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenShareModal(p)}
                    className="px-5 py-2.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white text-xs font-bold shadow-lg shadow-[#7357FF]/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign & Dispatch Brief</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: ACTIVE PAIRINGS */}
      {activeSubTab === 'active' && (
        <div className="space-y-4">
          {assignedProjects.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-[#8F91A3] opacity-40" />
              <h3 className="font-bold text-base text-[#17172B] dark:text-white">
                No Active Dispatches
              </h3>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Assigned projects will appear here with active execution tracking.
              </p>
            </div>
          ) : (
            assignedProjects.map((p) => {
              const spec = freelancers.find((f) => f.id === p.assignedFreelancerId || f._id === p.assignedFreelancerId);

              return (
                <div
                  key={p._id || p.customId}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          ● IN EXECUTION
                        </span>
                        <span className="text-[10px] font-mono text-[#8F91A3]">{p.customId || p._id}</span>
                      </div>
                      <h3 className="font-display font-extrabold text-base text-[#17172B] dark:text-white">
                        {p.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenShareModal(p)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#7357FF] hover:bg-[#EEE9FF] dark:hover:bg-[#252445] transition-colors"
                    >
                      Reassign / Dispatch Brief
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#202038] text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8F91A3] block font-bold">CLIENT</span>
                      <div className="font-bold text-[#17172B] dark:text-white">{p.clientName || 'Client'}</div>
                      <div className="text-[#65677A] dark:text-[#A6A8C0]">{p.clientEmail}</div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8F91A3] block font-bold">ASSIGNED ARCHITECT</span>
                      <div className="font-bold text-[#17172B] dark:text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{spec?.name || 'Vetted Specialist'}</span>
                      </div>
                      <div className="text-[#65677A] dark:text-[#A6A8C0]">{spec?.email}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: SPECIALIST ROSTER CAPACITY */}
      {activeSubTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelancers.map((f) => {
            const activeProjectsCount = projects.filter((p) => p.assignedFreelancerId === f.id || p.assignedFreelancerId === f._id).length;

            return (
              <div
                key={f.id || f._id}
                className="p-5 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-bold text-xs">
                    {f.name?.[0] || 'S'}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                    {f.availability || 'Available'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#17172B] dark:text-white">{f.name}</h4>
                  <p className="text-xs text-[#7357FF] font-medium">{f.title || 'Senior Architect'}</p>
                  <p className="text-[11px] text-[#8F91A3] truncate">{f.email}</p>
                </div>

                <div className="pt-2 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between text-xs">
                  <span className="text-[#65677A] dark:text-[#A6A8C0]">Active Projects:</span>
                  <span className="font-mono font-bold text-[#17172B] dark:text-white">
                    {activeProjectsCount} assigned
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
