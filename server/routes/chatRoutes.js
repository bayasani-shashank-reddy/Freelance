import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import { Notification } from '../models/Notification.js';

export const chatRouter = express.Router();

// GET /api/chat/project/:projectId — Fetch chat history for authorized project
chatRouter.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await ChatMessage.find({ projectId }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/project/:projectId — Send in-app project message & broadcast via Socket.IO
chatRouter.post('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { senderId, senderName, senderRole, senderAvatar = '', text, projectTitle = 'Project Workspace', attachment } = req.body;

    if (!senderId || !text || !text.trim()) {
      return res.status(400).json({ error: 'Sender ID and message text are required.' });
    }

    const customId = `msg-${Date.now()}`;
    const newMsg = new ChatMessage({
      customId,
      projectId,
      projectTitle,
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      text: text.trim(),
      attachment: attachment || null,
      readBy: [senderId]
    });

    await newMsg.save();

    // Broadcast via Socket.IO if mounted
    if (req.io) {
      req.io.to(`project:${projectId}`).emit('chat:new_message', newMsg);
    }

    res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
