import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  freelancerId: { type: String, required: true },
  freelancerName: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  items: [
    {
      description: { type: String },
      hours: { type: Number },
      rate: { type: Number },
      amount: { type: Number }
    }
  ],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  taxPercent: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'issued', 'paid', 'cancelled'], default: 'issued' },
  issuedDate: { type: Date, default: Date.now },
  dueDate: { type: Date }
});

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
