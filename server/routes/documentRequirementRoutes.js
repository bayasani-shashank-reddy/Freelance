import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { DocumentRequirementTemplate } from '../models/DocumentRequirementTemplate.js';
import { ProjectDocumentRequirement } from '../models/ProjectDocumentRequirement.js';
import { DocumentSubmission } from '../models/DocumentSubmission.js';
import { ProjectRequest } from '../models/IdeaSubmission.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AdminActivityLog } from '../models/AdminActivityLog.js';

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
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB max limit
});

export const documentRequirementRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// ─────────────────────────────────────────────────────────────
// SEED DEFAULT TEMPLATES ON DEMAND
// ─────────────────────────────────────────────────────────────
const seedDefaultTemplates = async () => {
  try {
    const count = await DocumentRequirementTemplate.countDocuments();
    if (count > 0) return;

    const defaultTemplates = [
      {
        customId: 'TMPL-WEB-DEV',
        name: 'Website Development Template',
        description: 'Standard document intake suite for bespoke web applications, landing pages, and enterprise SaaS portals.',
        category: 'Technical',
        version: 1,
        isDefault: true,
        createdBy: 'System Architect',
        requirements: [
          {
            reqId: 'REQ-W-01',
            requirementName: 'Business Requirements Document (BRD)',
            category: 'Business',
            description: 'Provide an overview of target users, commercial goals, and core user journeys.',
            instructions: 'Upload your finalized BRD or executive project specification in PDF or Word format.',
            mandatory: true,
            allowedFormats: ['pdf', 'docx', 'doc', 'txt'],
            maxFileSize: 25,
            stage: 'Intake'
          },
          {
            reqId: 'REQ-W-02',
            requirementName: 'Logo & Brand Assets Package',
            category: 'Design',
            description: 'Brand identity assets including vector logos, typography guides, and brand palette.',
            instructions: 'Please provide high-resolution SVG, PNG, or an organized ZIP archive containing brand assets.',
            mandatory: true,
            allowedFormats: ['zip', 'png', 'svg', 'pdf'],
            maxFileSize: 50,
            stage: 'Design'
          },
          {
            reqId: 'REQ-W-03',
            requirementName: 'Website Copy & Draft Content',
            category: 'Business',
            description: 'Text, headline copy, hero slogans, and page content outlines for navigation pages.',
            instructions: 'Upload your copy deck or wireframe content document in DOCX or PDF format.',
            mandatory: false,
            allowedFormats: ['docx', 'pdf', 'txt'],
            maxFileSize: 20,
            stage: 'Planning'
          },
          {
            reqId: 'REQ-W-04',
            requirementName: 'Reference Websites & Visual Inspo',
            category: 'Design',
            description: 'Curated list of benchmark websites, UI inspirations, and aesthetic references.',
            instructions: 'Attach a PDF or text file with live URLs and comments on what you like about each site.',
            mandatory: false,
            allowedFormats: ['pdf', 'txt', 'docx'],
            maxFileSize: 15,
            stage: 'Design'
          },
          {
            reqId: 'REQ-W-05',
            requirementName: 'Domain & DNS Configuration Spec',
            category: 'Technical',
            description: 'Details of production domain provider (e.g. Cloudflare, GoDaddy, AWS Route53).',
            instructions: 'Specify domain registrar and whether DNS management will be handled by client or NexusCraft.',
            mandatory: false,
            allowedFormats: ['pdf', 'txt'],
            maxFileSize: 10,
            stage: 'Development'
          }
        ]
      },
      {
        customId: 'TMPL-MOBILE-APP',
        name: 'Mobile Application Template',
        description: 'Comprehensive specifications for iOS, Android, and cross-platform mobile systems.',
        category: 'Technical',
        version: 1,
        isDefault: true,
        createdBy: 'System Architect',
        requirements: [
          {
            reqId: 'REQ-M-01',
            requirementName: 'App Functional Requirements Document',
            category: 'Technical',
            description: 'Detailed feature breakdowns, authentication flows, offline capabilities, and push notification requirements.',
            instructions: 'Upload technical requirement document detailing required screen flows and capabilities.',
            mandatory: true,
            allowedFormats: ['pdf', 'docx'],
            maxFileSize: 25,
            stage: 'Intake'
          },
          {
            reqId: 'REQ-M-02',
            requirementName: 'UI Reference Screenshots & Sketches',
            category: 'Design',
            description: 'Hand-drawn wireframes, napkin sketches, or screenshots from benchmark applications.',
            instructions: 'Upload an archive or compilation PDF of your user experience thoughts.',
            mandatory: true,
            allowedFormats: ['pdf', 'zip', 'png', 'jpg'],
            maxFileSize: 35,
            stage: 'Design'
          },
          {
            reqId: 'REQ-M-03',
            requirementName: 'Backend API Documentation or Postman Collection',
            category: 'Technical',
            description: 'Swagger/OpenAPI or Postman collection if connecting to an existing client API infrastructure.',
            instructions: 'Upload JSON/YAML OpenAPI definition or export of Postman workspace.',
            mandatory: false,
            allowedFormats: ['json', 'yaml', 'pdf', 'zip', 'txt'],
            maxFileSize: 20,
            stage: 'Development'
          },
          {
            reqId: 'REQ-M-04',
            requirementName: 'Store Deployment & Developer Accounts',
            category: 'Legal',
            description: 'Apple Developer Team ID and Google Play Console access permissions.',
            instructions: 'Upload developer account setup document or authorization declaration.',
            mandatory: false,
            allowedFormats: ['pdf', 'txt'],
            maxFileSize: 10,
            stage: 'Testing'
          }
        ]
      },
      {
        customId: 'TMPL-ECOMMERCE',
        name: 'E-Commerce Platform Template',
        description: 'Intake suite for online storefronts, catalog structures, payment gateways, and logistics policies.',
        category: 'Business',
        version: 1,
        isDefault: true,
        createdBy: 'System Architect',
        requirements: [
          {
            reqId: 'REQ-E-01',
            requirementName: 'Product Catalogue & Inventory Sheet',
            category: 'Business',
            description: 'Spreadsheet of initial SKU listings, variants (size, color), categories, and stock numbers.',
            instructions: 'Upload Excel or CSV catalog structure according to standard product schemas.',
            mandatory: true,
            allowedFormats: ['xlsx', 'xls', 'csv', 'pdf'],
            maxFileSize: 25,
            stage: 'Intake'
          },
          {
            reqId: 'REQ-E-02',
            requirementName: 'Payment Gateway Account Specification',
            category: 'Financial',
            description: 'Selected payment processors (e.g., Stripe, PayPal, Razorpay) and merchant currency requirements.',
            instructions: 'Specify sandbox API credentials or merchant account verification document.',
            mandatory: true,
            allowedFormats: ['pdf', 'txt'],
            maxFileSize: 10,
            stage: 'Planning'
          },
          {
            reqId: 'REQ-E-03',
            requirementName: 'Shipping & Tax Policy Documentation',
            category: 'Legal',
            description: 'Shipping zones, regional tax rates, returns, and refund policy declarations.',
            instructions: 'Provide legal terms and conditions and shipping rate tables.',
            mandatory: false,
            allowedFormats: ['pdf', 'docx'],
            maxFileSize: 15,
            stage: 'Planning'
          }
        ]
      },
      {
        customId: 'TMPL-AI-ML',
        name: 'AI / Machine Learning Model Template',
        description: 'Technical and data governance requirements for model fine-tuning, RAG pipelines, and inference services.',
        category: 'Technical',
        version: 1,
        isDefault: true,
        createdBy: 'System Architect',
        requirements: [
          {
            reqId: 'REQ-A-01',
            requirementName: 'Dataset Specification & Ground Truth Sample',
            category: 'Technical',
            description: 'Sample corpus, prompt/completion pairs, or training data distribution.',
            instructions: 'Upload sample JSONL, CSV, or ZIP with ground truth examples and labeling criteria.',
            mandatory: true,
            allowedFormats: ['json', 'jsonl', 'csv', 'zip'],
            maxFileSize: 50,
            stage: 'Intake'
          },
          {
            reqId: 'REQ-A-02',
            requirementName: 'Model Performance & Benchmark Criteria',
            category: 'Technical',
            description: 'Latency limits (ms), accuracy thresholds, precision/recall expectations, and target deployment budget.',
            instructions: 'Upload technical objective document detailing benchmark test cases.',
            mandatory: true,
            allowedFormats: ['pdf', 'docx'],
            maxFileSize: 15,
            stage: 'Planning'
          },
          {
            reqId: 'REQ-A-03',
            requirementName: 'Data Privacy & Ethics Governance Form',
            category: 'Legal',
            description: 'Confirmation that training dataset is free from prohibited PII or copyrighted material.',
            instructions: 'Upload signed data governance disclosure document.',
            mandatory: true,
            allowedFormats: ['pdf'],
            maxFileSize: 10,
            stage: 'Intake'
          }
        ]
      }
    ];

    await DocumentRequirementTemplate.insertMany(defaultTemplates);
    console.log('✅ Seeded 4 default Document Requirement Templates.');
  } catch (err) {
    console.error('Template seeding error:', err);
  }
};

// ─────────────────────────────────────────────────────────────
// 1. TEMPLATE ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET /api/document-templates — List all templates
documentRequirementRouter.get('/templates', async (req, res) => {
  try {
    await seedDefaultTemplates();
    const { category, search } = req.query;
    const filter = { status: { $ne: 'Archived' } };
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const templates = await DocumentRequirementTemplate.find(filter).sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/document-templates/:id — Single template details
documentRequirementRouter.get('/templates/:id', async (req, res) => {
  try {
    const template = await DocumentRequirementTemplate.findOne(getFilterById(req.params.id));
    if (!template) return res.status(404).json({ error: 'Template not found.' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-templates — Create custom template
documentRequirementRouter.post('/templates', async (req, res) => {
  try {
    const { name, description, category, requirements = [], createdBy = 'Admin' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Template name is required.' });

    const customId = `TMPL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const sanitizedReqs = requirements.map((r, i) => ({
      reqId: r.reqId || `REQ-${i + 1}-${Date.now().toString(36)}`,
      requirementName: r.requirementName || 'Document Requirement',
      category: r.category || 'Business',
      description: r.description || '',
      instructions: r.instructions || '',
      mandatory: r.mandatory !== false,
      allowedFormats: r.allowedFormats || ['pdf', 'docx'],
      maxFileSize: Number(r.maxFileSize) || 20,
      multipleFiles: !!r.multipleFiles,
      maxFileCount: Number(r.maxFileCount) || 1,
      referenceFile: r.referenceFile || null,
      stage: r.stage || 'Intake',
      visibility: r.visibility || 'Client-visible'
    }));

    const template = new DocumentRequirementTemplate({
      customId,
      name: name.trim(),
      description: description || '',
      category: category || 'General',
      version: 1,
      requirements: sanitizedReqs,
      createdBy,
      status: 'Active'
    });

    await template.save();

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: createdBy,
      actorName: createdBy,
      action: 'CREATE_TEMPLATE',
      resourceType: 'Template',
      resourceId: customId,
      details: { templateName: name, requirementCount: sanitizedReqs.length }
    });

    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/document-templates/:id — Update template
documentRequirementRouter.put('/templates/:id', async (req, res) => {
  try {
    const template = await DocumentRequirementTemplate.findOne(getFilterById(req.params.id));
    if (!template) return res.status(404).json({ error: 'Template not found.' });

    const { name, description, category, requirements, status } = req.body;
    if (name) template.name = name.trim();
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    if (status) template.status = status;
    if (Array.isArray(requirements)) {
      template.requirements = requirements.map((r, i) => ({
        reqId: r.reqId || `REQ-${i + 1}-${Date.now().toString(36)}`,
        requirementName: r.requirementName,
        category: r.category || 'Business',
        description: r.description || '',
        instructions: r.instructions || '',
        mandatory: r.mandatory !== false,
        allowedFormats: r.allowedFormats || ['pdf', 'docx'],
        maxFileSize: Number(r.maxFileSize) || 20,
        multipleFiles: !!r.multipleFiles,
        maxFileCount: Number(r.maxFileCount) || 1,
        referenceFile: r.referenceFile || null,
        stage: r.stage || 'Intake',
        visibility: r.visibility || 'Client-visible'
      }));
      template.version = (template.version || 1) + 1;
    }
    template.updatedAt = new Date();
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-templates/:id/duplicate — Duplicate template
documentRequirementRouter.post('/templates/:id/duplicate', async (req, res) => {
  try {
    const source = await DocumentRequirementTemplate.findOne(getFilterById(req.params.id));
    if (!source) return res.status(404).json({ error: 'Source template not found.' });

    const customId = `TMPL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const clone = new DocumentRequirementTemplate({
      customId,
      name: `${source.name} (Copy)`,
      description: source.description,
      category: source.category,
      version: 1,
      isDefault: false,
      requirements: source.requirements,
      createdBy: req.body.createdBy || 'Admin',
      status: 'Active'
    });

    await clone.save();
    res.json({ success: true, template: clone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/document-templates/:id — Delete template
documentRequirementRouter.delete('/templates/:id', async (req, res) => {
  try {
    const template = await DocumentRequirementTemplate.findOne(getFilterById(req.params.id));
    if (!template) return res.status(404).json({ error: 'Template not found.' });

    template.status = 'Archived';
    await template.save();
    res.json({ success: true, message: 'Template archived successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-templates/:id/assign — Assign entire template to project(s)
documentRequirementRouter.post('/templates/:id/assign', async (req, res) => {
  try {
    const template = await DocumentRequirementTemplate.findOne(getFilterById(req.params.id));
    if (!template) return res.status(404).json({ error: 'Template not found.' });

    const { projectIds = [], assignedBy = 'Admin' } = req.body;
    if (!projectIds.length) {
      return res.status(400).json({ error: 'Please select at least one project.' });
    }

    const createdReqs = [];
    for (const pId of projectIds) {
      const project = await ProjectRequest.findOne(getFilterById(pId));
      if (!project) continue;

      const pid = project.customId || project._id;
      const cid = project.clientId;

      for (const item of template.requirements) {
        // Create an isolated project-specific snapshot
        const reqCustomId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const pReq = new ProjectDocumentRequirement({
          customId: reqCustomId,
          projectId: pid,
          projectTitle: project.projectTitle,
          clientId: cid,
          clientName: project.clientName || 'Client',
          clientEmail: project.clientEmail || '',
          sourceTemplateId: template.customId,
          requirementName: item.requirementName,
          category: item.category,
          description: item.description,
          instructions: item.instructions,
          mandatory: item.mandatory,
          allowedFormats: item.allowedFormats,
          maxFileSize: item.maxFileSize,
          multipleFiles: item.multipleFiles,
          maxFileCount: item.maxFileCount,
          referenceFile: item.referenceFile,
          stage: item.stage,
          visibility: item.visibility,
          status: 'Active',
          submissionStatus: 'Not Submitted'
        });

        await pReq.save();
        createdReqs.push(pReq);
      }

      // Notify Client of assigned template requirements
      await Notification.create({
        customId: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        recipientId: cid,
        recipientRole: 'client',
        title: 'Project Document Requirements Assigned',
        message: `Admin assigned ${template.requirements.length} required documents for "${project.projectTitle}".`,
        type: 'document',
        link: '/client/dashboard'
      });
    }

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: assignedBy,
      actorName: assignedBy,
      action: 'ASSIGN_TEMPLATE',
      resourceType: 'Template',
      resourceId: template.customId,
      details: { templateName: template.name, assignedProjectCount: projectIds.length, totalCreated: createdReqs.length }
    });

    res.json({
      success: true,
      count: createdReqs.length,
      requirements: createdReqs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. DYNAMIC PROJECT DOCUMENT REQUIREMENTS (ADMIN BUILDER)
// ─────────────────────────────────────────────────────────────

// GET /api/document-requirements — List project requirements with filtering
documentRequirementRouter.get('/requirements', async (req, res) => {
  try {
    const { projectId, clientId, status, stage, category, search, submissionStatus } = req.query;
    const filter = {};

    if (projectId) filter.projectId = projectId;
    if (clientId) filter.clientId = clientId;
    if (status && status !== 'All') filter.status = status;
    if (submissionStatus && submissionStatus !== 'All') filter.submissionStatus = submissionStatus;
    if (stage && stage !== 'All') filter.stage = stage;
    if (category && category !== 'All') filter.category = category;

    if (search) {
      filter.$or = [
        { requirementName: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { customId: { $regex: search, $options: 'i' } }
      ];
    }

    const requirements = await ProjectDocumentRequirement.find(filter).sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/document-requirements/:id — Single requirement details
documentRequirementRouter.get('/requirements/:id', async (req, res) => {
  try {
    const reqDoc = await ProjectDocumentRequirement.findOne(getFilterById(req.params.id));
    if (!reqDoc) return res.status(404).json({ error: 'Requirement not found.' });

    // Look up submission history if available
    const submission = await DocumentSubmission.findOne({ requirementId: reqDoc.customId });
    res.json({ requirement: reqDoc, submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-requirements — Create new requirement (Builder)
documentRequirementRouter.post('/requirements', async (req, res) => {
  try {
    const {
      projectId,
      clientId,
      requirementName,
      category = 'Business',
      description = '',
      instructions = '',
      mandatory = true,
      allowedFormats = ['pdf', 'docx', 'zip'],
      maxFileSize = 20,
      multipleFiles = false,
      maxFileCount = 1,
      dueDate = null,
      visibility = 'Client-visible',
      stage = 'Intake',
      referenceFile = null,
      status = 'Active',
      actorName = 'Admin'
    } = req.body;

    if (!requirementName || !requirementName.trim()) {
      return res.status(400).json({ error: 'Requirement name is required.' });
    }
    if (!projectId) {
      return res.status(400).json({ error: 'Please select an applicable project.' });
    }

    const project = await ProjectRequest.findOne(getFilterById(projectId));
    if (!project) return res.status(404).json({ error: 'Selected project was not found.' });

    const pCustomId = project.customId || project._id;
    const resolvedClientId = clientId || project.clientId;
    const clientUser = await User.findOne(getFilterById(resolvedClientId));

    const customId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReq = new ProjectDocumentRequirement({
      customId,
      projectId: pCustomId,
      projectTitle: project.projectTitle,
      clientId: resolvedClientId,
      clientName: clientUser?.name || project.clientName || 'Client',
      clientEmail: clientUser?.email || project.clientEmail || '',
      requirementName: requirementName.trim(),
      category,
      description: description.trim(),
      instructions: instructions.trim(),
      mandatory: mandatory !== false,
      allowedFormats: Array.isArray(allowedFormats) && allowedFormats.length ? allowedFormats : ['pdf', 'docx'],
      maxFileSize: Number(maxFileSize) || 20,
      multipleFiles: !!multipleFiles,
      maxFileCount: Number(maxFileCount) || 1,
      referenceFile,
      dueDate: dueDate ? new Date(dueDate) : null,
      visibility,
      stage,
      status,
      submissionStatus: 'Not Submitted'
    });

    await newReq.save();

    // Create client notification
    if (visibility === 'Client-visible') {
      await Notification.create({
        customId: `notif-${Date.now()}`,
        recipientId: resolvedClientId,
        recipientRole: 'client',
        title: 'New Document Required',
        message: `Admin requested "${requirementName}" for project "${project.projectTitle}".`,
        type: 'document',
        link: '/client/dashboard'
      });
    }

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: actorName,
      actorName,
      action: 'CREATE_REQUIREMENT',
      resourceType: 'Requirement',
      resourceId: customId,
      details: { requirementName, projectTitle: project.projectTitle, mandatory }
    });

    res.status(201).json({ success: true, requirement: newReq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/document-requirements/:id — Edit requirement
documentRequirementRouter.patch('/requirements/:id', async (req, res) => {
  try {
    const requirement = await ProjectDocumentRequirement.findOne(getFilterById(req.params.id));
    if (!requirement) return res.status(404).json({ error: 'Requirement not found.' });

    const fields = [
      'requirementName',
      'category',
      'description',
      'instructions',
      'mandatory',
      'allowedFormats',
      'maxFileSize',
      'multipleFiles',
      'maxFileCount',
      'dueDate',
      'visibility',
      'stage',
      'status',
      'referenceFile'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'dueDate') {
          requirement.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
        } else {
          requirement[f] = req.body[f];
        }
      }
    });

    requirement.updatedAt = new Date();
    await requirement.save();

    res.json({ success: true, requirement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/document-requirements/:id — Delete requirement
documentRequirementRouter.delete('/requirements/:id', async (req, res) => {
  try {
    const requirement = await ProjectDocumentRequirement.findOne(getFilterById(req.params.id));
    if (!requirement) return res.status(404).json({ error: 'Requirement not found.' });

    const id = requirement.customId;
    await ProjectDocumentRequirement.deleteOne({ _id: requirement._id });
    await DocumentSubmission.deleteMany({ requirementId: id });

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: req.body.actorName || 'Admin',
      actorName: req.body.actorName || 'Admin',
      action: 'DELETE_REQUIREMENT',
      resourceType: 'Requirement',
      resourceId: id,
      details: { requirementName: requirement.requirementName }
    });

    res.json({ success: true, message: 'Document requirement removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-requirements/:id/duplicate — Duplicate requirement
documentRequirementRouter.post('/requirements/:id/duplicate', async (req, res) => {
  try {
    const source = await ProjectDocumentRequirement.findOne(getFilterById(req.params.id));
    if (!source) return res.status(404).json({ error: 'Requirement not found.' });

    const customId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicate = new ProjectDocumentRequirement({
      customId,
      projectId: source.projectId,
      projectTitle: source.projectTitle,
      clientId: source.clientId,
      clientName: source.clientName,
      clientEmail: source.clientEmail,
      requirementName: `${source.requirementName} (Copy)`,
      category: source.category,
      description: source.description,
      instructions: source.instructions,
      mandatory: source.mandatory,
      allowedFormats: source.allowedFormats,
      maxFileSize: source.maxFileSize,
      multipleFiles: source.multipleFiles,
      maxFileCount: source.maxFileCount,
      referenceFile: source.referenceFile,
      dueDate: source.dueDate,
      visibility: source.visibility,
      stage: source.stage,
      status: 'Active',
      submissionStatus: 'Not Submitted'
    });

    await duplicate.save();
    res.json({ success: true, requirement: duplicate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-requirements/:id/remind — Send submission reminder to client
documentRequirementRouter.post('/requirements/:id/remind', async (req, res) => {
  try {
    const requirement = await ProjectDocumentRequirement.findOne(getFilterById(req.params.id));
    if (!requirement) return res.status(404).json({ error: 'Requirement not found.' });

    await Notification.create({
      customId: `notif-${Date.now()}`,
      recipientId: requirement.clientId,
      recipientRole: 'client',
      title: 'Action Required: Document Submission Pending',
      message: `Friendly reminder: The document "${requirement.requirementName}" for "${requirement.projectTitle}" is pending your upload.`,
      type: 'document',
      link: '/client/dashboard'
    });

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: req.body.actorName || 'Admin',
      actorName: req.body.actorName || 'Admin',
      action: 'SEND_DOCUMENT_REMINDER',
      resourceType: 'Requirement',
      resourceId: requirement.customId,
      details: { requirementName: requirement.requirementName, clientId: requirement.clientId }
    });

    res.json({ success: true, message: 'Reminder notification dispatched to client.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. CLIENT PORTAL — "MY DOCUMENTS & REQUIREMENTS"
// ─────────────────────────────────────────────────────────────

// GET /api/document-submissions/client/:clientId — Client overview & requirements
documentRequirementRouter.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { projectId } = req.query;

    const filter = {
      clientId,
      visibility: 'Client-visible',
      status: { $ne: 'Archived' }
    };
    if (projectId) filter.projectId = projectId;

    const requirements = await ProjectDocumentRequirement.find(filter).sort({ createdAt: -1 });

    // Look up submissions
    const reqIds = requirements.map(r => r.customId);
    const submissions = await DocumentSubmission.find({ requirementId: { $in: reqIds } });
    const subMap = new Map();
    submissions.forEach(s => subMap.set(s.requirementId, s));

    // Combine requirement with latest submission data
    const list = requirements.map(r => {
      const sub = subMap.get(r.customId);
      const isOverdue = r.dueDate && new Date(r.dueDate) < new Date() && r.submissionStatus === 'Not Submitted';
      const effectiveStatus = isOverdue ? 'Overdue' : (r.submissionStatus || 'Not Submitted');

      return {
        ...r.toObject(),
        submissionStatus: effectiveStatus,
        submission: sub || null
      };
    });

    // Compute metrics
    const total = list.length;
    const submitted = list.filter(r => ['Submitted', 'Under Review', 'Approved'].includes(r.submissionStatus)).length;
    const approved = list.filter(r => r.submissionStatus === 'Approved').length;
    const pending = list.filter(r => r.submissionStatus === 'Not Submitted' || r.submissionStatus === 'Submitted').length;
    const revision = list.filter(r => r.submissionStatus === 'Revision Requested').length;
    const rejected = list.filter(r => r.submissionStatus === 'Rejected').length;
    const overdue = list.filter(r => r.submissionStatus === 'Overdue').length;
    const completionPercent = total > 0 ? Math.round((approved / total) * 100) : 0;

    res.json({
      metrics: {
        total,
        submitted,
        approved,
        pending,
        revision,
        rejected,
        overdue,
        completionPercent
      },
      requirements: list
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-submissions/upload — Client uploads a submission version
documentRequirementRouter.post('/upload-submission', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { requirementId, clientId, clientNotes = '', uploaderName = 'Client', uploaderEmail = '' } = req.body;
    if (!requirementId) {
      return res.status(400).json({ error: 'Requirement ID is required.' });
    }

    const requirement = await ProjectDocumentRequirement.findOne(getFilterById(requirementId));
    if (!requirement) {
      return res.status(404).json({ error: 'Document requirement record not found.' });
    }

    // Format & Size Validation against admin configuration
    const ext = path.extname(req.file.originalname).replace(/^\./, '').toLowerCase();
    if (requirement.allowedFormats && requirement.allowedFormats.length) {
      const normalizedAllowed = requirement.allowedFormats.map(f => f.toLowerCase().trim());
      if (!normalizedAllowed.includes(ext) && !normalizedAllowed.includes('*')) {
        // delete invalid file
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({
          error: `Format .${ext} is not allowed. Administrator specified allowed formats: ${requirement.allowedFormats.join(', ')}`
        });
      }
    }

    const maxBytes = (requirement.maxFileSize || 20) * 1024 * 1024;
    if (req.file.size > maxBytes) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({
        error: `File size exceeds the configured ${requirement.maxFileSize} MB limit for this requirement.`
      });
    }

    const sizeInKb = (req.file.size / 1024).toFixed(1) + ' KB';

    // Find or create DocumentSubmission container
    let submission = await DocumentSubmission.findOne({ requirementId: requirement.customId });
    let nextVersionNumber = 1;

    if (!submission) {
      submission = new DocumentSubmission({
        customId: `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        requirementId: requirement.customId,
        projectId: requirement.projectId,
        projectTitle: requirement.projectTitle,
        clientId: clientId || requirement.clientId,
        clientName: requirement.clientName,
        requirementName: requirement.requirementName,
        currentVersionNumber: 1,
        status: 'Submitted',
        versions: []
      });
    } else {
      nextVersionNumber = (submission.versions?.length || 0) + 1;
      submission.currentVersionNumber = nextVersionNumber;
      submission.status = 'Submitted';
    }

    const versionDoc = {
      versionNumber: nextVersionNumber,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      storagePath: `/uploads/${req.file.filename}`,
      fileSize: sizeInKb,
      fileSizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: {
        id: clientId || requirement.clientId,
        name: uploaderName,
        email: uploaderEmail,
        role: 'client'
      },
      clientNotes,
      reviewStatus: 'Submitted'
    };

    submission.versions.push(versionDoc);
    submission.updatedAt = new Date();
    await submission.save();

    // Update Requirement status
    requirement.submissionStatus = 'Submitted';
    requirement.submissionId = submission.customId;
    requirement.latestVersionNumber = nextVersionNumber;
    requirement.updatedAt = new Date();
    await requirement.save();

    // Notify Super Admin & Document Reviewers
    await Notification.create({
      customId: `notif-${Date.now()}`,
      recipientId: 'admin@nexuscraft.com',
      recipientRole: 'admin',
      title: 'New Document Submission Awaiting Review',
      message: `${uploaderName} uploaded v${nextVersionNumber} of "${requirement.requirementName}" for "${requirement.projectTitle}".`,
      type: 'document',
      link: '/admin/dashboard'
    });

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: clientId || 'Client',
      actorName: uploaderName,
      action: 'SUBMIT_DOCUMENT',
      resourceType: 'Submission',
      resourceId: submission.customId,
      details: {
        requirementName: requirement.requirementName,
        version: nextVersionNumber,
        fileName: req.file.originalname
      }
    });

    res.json({
      success: true,
      message: `Document version v${nextVersionNumber} uploaded successfully.`,
      submission,
      requirement
    });
  } catch (err) {
    console.error('Submission upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/document-submissions/:requirementId/history — Submission version history
documentRequirementRouter.get('/submissions/:requirementId/history', async (req, res) => {
  try {
    const submission = await DocumentSubmission.findOne({ requirementId: req.params.requirementId });
    if (!submission) {
      return res.json({ versions: [], currentVersionNumber: 0, status: 'Not Submitted' });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. ADMIN REVIEW WORKSPACE
// ─────────────────────────────────────────────────────────────

// GET /api/document-reviews — List submissions for review
documentRequirementRouter.get('/reviews', async (req, res) => {
  try {
    const { status, projectId, search } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (projectId) filter.projectId = projectId;
    if (search) {
      filter.$or = [
        { requirementName: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }

    const submissions = await DocumentSubmission.find(filter).sort({ updatedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-reviews/:id/approve — Admin approves document
documentRequirementRouter.post('/reviews/:id/approve', async (req, res) => {
  try {
    const submission = await DocumentSubmission.findOne(getFilterById(req.params.id));
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });

    const { reviewerId = 'Admin', reviewerName = 'Administrator', internalNotes = '' } = req.body;

    submission.status = 'Approved';
    const latestVersion = submission.versions[submission.versions.length - 1];
    if (latestVersion) {
      latestVersion.reviewStatus = 'Approved';
      latestVersion.reviewFeedback = {
        reason: 'Approved by Administrator',
        internalNotes,
        reviewedBy: reviewerId,
        reviewerName,
        reviewedAt: new Date()
      };
    }
    submission.updatedAt = new Date();
    await submission.save();

    // Update Project Requirement
    const requirement = await ProjectDocumentRequirement.findOne({ customId: submission.requirementId });
    if (requirement) {
      requirement.submissionStatus = 'Approved';
      requirement.updatedAt = new Date();
      await requirement.save();

      // Notify Client
      await Notification.create({
        customId: `notif-${Date.now()}`,
        recipientId: requirement.clientId,
        recipientRole: 'client',
        title: 'Document Approved',
        message: `Your submitted document "${requirement.requirementName}" has been approved by the technical triage team.`,
        type: 'document',
        link: '/client/dashboard'
      });
    }

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: reviewerId,
      actorName: reviewerName,
      action: 'APPROVE_DOCUMENT',
      resourceType: 'Submission',
      resourceId: submission.customId,
      details: { requirementName: submission.requirementName, projectTitle: submission.projectTitle }
    });

    res.json({ success: true, message: 'Document approved successfully.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-reviews/:id/request-revision — Admin requests changes
documentRequirementRouter.post('/reviews/:id/request-revision', async (req, res) => {
  try {
    const submission = await DocumentSubmission.findOne(getFilterById(req.params.id));
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });

    const {
      reason = 'Corrections required',
      instructions = 'Please review feedback and upload an updated document.',
      revisionDeadline = null,
      internalNotes = '',
      reviewerId = 'Admin',
      reviewerName = 'Administrator'
    } = req.body;

    submission.status = 'Revision Requested';
    const latestVersion = submission.versions[submission.versions.length - 1];
    if (latestVersion) {
      latestVersion.reviewStatus = 'Revision Requested';
      latestVersion.reviewFeedback = {
        reason,
        instructions,
        revisionDeadline: revisionDeadline ? new Date(revisionDeadline) : null,
        internalNotes,
        reviewedBy: reviewerId,
        reviewerName,
        reviewedAt: new Date()
      };
    }
    submission.updatedAt = new Date();
    await submission.save();

    // Update Requirement
    const requirement = await ProjectDocumentRequirement.findOne({ customId: submission.requirementId });
    if (requirement) {
      requirement.submissionStatus = 'Revision Requested';
      if (revisionDeadline) requirement.dueDate = new Date(revisionDeadline);
      requirement.updatedAt = new Date();
      await requirement.save();

      // Notify Client
      await Notification.create({
        customId: `notif-${Date.now()}`,
        recipientId: requirement.clientId,
        recipientRole: 'client',
        title: 'Document Revision Requested',
        message: `Changes requested for "${requirement.requirementName}". Reason: ${reason}. Please submit updated version.`,
        type: 'document',
        link: '/client/dashboard'
      });
    }

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: reviewerId,
      actorName: reviewerName,
      action: 'REQUEST_REVISION',
      resourceType: 'Submission',
      resourceId: submission.customId,
      details: {
        requirementName: submission.requirementName,
        reason,
        revisionDeadline
      }
    });

    res.json({ success: true, message: 'Revision request transmitted to client.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/document-reviews/:id/reject — Admin rejects document
documentRequirementRouter.post('/reviews/:id/reject', async (req, res) => {
  try {
    const submission = await DocumentSubmission.findOne(getFilterById(req.params.id));
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });

    const {
      reason = 'Document rejected due to non-compliance',
      instructions = '',
      internalNotes = '',
      reviewerId = 'Admin',
      reviewerName = 'Administrator'
    } = req.body;

    submission.status = 'Rejected';
    const latestVersion = submission.versions[submission.versions.length - 1];
    if (latestVersion) {
      latestVersion.reviewStatus = 'Rejected';
      latestVersion.reviewFeedback = {
        reason,
        instructions,
        internalNotes,
        reviewedBy: reviewerId,
        reviewerName,
        reviewedAt: new Date()
      };
    }
    submission.updatedAt = new Date();
    await submission.save();

    const requirement = await ProjectDocumentRequirement.findOne({ customId: submission.requirementId });
    if (requirement) {
      requirement.submissionStatus = 'Rejected';
      requirement.updatedAt = new Date();
      await requirement.save();

      await Notification.create({
        customId: `notif-${Date.now()}`,
        recipientId: requirement.clientId,
        recipientRole: 'client',
        title: 'Document Submission Rejected',
        message: `Your document "${requirement.requirementName}" was rejected. Reason: ${reason}`,
        type: 'document',
        link: '/client/dashboard'
      });
    }

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: reviewerId,
      actorName: reviewerName,
      action: 'REJECT_DOCUMENT',
      resourceType: 'Submission',
      resourceId: submission.customId,
      details: { requirementName: submission.requirementName, reason }
    });

    res.json({ success: true, message: 'Document marked as rejected.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. COMPLIANCE TELEMETRY & REPORTING
// ─────────────────────────────────────────────────────────────

// GET /api/document-requirements/compliance/overview
documentRequirementRouter.get('/compliance/overview', async (req, res) => {
  try {
    const projects = await ProjectRequest.find().sort({ createdAt: -1 });
    const allReqs = await ProjectDocumentRequirement.find({ status: { $ne: 'Archived' } });

    const projectCompliance = projects.map(p => {
      const pId = p.customId || p._id;
      const reqs = allReqs.filter(r => r.projectId === pId);
      const total = reqs.length;
      const approved = reqs.filter(r => r.submissionStatus === 'Approved').length;
      const pendingReview = reqs.filter(r => r.submissionStatus === 'Submitted').length;
      const overdue = reqs.filter(r => {
        return r.dueDate && new Date(r.dueDate) < new Date() && r.submissionStatus === 'Not Submitted';
      }).length;
      const missingMandatory = reqs.filter(r => r.mandatory && r.submissionStatus !== 'Approved').length;

      const completion = total > 0 ? Math.round((approved / total) * 100) : 100;
      return {
        projectId: pId,
        projectTitle: p.projectTitle,
        clientId: p.clientId,
        clientName: p.clientName,
        totalRequirements: total,
        approvedDocuments: approved,
        pendingReview,
        overdue,
        missingMandatory,
        completionPercent: completion,
        isCompliant: missingMandatory === 0 && total > 0
      };
    });

    const totalProjects = projectCompliance.length;
    const fullyCompliantProjects = projectCompliance.filter(p => p.isCompliant).length;
    const pendingReviewTotal = allReqs.filter(r => r.submissionStatus === 'Submitted').length;
    const overdueTotal = allReqs.filter(r => r.dueDate && new Date(r.dueDate) < new Date() && r.submissionStatus === 'Not Submitted').length;

    res.json({
      summary: {
        totalProjects,
        fullyCompliantProjects,
        nonCompliantProjects: totalProjects - fullyCompliantProjects,
        pendingReviewTotal,
        overdueTotal,
        totalRequirementsActive: allReqs.length
      },
      projects: projectCompliance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/document-requirements/compliance/export-csv
documentRequirementRouter.get('/compliance/export-csv', async (req, res) => {
  try {
    const requirements = await ProjectDocumentRequirement.find().sort({ createdAt: -1 });
    const headers = [
      'Requirement ID',
      'Requirement Name',
      'Project ID',
      'Project Title',
      'Client Name',
      'Category',
      'Mandatory',
      'Stage',
      'Allowed Formats',
      'Max Size (MB)',
      'Due Date',
      'Submission Status',
      'Created At'
    ];

    const rows = requirements.map(r => [
      `"${r.customId}"`,
      `"${r.requirementName.replace(/"/g, '""')}"`,
      `"${r.projectId}"`,
      `"${r.projectTitle.replace(/"/g, '""')}"`,
      `"${(r.clientName || '').replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.mandatory ? 'Yes' : 'No',
      `"${r.stage}"`,
      `"${(r.allowedFormats || []).join('; ')}"`,
      r.maxFileSize || 20,
      r.dueDate ? new Date(r.dueDate).toISOString().split('T')[0] : 'None',
      `"${r.submissionStatus}"`,
      new Date(r.createdAt).toISOString().split('T')[0]
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="NexusCraft_Document_Compliance.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
