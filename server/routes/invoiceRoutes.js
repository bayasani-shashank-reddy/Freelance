import express from 'express';
import { Invoice } from '../models/Invoice.js';
import { User } from '../models/User.js';

export const invoiceRouter = express.Router();

// GET /api/invoices/specialist/:freelancerId — Get earnings & invoice history (ID 110)
invoiceRouter.get('/specialist/:freelancerId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ freelancerId: req.params.freelancerId }).sort({ issuedDate: -1 });
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPending = invoices.filter(i => i.status === 'issued').reduce((acc, i) => acc + i.grandTotal, 0);

    res.json({
      success: true,
      totalEarnings: totalPaid,
      pendingPayout: totalPending,
      invoices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/project/:projectId — Get invoices for a project
invoiceRouter.get('/project/:projectId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ projectId: req.params.projectId }).sort({ issuedDate: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices — Create a verified invoice (ID 111)
invoiceRouter.post('/', async (req, res) => {
  try {
    const { projectId, projectTitle, freelancerId, freelancerName, clientId, clientName, clientEmail, items = [], currency = 'INR' } = req.body;

    const totalAmount = items.reduce((acc, item) => acc + (Number(item.amount) || (Number(item.hours) * Number(item.rate)) || 0), 0);
    const taxAmount = Math.round(totalAmount * 0.18);
    const grandTotal = totalAmount + taxAmount;

    const invoiceNumber = `NCX-INV-${Date.now().toString().slice(-6)}`;
    const invoice = new Invoice({
      customId: `inv-${Date.now()}`,
      invoiceNumber,
      projectId,
      projectTitle,
      freelancerId,
      freelancerName,
      clientId,
      clientName,
      clientEmail,
      items,
      totalAmount,
      currency,
      taxPercent: 18,
      taxAmount,
      grandTotal,
      status: 'issued',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    await invoice.save();
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
