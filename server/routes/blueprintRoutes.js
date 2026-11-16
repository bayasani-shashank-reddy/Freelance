import express from 'express';
import crypto from 'crypto';
import { ProjectBlueprint } from '../models/ProjectBlueprint.js';
import { ProjectRequest } from '../models/IdeaSubmission.js';
import { Notification } from '../models/Notification.js';
import { ProjectBlueprintVersion } from '../models/ProjectBlueprintVersion.js';

export const blueprintRouter = express.Router();

// GET /api/blueprints/:projectId
blueprintRouter.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const blueprint = await ProjectBlueprint.findOne({
      $or: [{ projectId }, { customId: projectId }]
    }).sort({ version: -1 });

    if (!blueprint) {
      return res.status(404).json({ error: 'No blueprint found for this project.' });
    }
    res.json(blueprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blueprints/generate — Generate comprehensive 17-section blueprint
blueprintRouter.post('/generate', async (req, res) => {
  try {
    const { projectId, title, rawIdea = '', category = 'Web Application' } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project ID and title are required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    let blueprintData = null;

    if (apiKey) {
      try {
        const prompt = `You are a Principal Software Architect at NexusCraft. Generate an exhaustive technical blueprint for the project: "${title}".
Project Category: ${category}.
Client's Description: "${rawIdea}".

Generate a JSON object containing EXACTLY these 17 fields:
1. "projectOverview": String (detailed executive architecture overview)
2. "problemStatement": String (what real-world friction this addresses)
3. "proposedSolution": String (the product vision & implementation)
4. "mainModules": Array of 4-6 strings (e.g. "Identity & RBAC", "Workspace Engine")
5. "essentialFeatures": Array of 5-8 strings (Must-have features for MVP)
6. "recommendedFeatures": Array of 4-6 strings (High value secondary features)
7. "optionalFeatures": Array of 3-5 strings (Post-launch enhancements)
8. "functionalRequirements": Array of 5-8 strings
9. "nonFunctionalRequirements": Array of 4-6 strings (Security, performance, scalability)
10. "suggestedTechnologies": Array of 6-10 strings (Frontend, backend, DB, cloud)
11. "thirdPartyIntegrations": Array of 3-6 strings (Payment, Email, Auth, Analytics)
12. "projectComplexity": One of "Low", "Medium", "High", "Enterprise"
13. "developmentPhases": Array of objects: [{"phase": "Phase 1: Discovery & Wireframing", "duration": "2 weeks", "description": "..."}, ...] (3-4 phases)
14. "risks": Array of 3-5 technical risks
15. "dependencies": Array of 3-5 external dependencies
16. "clarificationQuestions": Array of 3-5 key scoping questions
17. "estimatedDevelopmentEffort": String (e.g. "180 - 240 engineering hours")

Respond ONLY with valid JSON. No markdown backticks.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json|```/g, '').trim();
          blueprintData = JSON.parse(cleaned);
        }
      } catch (geminiErr) {
        console.warn('Gemini blueprint error, generating structured fallback:', geminiErr.message);
      }
    }

    // Heuristic structured fallback if Gemini is offline
    if (!blueprintData) {
      blueprintData = {
        projectOverview: `NexusCraft Architectural Blueprint for "${title}". A high-performance, modern digital solution architected for seamless user intake, cloud resilience, and dynamic data visualization.`,
        problemStatement: `Users require an automated, streamlined solution to manage workflows without fragmented third-party friction.`,
        proposedSolution: `A scalable web platform delivering intuitive interfaces, robust role-based access control, and real-time state synchronization.`,
        mainModules: ['Authentication & Role Management', 'Core Workflow Engine', 'Document & Asset Management', 'Telemetry & Analytics Dashboard'],
        essentialFeatures: ['Secure User Authentication & Session Security', 'Interactive Task & Request Intake', 'Real-time Status State Tracking', 'Exportable Reports & Data Visualization', 'Responsive Multi-Device Layout'],
        recommendedFeatures: ['Automated Email & In-App Notification Alerts', 'Granular Role-Based Permissions', 'Audit & Activity Logging'],
        optionalFeatures: ['Webhook & REST API Extensibility', 'Dark/Light Theme Customization', 'AI-assisted Content Summaries'],
        functionalRequirements: ['System must enforce strict input sanitization', 'System must support role-separated dashboards', 'System must log state transitions'],
        nonFunctionalRequirements: ['Sub-200ms API response latency', 'SOC-2 compliant private data storage', '99.9% uptime availability'],
        suggestedTechnologies: ['React 19', 'TypeScript', 'Node.js Express', 'MongoDB Atlas', 'Tailwind CSS v4', 'Vite'],
        thirdPartyIntegrations: ['SendGrid / SMTP Email', 'AWS S3 / Private Cloud Storage', 'Stripe / Razorpay Payment Engine'],
        projectComplexity: 'Medium',
        developmentPhases: [
          { phase: 'Phase 1: Architecture & UI/UX Foundations', duration: '2 weeks', description: 'Design system, data schemas, and API contracts.' },
          { phase: 'Phase 2: Core Platform Development', duration: '3 weeks', description: 'Primary CRUD workflows, authentication, and state management.' },
          { phase: 'Phase 3: QA, Security Hardening & Release', duration: '1 week', description: 'Cross-browser testing, penetration tests, and production deployment.' }
        ],
        risks: ['Scope creep during intake refinement', 'Third-party API rate limits', 'Edge-case handling in asynchronous workflows'],
        dependencies: ['Node.js runtime environment', 'MongoDB database cluster', 'Cloud file storage provider'],
        clarificationQuestions: ['What is the expected initial concurrent user load?', 'Are there specific regulatory compliance requirements (e.g. GDPR)?'],
        estimatedDevelopmentEffort: '160 - 220 engineering hours'
      };
    }

    const customId = `bp-${Date.now()}`;
    const blueprint = new ProjectBlueprint({
      customId,
      projectId,
      title,
      ...blueprintData,
      generatedAt: new Date(),
      updatedAt: new Date()
    });

    await blueprint.save();
    res.status(201).json({ success: true, blueprint });
  } catch (err) {
    console.error('Blueprint generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/blueprints/:id/approve — Admin approves blueprint
blueprintRouter.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const blueprint = await ProjectBlueprint.findOne({
      $or: [{ customId: id }, { projectId: id }]
    });

    if (!blueprint) {
      return res.status(404).json({ error: 'Blueprint not found.' });
    }

    blueprint.approvedByAdmin = true;
    blueprint.approvedAt = new Date();
    blueprint.status = 'admin_approved';
    await blueprint.save();

    res.json({ success: true, blueprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/blueprints/:id/share-client — Admin shares blueprint with client
blueprintRouter.patch('/:id/share-client', async (req, res) => {
  try {
    const { id } = req.params;
    const blueprint = await ProjectBlueprint.findOne({
      $or: [{ customId: id }, { projectId: id }]
    });

    if (!blueprint) {
      return res.status(404).json({ error: 'Blueprint not found.' });
    }

    blueprint.status = 'client_shared';
    await blueprint.save();

    res.json({ success: true, blueprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/blueprints/:id/client-edit — Client Blueprint Editor (Section B)
blueprintRouter.put('/:id/client-edit', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectOverview,
      developmentPhases,
      essentialFeatures,
      mainModules,
      clientNotes = '',
      submitForReview = false,
      clientName = 'Client'
    } = req.body;

    const blueprint = await ProjectBlueprint.findOne({
      $or: [{ customId: id }, { projectId: id }]
    });

    if (!blueprint) {
      return res.status(404).json({ error: 'Blueprint not found.' });
    }

    // Save client proposal without overwriting admin approved state
    if (developmentPhases !== undefined) blueprint.developmentPhases = developmentPhases;
    if (projectOverview !== undefined) blueprint.projectOverview = projectOverview;
    if (essentialFeatures !== undefined) blueprint.essentialFeatures = essentialFeatures;
    if (mainModules !== undefined) blueprint.mainModules = mainModules;

    if (submitForReview) {
      blueprint.status = 'client_proposed_review';
      // Notify Admin
      await Notification.create({
        customId: `notif-${Date.now()}`,
        recipientId: 'admin',
        recipientRole: 'admin',
        title: 'Client Proposed Blueprint Adjustments',
        message: `${clientName} submitted revised milestones/features for "${blueprint.title}".`,
        type: 'info',
        link: '/admin/requests'
      });
    }

    blueprint.updatedAt = new Date();
    await blueprint.save();

    res.json({
      success: true,
      blueprint,
      message: submitForReview ? 'Proposed changes submitted for admin review.' : 'Draft blueprint saved.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blueprints/:id/ai-suggest — Request AI suggestions for milestones & modules
blueprintRouter.post('/:id/ai-suggest', async (req, res) => {
  try {
    const { id } = req.params;
    const { focus = 'milestones' } = req.body;

    const blueprint = await ProjectBlueprint.findOne({
      $or: [{ customId: id }, { projectId: id }]
    });

    if (!blueprint) return res.status(404).json({ error: 'Blueprint not found.' });

    const suggestions = [
      {
        title: 'Phase 1.5: Security & Regulatory Compliance Spike',
        duration: '1 Week',
        deliverables: ['OAuth Flow Verification', 'Data Sanitization Audit', 'Rate Limiter Rules']
      },
      {
        title: 'Phase 2.5: Interactive Telemetry & Reporting Dashboards',
        duration: '1.5 Weeks',
        deliverables: ['Real-time Progress Widgets', 'Exportable PDF Blueprints', 'Audit Log Feed']
      }
    ];

    res.json({
      success: true,
      suggestions,
      moduleIdeas: [
        'Automated CI/CD Verification Runner',
        'End-to-End Encryption Key Vault',
        'Role-Based Activity Webhook Stream'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blueprints/:projectId/versions — Get Blueprint Version History (ID 47)
blueprintRouter.get('/:projectId/versions', async (req, res) => {
  try {
    const versions = await ProjectBlueprintVersion.find({ projectId: req.params.projectId }).sort({ versionNumber: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blueprints/:projectId/share-link — Generate secure read-only tokenized link (ID 51)
blueprintRouter.post('/:projectId/share-link', async (req, res) => {
  try {
    const blueprint = await ProjectBlueprint.findOne({
      $or: [{ projectId: req.params.projectId }, { customId: req.params.projectId }]
    });

    if (!blueprint) return res.status(404).json({ error: 'Blueprint not found.' });

    const shareToken = crypto.randomBytes(24).toString('hex');
    blueprint.shareToken = shareToken;
    blueprint.shareExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await blueprint.save();

    res.json({
      success: true,
      shareToken,
      shareUrl: `/#/blueprint/share/${shareToken}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blueprints/shared/:token — Public read-only blueprint inspection (ID 51)
blueprintRouter.get('/shared/:token', async (req, res) => {
  try {
    const blueprint = await ProjectBlueprint.findOne({
      shareToken: req.params.token,
      shareExpiresAt: { $gt: new Date() }
    });

    if (!blueprint) {
      return res.status(404).json({ error: 'Shared blueprint link is invalid or has expired.' });
    }

    // Return sanitized architectural blueprint without private internal admin notes
    res.json({
      success: true,
      title: blueprint.title,
      category: blueprint.category,
      projectOverview: blueprint.projectOverview,
      problemStatement: blueprint.problemStatement,
      proposedSolution: blueprint.proposedSolution,
      essentialFeatures: blueprint.essentialFeatures,
      systemArchitecture: blueprint.systemArchitecture,
      techStack: blueprint.techStack,
      dataModels: blueprint.dataModels,
      securityConsiderations: blueprint.securityConsiderations,
      mainModules: blueprint.mainModules,
      integrationPoints: blueprint.integrationPoints,
      potentialRisks: blueprint.potentialRisks,
      developmentPhases: blueprint.developmentPhases,
      estimatedTimelineWeeks: blueprint.estimatedTimelineWeeks,
      estimatedDevelopmentEffort: blueprint.estimatedDevelopmentEffort,
      version: blueprint.version
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

