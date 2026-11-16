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
  intakeReferenceTemplate: {
    fileName: { type: String, default: 'NexusCraft_Project_Intake_Specification_Template.docx' },
    originalName: { type: String, default: 'NexusCraft_Project_Intake_Specification_Template.docx' },
    storagePath: { type: String, default: '/uploads/NexusCraft_Project_Intake_Specification_Template.docx' },
    fileSize: { type: String, default: '32.5 KB' },
    mimeType: { type: String, default: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    title: { type: String, default: 'Official Project Specification Template' },
    instructions: {
      type: String,
      default: 'Please download this official reference document format. Fill in your project specifications and requirements following the template sections, then upload your completed document below.'
    },
    allowedFormats: [{ type: String, default: 'docx' }],
    updatedByAdminId: { type: String, default: 'admin' },
    updatedByAdminName: { type: String, default: 'NexusCraft Administration' },
    updatedAt: { type: Date, default: Date.now }
  },
  updatedByAdminId: { type: String, default: 'usr-admin-1' },
  updatedAt: { type: Date, default: Date.now }
});

export const PlatformSetting = mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', PlatformSettingSchema);
