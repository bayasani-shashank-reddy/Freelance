import mongoose from 'mongoose';

const SubAdminPermissionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true }, // Links to User customId or _id
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  department: {
    type: String,
    enum: ['Operations', 'Document Management', 'Compliance', 'Finance', 'Client Support', 'Project Management', 'Technical Triage', 'General Administration'],
    default: 'Operations'
  },
  designation: { type: String, default: 'Administrator' },
  role: {
    type: String,
    enum: [
      'super_admin',
      'operations_admin',
      'document_admin',
      'finance_admin',
      'support_admin',
      'project_manager',
      'content_admin',
      'custom'
    ],
    default: 'operations_admin'
  },
  permissions: {
    dashboard: {
      view: { type: Boolean, default: true },
      metrics: { type: Boolean, default: true }
    },
    projects: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
      assign: { type: Boolean, default: true },
      status: { type: Boolean, default: true }
    },
    clients: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    documents: {
      view: { type: Boolean, default: true },
      create_req: { type: Boolean, default: true },
      edit_req: { type: Boolean, default: true },
      delete_req: { type: Boolean, default: false },
      review: { type: Boolean, default: true },
      approve: { type: Boolean, default: true },
      reject: { type: Boolean, default: true }
    },
    specialists: {
      view: { type: Boolean, default: true },
      invite: { type: Boolean, default: false },
      assign: { type: Boolean, default: true },
      remove: { type: Boolean, default: false }
    },
    finance: {
      view: { type: Boolean, default: false },
      manage_credits: { type: Boolean, default: false },
      invoices: { type: Boolean, default: false }
    },
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      logs: { type: Boolean, default: true }
    }
  },
  assignedProjects: [{ type: String }], // empty = all projects
  assignedClients: [{ type: String }], // empty = all clients
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  createdBy: { type: String, default: 'Super Admin' },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SubAdminPermission =
  mongoose.models.SubAdminPermission ||
  mongoose.model('SubAdminPermission', SubAdminPermissionSchema);
