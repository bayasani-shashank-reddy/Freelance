import mongoose from 'mongoose';

const AdminContactLogSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  adminId: { type: String, required: true },
  adminName: { type: String, default: 'Admin' },
  method: { type: String, enum: ['Call', 'Email', 'Other'], default: 'Call' },
  outcome: { type: String, required: true },
  details: { type: String, default: '' },
  nextAction: { type: String, default: '' },
  followUpDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const AdminContactLog = mongoose.models.AdminContactLog || mongoose.model('AdminContactLog', AdminContactLogSchema);
