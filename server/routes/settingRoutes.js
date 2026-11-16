import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { AuditLog } from '../models/AuditLog.js';
import { AdminActivityLog } from '../models/AdminActivityLog.js';
import { ensureDefaultTemplateDocx } from '../scripts/generateDefaultTemplate.js';

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
    cb(null, `intake-ref-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

export const settingRouter = express.Router();

// GET /api/settings/intake-template — Get active client intake reference template
settingRouter.get('/intake-template', async (req, res) => {
  try {
    await ensureDefaultTemplateDocx();
    let settings = await PlatformSetting.findOne().sort({ updatedAt: -1 });
    if (!settings || !settings.intakeReferenceTemplate || !settings.intakeReferenceTemplate.storagePath) {
      settings = settings || new PlatformSetting({ customId: `settings-${Date.now()}` });
      settings.intakeReferenceTemplate = {
        fileName: 'NexusCraft_Project_Intake_Specification_Template.docx',
        originalName: 'NexusCraft_Project_Intake_Specification_Template.docx',
        storagePath: '/uploads/NexusCraft_Project_Intake_Specification_Template.docx',
        fileSize: '32.5 KB',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        title: 'Official Project Specification Template',
        instructions: 'Please download this official reference document format. Fill in your project specifications and requirements following the template sections, then upload your completed document below.',
        allowedFormats: ['docx', 'pdf', 'doc'],
        updatedByAdminId: 'admin',
        updatedByAdminName: 'NexusCraft Administration',
        updatedAt: new Date()
      };
      await settings.save();
    }
    res.json({ success: true, template: settings.intakeReferenceTemplate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/intake-template — Admin updates / replaces the official intake reference document
settingRouter.post('/intake-template', upload.single('file'), async (req, res) => {
  try {
    const { title, instructions, adminId = 'admin', adminName = 'Administrator' } = req.body;
    let settings = await PlatformSetting.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      settings = new PlatformSetting({ customId: `settings-${Date.now()}` });
    }

    if (!settings.intakeReferenceTemplate) {
      settings.intakeReferenceTemplate = {};
    }

    if (req.file) {
      const sizeInKb = (req.file.size / 1024).toFixed(1) + ' KB';
      settings.intakeReferenceTemplate.fileName = req.file.filename;
      settings.intakeReferenceTemplate.originalName = req.file.originalname;
      settings.intakeReferenceTemplate.storagePath = `/uploads/${req.file.filename}`;
      settings.intakeReferenceTemplate.fileSize = sizeInKb;
      settings.intakeReferenceTemplate.mimeType = req.file.mimetype;
    }

    if (title && title.trim()) {
      settings.intakeReferenceTemplate.title = title.trim();
    }
    if (instructions && instructions.trim()) {
      settings.intakeReferenceTemplate.instructions = instructions.trim();
    }

    settings.intakeReferenceTemplate.updatedByAdminId = adminId;
    settings.intakeReferenceTemplate.updatedByAdminName = adminName;
    settings.intakeReferenceTemplate.updatedAt = new Date();
    settings.updatedAt = new Date();

    await settings.save();

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: adminId,
      actorName: adminName,
      action: 'UPDATE_REQUIREMENT',
      resourceType: 'Template',
      resourceId: 'INTAKE-REFERENCE-TEMPLATE',
      details: {
        fileName: settings.intakeReferenceTemplate.originalName,
        title: settings.intakeReferenceTemplate.title,
        updatedAt: settings.intakeReferenceTemplate.updatedAt
      }
    });

    res.json({
      success: true,
      message: 'Intake reference document updated successfully.',
      template: settings.intakeReferenceTemplate
    });
  } catch (err) {
    console.error('Error updating intake reference template:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings — Retrieve current active platform configuration
settingRouter.get('/', async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      settings = new PlatformSetting({
        customId: 'platform-settings-default',
        scopingSlaHours: 48,
        assignmentSlaHours: 72,
        verificationSlaHours: 24,
        ideaSubmissionCostNCX: 50,
        clientWelcomeBonusNCX: 500,
        platformCommissionPercent: 15
      });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/settings — Update platform SLA targets, fees & feature flags (ID 85, 86)
settingRouter.patch('/', async (req, res) => {
  try {
    const { scopingSlaHours, assignmentSlaHours, verificationSlaHours, ideaSubmissionCostNCX, platformCommissionPercent, featureFlags, adminId = 'usr-admin-1' } = req.body;
    let settings = await PlatformSetting.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      settings = new PlatformSetting({ customId: `settings-${Date.now()}` });
    }

    if (scopingSlaHours !== undefined) settings.scopingSlaHours = Number(scopingSlaHours);
    if (assignmentSlaHours !== undefined) settings.assignmentSlaHours = Number(assignmentSlaHours);
    if (verificationSlaHours !== undefined) settings.verificationSlaHours = Number(verificationSlaHours);
    if (ideaSubmissionCostNCX !== undefined) settings.ideaSubmissionCostNCX = Number(ideaSubmissionCostNCX);
    if (platformCommissionPercent !== undefined) settings.platformCommissionPercent = Number(platformCommissionPercent);
    if (featureFlags !== undefined) settings.featureFlags = { ...settings.featureFlags, ...featureFlags };

    settings.updatedByAdminId = adminId;
    settings.updatedAt = new Date();
    await settings.save();

    await AuditLog.create({
      customId: `audit-${Date.now()}`,
      actorId: adminId,
      actorName: 'NexusCraft Admin',
      actorRole: 'admin',
      action: 'platform_settings_updated',
      entity: 'PlatformSetting',
      entityId: settings.customId,
      details: { scopingSlaHours, assignmentSlaHours, verificationSlaHours }
    });

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
