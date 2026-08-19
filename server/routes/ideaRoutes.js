import express from 'express';
import mongoose from 'mongoose';
import { IdeaSubmission } from '../models/IdeaSubmission.js';
import { User } from '../models/User.js';

export const ideaRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// Get all ideas (for Admin Dashboard)
ideaRouter.get('/', async (req, res) => {
  try {
    const ideas = await IdeaSubmission.find().sort({ timestamp: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ideas by client
ideaRouter.get('/client/:clientId', async (req, res) => {
  try {
    const ideas = await IdeaSubmission.find({ clientId: req.params.clientId }).sort({ timestamp: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a new idea (deducts 50 NCX credits)
ideaRouter.post('/submit', async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      clientEmail,
      clientAvatar,
      rawIdea,
      docFileName,
      docContentHtml,
      docBase64,
      submissionType,
      creditsCost = 50,
      customId,
    } = req.body;

    // Deduct user credits safely if user found
    try {
      const client = await User.findOne(getFilterById(clientId));
      if (client) {
        client.credits = Math.max(0, (client.credits || 0) - creditsCost);
        await client.save();
      }
    } catch (uErr) {
      console.log('Credit deduction notice:', uErr.message);
    }

    const newIdea = new IdeaSubmission({
      customId: customId || `idea-${Date.now()}`,
      clientId: clientId || 'usr-client-1',
      clientName: clientName || 'Client',
      clientEmail: clientEmail || '',
      clientAvatar: clientAvatar || '',
      rawIdea: rawIdea || 'New Idea Submission',
      docFileName: docFileName || null,
      docContentHtml: docContentHtml || null,
      docBase64: docBase64 || null,
      submissionType: submissionType || 'text',
      creditsCost,
      status: 'New',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    await newIdea.save();
    res.status(201).json({ success: true, idea: newIdea });
  } catch (err) {
    console.error('Error in /ideas/submit:', err);
    res.status(500).json({ error: err.message });
  }
});

// Client edits idea before review
ideaRouter.patch('/:id', async (req, res) => {
  try {
    const { rawIdea, docFileName, docContentHtml, submissionType } = req.body;
    const idea = await IdeaSubmission.findOneAndUpdate(
      getFilterById(req.params.id),
      {
        ...(rawIdea ? { rawIdea } : {}),
        ...(docFileName !== undefined ? { docFileName } : {}),
        ...(docContentHtml !== undefined ? { docContentHtml } : {}),
        ...(submissionType ? { submissionType } : {}),
      },
      { new: true }
    );
    res.json({ success: true, idea });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin updates status (New -> Reviewed -> Actioned)
ideaRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const idea = await IdeaSubmission.findOneAndUpdate(
      getFilterById(req.params.id),
      { status },
      { new: true }
    );
    res.json({ success: true, idea });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
