import express from 'express';
import mongoose from 'mongoose';
import { Proposal } from '../models/Proposal.js';
import { Job } from '../models/Job.js';

export const proposalRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// Get all proposals
proposalRouter.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a proposal
proposalRouter.post('/', async (req, res) => {
  try {
    const newProp = new Proposal({
      ...req.body,
      customId: req.body.id || req.body.customId || `prop-${Date.now()}`,
      status: req.body.status || 'Submitted'
    });
    await newProp.save();

    // Increment proposals count on job safely
    if (req.body.jobId) {
      try {
        await Job.findOneAndUpdate(
          getFilterById(req.body.jobId),
          { $inc: { proposalsCount: 1 } }
        );
      } catch (jErr) {
        console.log('Job count inc notice:', jErr.message);
      }
    }

    res.status(201).json({ success: true, proposal: newProp });
  } catch (err) {
    console.error('Error submitting proposal:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin awards proposal
proposalRouter.post('/:id/award', async (req, res) => {
  try {
    const prop = await Proposal.findOneAndUpdate(
      getFilterById(req.params.id),
      { status: 'Accepted' },
      { new: true }
    );

    if (prop && prop.jobId) {
      await Job.findOneAndUpdate(
        getFilterById(prop.jobId),
        {
          status: 'In Progress',
          assignedFreelancerId: prop.freelancerId,
          assignedFreelancerName: prop.freelancerName,
        }
      );
    }

    res.json({ success: true, proposal: prop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
