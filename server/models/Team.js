import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  ownerId: { type: String, required: true, index: true },
  teamName: { type: String, required: true },
  members: [
    {
      userId: { type: String },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, enum: ['owner', 'approver', 'viewer'], default: 'viewer' },
      status: { type: String, enum: ['active', 'pending', 'revoked'], default: 'pending' },
      inviteToken: { type: String },
      invitedAt: { type: Date, default: Date.now },
      joinedAt: { type: Date }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
