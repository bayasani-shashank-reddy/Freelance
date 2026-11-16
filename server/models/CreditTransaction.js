import mongoose from 'mongoose';

const CreditTransactionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, default: '' },
  amount: { type: Number, required: true }, // e.g. +500, -50
  type: {
    type: String,
    enum: ['welcome_bonus', 'project_submission', 'admin_adjustment', 'refund'],
    required: true
  },
  description: { type: String, required: true },
  requestId: { type: String, default: null },
  createdByAdminId: { type: String, default: null },
  balanceAfter: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const CreditTransaction = mongoose.models.CreditTransaction || mongoose.model('CreditTransaction', CreditTransactionSchema);
