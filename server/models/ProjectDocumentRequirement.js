import mongoose from 'mongoose';

const ProjectDocumentRequirementSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, required: true },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, default: 'Client' },
  clientEmail: { type: String, default: '' },
  sourceTemplateId: { type: String, default: null }, // Track source template if cloned
  requirementName: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Business', 'Design', 'Technical', 'Legal', 'Financial', 'Other'],
    default: 'Business'
  },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  mandatory: { type: Boolean, default: true },
  allowedFormats: [{ type: String, default: 'pdf' }], // e.g. ['pdf', 'docx', 'txt', 'png', 'jpg', 'zip']
  maxFileSize: { type: Number, default: 20 }, // in Megabytes
  multipleFiles: { type: Boolean, default: false },
  maxFileCount: { type: Number, default: 1 },
  referenceFile: {
    originalName: { type: String },
    storagePath: { type: String },
    fileSize: { type: String },
    mimeType: { type: String }
  },
  dueDate: { type: Date, default: null },
  visibility: {
    type: String,
    enum: ['Client-visible', 'Admin-only'],
    default: 'Client-visible'
  },
  stage: {
    type: String,
    enum: ['Intake', 'Planning', 'Design', 'Development', 'Testing', 'Delivery'],
    default: 'Intake'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  submissionStatus: {
    type: String,
    enum: ['Not Submitted', 'Submitted', 'Under Review', 'Approved', 'Revision Requested', 'Rejected', 'Overdue'],
    default: 'Not Submitted'
  },
  assignedReviewer: {
    id: { type: String, default: null },
    name: { type: String, default: null },
    role: { type: String, default: null }
  },
  submissionId: { type: String, default: null }, // Link to latest DocumentSubmission customId
  latestVersionNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ProjectDocumentRequirement =
  mongoose.models.ProjectDocumentRequirement ||
  mongoose.model('ProjectDocumentRequirement', ProjectDocumentRequirementSchema);
