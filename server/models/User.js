import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: 'Client@12345' },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
  credits: { type: Number, default: 500 },
  balance: { type: Number, default: 0 },
  escrowBalance: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  title: { type: String, default: '' },
  skills: [{ type: String }],
  company: { type: String, default: '' },
  verificationBadge: { type: String, default: 'Verified Client' },
  trustScore: { type: Number, default: 98 },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
