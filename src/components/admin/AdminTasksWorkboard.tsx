import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface OperationalTask {
  id: string;
  title: string;
  category: 'Triage' | 'Scoping' | 'Compliance' | 'Specialist' | 'Delivery';
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  assignee: string;
}

const INITIAL_TASKS: OperationalTask[] = [
  {
    id: 'TASK-101',
    title: 'Review Project Intake Specification Template updates',
    category: 'Triage',
    priority: 'High',
    status: 'In Progress',
    dueDate: 'Today',
    assignee: 'Head Administrator'
  },
  {
    id: 'TASK-102',
    title: 'Verify Spatial Audio Kernel feasibility quotation',
    category: 'Scoping',
    priority: 'Critical',
    status: 'Pending',
    dueDate: 'Nov 18, 2026',
    assignee: 'Sub-Admin Triage'
  },
  {
    id: 'TASK-103',
    title: 'Dispatch Autonomous Drone project brief to specialist',
    category: 'Specialist',
    priority: 'High',
    status: 'Pending',
    dueDate: 'Nov 19, 2026',
    assignee: 'Talent Dispatcher'
  },
  {
    id: 'TASK-104',
    title: 'Perform compliance audit on new sub-admin roles',
    category: 'Compliance',
    priority: 'Normal',
    status: 'Completed',
    dueDate: 'Nov 16, 2026',
    assignee: 'Security Officer'
  }
];

export const AdminTasksWorkboard: React.FC = () => {
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'Critical' | 'High' | 'Normal' | 'Low'>('High');
  const [newCategory, setNewCategory] = useState<'Triage' | 'Scoping' | 'Compliance' | 'Specialist' | 'Delivery'>('Triage');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('Administrator');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: OperationalTask = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory,
      status: 'Pending',
      dueDate: newDueDate || 'This Week',
      assignee: newAssignee
    };

    setTasks([created, ...tasks]);
    setNewTitle('');
    setNewTaskModalOpen(false);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const next = t.status === 'Completed' ? 'Pending' : t.status === 'Pending' ? 'In Progress' : 'Completed';
          return { ...t, status: next };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'all' || t.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7357FF]/10 text-[#7357FF] border border-[#7357FF]/20 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              Operational Workboard
            </span>
            <span className="text-xs text-[#8F91A3] font-mono">
              Administrative Execution
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white mt-1">
            Administrative Tasks & Workboard
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Track critical triage items, quotation reviews, contract follow-ups, and operational governance tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewTaskModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white text-xs font-bold shadow-lg shadow-[#7357FF]/25 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Operational Task</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-500">PENDING ACTION</span>
          <div className="text-2xl font-display font-bold text-[#17172B] dark:text-white mt-1">
            {tasks.filter((t) => t.status === 'Pending').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-[#3978FF]">IN PROGRESS</span>
          <div className="text-2xl font-display font-bold text-[#3978FF] mt-1">
            {tasks.filter((t) => t.status === 'In Progress').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">COMPLETED</span>
          <div className="text-2xl font-display font-bold text-emerald-500 mt-1">
            {tasks.filter((t) => t.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8F91A3]">Filter:</span>
          {['all', 'Pending', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus.toLowerCase() === st.toLowerCase()
                  ? 'bg-[#7357FF] text-white shadow-xs'
                  : 'text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F7F8FC] dark:hover:bg-[#131326]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8F91A3]">Priority:</span>
          {['all', 'Critical', 'High', 'Normal'].map((pr) => (
            <button
              key={pr}
              type="button"
              onClick={() => setFilterPriority(pr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterPriority.toLowerCase() === pr.toLowerCase()
                  ? 'bg-[#17172B] dark:bg-white text-white dark:text-[#17172B]'
                  : 'text-[#65677A] dark:text-[#A6A8C0]'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46]">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <h3 className="font-bold text-base text-[#17172B] dark:text-white">All Caught Up</h3>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">No tasks match the selected filters.</p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xs flex items-center justify-between gap-4 hover:border-[#7357FF]/30 transition-all"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                    t.status === 'Completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : t.status === 'In Progress'
                      ? 'bg-[#3978FF] border-[#3978FF] text-white'
                      : 'border-[#E8EAF4] dark:border-[#2A2A46]'
                  }`}
                >
                  {t.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {t.status === 'In Progress' && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#8F91A3]">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      t.priority === 'Critical'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : t.priority === 'High'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-[#EEE9FF] text-[#7357FF] dark:bg-[#252445]'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-[10px] font-bold text-[#8F91A3]">• {t.category}</span>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-bold text-[#17172B] dark:text-white ${
                    t.status === 'Completed' ? 'line-through opacity-60' : ''
                  }`}>
                    {t.title}
                  </h4>
                </div>
              </div>

              {/* Assignee & Due Date */}
              <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                <div className="hidden sm:block text-right">
                  <div className="text-[11px] font-semibold text-[#17172B] dark:text-white">{t.assignee}</div>
                  <div className="text-[10px] text-[#8F91A3] font-mono">Due: {t.dueDate}</div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(t.id)}
                  className="p-1.5 rounded-lg text-[#8F91A3] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Task */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
              Create Operational Task
            </h3>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17172B] dark:text-white">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Call client regarding project deadline"
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs outline-none focus:border-[#7357FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs outline-none"
                  >
                    <option value="Triage">Triage</option>
                    <option value="Scoping">Scoping</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">Assignee</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    placeholder="e.g. Lead Administrator"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">Due Date</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="e.g. Tomorrow or Nov 20"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#65677A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7357FF] text-white text-xs font-bold shadow-xs hover:bg-[#6042EE]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
