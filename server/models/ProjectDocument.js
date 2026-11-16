import mongoose from 'mongoose';

const DocumentVersionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  storagePath: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Original Client Document',
      'Admin Revised Document',
      'Approved Freelancer Sharing Version',
      'Final Approved Deliverable'
    ],
    default: 'Original Client Document'
  },
  uploadedBy: {
    id: { type: String },
    name: { type: String },
    role: { type: String }
  },
  description: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  checksum: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const ProjectDocumentSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  primaryCategory: {
    type: String,
    enum: [
      'Original Client Document',
      'Admin Revised Document',
      'Approved Freelancer Sharing Version',
      'Final Approved Deliverable'
    ],
    default: 'Original Client Document'
  },
  isImmutable: { type: Boolean, default: false }, // Client documents are immutable
  currentVersionNumber: { type: Number, default: 1 },
  versions: [DocumentVersionSchema],
  activeSharingFreelancers: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ProjectDocument = mongoose.models.ProjectDocument || mongoose.model('ProjectDocument', ProjectDocumentSchema);

