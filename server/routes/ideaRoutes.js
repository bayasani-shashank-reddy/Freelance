import express from 'express';
import { IdeaSubmission } from '../models/IdeaSubmission.js';
import { User } from '../models/User.js';

export const ideaRouter = express.Router();

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
    const { clientId, clientName, clientEmail, clientAvatar, rawIdea, docFileName, submissionType, creditsCost = 50 } = req.body;

    // Check & deduct user credits in MongoDB
    const client = await User.findOne({ $or: [{ _id: clientId }, { customId: clientId }] });
    if (client) {
      if (client.credits < creditsCost) {
        return res.status(400).json({ error: `Insufficient NCX credits. You need ${creditsCost} NCX but only have ${client.credits} NCX.` });
      }
      client.credits -= creditsCost;
      await client.save();
    }

    const newIdea = new IdeaSubmission({
      customId: `idea-${Date.now()}`,
      clientId,
      clientName,
      clientEmail,
      clientAvatar,
      rawIdea,
      docFileName: docFileName || null,
      submissionType: submissionType || 'text',
      creditsCost,
      status: 'New',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    await newIdea.save();
    res.status(201).json({ success: true, idea: newIdea, remainingCredits: client?.credits ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin updates status (New -> Reviewed -> Actioned)
ideaRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const idea = await IdeaSubmission.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { customId: req.params.id }] },
      { status },
      { new: true }
    );
    res.json({ success: true, idea });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
