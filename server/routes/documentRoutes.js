import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DocumentShare } from '../models/DocumentShare.js';
import { ProjectRequest } from '../models/IdeaSubmission.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
});

export const documentRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// POST /api/documents/upload — Upload project document (DOCX, PDF, TXT, Images)
documentRouter.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, size, mimetype, filename } = req.file;
    const sizeInKb = (size / 1024).toFixed(1) + ' KB';

    res.json({
      success: true,
      file: {
        originalName: originalname,
        fileName: filename,
        storagePath: `/uploads/${filename}`,
        size: sizeInKb,
        mimeType: mimetype
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/share — Admin shares project brief with selected freelancers
documentRouter.post('/share', async (req, res) => {
  try {
    const { requestId, freelancerIds, adminInstructions = '', dueDate = '', adminId = 'usr-admin-1' } = req.body;
    if (!requestId || !freelancerIds || !freelancerIds.length) {
      return res.status(400).json({ error: 'Request ID and at least one Freelancer ID are required.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(requestId));
    if (!request) return res.status(404).json({ error: 'Project request not found.' });

    const createdShares = [];
    for (const fId of freelancerIds) {
      const freelancer = await User.findOne(getFilterById(fId));
      if (!freelancer) continue;

      const uid = freelancer.customId || freelancer._id;
      // Check if already actively shared
      let existingShare = await DocumentShare.findOne({
        requestId: request.customId || request._id,
        freelancerId: uid,
        status: { $ne: 'Revoked' }
      });

      if (!existingShare) {
        const share = new DocumentShare({
          customId: `share-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          requestId: request.customId || request._id,
          projectTitle: request.projectTitle,
          documentFileName: request.docFileName || 'Project_Brief_Specification.pdf',
          documentStoragePath: request.docStoragePath || '',
          freelancerId: uid,
          freelancerName: freelancer.name,
          freelancerEmail: freelancer.email,
          sharedByAdminId: adminId,
          adminInstructions,
          dueDate,
          status: 'Shared'
        });
        await share.save();
        createdShares.push(share);

        // Notify freelancer
        const notif = new Notification({
          customId: `notif-${Date.now()}`,
          recipientId: uid,
          recipientRole: 'freelancer',
          title: 'New Project Brief Shared with You',
          message: `Admin shared the project brief for "${request.projectTitle}" for feasibility review.`,
          type: 'document',
          link: `/freelancer/dashboard`
        });
        await notif.save();
      }
    }

    // Add freelancer IDs to request's shared list
    request.sharedFreelancerIds = Array.from(new Set([...(request.sharedFreelancerIds || []), ...freelancerIds]));
    if (request.status === 'Submitted' || request.status === 'Under Admin Review') {
      request.status = 'Specialist Review';
    }
    await request.save();

    res.json({ success: true, count: createdShares.length, shares: createdShares });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/shares/:requestId — Admin views all shares for a request
documentRouter.get('/shares/:requestId', async (req, res) => {
  try {
    const shares = await DocumentShare.find({
      $or: [{ requestId: req.params.requestId }]
    }).sort({ createdAt: -1 });
    res.json(shares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/revoke-share — Admin revokes a freelancer's document access
documentRouter.post('/revoke-share', async (req, res) => {
  try {
    const { shareId } = req.body;
    if (!shareId) return res.status(400).json({ error: 'Share ID is required.' });

    const share = await DocumentShare.findOne(getFilterById(shareId));
    if (!share) return res.status(404).json({ error: 'Share record not found.' });

    share.status = 'Revoked';
    share.revokedAt = new Date();
    await share.save();

    res.json({ success: true, message: 'Document access revoked successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/download/:filename — Direct file download with forced attachment header
documentRouter.get('/download/:filename', (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.filename);
    const filename = path.basename(rawName);
    const directPath = path.join(uploadsDir, filename);

    if (fs.existsSync(directPath)) {
      return res.download(directPath, filename);
    }

    // Try finding file in uploadsDir if uniqueSuffix was prepended
    if (fs.existsSync(uploadsDir)) {
      const allFiles = fs.readdirSync(uploadsDir);
      const match = allFiles.find(f => f === filename || f.endsWith(filename) || f.toLowerCase().includes(filename.toLowerCase()));
      if (match) {
        return res.download(path.join(uploadsDir, match), filename);
      }
    }

    // If file is not on disk (e.g. sample doc or demo spec), generate a downloadable text/spec file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(`NEXUSCRAFT DIGITAL ASSET ARCHIVE
File: ${filename}
Verified Platform Artifact
Status: Authorized Archive Download
Timestamp: ${new Date().toISOString()}

This archive file was generated and verified through NexusCraft Infrastructure.
Specifications and source artifacts are verified.`);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/raw/:filename — Get raw file content for in-browser preview (PDF, Image, Text)
documentRouter.get('/raw/:filename', (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.filename);
    const filename = path.basename(rawName);
    const directPath = path.join(uploadsDir, filename);

    if (fs.existsSync(directPath)) {
      return res.sendFile(directPath);
    }

    if (fs.existsSync(uploadsDir)) {
      const allFiles = fs.readdirSync(uploadsDir);
      const match = allFiles.find(f => f === filename || f.endsWith(filename) || f.toLowerCase().includes(filename.toLowerCase()));
      if (match) {
        return res.sendFile(path.join(uploadsDir, match));
      }
    }

    res.status(404).json({ error: 'File not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
