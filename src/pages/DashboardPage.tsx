import React, { useState } from 'react';
import type { ActiveProject, ChatMessage } from '../types';
import { MOCK_ACTIVE_PROJECTS, MOCK_CHAT_MESSAGES } from '../data/mockData';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, dynamicJobs, dynamicProposals, releaseMilestoneEscrow } = useUser();
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'escrow'>('projects');
  const [projects, setProjects] = useState<ActiveProject[]>(MOCK_ACTIVE_PROJECTS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  const activeProject = projects[0];

  // Dynamic calculations for Client
  const clientJobs = dynamicJobs;
  const totalSpent = user?.balance ? 100000 - user.balance : 12500;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'client-1',
      senderName: user?.name || 'Alex Rivera',
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
        text: "Thanks for the feedback! I'm pushing those final micro-interaction adjustments to the Figma file right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isClient: false,
        isSelf: false,
      };
      setMessages((prev) => [...prev, designerReply]);
    }, 1200);
  };

  const handleReleaseMilestone = (milestoneId: string, amount: number, title: string) => {
    setProjects(
      projects.map((p) => {
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
    setPayoutSuccessMsg(`Successfully released $${amount.toLocaleString()} for "${title}" to Elena Rostova! Escrow ledger updated.`);
    setTimeout(() => setPayoutSuccessMsg(null), 4000);
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">CLIENT WORKSPACE // DYNAMIC TELEMETRY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name || 'Alex Rivera'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {user?.company || 'NeuraLabs Inc.'} • {user?.email}
            </p>
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
              onClick={() => navigate('/brief')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:scale-105 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>+ Create AI Brief</span>
            </button>
          </div>
        </div>

        {/* Dynamic Key Client Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">ACTIVE PROJECTS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{clientJobs.length}</div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">● In active sprint</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">PROPOSALS RECEIVED</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">{dynamicProposals.length}</div>
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-1">Available for review</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">TOTAL SPENT</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">Cleared milestone payouts</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">HELD IN ESCROW</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
              ${(user?.escrowBalance || 12500).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-indigo-300 font-semibold mt-1">Secured smart contract</div>
          </div>
        </div>

        {/* Success Toast Banner */}
        {payoutSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{payoutSuccessMsg}</span>
          </div>
        )}

        {/* Dashboard Workspace Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 pb-3">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Active Contracts ({clientJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 relative ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages & Feedback</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              activeTab === 'escrow'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Milestones & Escrow Ledger</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Project Overview Card */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 shadow-2xl bg-slate-900/95">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <img src={activeProject.designerAvatar} alt={activeProject.designerName} className="w-14 h-14 rounded-2xl object-cover border border-slate-700" />
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
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{del.name}</h4>
                          <span className="text-xs text-slate-400">{del.type} • {del.updatedAt}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/workspace/proj-1')}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MESSAGES & CHAT */}
        {activeTab === 'messages' && (
          <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[600px] bg-slate-900/95">
            {/* Sidebar Contact Info */}
            <div className="lg:col-span-4 p-6 bg-slate-950/60 border-r border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={activeProject.designerAvatar} alt={activeProject.designerName} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                  <div>
                    <h3 className="font-bold text-white text-base">{activeProject.designerName}</h3>
                    <span className="text-xs text-emerald-400 font-mono">● Online & Replying</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 mb-6">
                  <div className="text-slate-400 font-mono uppercase text-[10px]">ACTIVE CONTRACT:</div>
                  <div className="font-bold text-white">{activeProject.title}</div>
                  <div className="text-cyan-400 font-mono">{activeProject.progress}% Milestone Progress</div>
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
                <span className="text-3xl font-extrabold text-white">${activeProject.totalBudget.toLocaleString()}</span>
              </div>
              <div className="p-6 rounded-3xl glass-card border border-emerald-500/30 font-mono bg-emerald-950/20">
                <span className="text-xs text-emerald-400 block mb-1">RELEASED TO FREELANCER</span>
                <span className="text-3xl font-extrabold text-emerald-400">${activeProject.paidAmount.toLocaleString()}</span>
              </div>
              <div className="p-6 rounded-3xl glass-card border border-purple-500/30 font-mono bg-purple-950/20">
                <span className="text-xs text-purple-300 block mb-1">HELD IN SECURE ESCROW</span>
                <span className="text-3xl font-extrabold text-purple-300">${(activeProject.totalBudget - activeProject.paidAmount).toLocaleString()}</span>
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
                  <tbody className="divide-y divide-slate-800/60">
                    {activeProject.milestones.map((m) => (
                      <tr key={m.id}>
                        <td className="py-4">
                          <span className="font-bold text-white block">{m.title}</span>
                          <span className="text-slate-400 text-[10px] font-sans">{m.description}</span>
                        </td>
                        <td className="py-4 text-slate-300">{m.dueDate}</td>
                        <td className="py-4 font-bold text-cyan-300">${m.amount.toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            m.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-indigo-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {m.status === 'In Progress' ? (
                            <button
                              onClick={() => handleReleaseMilestone(m.id, m.amount, m.title)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-md transition-all"
                            >
                              Approve & Release ${m.amount}
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-bold">Paid & Released ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
