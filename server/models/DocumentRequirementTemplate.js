import mongoose from 'mongoose';

const TemplateRequirementItemSchema = new mongoose.Schema({
  reqId: { type: String, required: true },
  requirementName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Business', 'Design', 'Technical', 'Legal', 'Financial', 'Other'],
    default: 'Business'
  },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  mandatory: { type: Boolean, default: true },
  allowedFormats: [{ type: String }], // e.g. ['pdf', 'docx', 'png', 'jpg', 'zip']
  maxFileSize: { type: Number, default: 20 }, // in Megabytes
  multipleFiles: { type: Boolean, default: false },
  maxFileCount: { type: Number, default: 1 },
  referenceFile: {
    originalName: { type: String },
    storagePath: { type: String },
    fileSize: { type: String },
    mimeType: { type: String }
  },
  stage: {
    type: String,
    enum: ['Intake', 'Planning', 'Design', 'Development', 'Testing', 'Delivery'],
    default: 'Intake'
  },
  visibility: {
    type: String,
    enum: ['Client-visible', 'Admin-only'],
    default: 'Client-visible'
  }
});

const DocumentRequirementTemplateSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Business', 'Design', 'Technical', 'Legal', 'Financial', 'General'],
    default: 'General'
  },
  version: { type: Number, default: 1 },
  requirements: [TemplateRequirementItemSchema],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  createdBy: { type: String, default: 'Admin' },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const DocumentRequirementTemplate =
  mongoose.models.DocumentRequirementTemplate ||
  mongoose.model('DocumentRequirementTemplate', DocumentRequirementTemplateSchema);
