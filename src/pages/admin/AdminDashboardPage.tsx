import React, { useState } from 'react';
import type { IdeaSubmission } from '../../types';
import {
  Lock,
  UserCheck,
  Check,
  X,
  UserPlus,
  Briefcase,
  Award,
  FileText,
  MessageSquare,
  Send,
  ShieldCheck,
  Activity,
  ClipboardList,
  FileUp,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser, SEED_ACCOUNTS } from '../../context/UserContext';
import { NcxCoinIcon, NcxCreditBadge } from '../../components/NcxCredit';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';

export const AdminDashboardPage: React.FC = () => {
  const {
    pendingFreelancers,
    approvedFreelancers,
    approveFreelancer,
    rejectFreelancer,
    addFreelancerByAdmin,
    addClientByAdmin,
    dynamicJobs,
    assignFreelancerToProject,
    dynamicProposals,
    awardProposalWorkByAdmin,
    ideaSubmissions,
    updateIdeaStatus,
    adminClientMessages,
    sendAdminClientMessage,
    allClients,
  } = useUser();

  const totalGMV = dynamicJobs.reduce((acc, job) => acc + (job.maxBudget || 0), 0);
  const totalIdeas = ideaSubmissions.length;
  const newIdeas = ideaSubmissions.filter((s) => s.status === 'New').length;

  const [activeTab, setActiveTab] = useState<'ideas' | 'chat' | 'freelancers' | 'users' | 'proposals'>('ideas');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Selected client for chat
  const [selectedClientId, setSelectedClientId] = useState<string>(allClients[0]?.id || '');
  const [adminMsgInput, setAdminMsgInput] = useState('');

  // Add Freelancer Modal State
  const [addFreeModal, setAddFreeModal] = useState(false);
  const [freeFormData, setFreeFormData] = useState({ name: '', email: '', title: 'Senior Full Stack Developer', skills: 'React, Node.js, TypeScript' });

  // Add Client Modal State
  const [addClientModal, setAddClientModal] = useState(false);
  const [clientFormData, setClientFormData] = useState({ name: '', email: '', company: '', title: 'Project Owner' });

  // Assign Project Modal State
  const [assignModal, setAssignModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [activeDocView, setActiveDocView] = useState<{ fileName: string; rawText?: string } | null>(null);



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
    setActionNotice(`Freelancer account created for "${freeFormData.name}"! Default password: Freelancer@12345`);
    setFreeFormData({ name: '', email: '', title: 'Senior Full Stack Developer', skills: 'React, Node.js, TypeScript' });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name.trim() || !clientFormData.email.trim()) return;
    addClientByAdmin({
      name: clientFormData.name,
      email: clientFormData.email,
      company: clientFormData.company,
      title: clientFormData.title,
    });
    setAddClientModal(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    setActionNotice(`Client account created for "${clientFormData.name}"! They received 500 starter credits. Default password: Client@12345`);
    setClientFormData({ name: '', email: '', company: '', title: 'Project Owner' });
    setTimeout(() => setActionNotice(null), 5000);
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

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsgInput.trim() || !selectedClientId) return;
    sendAdminClientMessage(selectedClientId, adminMsgInput);
    setAdminMsgInput('');
  };

  const handleMarkIdeaStatus = (ideaId: string, status: IdeaSubmission['status']) => {
    updateIdeaStatus(ideaId, status);
    setActionNotice(`Idea marked as "${status}".`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const selectedClient = allClients.find((c) => c.id === selectedClientId);
  const chatForSelectedClient = adminClientMessages.filter((m) => m.conversationId === selectedClientId);
  const adminAvatar = SEED_ACCOUNTS[0].avatar;

  const statusColor = (status: string) => {
    if (status === 'New') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (status === 'Reviewed') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (status === 'Actioned') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-slate-800 text-slate-400';
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Platform Admin &amp; Moderation</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Verified Platform Governance Lead</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>System Health: 100%</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                <span>{newIdeas} New Idea Reports</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setAddClientModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Client</span>
            </button>
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

        {/* Global Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">PLATFORM GMV</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">${totalGMV.toLocaleString()}</div>
          </div>
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">NEW IDEA REPORTS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">{newIdeas}</div>
          </div>
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">PENDING APPROVALS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{pendingFreelancers.length}</div>
          </div>
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold mb-1">TOTAL CLIENTS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">{allClients.length}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-fit mb-8">
          {[
            { id: 'ideas', label: `Idea Reports (${totalIdeas})`, icon: <ClipboardList className="w-4 h-4" /> },
            { id: 'chat', label: 'Client Chat', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'freelancers', label: `Freelancers (${pendingFreelancers.length} pending)`, icon: <UserCheck className="w-4 h-4" /> },
            { id: 'users', label: `Clients (${allClients.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'proposals', label: `Proposals (${dynamicProposals.length})`, icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: IDEA REPORTS ── */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <div className="glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Idea &amp; Project Reports from Clients</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  {newIdeas} NEW
                </span>
              </div>

              {ideaSubmissions.length === 0 ? (
                <div className="py-10 text-center text-xs font-mono text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                  No idea submissions yet. Clients can submit ideas via the Brief Builder.
                </div>
              ) : (
                <div className="space-y-4">
                  {ideaSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-5 rounded-2xl bg-slate-950 border transition-all ${
                        sub.status === 'New' ? 'border-cyan-500/40 shadow-md shadow-cyan-500/5' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img src={sub.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt={sub.clientName} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                          <div>
                            <div className="font-bold text-white text-sm">{sub.clientName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{sub.clientEmail} • {sub.createdAt}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusColor(sub.status)}`}>
                            {sub.status}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            sub.submissionType === 'document'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : sub.submissionType === 'text'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          }`}>
                            {sub.submissionType === 'document' ? '📄 DOC UPLOAD' : sub.submissionType === 'text' ? '⚡ QUICK IDEA' : '🤖 AI BRIEF'}
                          </span>
                        </div>
                      </div>

                      {sub.docFileName ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
                          <div className="flex items-center gap-2">
                            <FileUp className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-xs font-mono text-indigo-300 font-bold">{sub.docFileName}</span>
                          </div>
                          <button
                            onClick={() => setActiveDocView({ fileName: sub.docFileName!, rawText: sub.rawIdea })}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-500/30 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Doc</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-4">{sub.rawIdea}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-900">
                        {sub.status === 'New' && (
                          <button
                            onClick={() => handleMarkIdeaStatus(sub.id, 'Reviewed')}
                            className="px-3 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold text-xs flex items-center gap-1 hover:bg-yellow-500/30 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Mark Reviewed
                          </button>
                        )}
                        {sub.status !== 'Actioned' && (
                          <button
                            onClick={() => handleMarkIdeaStatus(sub.id, 'Actioned')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-500/30 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Actioned
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedClientId(sub.clientId);
                            setActiveTab('chat');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1 hover:bg-indigo-500/30 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Reply via Chat
                        </button>
                        <span className="ml-auto text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          NCX paid: <NcxCreditBadge amount={sub.creditsCost} size="xs" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: CLIENT CHAT ── */}
        {activeTab === 'chat' && (
          <div className="glass-card border border-indigo-500/30 rounded-3xl overflow-hidden bg-slate-900/95">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-[650px]">
              {/* Client List Sidebar */}
              <div className="lg:col-span-4 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Client Conversations
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Admin ↔ Client only channel</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                  {allClients.map((client) => {
                    const clientMsgs = adminClientMessages.filter((m) => m.conversationId === client.id);
                    const unread = clientMsgs.filter((m) => m.senderRole === 'client').length;
                    const clientIdeas = ideaSubmissions.filter((s) => s.clientId === client.id).length;
                    return (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`w-full p-4 text-left transition-all hover:bg-slate-800/40 ${selectedClientId === client.id ? 'bg-indigo-500/10 border-l-2 border-indigo-400' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={client.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                            alt={client.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-xs">{client.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">{client.email}</div>
                            <div className="text-[10px] font-mono text-indigo-400">{clientIdeas} idea(s) • {clientMsgs.length} msg(s)</div>
                          </div>
                          {unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-8 flex flex-col h-full">
                {/* Chat Header */}
                {selectedClient && (
                  <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
                    <img src={selectedClient.avatar || ''} alt={selectedClient.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                    <div>
                      <div className="font-bold text-white text-sm">{selectedClient.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                        <span>{selectedClient.email}</span>
                        <span>•</span>
                        <NcxCreditBadge amount={selectedClient.credits ?? 0} size="xs" />
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {ideaSubmissions.filter((s) => s.clientId === selectedClient.id).length} submissions
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950">
                  {chatForSelectedClient.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <MessageSquare className="w-10 h-10 text-slate-600" />
                      <p className="text-sm font-bold text-slate-500">No messages with this client yet</p>
                      <p className="text-xs text-slate-600">Send a message to start the conversation.</p>
                    </div>
                  )}
                  {chatForSelectedClient.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[82%] ${msg.senderRole === 'admin' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <img
                        src={msg.senderRole === 'admin' ? adminAvatar : (selectedClient?.avatar || '')}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.senderRole === 'admin'
                            ? 'bg-gradient-to-r from-rose-700/80 to-indigo-700/80 text-white rounded-tr-none'
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[10px] font-mono text-slate-400 block mt-1 ${msg.senderRole === 'admin' ? 'text-right' : 'text-left'}`}>
                          {msg.senderName} • {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendAdminMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                  <input
                    type="text"
                    value={adminMsgInput}
                    onChange={(e) => setAdminMsgInput(e.target.value)}
                    placeholder={selectedClient ? `Message to ${selectedClient.name}...` : 'Select a client first'}
                    disabled={!selectedClientId}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!selectedClientId || !adminMsgInput.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white hover:from-rose-500 hover:to-indigo-500 transition-all shadow-md disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: FREELANCERS ── */}
        {activeTab === 'freelancers' && (
          <div className="space-y-6">
            {/* Pending Approvals */}
            <div className="glass-card border border-amber-500/30 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Freelancer Applications Queue</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {pendingFreelancers.length} Pending
                </span>
              </div>
              {pendingFreelancers.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                  ✓ All freelancer applications have been reviewed!
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
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">PENDING REVIEW</span>
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
                          <span>Approve</span>
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

            {/* Approved Freelancers */}
            <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Active Approved Freelancers ({approvedFreelancers.length})</span>
              </h2>
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
          </div>
        )}

        {/* ── TAB: CLIENT USERS ── */}
        {activeTab === 'users' && (
          <div className="glass-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Client Users ({allClients.length})</h2>
              </div>
              <button
                onClick={() => setAddClientModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>

            <div className="space-y-3">
              {allClients.map((client) => {
                const clientIdeas = ideaSubmissions.filter((s) => s.clientId === client.id);
                return (
                  <div key={client.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={client.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'} alt={client.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      <div>
                        <div className="font-bold text-white text-sm">{client.name}</div>
                        <div className="text-slate-400">{client.email} {client.company ? `• ${client.company}` : ''}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <NcxCreditBadge amount={client.credits ?? 0} size="xs" />
                          <span className="text-slate-500">•</span>
                          <span className="text-indigo-300 font-mono text-[10px]">{clientIdeas.length} idea(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                        ACTIVE
                      </span>
                      <button
                        onClick={() => { setSelectedClientId(client.id); setActiveTab('chat'); }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center gap-1 hover:bg-indigo-500/30 transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: PROPOSALS ── */}
        {activeTab === 'proposals' && (
          <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Incoming Proposals &amp; Work Award Queue</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {dynamicProposals.length} Submitted
              </span>
            </div>
            {dynamicProposals.length === 0 ? (
              <div className="py-10 text-center text-xs font-mono text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                No proposals submitted yet.
              </div>
            ) : (
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
                        Freelancer: <strong className="text-cyan-300">{prop.freelancerName}</strong> • {prop.submittedAt}
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
                            setActionNotice(`🎉 Admin awarded contract for "${prop.jobTitle}" to ${prop.freelancerName}!`);
                            setTimeout(() => setActionNotice(null), 4000);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                        >
                          <Award className="w-4 h-4 text-cyan-300" />
                          <span>Award Contract</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                          ✓ Awarded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Freelancer Modal */}
      {addFreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-4 bg-slate-900/95 text-xs">
            <h2 className="text-xl font-bold text-white">Admin: Register New Freelancer</h2>
            <form onSubmit={handleCreateFreelancer} className="space-y-3">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Full Name:</label>
                <input type="text" required value={freeFormData.name} onChange={(e) => setFreeFormData({ ...freeFormData, name: e.target.value })} placeholder="Rahul Sharma" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Email Address:</label>
                <input type="email" required value={freeFormData.email} onChange={(e) => setFreeFormData({ ...freeFormData, email: e.target.value })} placeholder="rahul@devstudio.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Professional Title:</label>
                <input type="text" value={freeFormData.title} onChange={(e) => setFreeFormData({ ...freeFormData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Skills (comma separated):</label>
                <input type="text" value={freeFormData.skills} onChange={(e) => setFreeFormData({ ...freeFormData, skills: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                Default password: <strong className="text-cyan-300">Freelancer@12345</strong>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAddFreeModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold">Issue Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {addClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-emerald-500/30 p-8 rounded-3xl space-y-4 bg-slate-900/95 text-xs">
            <h2 className="text-xl font-bold text-white">Admin: Add New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Full Name:</label>
                <input type="text" required value={clientFormData.name} onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })} placeholder="Priya Sharma" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Email Address:</label>
                <input type="email" required value={clientFormData.email} onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })} placeholder="priya@company.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Company (optional):</label>
                <input type="text" value={clientFormData.company} onChange={(e) => setClientFormData({ ...clientFormData, company: e.target.value })} placeholder="NeuraLabs Inc." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 flex items-center gap-2">
                <NcxCoinIcon size="sm" />
                <span>New client receives <strong className="text-white">500 NCX starter credits</strong> automatically. Default password: <strong className="text-white">Client@12345</strong></span>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAddClientModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold">Create Client Account</button>
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
                <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none">
                  <option value="">-- Choose Project --</option>
                  {dynamicJobs.map((j) => (<option key={j.id} value={j.id}>{j.title} (${j.maxBudget})</option>))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Select Approved Freelancer:</label>
                <select value={selectedFreelancerId} onChange={(e) => setSelectedFreelancerId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none">
                  <option value="">-- Choose Freelancer --</option>
                  {approvedFreelancers.map((f) => (<option key={f.id} value={f.id}>{f.name} ({f.title})</option>))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAssignModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold">Assign Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Document Viewer Modal */}
      {activeDocView && (
        <DocumentViewerModal
          isOpen={!!activeDocView}
          onClose={() => setActiveDocView(null)}
          fileName={activeDocView.fileName}
          rawText={activeDocView.rawText}
          onShareToChat={(text) => {
            if (selectedClientId) sendAdminClientMessage(selectedClientId, text);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
