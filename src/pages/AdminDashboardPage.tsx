import React, { useState } from 'react';
import { MOCK_ADMIN_STATS, MOCK_DISPUTES } from '../data/mockData';
import {
  Lock,
  AlertOctagon,
  FolderPlus,
  UserCheck,
  Check,
  X,
  UserPlus,
  Briefcase,
  Award,
  FileText,
  MessageSquare,
  Send,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
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
    chatMessages,
    sendChatMessage,
  } = useUser();

  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [categories, setCategories] = useState([
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'AI / ML Studio',
    '3D WebGL',
    'Fintech',
  ]);
  const [newCat, setNewCat] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Admin Chat Hub State
  const [selectedConvoId, setSelectedConvoId] = useState('conv-1');
  const [adminMsgInput, setAdminMsgInput] = useState('');
  const [customBudgetInput, setCustomBudgetInput] = useState<number | ''>('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

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

  const ADMIN_CONVERSATIONS = [
    {
      id: 'conv-1',
      name: 'Elena Rostova',
      role: 'Freelancer Specialist',
      projectTitle: 'Generative AI Web App',
      budget: 2500,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'conv-2',
      name: 'Alex Rivera',
      role: 'Client / Project Owner',
      projectTitle: 'Multi-Model Canvas Platform',
      budget: 12500,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'conv-3',
      name: 'David Vance',
      role: 'Pending Freelancer Applicant',
      projectTitle: 'Senior Full Stack & AI Role',
      budget: 8400,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const activeAdminConvo = ADMIN_CONVERSATIONS.find((c) => c.id === selectedConvoId) || ADMIN_CONVERSATIONS[0];
  const activeMessages = chatMessages[selectedConvoId] || [];

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

  const handleSendAdminChat = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || adminMsgInput;
    if (!textToSend.trim()) return;

    sendChatMessage(selectedConvoId, textToSend);
    setAdminMsgInput('');
  };

  const handleSendCustomBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBudgetInput || customBudgetInput <= 0) return;

    const budgetMsg = `💰 ADMIN PROJECT BUDGET AGREEMENT: Official customized escrow budget set to $${Number(customBudgetInput).toLocaleString()} USD for contract "${activeAdminConvo.projectTitle}".`;
    handleSendAdminChat(undefined, budgetMsg);
    setShowBudgetModal(false);
    setCustomBudgetInput('');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setActionNotice(`Custom project budget of $${Number(customBudgetInput).toLocaleString()} proposed in chat!`);
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
              ${MOCK_ADMIN_STATS.totalGMV.toLocaleString()}
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">NET REVENUE (5%)</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              ${MOCK_ADMIN_STATS.platformRevenue.toLocaleString()}
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

        {/* ADMIN MESSAGING & PROJECT BUDGET NEGOTIATION HUB */}
        <div className="glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Project & Budget Discussion Hub</h2>
                <p className="text-xs text-slate-400">Direct admin channel for project specs, customized escrow budgets, and milestone alignment.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/inbox')}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold text-xs hover:border-cyan-500/50 flex items-center gap-1.5"
            >
              <span>Open Full Inbox Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 font-bold uppercase">SELECT DISCUSSION CHANNEL:</div>
              {ADMIN_CONVERSATIONS.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedConvoId === convo.id
                      ? 'bg-gradient-to-r from-indigo-900/40 to-cyan-900/30 border-cyan-500/50 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={convo.avatar} alt={convo.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                    <div>
                      <div className="font-bold text-white text-xs">{convo.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{convo.projectTitle}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">${convo.budget.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between h-[420px]">
              {/* Convo Header */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{activeAdminConvo.name}</span>
                  <span className="text-slate-400">• {activeAdminConvo.projectTitle}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">Escrow:</span>
                  <span className="text-emerald-400 font-extrabold">${activeAdminConvo.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                {activeMessages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-mono text-[11px]">
                    No messages yet in this admin channel. Type a message or click a quick action below to start discussion.
                  </div>
                ) : (
                  activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[82%] p-3 rounded-2xl text-xs ${
                          msg.isSelf
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="text-[10px] font-mono opacity-70 mb-0.5 flex justify-between gap-4">
                          <span>{msg.senderName}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-3 border-t border-slate-900 flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>💰 Customize Budget & Escrow</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendAdminChat(
                      undefined,
                      `📜 ADMIN NOTICE: Official milestone approval granted for "${activeAdminConvo.projectTitle}". Escrow released!`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>📜 Approve Milestone</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendAdminChat(
                      undefined,
                      `🖼️ REQUEST: Please provide a screenshot preview of the design deliverable for admin audit.`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>🖼️ Request UI Screenshot</span>
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAdminChat} className="flex gap-2">
                <input
                  type="text"
                  value={adminMsgInput}
                  onChange={(e) => setAdminMsgInput(e.target.value)}
                  placeholder={`Type admin message regarding budget or project specs...`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
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
              placeholder="Add new industry skill category..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-semibold">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Budget Proposal Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Propose Custom Escrow Budget</h3>
            <form onSubmit={handleSendCustomBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Custom Amount ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-cyan-400 font-mono font-bold text-base">$</span>
                  <input
                    type="number"
                    value={customBudgetInput}
                    onChange={(e) => setCustomBudgetInput(Number(e.target.value))}
                    placeholder="e.g. 4500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold">Send Custom Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Freelancer Modal */}
      {addFreeModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">+ Add Approved Freelancer Account</h3>
            <form onSubmit={handleCreateFreelancer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={freeFormData.name}
                  onChange={(e) => setFreeFormData({ ...freeFormData, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={freeFormData.email}
                  onChange={(e) => setFreeFormData({ ...freeFormData, email: e.target.value })}
                  placeholder="sarah@nexuscraft.io"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Title & Role</label>
                <input
                  type="text"
                  required
                  value={freeFormData.title}
                  onChange={(e) => setFreeFormData({ ...freeFormData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={freeFormData.skills}
                  onChange={(e) => setFreeFormData({ ...freeFormData, skills: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAddFreeModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold shadow-md">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Assign Freelancer to Contract</h3>
            <form onSubmit={handleAssignProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Select Active Project</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {dynamicJobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title} (${job.minBudget.toLocaleString()} - ${job.maxBudget.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Select Approved Freelancer</label>
                <select
                  value={selectedFreelancerId}
                  onChange={(e) => setSelectedFreelancerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Choose Freelancer --</option>
                  {approvedFreelancers.map((free) => (
                    <option key={free.id} value={free.id}>{free.name} ({free.title})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAssignModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold shadow-md">Assign Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
