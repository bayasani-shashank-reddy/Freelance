import express from 'express';
import { AdminClientMessage } from '../models/AdminClientMessage.js';

export const messageRouter = express.Router();

// Get all admin-client messages (or by conversationId)
messageRouter.get('/', async (req, res) => {
  try {
    const { conversationId } = req.query;
    const filter = conversationId ? { conversationId } : {};
    const messages = await AdminClientMessage.find(filter).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send new message
messageRouter.post('/', async (req, res) => {
  try {
    const { conversationId, senderId, senderName, senderAvatar, senderRole, text, attachmentName } = req.body;

    const newMsg = new AdminClientMessage({
      customId: `acmsg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      senderRole,
      text,
      attachmentName: attachmentName || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    await newMsg.save();
    res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
