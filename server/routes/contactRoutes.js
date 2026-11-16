import express from 'express';
import mongoose from 'mongoose';
import { AdminContactLog } from '../models/AdminContactLog.js';
import { ProjectRequest } from '../models/IdeaSubmission.js';

export const contactRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// GET /api/contacts — Admin gets all contact logs
contactRouter.get('/', async (req, res) => {
  try {
    const logs = await AdminContactLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contacts/request/:requestId — Get logs for a specific project request
contactRouter.get('/request/:requestId', async (req, res) => {
  try {
    const logs = await AdminContactLog.find({ requestId: req.params.requestId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contacts — Admin records a call or email contact
contactRouter.post('/', async (req, res) => {
  try {
    const { requestId, clientId, clientName, clientPhone, clientEmail, adminId = 'usr-admin-1', adminName = 'Admin', method = 'Call', outcome, details = '', nextAction = '', followUpDate = '' } = req.body;
    if (!requestId || !clientId || !outcome) {
      return res.status(400).json({ error: 'Request ID, Client ID, and Outcome are required.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(requestId));

    const newLog = new AdminContactLog({
      customId: `contact-${Date.now()}`,
      requestId: request ? (request.customId || request._id) : requestId,
      projectTitle: request ? request.projectTitle : 'Project Request',
      clientId,
      clientName: clientName || (request ? request.clientName : 'Client'),
      clientPhone: clientPhone || (request ? request.clientPhone : ''),
      clientEmail: clientEmail || (request ? request.clientEmail : ''),
      adminId,
      adminName,
      method,
      outcome,
      details,
      nextAction,
      followUpDate
    });

    await newLog.save();
    res.status(201).json({ success: true, log: newLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
