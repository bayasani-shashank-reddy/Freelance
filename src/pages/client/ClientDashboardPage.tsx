import React, { useState } from 'react';
import type { ActiveProject, ChatMessage } from '../../types';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Send,
  FileText,
  Paperclip,
  Plus,
  Clock,
  Users,
  ShieldCheck,
  Zap,
  Award,
  Briefcase,
  FileCheck,
  Activity,
  Upload,
  DollarSign,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';

const MotionDiv = motion.div as any;

const ACTIVITY_FEED = [
  {
    id: 'act-1',
    type: 'milestone',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    title: 'Milestone Completed',
    description: 'Elena Rostova completed "Figma Hi-Fi Dark Glass System" — $3,000 ready for release.',
    time: '2 hours ago',
    isNew: true,
  },
  {
    id: 'act-2',
    type: 'upload',
    icon: <Upload className="w-4 h-4" />,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    title: 'Deliverable Uploaded',
    description: 'New file: NeuraAI_Figma_Master_v2.5.fig — 14 new screens added.',
    time: '4 hours ago',
    isNew: true,
  },
  {
    id: 'act-3',
    type: 'proposal',
    icon: <FileCheck className="w-4 h-4" />,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    title: 'Proposal Shortlisted',
    description: 'Julian Vance proposal for "Mobile App MVP" shortlisted — $4,500 budget.',
    time: 'Yesterday',
    isNew: false,
  },
  {
    id: 'act-4',
    type: 'payment',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    title: 'Escrow Released',
    description: '$2,500 released for Milestone 1 — "User Flows & Wireframes".',
    time: 'Aug 8',
    isNew: false,
  },
  {
    id: 'act-5',
    type: 'review',
    icon: <Bell className="w-4 h-4" />,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: 'Contract Started',
    description: 'New project contract "NeuraAI Platform Redesign" is now active.',
    time: 'Aug 1',
    isNew: false,
  },
];

export const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, dynamicJobs, dynamicProposals, releaseMilestoneEscrow } = useUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'escrow'>('projects');
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Real-time dynamic jobs belonging to this client
  const clientJobs = dynamicJobs.filter(
    (j) =>
      j.clientName.toLowerCase() === (user?.name || '').toLowerCase() ||
      j.clientName.toLowerCase() === (user?.email || '').toLowerCase() ||
      j.clientId === user?.id
  );

  // Real-time proposals relevant to this client's jobs
  const clientProposals = dynamicProposals.filter((p) => clientJobs.some((j) => j.id === p.jobId));

  // Real-time active contracts
  const clientActiveProjects = projects.filter((p) => clientJobs.some((j) => j.title === p.title));
  const activeProject = clientActiveProjects[0] || null;

  // Real-time financial calculations
  const totalSpent = user?.balance ? 100000 - user.balance : 0;
  const escrowBalance = user?.escrowBalance || 0;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'client-1',
      senderName: user?.name || 'Client',
      senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text: newMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isClient: true,
      isSelf: true,
    };

    setMessages([...messages, userMsg]);
    setNewMessageText('');

    setTimeout(() => {
      const designerReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: 'des-1',
        senderName: 'Elena Rostova',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: "Thanks for the feedback! I'm pushing those final micro-interaction adjustments right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isClient: false,
        isSelf: false,
      };
      setMessages((prev) => [...prev, designerReply]);
    }, 1200);
  };

  const handleReleaseMilestone = (milestoneId: string, amount: number, title: string) => {
    if (!activeProject) return;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          const updatedMilestones = p.milestones.map((m) => {
            if (m.id === milestoneId) {
              return { ...m, status: 'Completed' as const };
            }
            return m;
          });

          const newPaidAmount = p.paidAmount + amount;
          const newProgress = Math.min(100, Math.round((newPaidAmount / p.totalBudget) * 100));

          return {
            ...p,
            milestones: updatedMilestones,
            paidAmount: newPaidAmount,
            progress: newProgress,
          };
        }
        return p;
      })
    );

    releaseMilestoneEscrow(amount);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setPayoutSuccessMsg(`Successfully released $${amount.toLocaleString()} for "${title}"! Escrow ledger updated.`);
    setTimeout(() => setPayoutSuccessMsg(null), 4000);
  };

  return (
    <>
      <div className="pt-28 pb-8 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">CLIENT DASHBOARD // DYNAMIC WORKSPACE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good morning, <span className="gradient-text">{user?.name || 'New Client'}</span>
            </h1>

            {/* Client Attributes */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user?.verificationBadge || 'Enterprise Verified Client'}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trust Rating: {user?.trustScore || 98}%</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Sprint Velocity: {user?.sprintVelocity || 96}%</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/brief')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:scale-105 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-cyan-200" />
              <span>+ Post Project</span>
            </button>

            <button
              onClick={() => navigate('/designers')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Find Talent</span>
            </button>

            <button
              onClick={() => navigate('/brief')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Create AI Brief</span>
            </button>
          </div>
        </div>

        {payoutSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{payoutSuccessMsg}</span>
            </div>
          </div>
        )}

        {/* Dynamic Key Client Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">ACTIVE PROJECTS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{clientJobs.length}</div>
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-1">● In active sprint</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">PENDING PROPOSALS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">{clientProposals.length}</div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold mt-1">Available for review</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">TOTAL SPENT</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">${totalSpent.toLocaleString()}</div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">Cleared milestone payouts</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">HELD IN ESCROW</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">${escrowBalance.toLocaleString()}</div>
            <div className="text-[10px] font-mono text-purple-300 font-semibold mt-1">Secured smart contract</div>
          </div>
        </div>

        {/* ── DYNAMIC POSTED PROJECTS LISTINGS SECTION ── */}
        <div className="glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">My Posted Projects & Marketplace Listings ({clientJobs.length})</h2>
                <p className="text-xs text-slate-400">All live project requirements posted by you on NexusCraft.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/brief')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Project</span>
            </button>
          </div>

          {clientJobs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Projects Posted Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Post your first project or use the AI Brief Builder to specify your project requirements and receive real-time proposals from verified freelancers!
                </p>
              </div>
              <button
                onClick={() => navigate('/brief')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg"
              >
                Create Your First AI Project Brief
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientJobs.map((job) => (
                <div key={job.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{job.title}</h3>
                      <span className="text-xs text-slate-400">{job.category} • Posted {job.postedAt}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      ● {job.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic">{job.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ESTIMATED BUDGET:</span>
                      <span className="text-emerald-400 font-extrabold">${job.minBudget.toLocaleString()} - ${job.maxBudget.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold">{job.proposalsCount} Proposals</span>
                      <button
                        onClick={() => navigate('/proposals')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 font-bold text-xs flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Proposals</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-max mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Active Contracts ({clientActiveProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages & Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'escrow'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Milestones & Escrow Ledger</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE CONTRACTS */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {!activeProject ? (
              <div className="p-8 rounded-3xl glass-card border border-slate-800 text-center space-y-3 bg-slate-900/95">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Active Contracts Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When you award a proposal to a freelancer, your active sprint contract and milestone schedule will appear here.
                </p>
              </div>
            ) : (
              <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <img
                      src={activeProject.designerAvatar}
                      alt={activeProject.designerName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                        ● {activeProject.status} CONTRACT
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{activeProject.title}</h2>
                      <p className="text-xs text-slate-400">Assigned Freelancer: <span className="text-white font-bold">{activeProject.designerName}</span> ({activeProject.designerTitle})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-xs text-slate-400 block">TOTAL CONTRACT BUDGET</span>
                      <span className="text-2xl font-extrabold text-white">${activeProject.totalBudget.toLocaleString()}</span>
                      <span className="text-xs text-emerald-400 block mt-1">${activeProject.paidAmount.toLocaleString()} Released into Escrow</span>
                    </div>

                    <button
                      onClick={() => navigate('/workspace/proj-1')}
                      className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg"
                    >
                      Open Workspace
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="py-6 border-b border-slate-800">
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-slate-300 font-bold">OVERALL SPRINT PROGRESS</span>
                    <span className="text-cyan-400 font-extrabold">{activeProject.progress}% COMPLETED</span>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500" style={{ width: `${activeProject.progress}%` }} />
                  </div>
                </div>

                {/* Milestones Timeline */}
                <div className="py-6 border-b border-slate-800">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Milestone Delivery Schedule</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeProject.milestones.map((m) => (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border ${
                          m.status === 'Completed'
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                            : m.status === 'In Progress'
                            ? 'bg-indigo-950/40 border-cyan-400 text-white shadow-lg'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase">{m.status}</span>
                          <span className="font-mono text-xs font-bold text-cyan-300">${m.amount}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white mb-1">{m.title}</h4>
                        <p className="text-xs text-slate-400 mb-2">{m.description}</p>
                        <span className="text-[10px] font-mono text-slate-400 block">Due: {m.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables Section */}
                <div className="pt-6">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">Submitted Code & Design Deliverables</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeProject.deliverables.map((del) => (
                      <div key={del.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{del.name}</div>
                            <div className="text-[10px] text-slate-400">{del.type} • {del.updatedAt}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(del.url, '_blank')}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MESSAGES & CHAT */}
        {activeTab === 'messages' && (
          <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[600px] bg-slate-900/95">
            {/* Sidebar Contact Info */}
            <div className="lg:col-span-4 p-6 bg-slate-950/60 border-r border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={activeProject?.designerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt="Freelancer" className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                  <div>
                    <h3 className="font-bold text-white text-base">{activeProject?.designerName || 'Elena Rostova'}</h3>
                    <span className="text-xs text-emerald-400 font-mono">● Online & Replying</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 mb-6">
                  <div className="text-slate-400 font-mono uppercase text-[10px]">ACTIVE CONTRACT:</div>
                  <div className="font-bold text-white">{activeProject?.title || 'No Active Contract'}</div>
                  <div className="text-cyan-400 font-mono">{activeProject?.progress || 0}% Milestone Progress</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                All messages encrypted with End-to-End Escrow Audit Trail.
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="lg:col-span-8 flex flex-col h-full bg-slate-950">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[80%] ${msg.isClient ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.isClient
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                        {msg.attachment && (
                          <div className="mt-2 p-2 rounded-lg bg-black/30 border border-white/10 flex items-center gap-2 font-mono text-[10px]">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{msg.attachment.name}</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono text-slate-400 block mt-1 ${msg.isClient ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type message to designer..."
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: MILESTONES & FINANCIAL ESCROW */}
        {activeTab === 'escrow' && (
          <div className="space-y-8">
            {/* Financial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl glass-card border border-slate-800 font-mono bg-slate-900/95">
                <span className="text-xs text-slate-400 block mb-1">TOTAL CONTRACT VALUE</span>
                <span className="text-3xl font-extrabold text-white">${(activeProject?.totalBudget || 0).toLocaleString()}</span>
              </div>
              <div className="p-6 rounded-3xl glass-card border border-emerald-500/30 font-mono bg-emerald-950/20">
                <span className="text-xs text-emerald-400 block mb-1">RELEASED TO FREELANCER</span>
                <span className="text-3xl font-extrabold text-emerald-400">${(activeProject?.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="p-6 rounded-3xl glass-card border border-purple-500/30 font-mono bg-purple-950/20">
                <span className="text-xs text-purple-300 block mb-1">HELD IN SECURE ESCROW</span>
                <span className="text-3xl font-extrabold text-purple-300">${((activeProject?.totalBudget || 0) - (activeProject?.paidAmount || 0)).toLocaleString()}</span>
              </div>
            </div>

            {/* Detailed Milestone Release Table */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 bg-slate-900/95">
              <h3 className="text-lg font-bold text-white mb-4">Milestone Escrow Payout Approvals</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="pb-3">Milestone</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {activeProject ? (
                      activeProject.milestones.map((m) => (
                        <tr key={m.id}>
                          <td className="py-4 font-bold text-white">{m.title}</td>
                          <td className="py-4 text-slate-400">{m.dueDate}</td>
                          <td className="py-4 font-extrabold text-emerald-400">${m.amount}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : m.status === 'In Progress'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {m.status !== 'Completed' ? (
                              <button
                                onClick={() => handleReleaseMilestone(m.id, m.amount, m.title)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold shadow-md hover:scale-105 transition-all text-xs"
                              >
                                Release ${m.amount} Escrow
                              </button>
                            ) : (
                              <span className="text-emerald-400 font-bold flex items-center justify-end gap-1 text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Paid & Released</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                          No active milestone contract payouts pending.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Live Activity Feed */}
    <div className="bg-slate-950 pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Live Project Activity</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </h2>
          <button
            onClick={() => showToast({ type: 'info', title: 'Activity Feed', message: 'All project events are shown in real-time.' })}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors"
          >
            Mark all read
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {ACTIVITY_FEED.map((item, i) => (
              <MotionDiv
                key={item.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative flex items-start gap-4 p-4 rounded-2xl bg-slate-900/70 border ${
                  item.isNew ? 'border-cyan-500/30 shadow-md shadow-cyan-500/5' : 'border-slate-800'
                } transition-all hover:border-white/15`}
              >
                {/* New pulse badge */}
                {item.isNew && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    {item.isNew && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex-shrink-0">NEW</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] font-mono text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
    </>
  );
};

export default ClientDashboardPage;
