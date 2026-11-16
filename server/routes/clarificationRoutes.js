import express from 'express';
import { Clarification } from '../models/Clarification.js';
import { Notification } from '../models/Notification.js';

export const clarificationRouter = express.Router();

// GET /api/clarifications/project/:projectId — List clarifications for a project
clarificationRouter.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const items = await Clarification.find({
      $or: [{ projectId }, { projectTitle: projectId }]
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clarifications — Create a structured clarification request
clarificationRouter.post('/', async (req, res) => {
  try {
    const {
      projectId,
      projectTitle = '',
      question,
      category = 'Requirements Scope',
      askedBy = { id: 'admin', name: 'NexusCraft Admin', role: 'admin' },
      assignedToRole = 'client',
      assignedToId = ''
    } = req.body;

    if (!projectId || !question) {
      return res.status(400).json({ error: 'Project ID and Question are required.' });
    }

    const customId = `clarif-${Date.now()}`;
    const clarification = new Clarification({
      customId,
      projectId,
      projectTitle,
      question: question.trim(),
      category,
      askedBy,
      assignedToRole,
      assignedToId,
      status: 'Pending'
    });

    await clarification.save();

    // Send notification to recipient
    await Notification.create({
      customId: `notif-${Date.now()}-q`,
      recipientId: assignedToId || 'client',
      recipientRole: assignedToRole,
      title: 'Clarification Needed',
      message: `A question was posted regarding "${projectTitle || 'your project'}": "${question.slice(0, 80)}..."`,
      type: 'warning',
      link: `/requests/${projectId}`
    });

    res.status(201).json({ success: true, clarification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/clarifications/:id/answer — Client or recipient provides structured answer
clarificationRouter.patch('/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, answeredBy = { id: 'client', name: 'Client', role: 'client' }, supportingDocs = [] } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer content is required.' });
    }

    const clarification = await Clarification.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!clarification) {
      return res.status(404).json({ error: 'Clarification request not found.' });
    }

    clarification.answer = answer.trim();
    clarification.answeredBy = answeredBy;
    clarification.answeredAt = new Date();
    clarification.status = 'Answered';
    if (Array.isArray(supportingDocs) && supportingDocs.length) {
      clarification.supportingDocs = supportingDocs;
    }
    clarification.updatedAt = new Date();

    await clarification.save();

    // Notify Admin
    await Notification.create({
      customId: `notif-${Date.now()}-ans`,
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'Clarification Response Received',
      message: `${answeredBy.name} provided an answer for "${clarification.projectTitle}".`,
      type: 'info',
      link: `/admin/requests`
    });

    res.json({ success: true, clarification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/clarifications/:id/status — Admin closes or reopens clarification
clarificationRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const clarification = await Clarification.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!clarification) {
      return res.status(404).json({ error: 'Clarification not found.' });
    }

    clarification.status = status;
    clarification.updatedAt = new Date();
    await clarification.save();

    res.json({ success: true, clarification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

