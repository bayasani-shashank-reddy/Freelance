import React, { useState } from 'react';

import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  FileText,
  Paperclip,
  Plus,
  Clock,
  Users,
  ShieldCheck,
  Zap,
  Briefcase,
  FileCheck,
  Activity,
  Upload,
  FileUp,
  ClipboardList,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import {
  NcxCoinIcon,
  NcxCreditBadge,
} from '../../components/NcxCredit';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';

const MotionDiv = motion.div as any;

const ACTIVITY_FEED = [
  {
    id: 'act-1',
    type: 'milestone',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    title: 'Idea Received',
    description: 'Admin has received your project idea and is reviewing it.',
    time: '2 hours ago',
    isNew: true,
  },
  {
    id: 'act-2',
    type: 'upload',
    icon: <Upload className="w-4 h-4" />,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    title: 'Account Active',
    description: 'Your account is verified. You have 500 starter credits to submit ideas.',
    time: '4 hours ago',
    isNew: true,
  },
  {
    id: 'act-3',
    type: 'proposal',
    icon: <MessageCircle className="w-4 h-4" />,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    title: 'Admin Message',
    description: 'Admin reviewed your brief and sent you a proposal update.',
    time: 'Yesterday',
    isNew: false,
  },
  {
    id: 'act-4',
    type: 'payment',
    icon: <NcxCoinIcon size="xs" />,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    title: 'NCX Digital Credits Awarded',
    description: '500 NCX starter credits were added to your account on registration.',
    time: 'When registered',
    isNew: false,
  },
];

export const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, dynamicJobs, ideaSubmissions, editIdea, adminClientMessages, sendAdminClientMessage } = useUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'submissions'>('projects');
  const [newMessageText, setNewMessageText] = useState('');
  const [activeDocView, setActiveDocView] = useState<{ fileName: string; rawText?: string; docContentHtml?: string } | null>(null);

  // Edit Idea State
  const [editingSubmission, setEditingSubmission] = useState<{ id: string; rawIdea: string; docFileName?: string } | null>(null);
  const [editIdeaText, setEditIdeaText] = useState('');
  const [editDocName, setEditDocName] = useState('');

  // Get the client's idea submissions
  const mySubmissions = ideaSubmissions.filter((s) => s.clientId === user?.id);

  // Admin-client messages for this user
  const myAdminMessages = adminClientMessages.filter(
    (m) => m.conversationId === user?.id
  );

  // Real-time dynamic jobs belonging to this client
  const clientJobs = dynamicJobs.filter(
    (j) =>
      j.clientName.toLowerCase() === (user?.name || '').toLowerCase() ||
      j.clientName.toLowerCase() === (user?.email || '').toLowerCase() ||
      j.clientId === user?.id
  );

  // Credits
  const userCredits = user?.credits ?? 0;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user?.id) return;
    sendAdminClientMessage(user.id, newMessageText);
    setNewMessageText('');
    showToast({ type: 'success', title: 'Message Sent', message: 'Sent directly to NexusCraft Admin.' });
  };

  const handleSaveEditedIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;
    if (!editIdeaText.trim()) {
      showToast({ type: 'error', title: 'Empty Content', message: 'Please provide idea details or requirements.' });
      return;
    }

    const res = editIdea(editingSubmission.id, editIdeaText, editDocName || undefined);
    if (res.success) {
      showToast({ type: 'success', title: 'Idea Updated!', message: 'Your updated project idea was saved and sent to Admin for review.' });
      setEditingSubmission(null);
    } else {
      showToast({ type: 'error', title: 'Update Failed', message: res.error || 'Could not update idea.' });
    }
  };


  const statusColor = (status: string) => {
    if (status === 'New') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (status === 'Reviewed') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (status === 'Actioned') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-slate-800 text-slate-400';
  };

  const submissionTypeIcon = (type: string) => {
    if (type === 'document') return <FileUp className="w-4 h-4" />;
    if (type === 'text') return <Zap className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
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
                <span>{user?.verificationBadge || 'Verified Client'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1.5 shadow-sm shadow-indigo-500/20">
                <NcxCoinIcon size="xs" />
                <NcxCreditBadge amount={userCredits} size="xs" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Trust Score: {user?.trustScore || 98}%</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/brief')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:scale-105 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-cyan-200" />
              <span>+ Submit Idea</span>
            </button>

            <button
              onClick={() => navigate('/designers')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Find Talent</span>
            </button>
          </div>
        </div>



        {/* Dynamic Key Client Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">IDEAS SUBMITTED</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{mySubmissions.length}</div>
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-1">● Sent to admin</div>
          </div>

          <div className="glass-card border border-indigo-500/30 p-6 rounded-3xl bg-slate-900/95 shadow-lg shadow-indigo-500/5">
            <div className="text-xs font-mono text-indigo-300 font-bold uppercase mb-1 flex items-center gap-1.5">
              <NcxCoinIcon size="xs" />
              <span>NCX DIGITAL BALANCE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono flex items-center gap-2">
              <NcxCreditBadge amount={userCredits} size="md" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold mt-1">50 NCX per idea submission</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">ACTIVE JOBS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{clientJobs.length}</div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">On marketplace</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">ADMIN MESSAGES</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">{myAdminMessages.length}</div>
            <div className="text-[10px] font-mono text-purple-300 font-semibold mt-1">Direct channel</div>
          </div>
        </div>

        {/* Credits banner for new users */}
        {userCredits >= 450 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-cyan-950/80 border border-indigo-500/40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <NcxCoinIcon size="lg" className="shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🎉 Welcome! You have</span>
                  <NcxCreditBadge amount={userCredits} size="sm" />
                  <span>starter credits</span>
                </p>
                <p className="text-xs text-slate-300 mt-0.5">Use your branded NCX virtual digital credits to submit project ideas directly to admin. Each submission is only <span className="text-indigo-300 font-mono font-bold">50 NCX</span>.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/brief')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shrink-0 shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <NcxCoinIcon size="xs" />
              <span>Submit Idea</span>
            </button>
          </div>
        )}

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
            <span>Projects ({clientJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>My Submissions ({mySubmissions.length})</span>
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
            <span>Admin Chat {myAdminMessages.length > 0 && `(${myAdminMessages.length})`}</span>
          </button>
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900/95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Posted Projects ({clientJobs.length})</h2>
                  <p className="text-xs text-slate-400">All live project requirements posted by you.</p>
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
                    Submit your idea using Quick Idea, upload a document, or use the AI Brief Builder.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/brief')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg"
                >
                  Submit Your First Idea
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
        )}

        {/* TAB 2: MY SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 sm:p-8 bg-slate-900/95">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">My Idea Submissions</h2>
                    <p className="text-xs text-slate-400">All ideas you've submitted to the admin team.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/brief')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Submission</span>
                </button>
              </div>

              {mySubmissions.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Submissions Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Submit your project idea via Quick Idea, upload a Word document, or use the AI Brief Builder.
                  </p>
                  <button
                    onClick={() => navigate('/brief')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg"
                  >
                    Submit Your First Idea
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySubmissions.map((sub) => (
                    <div key={sub.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                            sub.submissionType === 'document'
                              ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                              : sub.submissionType === 'text'
                              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                              : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          }`}>
                            {submissionTypeIcon(sub.submissionType)}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {sub.submissionType === 'document' ? 'DOCUMENT UPLOAD' : sub.submissionType === 'text' ? 'QUICK IDEA' : 'AI BRIEF'}
                            </span>
                            <span className="text-xs font-mono text-slate-500">{sub.createdAt}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>

                      {sub.docFileName ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-xs font-mono text-indigo-300 font-bold">{sub.docFileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveDocView({ fileName: sub.docFileName!, rawText: sub.rawIdea, docContentHtml: sub.docContentHtml })}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-500/30 transition-all"
                            >
                              <span>Preview</span>
                            </button>
                            {sub.status === 'New' && (
                              <button
                                onClick={() => {
                                  setEditingSubmission({ id: sub.id, rawIdea: sub.rawIdea, docFileName: sub.docFileName });
                                  setEditIdeaText(sub.rawIdea);
                                  setEditDocName(sub.docFileName || '');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition-all"
                              >
                                <span>✏️ Edit</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{sub.rawIdea}</p>
                          {sub.status === 'New' && (
                            <button
                              onClick={() => {
                                setEditingSubmission({ id: sub.id, rawIdea: sub.rawIdea });
                                setEditIdeaText(sub.rawIdea);
                                setEditDocName('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-cyan-500/30 transition-all"
                            >
                              <span>✏️ Edit Idea</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-900 text-[10px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          NCX used: <NcxCreditBadge amount={sub.creditsCost} size="xs" />
                        </span>
                        {sub.status === 'New' && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Admin reviewing…
                          </span>
                        )}
                        {sub.status === 'Actioned' && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Check admin chat for updates
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN CHAT */}
        {activeTab === 'messages' && (
          <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[600px] bg-slate-900/95">
            {/* Sidebar */}
            <div className="lg:col-span-4 p-6 bg-slate-950/60 border-r border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center border border-cyan-500/30">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">NexusCraft Admin</h3>
                    <span className="text-xs text-emerald-400 font-mono">● Platform Support</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 mb-4">
                  <div className="text-slate-400 font-mono uppercase text-[10px]">DIRECT CHANNEL:</div>
                  <div className="font-bold text-white">Admin ↔ You (Private)</div>
                  <div className="text-cyan-400 font-mono text-[10px]">{mySubmissions.length} Idea(s) submitted</div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300">
                  💬 This is a private channel between you and the NexusCraft admin. Use it to discuss your project ideas and get updates.
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                End-to-end encrypted. Platform-monitored for quality.
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-8 flex flex-col h-full bg-slate-950">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {myAdminMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No messages yet</p>
                    <p className="text-xs text-slate-500">Submit an idea and start a conversation with admin!</p>
                  </div>
                )}
                {myAdminMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[80%] ${msg.senderRole === 'client' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.senderRole === 'client'
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                        {msg.attachmentName && (
                          <div className="mt-2 p-2 rounded-lg bg-black/30 border border-white/10 flex items-center gap-2 font-mono text-[10px]">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono text-slate-400 block mt-1 ${msg.senderRole === 'client' ? 'text-right' : 'text-left'}`}>
                        {msg.senderName} • {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Message to Admin..."
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
      </div>
    </div>

    {/* Live Activity Feed */}
    <div className="bg-slate-950 pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Platform Activity</span>
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
                {item.isNew && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                )}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
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

    {/* In-App Document Viewer Modal */}
    {activeDocView && (
      <DocumentViewerModal
        isOpen={!!activeDocView}
        onClose={() => setActiveDocView(null)}
        fileName={activeDocView.fileName}
        rawText={activeDocView.rawText}
        docContentHtml={activeDocView.docContentHtml}
        onShareToChat={(text) => {
          if (user?.id) sendAdminClientMessage(user.id, text);
        }}
      />
    )}

    {/* Client Edit Idea Modal (Allowed before Admin accepts) */}
    {editingSubmission && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>✏️ Edit Submitted Idea</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Pre-Review Edit
                </span>
              </h2>
              <p className="text-xs text-slate-400">Update your project idea before the Admin reviews or actions it.</p>
            </div>
            <button
              onClick={() => setEditingSubmission(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveEditedIdea} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-bold text-slate-300 mb-1.5">Project Idea / Requirements</label>
              <textarea
                rows={5}
                required
                value={editIdeaText}
                onChange={(e) => setEditIdeaText(e.target.value)}
                placeholder="Describe your vision, core features, and target timeline..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-300 mb-1.5">Attached Document File (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  placeholder="e.g. Project_Brief_v2.docx"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
              💡 Editing is free! Your updated specifications will be immediately reflected on the Admin Moderation Portal.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSubmission(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold shadow-lg hover:from-indigo-500 hover:to-cyan-400 transition-all"
              >
                Save &amp; Update Idea
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default ClientDashboardPage;
