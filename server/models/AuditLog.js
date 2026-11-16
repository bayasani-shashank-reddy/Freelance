import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true }, // e.g., 'Project', 'Quotation', 'Deliverable', 'User'
  targetId: { type: String, required: true },
  details: { type: String, default: '' },
  oldValues: { type: mongoose.Schema.Types.Mixed, default: null },
  newValues: { type: mongoose.Schema.Types.Mixed, default: null },
  reason: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

