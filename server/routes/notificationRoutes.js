import express from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';

export const notificationRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// GET /api/notifications/:recipientId — Get user or admin notifications
notificationRouter.get('/:recipientId', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const notifications = await Notification.find({
      $or: [{ recipientId }, { recipientId: recipientId === 'admin' ? 'admin' : null }]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read — Mark single notification as read
notificationRouter.patch('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(getFilterById(req.params.id), { read: true }, { new: true });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all/:recipientId — Mark all as read
notificationRouter.patch('/read-all/:recipientId', async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.params.recipientId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
