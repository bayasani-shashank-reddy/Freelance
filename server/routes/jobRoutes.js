import express from 'express';
import { Job } from '../models/Job.js';

export const jobRouter = express.Router();

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
      customId: `job-${Date.now()}`
    });
    await newJob.save();
    res.status(201).json({ success: true, job: newJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
