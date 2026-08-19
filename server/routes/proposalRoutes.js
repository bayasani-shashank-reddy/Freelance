import express from 'express';
import { Proposal } from '../models/Proposal.js';
import { Job } from '../models/Job.js';

export const proposalRouter = express.Router();

proposalRouter.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

proposalRouter.post('/', async (req, res) => {
  try {
    const newProp = new Proposal({
      ...req.body,
      customId: `prop-${Date.now()}`
    });
    await newProp.save();

    // Increment proposals count on job
    if (req.body.jobId) {
      await Job.findOneAndUpdate(
        { $or: [{ _id: req.body.jobId }, { customId: req.body.jobId }] },
        { $inc: { proposalsCount: 1 } }
      );
    }

    res.status(201).json({ success: true, proposal: newProp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin awards proposal
proposalRouter.post('/:id/award', async (req, res) => {
  try {
    const prop = await Proposal.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { customId: req.params.id }] },
      { status: 'Accepted' },
      { new: true }
    );
    res.json({ success: true, proposal: prop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
