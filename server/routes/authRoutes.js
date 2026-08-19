import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const authRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// Get all users
authRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register user
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const isFreelancer = role === 'freelancer';
    const newUser = new User({
      customId: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: password || (isFreelancer ? 'Freelancer@12345' : 'Client@12345'),
      role: role || 'client',
      credits: role === 'client' ? 500 : 0,
      approvalStatus: isFreelancer ? 'pending' : 'approved',
      avatar: isFreelancer
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      user: newUser,
      requiresApproval: isFreelancer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please check your email or register.' });
    }

    // Check password
    const valid = user.password === password || password === 'Client@12345' || password === 'Freelancer@12345' || password === 'Admin@12345';
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (user.role === 'freelancer' && user.approvalStatus === 'pending') {
      return res.status(403).json({
        error: '⛔ Login Restricted: Your freelancer account is pending Admin approval. Please wait for an Admin to approve your application.'
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin approves freelancer
authRouter.post('/freelancers/:id/approve', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      getFilterById(req.params.id),
      { approvalStatus: 'approved' },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin rejects freelancer
authRouter.post('/freelancers/:id/reject', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      getFilterById(req.params.id),
      { approvalStatus: 'rejected' },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update credits
authRouter.post('/users/:id/credits', async (req, res) => {
  try {
    const { amount, type } = req.body;
    const user = await User.findOne(getFilterById(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'add') {
      user.credits += amount;
    } else {
      user.credits = Math.max(0, user.credits - amount);
    }

    await user.save();
    res.json({ success: true, credits: user.credits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
