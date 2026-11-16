import mongoose from 'mongoose';

const RequestActivitySchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  actorId: { type: String, default: '' },
  actorName: { type: String, default: '' },
  actorRole: { type: String, default: 'admin' },
  activityType: { type: String, default: 'status_change' },
  previousStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  userVisibleNote: { type: String, default: '' },
  internalNote: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

export const RequestActivity = mongoose.models.RequestActivity || mongoose.model('RequestActivity', RequestActivitySchema);
