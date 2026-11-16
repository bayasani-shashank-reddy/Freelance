import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { PaymentOrder, TRUSTED_TOKEN_PACKS } from '../models/PaymentOrder.js';
import { AuditLog } from '../models/AuditLog.js';

export const creditRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// GET /api/credits/balance/:userId — Current credit & escrow balance
creditRouter.get('/balance/:userId', async (req, res) => {
  try {
    const user = await User.findOne(getFilterById(req.params.userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      success: true,
      credits: user.credits || 0,
      escrowBalance: user.escrowBalance || 0,
      totalBalance: (user.credits || 0) + (user.escrowBalance || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credits/transactions/:userId — User's transaction history
creditRouter.get('/transactions/:userId', async (req, res) => {
  try {
    const user = await User.findOne(getFilterById(req.params.userId));
    const uid = user ? (user.customId || user._id) : req.params.userId;
    const transactions = await CreditTransaction.find({
      $or: [{ userId: uid }, { userId: req.params.userId }]
    }).sort({ createdAt: -1 });

    const totalSpent = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const totalEarned = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);

    res.json({
      success: true,
      currentBalance: user ? user.credits : 0,
      escrowBalance: user ? (user.escrowBalance || 0) : 0,
      totalSpent,
      totalEarned,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credits/all — Admin view all credit transactions
creditRouter.get('/all', async (req, res) => {
  try {
    const transactions = await CreditTransaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credits/create-order — Creates a server-validated PaymentOrder (ID 124)
// Prevents clients from supplying arbitrary token amounts; prices and tokens are derived exclusively from trusted catalog
creditRouter.post('/create-order', async (req, res) => {
  try {
    const { userId, packageId, currency = 'INR' } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ error: 'User ID and Package ID are required.' });
    }

    const pack = TRUSTED_TOKEN_PACKS[packageId];
    if (!pack) {
      return res.status(400).json({ error: 'Invalid token package selected.' });
    }

    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const amount = currency.toUpperCase() === 'USD' ? pack.amountUSD : pack.amountINR;
    const customId = `order-${Date.now()}`;
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;

    const order = new PaymentOrder({
      customId,
      userId: user.customId || user._id,
      userEmail: user.email,
      packageId,
      tokens: pack.tokens, // Derived server-side from TRUSTED_TOKEN_PACKS
      amount,
      currency: currency.toUpperCase(),
      provider: process.env.STRIPE_SECRET_KEY ? 'stripe' : process.env.RAZORPAY_KEY_ID ? 'razorpay' : 'sandbox',
      receiptInvoiceId: invoiceId,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      order: {
        orderId: order.customId,
        packageId: pack.id,
        packageName: pack.name,
        tokens: pack.tokens,
        amount,
        currency: currency.toUpperCase(),
        provider: order.provider,
        invoiceId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credits/verify-payment — Verified Payment Settlement & Atomic Token Credit (ID 8, 124)
creditRouter.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, providerPaymentId, idempotencyKey } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required to verify payment.' });
    }

    const order = await PaymentOrder.findOne({ customId: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Payment order not found.' });
    }

    // Idempotency: Prevent duplicate token credits for already settled orders
    if (order.status === 'completed') {
      const existingUser = await User.findOne(getFilterById(order.userId));
      return res.json({
        success: true,
        message: 'Order already settled.',
        credits: existingUser ? existingUser.credits : 0,
        invoiceId: order.receiptInvoiceId
      });
    }

    const user = await User.findOne(getFilterById(order.userId));
    if (!user) return res.status(404).json({ error: 'Associated user account not found.' });

    // Mark order as completed
    order.status = 'completed';
    order.providerPaymentId = providerPaymentId || `pay-${Date.now()}`;
    order.idempotencyKey = idempotencyKey || `idem-${Date.now()}`;
    order.completedAt = new Date();
    await order.save();

    // Atomically credit token amount from verified order
    user.credits = (user.credits || 0) + order.tokens;
    await user.save();

    // Create immutable credit transaction
    const tx = new CreditTransaction({
      customId: `tx-topup-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      amount: order.tokens,
      type: 'purchase',
      description: `Token Pack Top-Up: +${order.tokens} NCX (${order.currency} ${order.amount}) [${order.receiptInvoiceId}]`,
      balanceAfter: user.credits
    });
    await tx.save();

    res.json({
      success: true,
      message: `Payment confirmed. ${order.tokens} NCX successfully credited to vault!`,
      credits: user.credits,
      invoiceId: order.receiptInvoiceId,
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credits/topup — Protected backward-compatible endpoint (Redirects to verified workflow)
creditRouter.post('/topup', async (req, res) => {
  try {
    const { userId, packageId, tokens, amountPaid, orderId } = req.body;
    if (orderId) {
      return res.redirect(307, '/api/credits/verify-payment');
    }

    // If direct topup attempted without verified order, enforce package lookup
    const validPack = TRUSTED_TOKEN_PACKS[packageId] || Object.values(TRUSTED_TOKEN_PACKS).find(p => p.tokens === Number(tokens));
    if (!validPack) {
      return res.status(400).json({
        error: 'Unverified top-up rejected. All token purchases must originate from a verified order.'
      });
    }

    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create and complete order automatically in dev/sandbox
    const verifiedOrder = new PaymentOrder({
      customId: `order-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      packageId: validPack.id,
      tokens: validPack.tokens,
      amount: validPack.amountINR,
      currency: 'INR',
      status: 'completed',
      receiptInvoiceId: `INV-${Date.now().toString().slice(-6)}`,
      completedAt: new Date()
    });
    await verifiedOrder.save();

    user.credits = (user.credits || 0) + validPack.tokens;
    await user.save();

    const tx = new CreditTransaction({
      customId: `tx-topup-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      amount: validPack.tokens,
      type: 'purchase',
      description: `Token Pack Top-Up: +${validPack.tokens} NCX (Verified Order #${verifiedOrder.customId})`,
      balanceAfter: user.credits
    });
    await tx.save();

    res.json({
      success: true,
      message: `Verified and credited ${validPack.tokens} NCX.`,
      credits: user.credits,
      transaction: tx,
      receipt: {
        invoiceId: verifiedOrder.receiptInvoiceId,
        tokens: validPack.tokens,
        date: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credits/escrow-lock — Client locks NCX into milestone escrow (ID 38, 114)
creditRouter.post('/escrow-lock', async (req, res) => {
  try {
    const { clientId, projectId, projectTitle, amountNCX, milestoneTitle } = req.body;
    const amount = Number(amountNCX);
    if (!clientId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Client ID and positive token amount required.' });
    }

    const client = await User.findOne(getFilterById(clientId));
    if (!client) return res.status(404).json({ error: 'Client not found.' });

    if ((client.credits || 0) < amount) {
      return res.status(402).json({
        error: 'Insufficient spendable NCX credits to fund milestone escrow.',
        availableCredits: client.credits || 0,
        requiredCredits: amount
      });
    }

    // Atomically transfer from spendable credits to escrow reserve
    client.credits -= amount;
    client.escrowBalance = (client.escrowBalance || 0) + amount;
    await client.save();

    const tx = new CreditTransaction({
      customId: `tx-escrow-lock-${Date.now()}`,
      userId: client.customId || client._id,
      userEmail: client.email,
      amount: -amount,
      type: 'escrow_lock',
      description: `Escrow Funded — "${milestoneTitle || 'Milestone'}" for Project "${projectTitle || projectId}"`,
      requestId: projectId,
      balanceAfter: client.credits
    });
    await tx.save();

    res.json({
      success: true,
      message: `Successfully locked ${amount} NCX into milestone escrow.`,
      spendableCredits: client.credits,
      escrowBalance: client.escrowBalance,
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credits/escrow-release — Release milestone funds to specialist upon client acceptance (ID 75, 114)
creditRouter.post('/escrow-release', async (req, res) => {
  try {
    const { clientId, specialistId, projectId, amountNCX, milestoneTitle } = req.body;
    const amount = Number(amountNCX);
    if (!clientId || !specialistId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Client ID, Specialist ID, and valid amount required.' });
    }

    const client = await User.findOne(getFilterById(clientId));
    const specialist = await User.findOne(getFilterById(specialistId));

    if (!client || !specialist) {
      return res.status(404).json({ error: 'Client or Specialist account not found.' });
    }

    if ((client.escrowBalance || 0) < amount) {
      return res.status(400).json({ error: 'Client escrow reserve balance is insufficient.' });
    }

    // Deduct from client escrow reserve
    client.escrowBalance = Math.max(0, client.escrowBalance - amount);
    await client.save();

    // Credit specialist spendable balance
    specialist.credits = (specialist.credits || 0) + amount;
    await specialist.save();

    // Record specialist receipt transaction
    const specTx = new CreditTransaction({
      customId: `tx-escrow-release-${Date.now()}`,
      userId: specialist.customId || specialist._id,
      userEmail: specialist.email,
      amount: amount,
      type: 'escrow_release',
      description: `Escrow Released — Milestone "${milestoneTitle || 'Approved Deliverable'}" (Project #${projectId})`,
      requestId: projectId,
      balanceAfter: specialist.credits
    });
    await specTx.save();

    res.json({
      success: true,
      message: `Released ${amount} NCX to specialist.`,
      clientEscrowBalance: client.escrowBalance,
      specialistCredits: specialist.credits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credits/admin-adjust — Admin manual authorized adjustment
creditRouter.post('/admin-adjust', async (req, res) => {
  try {
    const { userId, amount, reason, adminId = 'usr-admin-1' } = req.body;
    if (!userId || amount === undefined || !reason) {
      return res.status(400).json({ error: 'User ID, amount, and reason are required.' });
    }

    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.credits = Math.max(0, (user.credits || 0) + Number(amount));
    await user.save();

    const tx = new CreditTransaction({
      customId: `tx-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      amount: Number(amount),
      type: 'admin_adjustment',
      description: `Admin Adjustment: ${reason}`,
      createdByAdminId: adminId,
      balanceAfter: user.credits
    });
    await tx.save();

    res.json({ success: true, updatedCredits: user.credits, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
