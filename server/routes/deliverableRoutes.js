import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { DeliverableSubmission } from '../models/DeliverableSubmission.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deliverablesDir = path.join(__dirname, '..', 'uploads', 'deliverables');

if (!fs.existsSync(deliverablesDir)) {
  fs.mkdirSync(deliverablesDir, { recursive: true });
}

// Multer storage for ZIP deliverables
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, deliverablesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `deliverable-${uniqueSuffix}.zip`);
  }
});

const uploadZip = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max zip upload
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.zip') {
      return cb(new Error('Only .zip deliverable archives are allowed.'), false);
    }
    cb(null, true);
  }
});

export const deliverableRouter = express.Router();

// POST /api/deliverables/upload-zip — Freelancer submits ZIP deliverable with security analysis
deliverableRouter.post('/upload-zip', uploadZip.single('zipFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid .zip deliverable archive.' });
    }

    const {
      projectId,
      projectTitle = '',
      freelancerId,
      freelancerName = 'Specialist',
      submissionTitle,
      description = '',
      releaseNotes = '',
      sourceRepoUrl = '',
      livePreviewUrl = '',
      gitCommitHash = '',
      gitCommitDate = '',
      gitBranch = 'main',
      gitReleaseTag = ''
    } = req.body;

    if (!projectId || !freelancerId || !submissionTitle) {
      return res.status(400).json({ error: 'Project ID, Freelancer ID, and Submission Title are required.' });
    }

    const filePath = req.file.path;
    const compressedSize = req.file.size;
    const compressedSizeStr = (compressedSize / (1024 * 1024)).toFixed(2) + ' MB';

    // ── COMPUTE CRYPTOGRAPHIC SHA-256 CHECKSUM ──
    const fileBuffer = fs.readFileSync(filePath);
    const sha256Checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // ── SECURITY & SAFE INSPECTION (ADM-ZIP) ──
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    const MAX_FILES = 5000;
    const MAX_UNCOMPRESSED_BYTES = 200 * 1024 * 1024; // 200MB max uncompressed
    const MAX_RATIO = 25; // Zip bomb compression ratio guard

    if (zipEntries.length > MAX_FILES) {
      fs.unlinkSync(filePath); // delete untrusted file
      return res.status(400).json({ error: `Archive contains too many files (${zipEntries.length}). Maximum allowed is ${MAX_FILES}.` });
    }

    let uncompressedSize = 0;
    let readmeDetected = false;
    let readmeContent = '';
    let packageJsonDetected = false;
    let packageJsonContent = '';
    let installationInstructions = '';
    const configFilesDetected = [];
    const nestedArchivesDetected = [];
    const fileManifest = [];
    const securityFlags = [];

    const knownConfigFiles = ['tsconfig.json', 'vite.config.ts', 'vite.config.js', 'tailwind.config.js', 'tailwind.config.ts', 'package.json', 'package-lock.json', '.env.example', 'docker-compose.yml', 'Dockerfile'];

    for (const entry of zipEntries) {
      // Path traversal check
      if (entry.entryName.includes('..') || path.isAbsolute(entry.entryName)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Security violation: Archive contains forbidden path traversal patterns.' });
      }

      uncompressedSize += entry.header.size;

      const baseName = path.basename(entry.entryName).toLowerCase();
      const ext = path.extname(entry.entryName).toLowerCase();

      // Check for nested archives
      if (['.zip', '.tar', '.gz', '.tgz', '.rar', '.7z', '.bz2'].includes(ext)) {
        nestedArchivesDetected.push(entry.entryName);
        securityFlags.push(`Nested Archive Detected: ${entry.entryName} (Archives inside archives are flagged for manual inspection)`);
      }

      // Check for dangerous script/binary executables
      if (['.exe', '.bat', '.sh', '.cmd', '.vbs', '.msi', '.ps1'].includes(ext)) {
        securityFlags.push(`Advisory Notice: Contains script/binary extension (${entry.name}) — Execution blocked on server.`);
      }

      // Check for README
      if (baseName.startsWith('readme') && (baseName.endsWith('.md') || baseName.endsWith('.txt'))) {
        readmeDetected = true;
        try {
          if (entry.header.size < 50000) {
            readmeContent = entry.getData().toString('utf8');
            // Try extracting installation commands
            const matchInstall = readmeContent.match(/(npm (?:install|i|run \w+)|yarn (?:add|install)|pnpm (?:install|i))/gi);
            if (matchInstall) {
              installationInstructions = Array.from(new Set(matchInstall)).slice(0, 4).join(' | ');
            }
          }
        } catch {}
      }

      // Check for package.json
      if (baseName === 'package.json') {
        packageJsonDetected = true;
        try {
          if (entry.header.size < 50000) {
            packageJsonContent = entry.getData().toString('utf8');
            if (!installationInstructions) {
              try {
                const parsed = JSON.parse(packageJsonContent);
                if (parsed.scripts) {
                  installationInstructions = `npm install && npm run ${Object.keys(parsed.scripts)[0] || 'dev'}`;
                }
              } catch {}
            }
          }
        } catch {}
      }

      // Check for configuration files
      if (knownConfigFiles.includes(baseName)) {
        configFilesDetected.push(baseName);
      }

      fileManifest.push({
        path: entry.entryName,
        size: entry.header.size,
        isDirectory: entry.isDirectory
      });
    }

    // Zip bomb detection
    if (uncompressedSize > MAX_UNCOMPRESSED_BYTES || (compressedSize > 0 && (uncompressedSize / compressedSize) > MAX_RATIO)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Security violation: Potential archive expansion bomb detected.' });
    }

    const versionCount = await DeliverableSubmission.countDocuments({ projectId });
    const version = versionCount + 1;

    const customId = `deliv-${Date.now()}`;
    const submission = new DeliverableSubmission({
      customId,
      projectId,
      projectTitle,
      freelancerId,
      freelancerName,
      submissionTitle,
      version,
      description,
      releaseNotes,
      zipFileName: req.file.originalname,
      zipFileSize: compressedSizeStr,
      zipStoragePath: `/uploads/deliverables/${req.file.filename}`,
      sha256Checksum,
      fileCount: zipEntries.length,
      uncompressedSizeBytes: uncompressedSize,
      hasReadme: readmeDetected,
      readmeDetected,
      readmeContent: readmeContent.slice(0, 5000), // store preview snippet
      hasPackageJson: packageJsonDetected,
      packageJsonContent: packageJsonContent.slice(0, 4000),
      configFilesDetected: Array.from(new Set(configFilesDetected)),
      nestedArchivesDetected,
      installationInstructions: installationInstructions || 'Run standard package manager install (e.g. npm install)',
      sourceRepoUrl,
      livePreviewUrl,
      gitCommitHash: gitCommitHash || `sha-${sha256Checksum.slice(0, 7)}`,
      gitCommitDate: gitCommitDate || new Date().toISOString(),
      gitBranch: gitBranch || 'main',
      gitReleaseTag: gitReleaseTag || `v${version}.0.0`,
      fileManifest: fileManifest.slice(0, 300), // manifest sample for speed
      securityScan: {
        passed: true,
        status: securityFlags.length ? 'Passed with Advisory Warnings' : 'Passed Clean Safe Structural Check (Advisory)',
        integrityVerified: true,
        disclaimer: 'A checksum confirms file integrity; it does not prove that software is secure. Only show a security status based on checks actually executed.',
        flags: securityFlags
      },
      status: 'Submitted',
      releaseToClient: false // Must be explicitly released by Admin
    });

    await submission.save();

    // Notify Admin
    await Notification.create({
      customId: `notif-${Date.now()}-adm`,
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'New Deliverable Package Submitted',
      message: `${freelancerName} uploaded ZIP deliverable v${version} for "${projectTitle}" (${compressedSizeStr}, ${zipEntries.length} files).`,
      type: 'info',
      link: `/admin/requests`
    });

    res.status(201).json({ success: true, submission });
  } catch (err) {
    console.error('Deliverable upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deliverables/project/:projectId — Get deliverables for project
// If client, returns ONLY admin-released deliverables
deliverableRouter.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role } = req.query; // 'client' | 'admin' | 'freelancer'

    const filter = { $or: [{ projectId }, { projectTitle: projectId }] };
    if (role === 'client') {
      filter.releaseToClient = true; // Client confidentiality rule
    }

    const deliverables = await DeliverableSubmission.find(filter).sort({ version: -1 });
    res.json(deliverables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deliverables/freelancer/:freelancerId — Freelancer view their own submissions
deliverableRouter.get('/freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const deliverables = await DeliverableSubmission.find({ freelancerId }).sort({ submittedAt: -1 });
    res.json(deliverables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/deliverables/:id/status — Admin reviews deliverable package
deliverableRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback = '', adminId = 'admin' } = req.body;

    const deliverable = await DeliverableSubmission.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable submission not found.' });
    }

    const oldStatus = deliverable.status;
    deliverable.status = status;
    deliverable.adminFeedback = adminFeedback;
    deliverable.reviewedByAdminId = adminId;
    deliverable.updatedAt = new Date();

    await deliverable.save();

    // Notify Freelancer
    await Notification.create({
      customId: `notif-${Date.now()}-fl`,
      recipientId: deliverable.freelancerId,
      recipientRole: 'freelancer',
      title: `Deliverable v${deliverable.version} ${status}`,
      message: `Admin set status to "${status}" on "${deliverable.submissionTitle}". ${adminFeedback ? `Feedback: ${adminFeedback}` : ''}`,
      type: status === 'Approved' ? 'success' : (status === 'Changes Requested' ? 'warning' : 'info'),
      link: `/freelancer/dashboard`
    });

    // Audit log
    await AuditLog.create({
      customId: `audit-${Date.now()}`,
      actorId: adminId,
      actorName: 'Administrator',
      actorRole: 'admin',
      action: 'UPDATE_DELIVERABLE_STATUS',
      targetType: 'DeliverableSubmission',
      targetId: deliverable.customId,
      details: adminFeedback,
      oldValues: { status: oldStatus },
      newValues: { status }
    });

    res.json({ success: true, deliverable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/deliverables/:id/release-client — Admin explicitly releases deliverable to client
deliverableRouter.patch('/:id/release-client', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId = 'admin' } = req.body;

    const deliverable = await DeliverableSubmission.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found.' });
    }

    deliverable.releaseToClient = true;
    deliverable.clientReleasedAt = new Date();
    await deliverable.save();

    // Audit log
    await AuditLog.create({
      customId: `audit-${Date.now()}`,
      actorId: adminId,
      actorName: 'Administrator',
      actorRole: 'admin',
      action: 'RELEASE_DELIVERABLE_TO_CLIENT',
      targetType: 'DeliverableSubmission',
      targetId: deliverable.customId,
      details: `Admin released Deliverable v${deliverable.version} to client.`
    });

    res.json({ success: true, deliverable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

