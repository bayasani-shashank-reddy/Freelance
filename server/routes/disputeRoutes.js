import express from 'express';
import { Dispute } from '../models/Dispute.js';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export const disputeRouter = express.Router();

const getFilterById = (id) => {
  return { $or: [{ _id: id }, { customId: id }] };
};

// GET /api/disputes — Admin gets all platform disputes (ID 79)
disputeRouter.get('/', async (req, res) => {
  try {
    const disputes = await Dispute.find().sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/disputes/project/:projectId — Get disputes for project
disputeRouter.get('/project/:projectId', async (req, res) => {
  try {
    const disputes = await Dispute.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/disputes — Client or Specialist raises a formal dispute (ID 79)
disputeRouter.post('/', async (req, res) => {
  try {
    const {
      projectId,
      projectTitle = 'Project Workspace',
      raisedById,
      raisedByName,
      raisedByRole,
      againstId,
      againstName = '',
      reason,
      description,
      evidenceUrls = [],
      requestedRefundNCX = 0
    } = req.body;

    if (!projectId || !raisedById || !reason || !description) {
      return res.status(400).json({ error: 'Project ID, Raiser ID, Reason, and Description are required.' });
    }

    const customId = `disp-${Date.now()}`;
    const dispute = new Dispute({
      customId,
      projectId,
      projectTitle,
      raisedById,
      raisedByName,
      raisedByRole,
      againstId,
      againstName,
      reason,
      description,
      evidenceUrls,
      requestedRefundNCX: Number(requestedRefundNCX) || 0,
      status: 'open'
    });

    await dispute.save();

    // Alert Admin
    await Notification.create({
      customId: `notif-${Date.now()}`,
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'New Project Dispute Raised',
      message: `${raisedByName} (${raisedByRole}) raised a dispute on "${projectTitle}": ${reason}`,
      type: 'warning',
      link: '/admin/dashboard?tab=disputes'
    });

    res.status(201).json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/disputes/:id/resolve — Admin resolves dispute with optional refund reversal (ID 80)
disputeRouter.post('/:id/resolve', async (req, res) => {
  try {
    const { resolutionNotes, refundedNCX = 0, status = 'resolved', adminId = 'usr-admin-1' } = req.body;
    const dispute = await Dispute.findOne(getFilterById(req.params.id));

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute record not found.' });
    }

    const refundAmount = Math.max(0, Number(refundedNCX) || 0);

    dispute.status = status;
    dispute.adminDecision = {
      resolutionNotes,
      refundedNCX: refundAmount,
      resolvedByAdminId: adminId,
      resolvedAt: new Date()
    };
    dispute.updatedAt = new Date();
    await dispute.save();

    // If refund awarded, refund client from escrow or reversal
    if (refundAmount > 0) {
      const client = await User.findOne({
        $or: [{ customId: dispute.raisedById }, { _id: dispute.raisedById }]
      });

      if (client) {
        // Return to client credits
        client.credits = (client.credits || 0) + refundAmount;
        if (client.escrowBalance && client.escrowBalance >= refundAmount) {
          client.escrowBalance -= refundAmount;
        }
        await client.save();

        // Create reversal ledger record
        await CreditTransaction.create({
          customId: `tx-refund-${Date.now()}`,
          userId: client.customId || client._id,
          userEmail: client.email,
          amount: refundAmount,
          type: 'refund',
          description: `Dispute Resolution Refund: +${refundAmount} NCX for Project "${dispute.projectTitle}" (Dispute #${dispute.customId})`,
          requestId: dispute.projectId,
          balanceAfter: client.credits
        });
      }
    }

    // Log in AuditLog
    await AuditLog.create({
      customId: `audit-${Date.now()}`,
      actorId: adminId,
      actorName: 'NexusCraft Admin',
      actorRole: 'admin',
      action: 'dispute_resolved',
      entity: 'Dispute',
      entityId: dispute.customId,
      details: { resolutionNotes, refundAmount, status }
    });

    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
