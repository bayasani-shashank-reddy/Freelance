import mongoose from 'mongoose';

const AdminActivityLogSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorEmail: { type: String, default: '' },
  actorRole: { type: String, default: 'admin' },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_REQUIREMENT',
      'UPDATE_REQUIREMENT',
      'DELETE_REQUIREMENT',
      'ACTIVATE_REQUIREMENT',
      'DEACTIVATE_REQUIREMENT',
      'ASSIGN_REQUIREMENT',
      'CREATE_TEMPLATE',
      'UPDATE_TEMPLATE',
      'DELETE_TEMPLATE',
      'ASSIGN_TEMPLATE',
      'SUBMIT_DOCUMENT',
      'APPROVE_DOCUMENT',
      'REQUEST_REVISION',
      'REJECT_DOCUMENT',
      'CREATE_SUB_ADMIN',
      'UPDATE_SUB_ADMIN_PERMISSIONS',
      'DELETE_SUB_ADMIN',
      'TOGGLE_SUB_ADMIN_STATUS',
      'SEND_DOCUMENT_REMINDER',
      'EXPORT_COMPLIANCE_REPORT'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['Requirement', 'Template', 'Submission', 'SubAdmin', 'Project', 'Client', 'Compliance']
  },
  resourceId: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
});

export const AdminActivityLog =
  mongoose.models.AdminActivityLog ||
  mongoose.model('AdminActivityLog', AdminActivityLogSchema);
