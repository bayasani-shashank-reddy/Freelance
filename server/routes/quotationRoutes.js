import express from 'express';
import { FreelancerQuotation } from '../models/FreelancerQuotation.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export const quotationRouter = express.Router();

// GET /api/quotations/request/:requestId — Admin view all quotations for a request
quotationRouter.get('/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const quotations = await FreelancerQuotation.find({
      $or: [{ requestId }, { projectTitle: requestId }]
    }).sort({ submittedAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotations/freelancer/:freelancerId — Freelancer view their own quotations only
quotationRouter.get('/freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const quotations = await FreelancerQuotation.find({ freelancerId }).sort({ submittedAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotations — Freelancer submits a quotation (creates new version, preserving previous)
quotationRouter.post('/', async (req, res) => {
  try {
    const {
      requestId,
      projectTitle,
      freelancerId,
      freelancerName,
      freelancerEmail,
      currency = 'INR (₹)',
      totalCost,
      estimatedHours = 0,
      estimatedTimeline = '',
      breakdown = {},
      assumptions = [],
      exclusions = [],
      risks = [],
      validityPeriod = '30 Days'
    } = req.body;

    if (!requestId || !freelancerId || totalCost === undefined) {
      return res.status(400).json({ error: 'Request ID, Freelancer ID, and Total Cost are required.' });
    }

    // Determine current version count for this freelancer and request
    const existingCount = await FreelancerQuotation.countDocuments({ requestId, freelancerId });
    const version = existingCount + 1;

    const customId = `quote-${Date.now()}`;
    const quotation = new FreelancerQuotation({
      customId,
      requestId,
      projectTitle: projectTitle || 'Project Quotation',
      freelancerId,
      freelancerName: freelancerName || 'Specialist',
      freelancerEmail: freelancerEmail || '',
      version,
      currency,
      totalCost: Number(totalCost),
      estimatedHours: Number(estimatedHours) || 0,
      estimatedTimeline,
      breakdown: {
        frontendCost: Number(breakdown.frontendCost) || 0,
        backendCost: Number(breakdown.backendCost) || 0,
        databaseCost: Number(breakdown.databaseCost) || 0,
        uiUxCost: Number(breakdown.uiUxCost) || 0,
        integrationCost: Number(breakdown.integrationCost) || 0,
        testingCost: Number(breakdown.testingCost) || 0,
        deploymentCost: Number(breakdown.deploymentCost) || 0,
        additionalExpenses: Number(breakdown.additionalExpenses) || 0
      },
      assumptions: Array.isArray(assumptions) ? assumptions : [],
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      risks: Array.isArray(risks) ? risks : [],
      validityPeriod,
      status: 'Submitted'
    });

    await quotation.save();

    // Notify Admin
    await Notification.create({
      customId: `notif-${Date.now()}-adm`,
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'Freelancer Quotation Submitted',
      message: `${freelancerName} submitted Quotation v${version} for "${projectTitle}" (₹${Number(totalCost).toLocaleString('en-IN')}).`,
      type: 'info',
      link: `/admin/requests`
    });

    res.status(201).json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/quotations/:id/status — Admin review decision (Approve, Reject, Request Revision)
quotationRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback = '', adminId = 'admin' } = req.body;

    const quotation = await FreelancerQuotation.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found.' });
    }

    const oldStatus = quotation.status;
    quotation.status = status;
    if (adminFeedback) quotation.adminFeedback = adminFeedback;

    await quotation.save();

    // Notify Freelancer
    await Notification.create({
      customId: `notif-${Date.now()}-fl`,
      recipientId: quotation.freelancerId,
      recipientRole: 'freelancer',
      title: `Quotation ${status}`,
      message: `Admin set status to "${status}" for your quotation v${quotation.version} on "${quotation.projectTitle}". ${adminFeedback ? `Feedback: ${adminFeedback}` : ''}`,
      type: status === 'Approved' ? 'success' : (status === 'Revision Requested' ? 'warning' : 'info'),
      link: `/freelancer/dashboard`
    });

    // Audit log
    await AuditLog.create({
      customId: `audit-${Date.now()}`,
      actorId: adminId,
      actorName: 'Administrator',
      actorRole: 'admin',
      action: 'UPDATE_QUOTATION_STATUS',
      targetType: 'FreelancerQuotation',
      targetId: quotation.customId,
      details: adminFeedback,
      oldValues: { status: oldStatus },
      newValues: { status }
    });

    res.json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

