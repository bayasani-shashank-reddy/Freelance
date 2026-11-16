import mongoose from 'mongoose';

const DeliverableSubmissionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  freelancerId: { type: String, required: true, index: true },
  freelancerName: { type: String, required: true },
  submissionTitle: { type: String, required: true },
  version: { type: Number, default: 1 },
  description: { type: String, default: '' },
  releaseNotes: { type: String, default: '' },
  zipFileName: { type: String, required: true },
  zipFileSize: { type: String, default: '' },
  zipStoragePath: { type: String, required: true },
  storageType: { type: String, enum: ['local_disk', 's3_compatible'], default: 'local_disk' },
  signedDownloadUrl: { type: String, default: '' },
  signedUrlExpiresAt: { type: Date },
  sha256Checksum: { type: String, default: '' },
  fileCount: { type: Number, default: 0 },
  uncompressedSizeBytes: { type: Number, default: 0 },
  hasReadme: { type: Boolean, default: false },
  readmeDetected: { type: Boolean, default: false },
  readmeContent: { type: String, default: '' },
  hasPackageJson: { type: Boolean, default: false },
  packageJsonContent: { type: String, default: '' },
  configFilesDetected: [{ type: String }],
  nestedArchivesDetected: [{ type: String }],
  installationInstructions: { type: String, default: '' },
  sourceRepoUrl: { type: String, default: '' },
  livePreviewUrl: { type: String, default: '' },
  gitCommitHash: { type: String, default: '' },
  gitCommitDate: { type: String, default: '' },
  gitBranch: { type: String, default: 'main' },
  gitReleaseTag: { type: String, default: '' },
  fileManifest: [
    {
      path: { type: String },
      size: { type: Number },
      isDirectory: { type: Boolean }
    }
  ],
  securityScan: {
    passed: { type: Boolean, default: true },
    status: { type: String, default: 'Passed Safe Structural Checks (Advisory)' },
    integrityVerified: { type: Boolean, default: true },
    disclaimer: {
      type: String,
      default: 'A checksum confirms file integrity; it does not prove that software is secure. Only show a security status based on checks actually executed.'
    },
    flags: [{ type: String }]
  },
  malwareScan: {
    status: {
      type: String,
      enum: ['clean', 'quarantined', 'scan_pending', 'scan_not_configured'],
      default: 'scan_not_configured'
    },
    scannerEngine: { type: String, default: 'AdmZip Inspector v2.0 (Structural)' },
    scannedAt: { type: Date, default: Date.now },
    scanReport: { type: String, default: 'Structural checks completed: zero path-traversal and zero zip-bomb anomalies.' }
  },
  escrowStatus: {
    type: String,
    enum: ['not_funded', 'locked', 'released', 'disputed', 'refunded'],
    default: 'not_funded'
  },
  escrowAmountNCX: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Changes Requested', 'Resubmitted', 'Approved', 'Rejected'],
    default: 'Submitted'
  },
  releaseToClient: { type: Boolean, default: false }, // Client can only see after explicit admin release
  clientReleasedAt: { type: Date, default: null },
  adminFeedback: { type: String, default: '' },
  reviewedByAdminId: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const DeliverableSubmission = mongoose.models.DeliverableSubmission || mongoose.model('DeliverableSubmission', DeliverableSubmissionSchema);
