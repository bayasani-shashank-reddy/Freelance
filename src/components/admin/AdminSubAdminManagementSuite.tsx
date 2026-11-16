import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Lock,
  Trash2,
  Settings,
  History,
  RefreshCw,
  X,
  Users
} from 'lucide-react';
import { api } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import confetti from 'canvas-confetti';

const DEPARTMENTS = [
  'Operations',
  'Document Management',
  'Compliance',
  'Finance',
  'Client Support',
  'Project Management',
  'Technical Triage',
  'General Administration'
];

const ROLE_PRESETS = {
  super_admin: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: true, edit: true, delete: true, assign: true, status: true },
    clients: { view: true, create: true, edit: true, delete: true },
    documents: { view: true, create_req: true, edit_req: true, delete_req: true, review: true, approve: true, reject: true },
    specialists: { view: true, invite: true, assign: true, remove: true },
    finance: { view: true, manage_credits: true, invoices: true },
    settings: { view: true, edit: true, logs: true }
  },
  operations_admin: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: true, edit: true, delete: false, assign: true, status: true },
    clients: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: false, review: true, approve: true, reject: true },
    specialists: { view: true, invite: true, assign: true, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: true }
  },
  document_admin: {
    dashboard: { view: true, metrics: false },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: true, review: true, approve: true, reject: true },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: true }
  },
  finance_admin: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create_req: false, edit_req: false, delete_req: false, review: false, approve: false, reject: false },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: true, manage_credits: true, invoices: true },
    settings: { view: false, edit: false, logs: true }
  },
  support_admin: {
    dashboard: { view: true, metrics: false },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create_req: false, edit_req: false, delete_req: false, review: false, approve: false, reject: false },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: false }
  },
  project_manager: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: true, edit: true, delete: false, assign: true, status: true },
    clients: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: false, review: true, approve: false, reject: false },
    specialists: { view: true, invite: false, assign: true, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: false }
  },
  content_admin: {
    dashboard: { view: true, metrics: false },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: false, create: false, edit: false, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: false, review: false, approve: false, reject: false },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: false }
  }
};

export const AdminSubAdminManagementSuite: React.FC = () => {
  const { user } = useUser();
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'logs'>('roster');

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Admin@12345',
    department: 'Operations',
    designation: 'Operations Specialist',
    role: 'operations_admin',
    permissions: JSON.parse(JSON.stringify(ROLE_PRESETS.operations_admin))
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsData, logsData] = await Promise.all([
        api.getSubAdmins({
          department: departmentFilter !== 'All' ? departmentFilter : undefined,
          search: search.trim() || undefined
        }),
        api.getAdminActivityLogs({ limit: 60 })
      ]);
      if (Array.isArray(adminsData)) setSubAdmins(adminsData);
      if (Array.isArray(logsData)) setActivityLogs(logsData);
    } catch (err) {
      console.error('Error loading sub-admins:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, search]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSubAdmin(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      password: 'Admin@12345',
      department: 'Operations',
      designation: 'Operations Specialist',
      role: 'operations_admin',
      permissions: JSON.parse(JSON.stringify(ROLE_PRESETS.operations_admin))
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (admin: any) => {
    setEditingSubAdmin(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || '',
      password: '',
      department: admin.department || 'Operations',
      designation: admin.designation || 'Specialist',
      role: admin.role || 'operations_admin',
      permissions: admin.permissions || JSON.parse(JSON.stringify(ROLE_PRESETS.operations_admin))
    });
    setModalOpen(true);
  };

  // Handle role change (auto-update permissions preset)
  const handleRoleChange = (newRole: string) => {
    const preset = (ROLE_PRESETS as any)[newRole];
    setForm(prev => ({
      ...prev,
      role: newRole,
      permissions: preset ? JSON.parse(JSON.stringify(preset)) : prev.permissions
    }));
  };

  // Toggle permission checkbox
  const handleTogglePermission = (group: string, action: string) => {
    setForm(prev => ({
      ...prev,
      role: 'custom',
      permissions: {
        ...prev.permissions,
        [group]: {
          ...prev.permissions[group],
          [action]: !prev.permissions[group]?.[action]
        }
      }
    }));
  };

  // Submit Sub-Admin Form
  const handleSubmitSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      alert('Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    if (editingSubAdmin) {
      const res = await api.updateSubAdminPermissions(editingSubAdmin.customId, {
        department: form.department,
        designation: form.designation,
        role: form.role,
        permissions: form.permissions,
        actorName: user?.name || 'Super Admin'
      });
      setIsSubmitting(false);

      if (res.success) {
        setModalOpen(false);
        loadData();
      } else {
        alert(res.error || 'Failed to update sub-admin.');
      }
    } else {
      const res = await api.createSubAdmin({
        ...form,
        creatorName: user?.name || 'Super Admin'
      });
      setIsSubmitting(false);

      if (res.success) {
        confetti({ particleCount: 50, spread: 60 });
        setModalOpen(false);
        loadData();
      } else {
        alert(res.error || 'Failed to create sub-admin.');
      }
    }
  };

  // Toggle status
  const handleToggleStatus = async (admin: any) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    const res = await api.toggleSubAdminStatus(admin.customId, newStatus, user?.name || 'Super Admin');
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to toggle status.');
    }
  };

  // Delete Sub-Admin
  const handleDeleteSubAdmin = async (admin: any) => {
    if (!confirm(`Are you sure you want to remove sub-admin "${admin.name}"?`)) return;
    const res = await api.deleteSubAdmin(admin.customId, user?.name || 'Super Admin');
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to delete sub-admin.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
              ENTERPRISE RBAC & AUDIT
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white mt-1">
            Sub-Admin Management & Granular Permissions
          </h2>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
            Authorize departmental sub-administrators, configure granular permission checkboxes, and audit all platform actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38] text-[#65677A] dark:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sub-Admin</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8EAF4] dark:border-[#2A2A46] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'roster'
              ? 'border-[#7357FF] text-[#7357FF] bg-[#EEE9FF]/30 dark:bg-[#201F3E]/30'
              : 'border-transparent text-[#65677A] dark:text-[#A6A8C0]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Authorized Sub-Admins ({subAdmins.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-[#7357FF] text-[#7357FF] bg-[#EEE9FF]/30 dark:bg-[#201F3E]/30'
              : 'border-transparent text-[#65677A] dark:text-[#A6A8C0]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Chronological Activity & Audit Stream</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SUB-ADMIN ROSTER TABLE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F91A3]" />
                <input
                  type="text"
                  placeholder="Search name, email, designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs outline-none focus:border-[#7357FF] w-64"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                aria-label="Filter sub-admins by department"
                className="px-3 py-1.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B] text-xs font-semibold outline-none"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[10px] font-mono uppercase text-[#65677A] dark:text-[#A6A8C0]">
                  <th className="py-3 px-4">Sub-Admin</th>
                  <th className="py-3 px-4">Department & Designation</th>
                  <th className="py-3 px-4">Role Profile</th>
                  <th className="py-3 px-4">Permission Scopes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF4] dark:divide-[#2A2A46]">
                {subAdmins.map(admin => {
                  const isRoot = admin.email === 'admin@nexuscraft.com';
                  const isSuspended = admin.status === 'suspended';

                  return (
                    <tr key={admin.customId} className="hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#17172B] dark:text-white flex items-center gap-1.5">
                          {admin.name}
                          {isRoot && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#7357FF] text-white">
                              ROOT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8F91A3] font-mono">{admin.email}</div>
                        {admin.phone && (
                          <div className="text-[10px] text-[#8F91A3]">{admin.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#17172B] dark:text-white">{admin.department}</div>
                        <div className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">{admin.designation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF] uppercase">
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {admin.permissions?.documents?.review && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-50 text-blue-700">DOCS</span>
                          )}
                          {admin.permissions?.projects?.edit && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700">PROJECTS</span>
                          )}
                          {admin.permissions?.finance?.view && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-50 text-emerald-700">FINANCE</span>
                          )}
                          {admin.permissions?.clients?.edit && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-50 text-amber-700">CLIENTS</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {admin.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px] font-mono text-[#8F91A3]">
                        {admin.createdBy || 'System'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(admin)}
                            title="Edit Permissions"
                            className="p-1.5 rounded-lg border border-[#E8EAF4] hover:bg-white text-[#7357FF]"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          {!isRoot && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(admin)}
                                title={isSuspended ? 'Activate Access' : 'Suspend Access'}
                                className={`p-1.5 rounded-lg border ${
                                  isSuspended ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-600'
                                } hover:bg-white`}
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubAdmin(admin)}
                                title="Remove Sub-Admin"
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: CHRONOLOGICAL ACTIVITY & AUDIT STREAM
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#17172B]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-[10px] font-mono uppercase text-[#65677A] dark:text-[#A6A8C0]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Audit Details & Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF4] dark:divide-[#2A2A46]">
                {activityLogs.map(log => (
                  <tr key={log.customId || log._id} className="hover:bg-[#F7F8FC] dark:hover:bg-[#1E1E38]/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-[#8F91A3] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#17172B] dark:text-white">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#65677A] dark:text-[#A6A8C0]">
                      {log.resourceType}: #{log.resourceId}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#65677A] dark:text-[#A6A8C0]">
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-ADMIN BUILDER & PERMISSION MODAL
      ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF]">
                  ACCESS CONTROL ARCHITECT
                </span>
                <h3 className="font-display font-bold text-lg text-[#17172B] dark:text-white">
                  {editingSubAdmin ? `Edit Sub-Admin: ${editingSubAdmin.name}` : 'Authorize New Sub-Administrator'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-[#8F91A3] hover:bg-[#F5F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSubAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingSubAdmin}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none focus:border-[#7357FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingSubAdmin}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none focus:border-[#7357FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Document Reviewer"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#17172B] dark:text-white">
                    Role Preset
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#131326] text-xs font-semibold outline-none"
                  >
                    <option value="operations_admin">Operations Administrator (Projects, Clients, Docs)</option>
                    <option value="document_admin">Document Administrator (Requirement Builder, Review, Audit)</option>
                    <option value="finance_admin">Finance Administrator (Credits, Invoices, Financial Telemetry)</option>
                    <option value="support_admin">Support Administrator (Client Accounts, Inquiry Desk)</option>
                    <option value="project_manager">Project Manager (Execution, Milestones, Deliverables)</option>
                    <option value="content_admin">Content Administrator (Templates, Drafts)</option>
                    <option value="custom">Custom Permissions Profile</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Checkboxes Grouped */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#17172B] dark:text-white block">
                  Granular Permission Flags
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Documents Group */}
                  <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-2">
                    <span className="font-bold text-[11px] text-[#7357FF] uppercase block">
                      Documents & Requirements
                    </span>
                    <div className="space-y-1">
                      {[
                        { key: 'view', label: 'View Requirements & Submissions' },
                        { key: 'create_req', label: 'Create Requirements' },
                        { key: 'edit_req', label: 'Edit Requirements' },
                        { key: 'delete_req', label: 'Delete Requirements' },
                        { key: 'review', label: 'Review & Audit Submissions' },
                        { key: 'approve', label: 'Approve Submissions' },
                        { key: 'reject', label: 'Reject / Request Revisions' }
                      ].map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!form.permissions?.documents?.[perm.key]}
                            onChange={() => handleTogglePermission('documents', perm.key)}
                            className="w-3.5 h-3.5 text-[#7357FF] rounded"
                          />
                          <span className="text-[#65677A] dark:text-[#A6A8C0]">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Projects Group */}
                  <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-2">
                    <span className="font-bold text-[11px] text-[#7357FF] uppercase block">
                      Projects & Triage
                    </span>
                    <div className="space-y-1">
                      {[
                        { key: 'view', label: 'View Project Requests' },
                        { key: 'create', label: 'Create / Intake Projects' },
                        { key: 'edit', label: 'Edit Project Metadata' },
                        { key: 'assign', label: 'Assign Specialists' },
                        { key: 'status', label: 'Change Project Status' },
                        { key: 'delete', label: 'Delete Projects' }
                      ].map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!form.permissions?.projects?.[perm.key]}
                            onChange={() => handleTogglePermission('projects', perm.key)}
                            className="w-3.5 h-3.5 text-[#7357FF] rounded"
                          />
                          <span className="text-[#65677A] dark:text-[#A6A8C0]">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clients Group */}
                  <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-2">
                    <span className="font-bold text-[11px] text-[#7357FF] uppercase block">
                      Client Accounts
                    </span>
                    <div className="space-y-1">
                      {[
                        { key: 'view', label: 'View Client Profiles' },
                        { key: 'create', label: 'Create / Authorize Clients' },
                        { key: 'edit', label: 'Edit Client Profiles' },
                        { key: 'delete', label: 'Remove Clients' }
                      ].map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!form.permissions?.clients?.[perm.key]}
                            onChange={() => handleTogglePermission('clients', perm.key)}
                            className="w-3.5 h-3.5 text-[#7357FF] rounded"
                          />
                          <span className="text-[#65677A] dark:text-[#A6A8C0]">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Finance Group */}
                  <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-2">
                    <span className="font-bold text-[11px] text-[#7357FF] uppercase block">
                      Finance & NCX
                    </span>
                    <div className="space-y-1">
                      {[
                        { key: 'view', label: 'View Financial Ledger' },
                        { key: 'manage_credits', label: 'Manage NCX Credits' },
                        { key: 'invoices', label: 'Issue & Authorize Invoices' }
                      ].map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!form.permissions?.finance?.[perm.key]}
                            onChange={() => handleTogglePermission('finance', perm.key)}
                            className="w-3.5 h-3.5 text-[#7357FF] rounded"
                          />
                          <span className="text-[#65677A] dark:text-[#A6A8C0]">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#65677A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#7357FF] hover:bg-[#6042EE] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSubAdmin ? 'Update Permissions' : 'Authorize Sub-Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
