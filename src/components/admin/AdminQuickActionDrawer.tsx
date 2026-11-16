import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Users,
  Layers,
  Save,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';

interface AdminQuickActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onProjectUpdated: () => void;
}

export const AdminQuickActionDrawer: React.FC<AdminQuickActionDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated
}) => {
  const [drawerTab, setDrawerTab] = useState<'status' | 'matching' | 'pricing'>('status');

  // Status & Priority State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Normal');
  const [internalNote, setInternalNote] = useState('');
  const [userVisibleNote, setUserVisibleNote] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  // Smart Matching State
  const [matchingData, setMatchingData] = useState<any>(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Commercial Pricing State
  const [pricingForm, setPricingForm] = useState({
    proposedClientPrice: 0,
    proposedFreelancerFee: 0,
    approvedClientPrice: 0,
    approvedFreelancerFee: 0,
    reason: 'Initial commercial alignment'
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingFeedback, setPricingFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setSelectedStatus(project.status || 'Submitted');
      setSelectedPriority(project.priority || 'Normal');
      setInternalNote(project.internalNote || '');
      setUserVisibleNote(project.userVisibleNote || '');

      const comm = project.commercialTerms || {};
      setPricingForm({
        proposedClientPrice: comm.proposedClientPrice || 150000,
        proposedFreelancerFee: comm.proposedFreelancerFee || 105000,
        approvedClientPrice: comm.approvedClientPrice || 0,
        approvedFreelancerFee: comm.approvedFreelancerFee || 0,
        reason: 'Commercial governance update'
      });

      // Load matching candidates if project is selected
      const pId = project.customId || project.id;
      if (pId) {
        setMatchingLoading(true);
        api.getSmartFreelancerMatches(pId).then(res => {
          if (res?.success) {
            setMatchingData(res);
          }
          setMatchingLoading(false);
        });
      }
    }
  }, [project]);

  if (!isOpen || !project) return null;

  // Margin Calculation
  const clientPrice = Number(pricingForm.approvedClientPrice) || Number(pricingForm.proposedClientPrice) || 0;
  const freelancerFee = Number(pricingForm.approvedFreelancerFee) || Number(pricingForm.proposedFreelancerFee) || 0;
  const projectedMargin = Math.max(0, clientPrice - freelancerFee);
  const marginPercentage = clientPrice > 0 ? Math.round((projectedMargin / clientPrice) * 100) : 0;
  const isLowMargin = marginPercentage < 20;

  // Handle Save Status & Priority
  const handleSaveStatus = async () => {
    setStatusSaving(true);
    const pId = project.customId || project.id;

    // Update status
    await api.updateProjectStatus(pId, {
      status: selectedStatus,
      internalNote,
      userVisibleNote
    });

    // Update priority if changed
    if (selectedPriority !== project.priority) {
      await api.updateProjectPriority(pId, selectedPriority);
    }

    setStatusSaving(false);
    confetti({ particleCount: 40, spread: 40 });
    onProjectUpdated();
  };

  // Handle Assign Freelancer
  const handleAssignFreelancer = async (fl: any) => {
    const pId = project.customId || project.id;
    setAssigningId(fl.customId || fl._id);

    const res = await api.assignFreelancerToProject(pId, {
      freelancerId: fl.customId || fl._id,
      freelancerName: fl.name,
      notes: `Smart matched based on ${fl.skills?.slice(0, 3).join(', ')}`
    });

    setAssigningId(null);
    if (res?.success) {
      confetti({ particleCount: 50, spread: 50 });
      alert(`Assigned ${fl.name} to "${project.projectTitle}". Private dossier shared.`);
      onProjectUpdated();
    }
  };

  // Handle Save Pricing
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSaving(true);
    setPricingFeedback(null);
    const pId = project.customId || project.id;

    const res = await api.updateProjectCommercials(pId, pricingForm);
    setPricingSaving(false);

    if (res?.success) {
      confetti({ particleCount: 40, spread: 40 });
      setPricingFeedback('Commercial terms saved & audited successfully.');
      onProjectUpdated();
    } else {
      setPricingFeedback('Failed to save commercial terms.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#17172B] border-l border-[#E8EAF4] dark:border-[#2A2A46] h-full shadow-2xl z-10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                QUICK ACTION DRAWER
              </span>
              <span className="text-xs font-mono text-[#8F91A3]">
                {project.customId || project.id}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-lg text-[#17172B] dark:text-white leading-tight">
              {project.projectTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8F91A3] hover:text-[#17172B] dark:hover:text-white hover:bg-[#F7F8FC] dark:hover:bg-[#1F1F38] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex items-center px-6 border-b border-[#E8EAF4] dark:border-[#2A2A46] gap-2 text-xs font-semibold">
          {[
            { id: 'status', label: 'Triage & Status', icon: Layers },
            { id: 'matching', label: 'Smart Matching', icon: Users },
            { id: 'pricing', label: 'Pricing & Margin', icon: DollarSign }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = drawerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDrawerTab(tab.id as any)}
                className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#7357FF] text-[#7357FF] font-bold'
                    : 'border-transparent text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: TRIAGE & STATUS */}
          {drawerTab === 'status' && (
            <div className="space-y-5 text-xs">
              
              {/* Project Info Pill */}
              <div className="p-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8F91A3]">Client: <strong className="text-[#17172B] dark:text-white">{project.clientName}</strong></span>
                  <span className="font-mono text-[10px] text-[#7357FF]">{project.aiCategory || 'Web Product'}</span>
                </div>
                <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0] line-clamp-3">
                  {project.aiSummary || project.rawIdea || 'No raw idea description provided.'}
                </p>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#7357FF]">
                  Project Operational Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A32] text-xs font-semibold text-[#17172B] dark:text-white focus:outline-none focus:border-[#7357FF]"
                >
                  <option value="Submitted">Submitted (Awaiting Triage)</option>
                  <option value="Under Admin Review">Under Admin Review</option>
                  <option value="Specialist Review">Specialist Review (Roster Assigned)</option>
                  <option value="Estimate Preparation">Estimate Preparation</option>
                  <option value="Awaiting Client Decision">Awaiting Client Decision</option>
                  <option value="In Progress">In Progress (Sprint Active)</option>
                  <option value="Completed">Completed & Released</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#7357FF]">
                  Priority Classification
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Low', 'Normal', 'High', 'Urgent'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPriority(p)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedPriority === p
                          ? 'bg-[#17172B] text-white border-[#17172B] dark:bg-[#7357FF] dark:border-[#7357FF]'
                          : 'bg-[#F7F8FC] dark:bg-[#131326] text-[#65677A] dark:text-[#A6A8C0] border-[#E8EAF4] dark:border-[#2A2A46] hover:border-[#7357FF]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Admin Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#7357FF]">
                  Internal Administration Notes (Confidential)
                </label>
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  placeholder="Record internal staffing remarks, budget sensitivities, or risk tags..."
                  className="w-full p-3 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A32] text-xs text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* User Visible Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#7357FF]">
                  Client Visible Progress Update
                </label>
                <input
                  type="text"
                  value={userVisibleNote}
                  onChange={e => setUserVisibleNote(e.target.value)}
                  placeholder="e.g. Scoping finalized; assigned to Lead Architect for review."
                  className="w-full p-3 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A32] text-xs text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={statusSaving}
                className="w-full py-3 rounded-xl bg-[#7357FF] hover:bg-[#5E3FFF] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{statusSaving ? 'Saving Audit Record...' : 'Save Status & Priority'}</span>
              </button>

            </div>
          )}

          {/* TAB 2: SMART FREELANCER MATCHING */}
          {drawerTab === 'matching' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                    Smart Candidate Recommendations
                  </h4>
                  <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                    Ranked by skill intersection, availability, and active workload.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#7357FF] font-bold">
                  Target: {matchingData?.targetSkills?.slice(0, 3).join(', ') || 'Full Stack'}
                </span>
              </div>

              {matchingLoading ? (
                <div className="py-12 text-center text-[#8F91A3]">
                  Analyzing specialist skills and capacity...
                </div>
              ) : (matchingData?.recommendations || []).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E8EAF4] dark:border-[#2A2A46] rounded-xl text-[#8F91A3]">
                  No active freelancers available in the roster.
                </div>
              ) : (
                <div className="space-y-3">
                  {matchingData.recommendations.map((rec: any) => {
                    const fl = rec.freelancer;
                    const isAssigned = project.assignedFreelancerId === (fl.customId || fl._id);
                    return (
                      <div
                        key={fl.customId || fl._id}
                        className={`p-4 rounded-xl border bg-white dark:bg-[#1A1A32] space-y-2.5 transition-all ${
                          isAssigned ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#E8EAF4] dark:border-[#2A2A46]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={fl.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                              alt={fl.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#E8EAF4] dark:border-[#2A2A46]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-[#17172B] dark:text-white">
                                  {fl.name}
                                </h5>
                                {isAssigned && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#10B981] text-white font-bold">
                                    Currently Assigned
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                                {fl.title || 'Specialist'} • ₹{fl.hourlyRate || 1200}/hr
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-display font-black text-[#7357FF]">
                              {rec.matchScore}%
                            </span>
                            <div className="text-[9px] font-mono text-[#10B981] font-bold">
                              {rec.availability}
                            </div>
                          </div>
                        </div>

                        {/* Match Reason Breakdown */}
                        <div className="p-2 rounded-lg bg-[#F7F8FC] dark:bg-[#131326] text-[10px] text-[#4A4C63] dark:text-[#C5C7DE] leading-relaxed">
                          <strong>Match Logic:</strong> {rec.matchReason}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1">
                          {(fl.skills || []).map((s: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F0F2FA] dark:bg-[#202038] text-[#17172B] dark:text-[#E2E4F0]">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Action */}
                        {!isAssigned && (
                          <button
                            type="button"
                            onClick={() => handleAssignFreelancer(fl)}
                            disabled={assigningId === (fl.customId || fl._id)}
                            className="w-full py-2 rounded-lg bg-[#17172B] dark:bg-[#7357FF] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{assigningId === (fl.customId || fl._id) ? 'Assigning...' : 'Assign to Project'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRICING & MARGIN */}
          {drawerTab === 'pricing' && (
            <form onSubmit={handleSavePricing} className="space-y-5 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#17172B] dark:text-white">
                  Commercial Terms & Platform Margin
                </h4>
                <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                  Record proposed and approved commercial terms. Platform margin calculated in real time.
                </p>
              </div>

              {/* Real-time Margin Gauge Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#7357FF]/10 to-[#3978FF]/10 border border-[#7357FF]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                    PROJECTED PLATFORM MARGIN
                  </span>
                  <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-full ${
                    isLowMargin
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-[#10B981]/20 text-[#10B981]'
                  }`}>
                    {marginPercentage}% Margin
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="font-display font-black text-2xl text-[#17172B] dark:text-white">
                    ₹{projectedMargin.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                    Billing: ₹{clientPrice.toLocaleString('en-IN')} | Payout: ₹{freelancerFee.toLocaleString('en-IN')}
                  </div>
                </div>

                {isLowMargin && (
                  <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Configured Margin Warning: Platform margin is below the recommended 20% target.</span>
                  </div>
                )}
              </div>

              {/* Proposed Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">
                    Proposed Client Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pricingForm.proposedClientPrice}
                    onChange={e => setPricingForm({ ...pricingForm, proposedClientPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A32] text-xs font-mono text-[#17172B] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">
                    Proposed Freelancer Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={pricingForm.proposedFreelancerFee}
                    onChange={e => setPricingForm({ ...pricingForm, proposedFreelancerFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A32] text-xs font-mono text-[#17172B] dark:text-white"
                  />
                </div>
              </div>

              {/* Approved Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#10B981]">
                    Approved Client Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pricingForm.approvedClientPrice}
                    onChange={e => setPricingForm({ ...pricingForm, approvedClientPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#10B981]/40 bg-white dark:bg-[#1A1A32] text-xs font-mono text-[#17172B] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#10B981]">
                    Approved Freelancer Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={pricingForm.approvedFreelancerFee}
                    onChange={e => setPricingForm({ ...pricingForm, approvedFreelancerFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#10B981]/40 bg-white dark:bg-[#1A1A32] text-xs font-mono text-[#17172B] dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-[#8F91A3]">
                  Audit Reason / Adjustment Note
                </label>
                <input
                  type="text"
                  value={pricingForm.reason}
                  onChange={e => setPricingForm({ ...pricingForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#1A1A32] text-xs text-[#17172B] dark:text-white"
                />
              </div>

              {pricingFeedback && (
                <div className="p-2.5 rounded-lg bg-[#10B981]/15 text-[#10B981] text-[11px] font-semibold text-center">
                  {pricingFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={pricingSaving}
                className="w-full py-3 rounded-xl bg-[#7357FF] hover:bg-[#5E3FFF] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>{pricingSaving ? 'Recording Commercials...' : 'Save & Record Commercial Terms'}</span>
              </button>

              <p className="text-[10px] text-[#8F91A3] text-center leading-relaxed">
                *Values are labeled as projected or approved commercial terms until confirmed by verified bank settlement records.
              </p>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminQuickActionDrawer;