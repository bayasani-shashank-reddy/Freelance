import express from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job.js';

export const jobRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

jobRouter.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

jobRouter.post('/', async (req, res) => {
  try {
    const newJob = new Job({
      ...req.body,
      customId: req.body.id || req.body.customId || `job-${Date.now()}`
    });
    await newJob.save();
    res.status(201).json({ success: true, job: newJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

jobRouter.patch('/:id/assign', async (req, res) => {
  try {
    const { freelancerId, freelancerName } = req.body;
    const job = await Job.findOneAndUpdate(
      getFilterById(req.params.id),
      {
        status: 'In Progress',
        assignedFreelancerId: freelancerId,
        assignedFreelancerName: freelancerName,
      },
      { new: true }
    );
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
