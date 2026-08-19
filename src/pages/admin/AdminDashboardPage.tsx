import React, { useState } from 'react';
import type { Dispute } from '../../types';
import { Lock, AlertOctagon, FolderPlus, UserCheck, Check, X, UserPlus, Briefcase, Award, FileText, ShieldCheck, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../../context/UserContext';

export const AdminDashboardPage: React.FC = () => {
  const {
    pendingFreelancers,
    approvedFreelancers,
    approveFreelancer,
    rejectFreelancer,
    addFreelancerByAdmin,
    dynamicJobs,
    assignFreelancerToProject,
    dynamicProposals,
    awardProposalWorkByAdmin,
  } = useUser();

  const totalGMV = dynamicJobs.reduce((acc, job) => acc + (job.maxBudget || 0), 0);
  const platformRevenue = Math.round(totalGMV * 0.05);

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [categories, setCategories] = useState(['Web Development', 'Mobile Development', 'UI/UX Design', 'AI / ML Studio', '3D WebGL', 'Fintech']);
  const [newCat, setNewCat] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Add Freelancer Modal State
  const [addFreeModal, setAddFreeModal] = useState(false);
  const [freeFormData, setFreeFormData] = useState({
    name: '',
    email: '',
    title: 'Senior Full Stack Developer',
    skills: 'React, Node.js, TypeScript',
    hourlyRate: 85,
  });

  // Assign Project Modal State
  const [assignModal, setAssignModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');

  const handleApprove = (id: string, name: string) => {
    approveFreelancer(id);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setActionNotice(`Freelancer "${name}" approved successfully! Account is now active.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleReject = (id: string, name: string) => {
    rejectFreelancer(id);
    setActionNotice(`Freelancer "${name}" application rejected.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCreateFreelancer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeFormData.name.trim() || !freeFormData.email.trim()) return;

    addFreelancerByAdmin({
      name: freeFormData.name,
      email: freeFormData.email,
      title: freeFormData.title,
      skills: freeFormData.skills.split(',').map((s) => s.trim()),
    });

    setAddFreeModal(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    setActionNotice(`Freelancer account created for "${freeFormData.name}" with email credentials sent!`);
    setFreeFormData({
      name: '',
      email: '',
      title: 'Senior Full Stack Developer',
      skills: 'React, Node.js, TypeScript',
      hourlyRate: 85,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAssignProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !selectedFreelancerId) return;

    assignFreelancerToProject(selectedJobId, selectedFreelancerId);
    setAssignModal(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    setActionNotice('Freelancer successfully assigned to project contract!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResolveDispute = (disputeId: string) => {
    setDisputes(disputes.map((d) => (d.id === disputeId ? { ...d, status: 'Resolved' as const } : d)));
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setActionNotice(`Dispute #${disputeId} resolved! Escrow arbitrated and funds returned.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCategories([...categories, newCat.trim()]);
    setNewCat('');
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">SUPERADMIN PLATFORM HUB</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Platform Admin & Moderation</h1>

            {/* Enhanced Admin Governance Attributes */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Verified Platform Governance Lead</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Smart Contract Health: 100% (0 Security Alerts)</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>142 Managed Contracts</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddFreeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Freelancer</span>
            </button>

            <button
              onClick={() => setAssignModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Assign Project</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6">
            ✓ {actionNotice}
          </div>
        )}

        {/* Global Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">PLATFORM GMV</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ${totalGMV.toLocaleString()}
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">NET REVENUE (5%)</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              ${platformRevenue.toLocaleString()}
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">PENDING APPROVALS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              {pendingFreelancers.length}
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">ACTIVE FREELANCERS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
              {approvedFreelancers.length}
            </div>
          </div>
        </div>

        {/* FREELANCER APPROVALS CENTER */}
        <div className="glass-card border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Freelancer Applications Queue</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {pendingFreelancers.length} Pending
            </span>
          </div>

          {pendingFreelancers.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
              ✓ All freelancer applications have been reviewed & approved!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingFreelancers.map((free) => (
                <div key={free.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={free.avatar} alt={free.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{free.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          PENDING REVIEW
                        </span>
                      </div>
                      <div className="text-slate-400">{free.email} • {free.title}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(free.id, free.name)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Freelancer</span>
                    </button>
                    <button
                      onClick={() => handleReject(free.id, free.name)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INCOMING PROPOSALS & AWARD WORK QUEUE */}
        <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Incoming Proposals & Work Award Queue</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {dynamicProposals.length} Submitted
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {dynamicProposals.map((prop) => (
              <div key={prop.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{prop.jobTitle}</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${prop.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                      {prop.status === 'Accepted' ? '✓ WORK ASSIGNED' : prop.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Freelancer: <strong className="text-cyan-300">{prop.freelancerName}</strong> • Submitted: {prop.submittedAt}
                  </div>
                  <p className="text-slate-300 line-clamp-1 italic">{prop.coverLetter}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-xs text-slate-400">BID AMOUNT</div>
                    <div className="text-base font-extrabold text-emerald-400">${prop.proposedBudget.toLocaleString()}</div>
                  </div>

                  {prop.status !== 'Accepted' ? (
                    <button
                      onClick={() => {
                        awardProposalWorkByAdmin(prop.id);
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
                        setActionNotice(`🎉 Admin awarded contract for "${prop.jobTitle}" to ${prop.freelancerName}! Work is assigned.`);
                        setTimeout(() => setActionNotice(null), 4000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                    >
                      <Award className="w-4 h-4 text-cyan-300" />
                      <span>Award Contract</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                      ✓ Contract Awarded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE APPROVED FREELANCERS DIRECTORY */}
        <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Active Approved Freelancers ({approvedFreelancers.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedFreelancers.map((free) => (
              <div key={free.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={free.avatar} alt={free.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  <div>
                    <div className="font-bold text-white text-sm">{free.name}</div>
                    <div className="text-slate-400">{free.email}</div>
                    <div className="text-cyan-300 font-mono text-[10px] mt-0.5">{free.title}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute & Escrow Arbitrage Queue */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95">
          <div className="flex items-center gap-2 mb-6">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Dispute & Escrow Arbitrage Queue</h2>
          </div>

          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{dispute.projectTitle}</div>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${dispute.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {dispute.status}
                  </span>
                </div>
                <p className="text-slate-300">{dispute.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                  <span className="font-mono text-slate-400">Disputed Escrow: ${dispute.amountInDispute.toLocaleString()}</span>
                  {dispute.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolveDispute(dispute.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 font-bold hover:bg-slate-800"
                    >
                      Arbitrate & Refund Client
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Taxonomy Manager */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
          <div className="flex items-center gap-2 mb-6">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Platform Category Taxonomy</h2>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-3 mb-6 max-w-md">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Add new platform category..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">
              Add Category
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add Freelancer Modal */}
      {addFreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-4 bg-slate-900/95 text-xs">
            <h2 className="text-xl font-bold text-white">Admin: Register New Freelancer</h2>
            <form onSubmit={handleCreateFreelancer} className="space-y-3">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={freeFormData.name}
                  onChange={(e) => setFreeFormData({ ...freeFormData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Email Address:</label>
                <input
                  type="email"
                  required
                  value={freeFormData.email}
                  onChange={(e) => setFreeFormData({ ...freeFormData, email: e.target.value })}
                  placeholder="rahul@devstudio.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Professional Title:</label>
                <input
                  type="text"
                  value={freeFormData.title}
                  onChange={(e) => setFreeFormData({ ...freeFormData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Skills (comma separated):</label>
                <input
                  type="text"
                  value={freeFormData.skills}
                  onChange={(e) => setFreeFormData({ ...freeFormData, skills: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddFreeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold"
                >
                  Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-indigo-500/30 p-8 rounded-3xl space-y-4 bg-slate-900/95 text-xs">
            <h2 className="text-xl font-bold text-white">Assign Freelancer to Contract</h2>
            <form onSubmit={handleAssignProject} className="space-y-4">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Select Active Project:</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Project --</option>
                  {dynamicJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} (${j.maxBudget})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Select Approved Freelancer:</label>
                <select
                  value={selectedFreelancerId}
                  onChange={(e) => setSelectedFreelancerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Freelancer --</option>
                  {approvedFreelancers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold"
                >
                  Assign Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
