import mongoose from 'mongoose';

const DeviceSessionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  refreshTokenHash: { type: String, required: true, index: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'Unknown Browser' },
  deviceType: { type: String, default: 'Desktop' },
  lastActive: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const DeviceSession = mongoose.models.DeviceSession || mongoose.model('DeviceSession', DeviceSessionSchema);
