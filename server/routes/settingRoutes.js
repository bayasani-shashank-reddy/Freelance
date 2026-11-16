import express from 'express';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { AuditLog } from '../models/AuditLog.js';

export const settingRouter = express.Router();

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
