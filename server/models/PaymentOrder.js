import mongoose from 'mongoose';

export const TRUSTED_TOKEN_PACKS = {
  pack_starter: { id: 'pack_starter', name: 'Starter Pack', tokens: 500, amountINR: 5000, amountUSD: 60 },
  pack_builder: { id: 'pack_builder', name: 'Builder Pack', tokens: 1200, amountINR: 11000, amountUSD: 135 },
  pack_growth: { id: 'pack_growth', name: 'Growth Pack', tokens: 2500, amountINR: 21000, amountUSD: 250 },
  pack_enterprise: { id: 'pack_enterprise', name: 'Enterprise Pack', tokens: 6000, amountINR: 48000, amountUSD: 580 }
};

const PaymentOrderSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  packageId: { type: String, required: true },
  tokens: { type: Number, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  provider: { type: String, enum: ['stripe', 'razorpay', 'sandbox'], default: 'sandbox' },
  providerOrderId: { type: String, index: true },
  providerPaymentId: { type: String },
  idempotencyKey: { type: String, unique: true, sparse: true, index: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending', index: true },
  receiptInvoiceId: { type: String },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export const PaymentOrder = mongoose.models.PaymentOrder || mongoose.model('PaymentOrder', PaymentOrderSchema);
