import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';

interface AdminProjectsManagerProps {
  projects: any[];
  freelancers: any[];
  onSelectProject: (projectId: string) => void;
  onRefresh: () => void;
  onOpenShareModal: (project: any) => void;
  onOpenDocViewer: (fileName: string, storagePath?: string) => void;
}

export const AdminProjectsManager: React.FC<AdminProjectsManagerProps> = ({
  projects,
  freelancers,
  onSelectProject,
  onRefresh,
  onOpenShareModal,
  onOpenDocViewer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stages = ['Intake', 'Planning', 'Design', 'Development', 'Testing', 'Delivery', 'Completed'];

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const projectStage = p.stage || (p.status === 'completed' ? 'Completed' : p.status === 'in_review' ? 'Planning' : 'Intake');
    const matchesStage = stageFilter === 'all' || projectStage.toLowerCase() === stageFilter.toLowerCase();

    return matchesSearch && matchesStage;
  });

  // Calculate Stats
  const totalCount = projects.length;
  const inDevCount = projects.filter((p) => (p.stage || '').toLowerCase() === 'development' || p.status === 'active').length;
  const intakeCount = projects.filter((p) => p.status === 'submitted' || p.status === 'in_review').length;
  const completedCount = projects.filter((p) => p.status === 'completed' || (p.stage || '').toLowerCase() === 'completed').length;

  const handleStageChange = async (projectId: string, newStage: string) => {
    setUpdatingId(projectId);
    try {
      await api.updateProjectStatus(projectId, { status: newStage.toLowerCase() });
      onRefresh();
    } catch (err: any) {
      console.error('Failed to update stage:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & METRICS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7357FF]/10 text-[#7357FF] border border-[#7357FF]/20">
              Operations Portfolio
            </span>
            <span className="text-xs text-[#8F91A3] font-mono">
              Live Projects Management
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white mt-1">
            Projects Portfolio & Lifecycle
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Track end-to-end development lifecycles, milestones, assigned specialists, and client delivery gates.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#1A1A30] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white hover:border-[#7357FF] flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#7357FF]" />
          <span>Sync Portfolio</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">TOTAL PROJECTS</span>
          <div className="text-2xl font-display font-bold text-[#17172B] dark:text-white">{totalCount}</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">All portfolio initiatives</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF]">ACTIVE DEVELOPMENT</span>
          <div className="text-2xl font-display font-bold text-[#3978FF]">{inDevCount}</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Under active execution</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-500">IN PLANNING / INTAKE</span>
          <div className="text-2xl font-display font-bold text-amber-500">{intakeCount}</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Scoping & quoting</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">COMPLETED & DELIVERED</span>
          <div className="text-2xl font-display font-bold text-emerald-500">{completedCount}</div>
          <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">Production handoff done</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTERS & SEARCH BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8F91A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project title, client email, category or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
          />
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              stageFilter === 'all'
                ? 'bg-[#7357FF] text-white shadow-xs'
                : 'bg-[#F7F8FC] dark:bg-[#131326] text-[#65677A] dark:text-[#A6A8C0] border border-[#E8EAF4] dark:border-[#2A2A46]'
            }`}
          >
            All ({totalCount})
          </button>
          {stages.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                stageFilter.toLowerCase() === st.toLowerCase()
                  ? 'bg-[#7357FF] text-white shadow-xs'
                  : 'bg-[#F7F8FC] dark:bg-[#131326] text-[#65677A] dark:text-[#A6A8C0] border border-[#E8EAF4] dark:border-[#2A2A46]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PROJECT CARDS / LIST VIEW
      ───────────────────────────────────────────────────────────── */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-3">
          <Briefcase className="w-10 h-10 mx-auto text-[#8F91A3] opacity-40" />
          <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
            No projects found matching filter
          </h3>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Try adjusting your search query or stage filter to locate projects.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((p) => {
            const currentStage = p.stage || (p.status === 'completed' ? 'Completed' : p.status === 'in_review' ? 'Planning' : 'Intake');
            const progress = p.progressPercent || (currentStage === 'Completed' ? 100 : currentStage === 'Delivery' ? 85 : currentStage === 'Development' ? 60 : currentStage === 'Design' ? 40 : currentStage === 'Planning' ? 20 : 10);
            const assignedSpecialist = freelancers.find((f) => f.id === p.assignedFreelancerId || f._id === p.assignedFreelancerId);

            return (
              <div
                key={p._id || p.customId}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm hover:border-[#7357FF]/40 transition-all space-y-4"
              >
                {/* Top Row: Title, ID, Stage Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#8F91A3]">
                        {p.customId || p._id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF]">
                        {p.category || 'Custom Software'}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#17172B] dark:text-white">
                      {p.title || 'Untitled Project'}
                    </h3>
                  </div>

                  {/* Stage Changer Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-mono text-[#8F91A3]">Stage:</span>
                    <select
                      value={currentStage}
                      disabled={updatingId === (p._id || p.customId)}
                      onChange={(e) => handleStageChange(p._id || p.customId, e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#7357FF] outline-none cursor-pointer hover:border-[#7357FF] transition-colors"
                    >
                      {stages.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#65677A] dark:text-[#A6A8C0]">
                      Milestone Execution Progress
                    </span>
                    <span className="font-mono font-bold text-[#7357FF]">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#E8EAF4] dark:bg-[#222238] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7357FF] to-[#3978FF] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#202038] text-xs">
                  
                  {/* Client Info */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-[#8F91A3] block font-bold">CLIENT</span>
                    <div className="font-semibold text-[#17172B] dark:text-white truncate">
                      {p.clientName || 'NexusCraft Client'}
                    </div>
                    <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0] truncate">
                      {p.clientEmail}
                    </div>
                    {p.clientPhone && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono text-[#7357FF] font-bold">
                          {p.clientCountryCode || '+91'} {p.clientPhone}
                        </span>
                        <a
                          href={`https://wa.me/${(p.clientCountryCode || '+91').replace('+', '')}${p.clientPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Specialist Info */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-[#8F91A3] block font-bold">ASSIGNED SPECIALIST</span>
                    {assignedSpecialist ? (
                      <div>
                        <div className="font-semibold text-[#17172B] dark:text-white flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{assignedSpecialist.name}</span>
                        </div>
                        <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                          {assignedSpecialist.title || 'Specialist Architect'}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-0.5">
                        <span className="text-[11px] text-amber-500 font-semibold block">Unassigned</span>
                        <button
                          type="button"
                          onClick={() => onOpenShareModal(p)}
                          className="text-[10px] font-bold text-[#7357FF] hover:underline"
                        >
                          + Assign Specialist Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Specification & Files */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-[#8F91A3] block font-bold">SPECIFICATION ATTACHMENT</span>
                    {p.referenceDoc?.fileName || p.specDocFileName ? (
                      <div className="flex items-center gap-2 pt-0.5">
                        <FileText className="w-3.5 h-3.5 text-[#3978FF]" />
                        <span className="font-mono text-[11px] text-[#17172B] dark:text-white truncate">
                          {p.referenceDoc?.fileName || p.specDocFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenDocViewer(p.referenceDoc?.fileName || p.specDocFileName, p.referenceDoc?.storagePath || p.specDocStoragePath)}
                          className="p-1 rounded text-[#7357FF] hover:bg-[#EEE9FF] dark:hover:bg-[#201F3E]"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#8F91A3] italic">No document attached</span>
                    )}
                    {p.referenceUrl && (
                      <a
                        href={p.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#3978FF] hover:underline flex items-center gap-1 pt-0.5 truncate"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{p.referenceUrl}</span>
                      </a>
                    )}
                  </div>

                </div>

                {/* Bottom Row: Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#8F91A3]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenShareModal(p)}
                      className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white hover:border-[#7357FF] transition-colors"
                    >
                      Dispatch Brief
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectProject(p._id || p.customId)}
                      className="px-4 py-1.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Open Dossier & Triage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
