import mongoose from 'mongoose';

const PlatformSettingSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  scopingSlaHours: { type: Number, default: 48 },
  assignmentSlaHours: { type: Number, default: 72 },
  verificationSlaHours: { type: Number, default: 24 },
  ideaSubmissionCostNCX: { type: Number, default: 50 },
  clientWelcomeBonusNCX: { type: Number, default: 500 },
  platformCommissionPercent: { type: Number, default: 15 },
  featureFlags: {
    enablePublicRegistration: { type: Boolean, default: true },
    enableAiBrainstorming: { type: Boolean, default: true },
    enableInstantQuotes: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  },
  updatedByAdminId: { type: String, default: 'usr-admin-1' },
  updatedAt: { type: Date, default: Date.now }
});

export const PlatformSetting = mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', PlatformSettingSchema);
