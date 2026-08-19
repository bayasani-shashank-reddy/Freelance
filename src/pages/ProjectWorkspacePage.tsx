import React, { useState } from 'react';
import type { TaskItem, DeliverableVersion } from '../types';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  CheckSquare,
  FileCode,
  MessageSquare,
  DollarSign,
  Plus,
  History,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const ProjectWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    workspaceTasks,
    addWorkspaceTask,
    updateTaskStatus,
    releaseMilestoneEscrow,
    chatMessages,
    sendChatMessage,
    user,
    dynamicJobs,
  } = useUser();

  const job = dynamicJobs.find((j) => j.id === id);
  const project = job ? {
    id: job.id,
    title: job.title,
    designerId: job.assignedFreelancerId || '',
    designerName: job.assignedFreelancerName || 'Assigned Freelancer',
    designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    designerTitle: 'Freelancer',
    clientName: job.clientName,
    status: job.status === 'Closed' ? 'Completed' : 'Active',
    progress: 0,
    totalBudget: job.maxBudget,
    paidAmount: 0,
    startDate: job.postedAt,
    deadline: job.duration,
    milestones: [] as any[],
    deliverables: [] as any[],
    nextDeliverable: 'Initial Setup',
  } : null;

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'deliverables' | 'chat'>('overview');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [chatInputText, setChatInputText] = useState('');

  if (!project) return <div className="pt-28 pb-24 text-center text-white min-h-screen">Workspace not found</div>;

  // Deliverables Versioning state
  const [deliverables] = useState([
    {
      id: 'd1',
      name: 'NeuraAI_Figma_Master_v2.4.fig',
      type: 'Figma File',
      url: '#',
      versions: [
        { version: 1, submittedAt: 'Aug 05', description: 'Initial wireframe draft', files: [{ name: 'v1_wireframe.fig', url: '#' }], status: 'Approved' },
        { version: 2, submittedAt: 'Aug 12', description: 'Added dark cyberpunk glass theme & telemetry canvas', files: [{ name: 'v2.4_final.fig', url: '#' }], status: 'Under Review' },
      ] as DeliverableVersion[],
    },
  ]);

  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: 'todo',
      assignee: user?.name || 'Elena Rostova',
      dueDate: 'Aug 26',
    };
    addWorkspaceTask(newTask);
    setNewTaskTitle('');
  };

  const handleMoveTask = (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleApproveDeliverable = () => {
    releaseMilestoneEscrow(2400);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setPayoutSuccessMsg('Milestone approved & Escrow payout of $2,400 released to freelancer wallet!');
    setTimeout(() => setPayoutSuccessMsg(null), 4000);
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workspace Banner */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">ACTIVE PROJECT WORKSPACE</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HEALTH: ON TRACK
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{project.title}</h1>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                <span>Contractor: <strong className="text-white">{project.designerName}</strong></span>
                <span>•</span>
                <span>Budget: <strong className="text-emerald-400">${project.totalBudget.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Paid: <strong className="text-cyan-400">${project.paidAmount.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/wallet')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all"
              >
                Escrow Wallet (${(project.totalBudget - project.paidAmount).toLocaleString()})
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-400">Milestone Progress ({project.progress}%)</span>
              <span className="text-cyan-300 font-bold">Deadline: {project.deadline}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {payoutSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6 animate-pulse">
            ✓ {payoutSuccessMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
          {[
            { id: 'overview', label: 'Overview & Activity', icon: LayoutDashboard },
            { id: 'tasks', label: 'Tasks (Kanban)', icon: CheckSquare },
            { id: 'milestones', label: 'Milestones & Payments', icon: DollarSign },
            { id: 'deliverables', label: 'Deliverables & Versions', icon: FileCode },
            { id: 'chat', label: 'Project Chat', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Overview & Timeline</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Building next-generation generative AI studio workflow canvas with high-density telemetry dashboards, dark cyberpunk glassmorphism, and React Three Fiber 3D UI integration.
                </p>

                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">Milestone Timeline</h4>
                <div className="space-y-3">
                  {project.milestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${m.status === 'Completed' ? 'bg-emerald-400' : m.status === 'In Progress' ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                        <div>
                          <div className="text-sm font-bold text-white">{m.title}</div>
                          <div className="text-xs text-slate-400 font-mono">Due {m.dueDate} • ${m.amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Sidebar */}
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Recent Activity Log</span>
              </h3>
              <div className="space-y-4 text-xs font-mono text-slate-400">
                <div className="pb-3 border-b border-slate-800/80">
                  <div className="text-slate-300 font-bold">10:45 AM</div>
                  <div>Client approved Milestone 2 payment ($3,000)</div>
                </div>
                <div className="pb-3 border-b border-slate-800/80">
                  <div className="text-slate-300 font-bold">10:42 AM</div>
                  <div>Elena uploaded Deliverable Version 2 (Figma Master v2.4)</div>
                </div>
                <div>
                  <div className="text-slate-300 font-bold">Yesterday</div>
                  <div>New task created: Interactive 3D WebGL Shader</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tasks (Kanban) */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <form onSubmit={handleAddTask} className="flex gap-3 max-w-xl">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new project task..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* To Do */}
              <div className="glass-card border border-slate-800/80 rounded-2xl p-4 bg-slate-900/95">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-4 flex items-center justify-between">
                  <span>To Do</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 font-bold">{workspaceTasks.filter((t) => t.status === 'todo').length}</span>
                </h4>
                <div className="space-y-3">
                  {workspaceTasks.filter((t) => t.status === 'todo').map((task) => (
                    <div key={task.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-white mb-2">{task.title}</div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Due {task.dueDate}</span>
                        <button onClick={() => handleMoveTask(task.id, 'in_progress')} className="text-cyan-300 font-bold hover:underline">Start →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress */}
              <div className="glass-card border border-slate-800/80 rounded-2xl p-4 bg-slate-900/95">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-4 flex items-center justify-between">
                  <span>In Progress</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">{workspaceTasks.filter((t) => t.status === 'in_progress').length}</span>
                </h4>
                <div className="space-y-3">
                  {workspaceTasks.filter((t) => t.status === 'in_progress').map((task) => (
                    <div key={task.id} className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs">
                      <div className="font-bold text-white mb-2">{task.title}</div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Due {task.dueDate}</span>
                        <button onClick={() => handleMoveTask(task.id, 'completed')} className="text-emerald-400 font-bold hover:underline">Complete ✓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed */}
              <div className="glass-card border border-slate-800/80 rounded-2xl p-4 bg-slate-900/95">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase mb-4 flex items-center justify-between">
                  <span>Completed</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{workspaceTasks.filter((t) => t.status === 'completed').length}</span>
                </h4>
                <div className="space-y-3">
                  {workspaceTasks.filter((t) => t.status === 'completed').map((task) => (
                    <div key={task.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 opacity-80 text-xs">
                      <div className="font-bold text-slate-300 line-through mb-1">{task.title}</div>
                      <div className="text-[10px] font-mono text-emerald-400">✓ Done</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Milestones */}
        {activeTab === 'milestones' && (
          <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Milestone Escrow Schedule</h3>
            {project.milestones.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400 font-mono">${m.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-mono text-slate-500">{m.status}</div>
                  </div>
                  {m.status === 'In Progress' && (
                    <button
                      onClick={handleApproveDeliverable}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Release Escrow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Deliverables & Versions */}
        {activeTab === 'deliverables' && (
          <div className="space-y-6">
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Deliverables & Version History</h3>
              {deliverables.map((item) => (
                <div key={item.id} className="space-y-4">
                  <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>{item.name}</span>
                  </div>

                  <div className="space-y-3">
                    {item.versions.map((ver) => (
                      <div key={ver.version} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">Version {ver.version} ({ver.submittedAt})</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${ver.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                            {ver.status}
                          </span>
                        </div>
                        <p className="text-slate-300">{ver.description}</p>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleApproveDeliverable}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
                          >
                            Approve Version
                          </button>
                          <button
                            onClick={() => {
                              setPayoutSuccessMsg('Revision requested for Deliverable Version 2. Contractor notified.');
                              setTimeout(() => setPayoutSuccessMsg(null), 3500);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:text-white"
                          >
                            Request Revision
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Project Chat & Side Info Panel */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card border border-slate-800/80 rounded-3xl p-6 flex flex-col h-[520px]">
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Project Discussion Chat</h3>
                  <p className="text-[11px] text-slate-400">Direct message channel linked to project contract</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  ● ACTIVE ROOM
                </span>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {(chatMessages[project.id] || []).map((msg) => {
                  const isSelf = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl max-w-md text-xs space-y-1 ${
                        isSelf
                          ? 'bg-indigo-600/20 border border-indigo-500/30 ml-auto'
                          : 'bg-slate-900/90 border border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-cyan-300">{msg.senderName}:</span>
                      <p className="text-slate-200">{msg.text}</p>
                      <span className="text-[9px] text-slate-400 block text-right">{msg.timestamp}</span>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInputText.trim()) return;
                  sendChatMessage(project.id, chatInputText);
                  setChatInputText('');
                }}
                className="pt-3 border-t border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Type a message or discuss proposal details..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs">
                  Send
                </button>
              </form>
            </div>

            {/* Right-Side Project Information Panel */}
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-5 text-xs">
              <h3 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Project Specification</h3>

              <div>
                <span className="text-slate-500 block">Project Title:</span>
                <span className="text-white font-bold text-sm">{project.title}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Client Requirements Checklist:</span>
                <ul className="space-y-1 text-slate-300 font-medium">
                  <li>✓ Digital Food Menu / Catalog</li>
                  <li>✓ Cart & Online Ordering</li>
                  <li>✓ Table Reservation System</li>
                  <li>✓ UPI & Card Payment Gateway</li>
                  <li>✓ Admin Dashboard Panel</li>
                </ul>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-500">Budget Range:</span>
                <span className="text-emerald-400 font-bold font-mono">${project.totalBudget.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Timeline:</span>
                <span className="text-slate-200 font-medium">3 Weeks</span>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    setPayoutSuccessMsg('Proposal submitted directly to client in chat!');
                    setTimeout(() => setPayoutSuccessMsg(null), 3500);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold"
                >
                  Send Proposal From Chat
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  View Full Brief Spec
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspacePage;
