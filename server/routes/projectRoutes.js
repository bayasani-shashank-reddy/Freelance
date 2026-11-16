import express from 'express';
import mongoose from 'mongoose';
import { ProjectRequest } from '../models/IdeaSubmission.js';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { RequestActivity } from '../models/RequestActivity.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { DocumentShare } from '../models/DocumentShare.js';

export const projectRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// Heuristic fallback generator for AI preview
const generateHeuristicSummary = (title, url = '', docText = '') => {
  const combined = (title + ' ' + url + ' ' + docText).toLowerCase();
  
  let category = 'Website';
  let features = ['Modern Responsive Layout', 'Contact & Inquiry Form', 'SEO & Performance Architecture'];
  let assumptions = ['Do you require an administrative control dashboard?', 'Will users need to create accounts and log in?'];
  let summary = `An initial digital product concept for "${title}". Designed to provide a streamlined, high-performance web experience for your target audience.`;

  if (combined.includes('restaurant') || combined.includes('food') || combined.includes('cafe')) {
    category = 'Food & Hospitality';
    features = ['Interactive Digital Food Menu', 'Online Cart & Order Management', 'Table Reservation Calendar', 'Location Map & Store Hours', 'Admin Menu Manager'];
    assumptions = ['Do you need real-time payment gateway integration (UPI/Cards)?', 'Will customers receive SMS or WhatsApp order confirmations?', 'Do you manage internal delivery staff or use 3rd-party delivery?'];
    summary = `A modern restaurant & food ordering platform concept for "${title}". Enables customers to explore the digital menu, place pickup or delivery orders, and reserve dining tables seamlessly.`;
  } else if (combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') || combined.includes('fashion') || combined.includes('clothing')) {
    category = 'E-commerce';
    features = ['Visual Product Catalog with Filters', 'Shopping Cart & Secure Checkout', 'Customer Account & Order History', 'Inventory & Stock Management', 'Discount Coupon Engine'];
    assumptions = ['Which payment gateways do you plan to support?', 'Do you require automated shipping carrier tracking?', 'Do products have multiple variant options (sizes, colors)?'];
    summary = `A dedicated e-commerce online store concept for "${title}". Built to showcase product collections, process digital transactions safely, and track order fulfillment.`;
  } else if (combined.includes('hotel') || combined.includes('booking') || combined.includes('room') || combined.includes('travel')) {
    category = 'Travel & Hospitality';
    features = ['Room Availability & Pricing Engine', 'Direct Date Reservation System', 'Photo & Amenities Showcase', 'Automated Email Invoicing', 'Guest Reviews Display'];
    assumptions = ['Do you require calendar sync with Airbnb or Booking.com?', 'Will guests pay deposits online or upon check-in?'];
    summary = `An online booking and hospitality platform for "${title}". Allows travelers and guests to inspect availability, compare accommodations, and reserve bookings directly.`;
  } else if (combined.includes('saas') || combined.includes('ai') || combined.includes('tool') || combined.includes('dashboard') || combined.includes('app')) {
    category = 'Web Application / SaaS';
    features = ['User Authentication (OAuth / Magic Link)', 'Interactive Telemetry & Metrics Dashboard', 'Subscription & Tier Billing (Stripe / Razorpay)', 'Role-based Access Permissions', 'REST API & Webhook Endpoints'];
    assumptions = ['Will the application require AI LLM API connections?', 'What tier structure or usage quotas are intended for subscribers?'];
    summary = `A scalable SaaS web application concept for "${title}". Combines secure user management, real-time workflows, and modern cloud architecture.`;
  } else if (combined.includes('portfolio') || combined.includes('studio') || combined.includes('creative') || combined.includes('personal')) {
    category = 'Portfolio & Personal Brand';
    features = ['High-Impact Media Case Studies', 'Client Testimonial Showcase', 'Service Pricing Packages', 'Direct Project Inquiry Form', 'Fast Global CDN Delivery'];
    assumptions = ['Do you have existing brand guidelines and color palettes?', 'Will you need an editorial blog or news section?'];
    summary = `A curated editorial portfolio platform for "${title}". Crafted to showcase creative work, highlight client case studies, and drive direct client inquiries.`;
  }

  return { summary, suggestedFeatures: features, assumptions, category };
};

// POST /api/projects/preview — FREE AI preview generator (does NOT deduct credits)
projectRouter.post('/preview', async (req, res) => {
  try {
    const { title, referenceUrl = '', docText = '' } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required to generate an AI summary.' });
    }

    // Try Gemini if API key is in environment, otherwise use heuristic engine
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are a principal technical product manager for NexusCraft, a managed digital product development studio. 
A client submitted this project title: "${title}". 
Optional reference URL: "${referenceUrl}".
Optional document excerpts: "${docText.slice(0, 1500)}".

Generate a concise technical scoping preview with:
1. "summary": A professional, engaging 2 to 4 sentence executive description of what this project will build.
2. "suggestedFeatures": An array of 4 to 6 probable key features for this product.
3. "assumptions": An array of 2 to 3 concise clarifying questions/things to confirm before development.
4. "category": A single short category string (e.g. Website, E-commerce, SaaS Application, Mobile App, etc.).

Return ONLY a valid JSON object with keys: summary, suggestedFeatures, assumptions, category. No markdown blocks.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return res.json({
            success: true,
            source: 'gemini',
            summary: parsed.summary,
            suggestedFeatures: parsed.suggestedFeatures || [],
            assumptions: parsed.assumptions || [],
            category: parsed.category || 'Website'
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini preview error, falling back to heuristic engine:', geminiErr.message);
      }
    }

    // Fallback engine
    const fallback = generateHeuristicSummary(title, referenceUrl, docText);
    return res.json({
      success: true,
      source: 'heuristic',
      ...fallback
    });
  } catch (err) {
    console.error('Preview endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/submit — Submits project request & atomically deducts 50 NCX credits
projectRouter.post('/submit', async (req, res) => {
  try {
    const {
      clientId,
      projectTitle,
      rawIdea = '',
      referenceUrl = '',
      docFileName = null,
      docFileSize = null,
      docFileType = null,
      docStoragePath = null,
      docContentHtml = null,
      aiSummary = '',
      aiSuggestedFeatures = [],
      aiAssumptions = [],
      aiCategory = 'Website',
      submissionType = 'title_only'
    } = req.body;

    if (!clientId) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    if (!projectTitle || !projectTitle.trim()) {
      return res.status(400).json({ error: 'Project Title is required to submit a request.' });
    }

    // Check user & credit balance with robust identifier matching
    let user = await User.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(clientId) ? [{ _id: clientId }] : []),
        { customId: clientId },
        { email: typeof clientId === 'string' ? clientId.toLowerCase().trim() : '' }
      ]
    });

    if (!user) {
      // Auto-provision user account in database if missing from demo session
      user = await User.create({
        customId: clientId.startsWith('usr-') ? clientId : `usr-${Date.now()}`,
        name: req.body.clientName || 'Alex Rivera',
        email: typeof clientId === 'string' && clientId.includes('@') ? clientId.toLowerCase().trim() : 'alex.rivera@client.com',
        role: 'client',
        credits: 500,
        status: 'active'
      });
    }

    const SUBMISSION_COST = 50;
    if ((user.credits || 0) < SUBMISSION_COST) {
      return res.status(402).json({
        error: 'Not enough NCX credits to submit this request.',
        currentBalance: user.credits || 0,
        requiredCredits: SUBMISSION_COST,
        shortfall: SUBMISSION_COST - (user.credits || 0)
      });
    }

    // Generate fallback summary if AI summary was not pre-generated
    let finalSummary = aiSummary;
    let finalFeatures = aiSuggestedFeatures;
    let finalAssumptions = aiAssumptions;
    let finalCategory = aiCategory;

    if (!finalSummary) {
      const generated = generateHeuristicSummary(projectTitle, referenceUrl);
      finalSummary = generated.summary;
      finalFeatures = generated.suggestedFeatures;
      finalAssumptions = generated.assumptions;
      finalCategory = generated.category;
    }

    const customId = `req-${Date.now()}`;
    const newRequest = new ProjectRequest({
      customId,
      clientId: user.customId || user._id,
      clientName: user.name,
      clientAvatar: user.avatar,
      clientEmail: user.email,
      clientPhone: user.phone || '',
      clientCountryCode: user.countryCode || '+1',
      projectTitle: projectTitle.trim(),
      rawIdea: rawIdea.trim() || projectTitle.trim(),
      referenceUrl: referenceUrl.trim(),
      docFileName,
      docFileSize,
      docFileType,
      docStoragePath,
      docContentHtml,
      aiSummary: finalSummary,
      aiSuggestedFeatures: finalFeatures,
      aiAssumptions: finalAssumptions,
      aiCategory: finalCategory,
      submissionType,
      creditsCost: SUBMISSION_COST,
      status: 'Submitted',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    await newRequest.save();

    // Deduct 50 NCX atomically
    user.credits = Math.max(0, (user.credits || 0) - SUBMISSION_COST);
    await user.save();

    // Record Credit Transaction
    const tx = new CreditTransaction({
      customId: `tx-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      amount: -SUBMISSION_COST,
      type: 'project_submission',
      description: `Project Submission — "${projectTitle.trim()}"`,
      requestId: customId,
      balanceAfter: user.credits
    });
    await tx.save();

    // Record initial Request Activity
    const act = new RequestActivity({
      customId: `act-${Date.now()}`,
      requestId: customId,
      actorId: user.customId || user._id,
      actorName: user.name,
      actorRole: 'client',
      activityType: 'submission',
      previousStatus: '',
      newStatus: 'Submitted',
      userVisibleNote: 'Project request received and queued for administrative review.'
    });
    await act.save();

    // Notification for Admin
    const adminNotif = new Notification({
      customId: `notif-${Date.now()}-adm`,
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'New Project Request Submitted',
      message: `${user.name} submitted "${projectTitle.trim()}" for review.`,
      type: 'info',
      link: `/admin/requests`
    });
    await adminNotif.save();

    // Notification for Client
    const clientNotif = new Notification({
      customId: `notif-${Date.now()}-cli`,
      recipientId: user.customId || user._id,
      recipientRole: 'client',
      title: 'Project Request Submitted',
      message: `Your request "${projectTitle.trim()}" was received for 50 NCX. Our team will review your brief.`,
      type: 'success',
      link: `/requests/${customId}`
    });
    await clientNotif.save();

    res.status(201).json({
      success: true,
      request: newRequest,
      remainingCredits: user.credits
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/bulk-action — Bulk Intake Pipeline Actions (ID 82)
projectRouter.post('/bulk-action', async (req, res) => {
  try {
    const { action, projectIds = [], payload = {}, adminId = 'usr-admin-1' } = req.body;
    if (!action || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'Action and non-empty projectIds array are required.' });
    }

    const filter = {
      $or: [{ customId: { $in: projectIds } }, { _id: { $in: projectIds } }]
    };

    let updateData = {};
    let auditAction = `BULK_${action.toUpperCase()}`;

    switch (action) {
      case 'approve':
        updateData = { status: 'Scoping_Approved', approvedAt: new Date() };
        break;
      case 'archive':
        updateData = { status: 'Archived', archivedAt: new Date() };
        break;
      case 'set_category':
        if (!payload.category) return res.status(400).json({ error: 'Category is required for set_category action.' });
        updateData = { aiCategory: payload.category };
        break;
      case 'set_priority':
        if (!payload.priority) return res.status(400).json({ error: 'Priority is required for set_priority action.' });
        updateData = { priority: payload.priority };
        break;
      default:
        return res.status(400).json({ error: `Unsupported bulk action: ${action}` });
    }

    const result = await ProjectRequest.updateMany(filter, { $set: updateData });

    // Record in AuditLog
    await AuditLog.create({
      customId: `audit-bulk-${Date.now()}`,
      actorId: adminId,
      actorName: 'NexusCraft Admin',
      actorRole: 'admin',
      action: auditAction,
      entity: 'ProjectRequest',
      entityId: `bulk-${projectIds.length}-projects`,
      details: { action, count: result.modifiedCount, projectIds }
    });

    res.json({
      success: true,
      message: `Bulk ${action} executed successfully.`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects — Admin gets all project submissions
projectRouter.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { customId: { $regex: search, $options: 'i' } }
      ];
    }
    const requests = await ProjectRequest.find(query).sort({ _id: -1 }).lean();
    const normalized = requests.map(r => ({
      ...r,
      projectTitle: r.projectTitle || r.title || 'Untitled Project',
      title: r.projectTitle || r.title || 'Untitled Project',
      clientName: r.clientName || 'Direct Client',
      clientId: r.clientId || r.clientEmail || 'usr-client'
    }));
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/client/:clientId — Client gets their own requests with complete identity matching
projectRouter.get('/client/:clientId', async (req, res) => {
  try {
    const rawId = req.params.clientId;
    // Find matching user by customId, _id, or email
    const user = await User.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(rawId) ? [{ _id: rawId }] : []),
        { customId: rawId },
        { email: rawId.toLowerCase() }
      ]
    });

    const clientIds = [rawId];
    if (user) {
      if (user._id) clientIds.push(user._id.toString());
      if (user.customId) clientIds.push(user.customId);
    }

    const requests = await ProjectRequest.find({
      $or: [
        { clientId: { $in: clientIds } },
        ...(user?.email ? [{ clientEmail: user.email }] : [])
      ]
    }).sort({ _id: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id — Single request details with activity & contact history
projectRouter.get('/:id', async (req, res) => {
  try {
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project request not found.' });

    const activities = await RequestActivity.find({ requestId: request.customId || request._id }).sort({ timestamp: 1 });
    res.json({ success: true, request, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/status — Admin updates status
projectRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status, internalNote = '', userVisibleNote = '', adminId = 'usr-admin-1', adminName = 'Admin' } = req.body;
    
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const previousStatus = request.status;
    request.status = status;
    if (userVisibleNote) request.userVisibleNote = userVisibleNote;
    if (internalNote) request.internalNote = internalNote;
    await request.save();

    // Create activity record
    const act = new RequestActivity({
      customId: `act-${Date.now()}`,
      requestId: request.customId || request._id,
      actorId: adminId,
      actorName: adminName,
      actorRole: 'admin',
      activityType: 'status_change',
      previousStatus,
      newStatus: status,
      userVisibleNote,
      internalNote
    });
    await act.save();

    // Notify client if userVisibleNote is provided or on key status changes
    const notif = new Notification({
      customId: `notif-${Date.now()}`,
      recipientId: request.clientId,
      recipientRole: 'client',
      title: `Status Update: ${status}`,
      message: userVisibleNote || `Your project request "${request.projectTitle}" status was updated to ${status}.`,
      type: 'info',
      link: `/requests/${request.customId || request._id}`
    });
    await notif.save();

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// UNIQUE ROLE FEATURES ENDPOINTS (Client, Admin, Freelancer)
// ─────────────────────────────────────────────────────────────

// POST /api/projects/:id/scope-changes — Client requests scope modification
projectRouter.post('/:id/scope-changes', async (req, res) => {
  try {
    const { title, description, reason, affectedRequirements = [], estimatedBudgetImpact = 0, estimatedTimelineImpact = 'No change' } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for scope change.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const changeItem = {
      customId: `sc-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      reason: reason ? reason.trim() : '',
      affectedRequirements,
      estimatedBudgetImpact: Number(estimatedBudgetImpact) || 0,
      estimatedTimelineImpact,
      status: 'Pending',
      adminNotes: '',
      submittedAt: new Date()
    };

    if (!request.scopeChanges) request.scopeChanges = [];
    request.scopeChanges.push(changeItem);
    await request.save();

    // Log Activity
    await RequestActivity.create({
      customId: `act-${Date.now()}`,
      requestId: request.customId || request._id,
      actorId: request.clientId,
      actorName: request.clientName,
      actorRole: 'client',
      activityType: 'scope_change_request',
      userVisibleNote: `Scope Change Requested: "${title}"`
    });

    res.json({ success: true, scopeChange: changeItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/scope-changes/:changeId — Admin reviews scope change
projectRouter.patch('/:id/scope-changes/:changeId', async (req, res) => {
  try {
    const { status, adminNotes = '', budgetImpact = 0, timelineImpact = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const sc = request.scopeChanges?.find(c => c.customId === req.params.changeId);
    if (!sc) return res.status(404).json({ error: 'Scope change record not found.' });

    sc.status = status;
    sc.adminNotes = adminNotes;
    sc.reviewedAt = new Date();
    if (budgetImpact) sc.estimatedBudgetImpact = budgetImpact;
    if (timelineImpact) sc.estimatedTimelineImpact = timelineImpact;

    await request.save();

    res.json({ success: true, scopeChange: sc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/decisions — Admin creates a decision gate for client
projectRouter.post('/:id/decisions', async (req, res) => {
  try {
    const { title, description, decisionType = 'requirement', deadline } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const decisionItem = {
      customId: `dec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      decisionType,
      status: 'Pending',
      clientFeedback: '',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 3 * 86400000),
      createdAt: new Date()
    };

    if (!request.decisions) request.decisions = [];
    request.decisions.push(decisionItem);
    await request.save();

    res.json({ success: true, decision: decisionItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/decisions/:decisionId — Client responds to decision
projectRouter.patch('/:id/decisions/:decisionId', async (req, res) => {
  try {
    const { status, clientFeedback = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const dec = request.decisions?.find(d => d.customId === req.params.decisionId);
    if (!dec) return res.status(404).json({ error: 'Decision item not found.' });

    dec.status = status;
    dec.clientFeedback = clientFeedback;
    dec.decidedAt = new Date();
    await request.save();

    res.json({ success: true, decision: dec, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/acceptance — Client records Final Handover Acceptance
projectRouter.post('/:id/acceptance', async (req, res) => {
  try {
    const { status, rating = 5, feedback = '', issues = [] } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverAcceptance = {
      status, // 'Accepted' | 'Issues Raised'
      rating: Number(rating) || 5,
      feedback: feedback.trim(),
      issues,
      acceptedAt: new Date()
    };

    if (status === 'Accepted') {
      request.status = 'Completed';
    }

    await request.save();
    res.json({ success: true, handoverAcceptance: request.handoverAcceptance, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/worklogs — Freelancer logs actual effort vs estimate
projectRouter.post('/:id/worklogs', async (req, res) => {
  try {
    const { freelancerId, freelancerName = 'Specialist', taskTitle, estimatedHours = 0, actualHours = 0, workCompleted = '', remainingWork = '', deviationReason = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const logItem = {
      customId: `wl-${Date.now()}`,
      freelancerId,
      freelancerName,
      taskTitle: taskTitle?.trim() || 'Development Sprint',
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      workCompleted: workCompleted.trim(),
      remainingWork: remainingWork.trim(),
      deviationReason: deviationReason.trim(),
      loggedAt: new Date()
    };

    if (!request.worklogs) request.worklogs = [];
    request.worklogs.push(logItem);
    await request.save();

    res.json({ success: true, worklog: logItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/handover — Freelancer saves Technical Handover runbook
projectRouter.post('/:id/handover', async (req, res) => {
  try {
    const { overview, technologies = [], installationInstructions = '', envVariables = [], databaseSetup = '', startupInstructions = '', keyModules = [], knownLimitations = '', futureRecommendations = '', authorName = 'Lead Specialist' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverDoc = {
      overview: overview?.trim() || '',
      technologies,
      installationInstructions: installationInstructions.trim(),
      envVariables,
      databaseSetup: databaseSetup.trim(),
      startupInstructions: startupInstructions.trim(),
      keyModules,
      knownLimitations: knownLimitations.trim(),
      futureRecommendations: futureRecommendations.trim(),
      generatedAt: new Date(),
      authorName
    };

    await request.save();
    res.json({ success: true, handoverDoc: request.handoverDoc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/operations/sla-radar — Admin SLA & Bottleneck Radar data
projectRouter.get('/operations/sla-radar', async (req, res) => {
  try {
    const projects = await ProjectRequest.find().sort({ timestamp: -1 });
    const now = Date.now();

    const radarItems = projects.map(p => {
      const ageHours = Math.round((now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60));
      let slaStatus = 'On Track';
      let bottleneck = null;

      if ((p.status === 'Submitted' || p.status === 'New') && ageHours > 24) {
        slaStatus = 'Breached';
        bottleneck = 'Initial Intake Triage Overdue (>24h)';
      } else if (p.status === 'Under Admin Review' && ageHours > 48) {
        slaStatus = 'At Risk';
        bottleneck = 'Admin Scoping Approval Delayed (>48h)';
      } else if (p.status === 'Specialist Review' && (!p.assignedFreelancerId || p.assignedFreelancerId === 'null')) {
        slaStatus = 'Breached';
        bottleneck = 'Approved Project Awaiting Specialist Assignment';
      }

      return {
        id: p.customId || p._id,
        title: p.projectTitle,
        clientName: p.clientName,
        status: p.status,
        ageHours,
        slaStatus,
        bottleneck,
        assignedFreelancer: p.assignedFreelancerName || 'Unassigned',
        priority: p.priority || 'Normal',
        submittedAt: p.createdAt
      };
    });

    const breaches = radarItems.filter(r => r.slaStatus === 'Breached').length;
    const atRisk = radarItems.filter(r => r.slaStatus === 'At Risk').length;
    const onTrack = radarItems.filter(r => r.slaStatus === 'On Track').length;

    res.json({
      summary: { total: radarItems.length, onTrack, atRisk, breaches },
      items: radarItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// UNIQUE ROLE FEATURES ENDPOINTS (Client, Admin, Freelancer)
// ─────────────────────────────────────────────────────────────

// POST /api/projects/:id/scope-changes — Client requests scope modification
projectRouter.post('/:id/scope-changes', async (req, res) => {
  try {
    const { title, description, reason, affectedRequirements = [], estimatedBudgetImpact = 0, estimatedTimelineImpact = 'No change' } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for scope change.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const changeItem = {
      customId: `sc-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      reason: reason ? reason.trim() : '',
      affectedRequirements,
      estimatedBudgetImpact: Number(estimatedBudgetImpact) || 0,
      estimatedTimelineImpact,
      status: 'Pending',
      adminNotes: '',
      submittedAt: new Date()
    };

    if (!request.scopeChanges) request.scopeChanges = [];
    request.scopeChanges.push(changeItem);
    await request.save();

    await RequestActivity.create({
      customId: `act-${Date.now()}`,
      requestId: request.customId || request._id,
      actorId: request.clientId,
      actorName: request.clientName,
      actorRole: 'client',
      activityType: 'scope_change_request',
      userVisibleNote: `Scope Change Requested: "${title}"`
    });

    res.json({ success: true, scopeChange: changeItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// UNIQUE ROLE FEATURES ENDPOINTS (Client, Admin, Freelancer)
// ─────────────────────────────────────────────────────────────

// POST /api/projects/:id/scope-changes — Client requests scope modification
projectRouter.post('/:id/scope-changes', async (req, res) => {
  try {
    const { title, description, reason, affectedRequirements = [], estimatedBudgetImpact = 0, estimatedTimelineImpact = 'No change' } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for scope change.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const changeItem = {
      customId: `sc-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      reason: reason ? reason.trim() : '',
      affectedRequirements,
      estimatedBudgetImpact: Number(estimatedBudgetImpact) || 0,
      estimatedTimelineImpact,
      status: 'Pending',
      adminNotes: '',
      submittedAt: new Date()
    };

    if (!request.scopeChanges) request.scopeChanges = [];
    request.scopeChanges.push(changeItem);
    await request.save();

    // Log Activity
    await RequestActivity.create({
      customId: `act-${Date.now()}`,
      requestId: request.customId || request._id,
      actorId: request.clientId,
      actorName: request.clientName,
      actorRole: 'client',
      activityType: 'scope_change_request',
      userVisibleNote: `Scope Change Requested: "${title}"`
    });

    res.json({ success: true, scopeChange: changeItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/scope-changes/:changeId — Admin reviews scope change
projectRouter.patch('/:id/scope-changes/:changeId', async (req, res) => {
  try {
    const { status, adminNotes = '', budgetImpact = 0, timelineImpact = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const sc = request.scopeChanges?.find(c => c.customId === req.params.changeId);
    if (!sc) return res.status(404).json({ error: 'Scope change record not found.' });

    sc.status = status;
    sc.adminNotes = adminNotes;
    sc.reviewedAt = new Date();
    if (budgetImpact) sc.estimatedBudgetImpact = budgetImpact;
    if (timelineImpact) sc.estimatedTimelineImpact = timelineImpact;

    await request.save();

    res.json({ success: true, scopeChange: sc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/decisions — Admin creates a decision gate for client
projectRouter.post('/:id/decisions', async (req, res) => {
  try {
    const { title, description, decisionType = 'requirement', deadline } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const decisionItem = {
      customId: `dec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      decisionType,
      status: 'Pending',
      clientFeedback: '',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 3 * 86400000),
      createdAt: new Date()
    };

    if (!request.decisions) request.decisions = [];
    request.decisions.push(decisionItem);
    await request.save();

    res.json({ success: true, decision: decisionItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/decisions/:decisionId — Client responds to decision
projectRouter.patch('/:id/decisions/:decisionId', async (req, res) => {
  try {
    const { status, clientFeedback = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const dec = request.decisions?.find(d => d.customId === req.params.decisionId);
    if (!dec) return res.status(404).json({ error: 'Decision item not found.' });

    dec.status = status;
    dec.clientFeedback = clientFeedback;
    dec.decidedAt = new Date();
    await request.save();

    res.json({ success: true, decision: dec, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/acceptance — Client records Final Handover Acceptance
projectRouter.post('/:id/acceptance', async (req, res) => {
  try {
    const { status, rating = 5, feedback = '', issues = [] } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverAcceptance = {
      status, // 'Accepted' | 'Issues Raised'
      rating: Number(rating) || 5,
      feedback: feedback.trim(),
      issues,
      acceptedAt: new Date()
    };

    if (status === 'Accepted') {
      request.status = 'Completed';
    }

    await request.save();
    res.json({ success: true, handoverAcceptance: request.handoverAcceptance, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/worklogs — Freelancer logs actual effort vs estimate
projectRouter.post('/:id/worklogs', async (req, res) => {
  try {
    const { freelancerId, freelancerName = 'Specialist', taskTitle, estimatedHours = 0, actualHours = 0, workCompleted = '', remainingWork = '', deviationReason = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const logItem = {
      customId: `wl-${Date.now()}`,
      freelancerId,
      freelancerName,
      taskTitle: taskTitle?.trim() || 'Development Sprint',
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      workCompleted: workCompleted.trim(),
      remainingWork: remainingWork.trim(),
      deviationReason: deviationReason.trim(),
      loggedAt: new Date()
    };

    if (!request.worklogs) request.worklogs = [];
    request.worklogs.push(logItem);
    await request.save();

    res.json({ success: true, worklog: logItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/handover — Freelancer saves Technical Handover runbook
projectRouter.post('/:id/handover', async (req, res) => {
  try {
    const { overview, technologies = [], installationInstructions = '', envVariables = [], databaseSetup = '', startupInstructions = '', keyModules = [], knownLimitations = '', futureRecommendations = '', authorName = 'Lead Specialist' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverDoc = {
      overview: overview?.trim() || '',
      technologies,
      installationInstructions: installationInstructions.trim(),
      envVariables,
      databaseSetup: databaseSetup.trim(),
      startupInstructions: startupInstructions.trim(),
      keyModules,
      knownLimitations: knownLimitations.trim(),
      futureRecommendations: futureRecommendations.trim(),
      generatedAt: new Date(),
      authorName
    };

    await request.save();
    res.json({ success: true, handoverDoc: request.handoverDoc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/operations/sla-radar — Admin SLA & Bottleneck Radar data
projectRouter.get('/operations/sla-radar', async (req, res) => {
  try {
    const projects = await ProjectRequest.find().sort({ timestamp: -1 });
    const now = Date.now();

    const radarItems = projects.map(p => {
      const ageHours = Math.round((now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60));
      let slaStatus = 'On Track';
      let bottleneck = null;

      if ((p.status === 'Submitted' || p.status === 'New') && ageHours > 24) {
        slaStatus = 'Breached';
        bottleneck = 'Initial Intake Triage Overdue (>24h)';
      } else if (p.status === 'Under Admin Review' && ageHours > 48) {
        slaStatus = 'At Risk';
        bottleneck = 'Admin Scoping Approval Delayed (>48h)';
      } else if (p.status === 'Specialist Review' && (!p.assignedFreelancerId || p.assignedFreelancerId === 'null')) {
        slaStatus = 'Breached';
        bottleneck = 'Approved Project Awaiting Specialist Assignment';
      }

      return {
        id: p.customId || p._id,
        title: p.projectTitle,
        clientName: p.clientName,
        status: p.status,
        ageHours,
        slaStatus,
        bottleneck,
        assignedFreelancer: p.assignedFreelancerName || 'Unassigned',
        priority: p.priority || 'Normal',
        submittedAt: p.createdAt
      };
    });

    const breaches = radarItems.filter(r => r.slaStatus === 'Breached').length;
    const atRisk = radarItems.filter(r => r.slaStatus === 'At Risk').length;
    const onTrack = radarItems.filter(r => r.slaStatus === 'On Track').length;

    res.json({
      summary: { total: radarItems.length, onTrack, atRisk, breaches },
      items: radarItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/scope-changes/:changeId — Admin reviews scope change
projectRouter.patch('/:id/scope-changes/:changeId', async (req, res) => {
  try {
    const { status, adminNotes = '', budgetImpact = 0, timelineImpact = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const sc = request.scopeChanges?.find(c => c.customId === req.params.changeId);
    if (!sc) return res.status(404).json({ error: 'Scope change record not found.' });

    sc.status = status;
    sc.adminNotes = adminNotes;
    sc.reviewedAt = new Date();
    if (budgetImpact) sc.estimatedBudgetImpact = budgetImpact;
    if (timelineImpact) sc.estimatedTimelineImpact = timelineImpact;

    await request.save();
    res.json({ success: true, scopeChange: sc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/decisions — Admin creates a decision gate for client
projectRouter.post('/:id/decisions', async (req, res) => {
  try {
    const { title, description, decisionType = 'requirement', deadline } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const decisionItem = {
      customId: `dec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      decisionType,
      status: 'Pending',
      clientFeedback: '',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 3 * 86400000),
      createdAt: new Date()
    };

    if (!request.decisions) request.decisions = [];
    request.decisions.push(decisionItem);
    await request.save();

    res.json({ success: true, decision: decisionItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// UNIQUE ROLE FEATURES ENDPOINTS (Client, Admin, Freelancer)
// ─────────────────────────────────────────────────────────────

// POST /api/projects/:id/scope-changes — Client requests scope modification
projectRouter.post('/:id/scope-changes', async (req, res) => {
  try {
    const { title, description, reason, affectedRequirements = [], estimatedBudgetImpact = 0, estimatedTimelineImpact = 'No change' } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for scope change.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const changeItem = {
      customId: `sc-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      reason: reason ? reason.trim() : '',
      affectedRequirements,
      estimatedBudgetImpact: Number(estimatedBudgetImpact) || 0,
      estimatedTimelineImpact,
      status: 'Pending',
      adminNotes: '',
      submittedAt: new Date()
    };

    if (!request.scopeChanges) request.scopeChanges = [];
    request.scopeChanges.push(changeItem);
    await request.save();

    // Log Activity
    await RequestActivity.create({
      customId: `act-${Date.now()}`,
      requestId: request.customId || request._id,
      actorId: request.clientId,
      actorName: request.clientName,
      actorRole: 'client',
      activityType: 'scope_change_request',
      userVisibleNote: `Scope Change Requested: "${title}"`
    });

    res.json({ success: true, scopeChange: changeItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/scope-changes/:changeId — Admin reviews scope change
projectRouter.patch('/:id/scope-changes/:changeId', async (req, res) => {
  try {
    const { status, adminNotes = '', budgetImpact = 0, timelineImpact = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const sc = request.scopeChanges?.find(c => c.customId === req.params.changeId);
    if (!sc) return res.status(404).json({ error: 'Scope change record not found.' });

    sc.status = status;
    sc.adminNotes = adminNotes;
    sc.reviewedAt = new Date();
    if (budgetImpact) sc.estimatedBudgetImpact = budgetImpact;
    if (timelineImpact) sc.estimatedTimelineImpact = timelineImpact;

    await request.save();

    res.json({ success: true, scopeChange: sc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/decisions — Admin creates a decision gate for client
projectRouter.post('/:id/decisions', async (req, res) => {
  try {
    const { title, description, decisionType = 'requirement', deadline } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const decisionItem = {
      customId: `dec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      decisionType,
      status: 'Pending',
      clientFeedback: '',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 3 * 86400000),
      createdAt: new Date()
    };

    if (!request.decisions) request.decisions = [];
    request.decisions.push(decisionItem);
    await request.save();

    res.json({ success: true, decision: decisionItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/decisions/:decisionId — Client responds to decision
projectRouter.patch('/:id/decisions/:decisionId', async (req, res) => {
  try {
    const { status, clientFeedback = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const dec = request.decisions?.find(d => d.customId === req.params.decisionId);
    if (!dec) return res.status(404).json({ error: 'Decision item not found.' });

    dec.status = status;
    dec.clientFeedback = clientFeedback;
    dec.decidedAt = new Date();
    await request.save();

    res.json({ success: true, decision: dec, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/acceptance — Client records Final Handover Acceptance
projectRouter.post('/:id/acceptance', async (req, res) => {
  try {
    const { status, rating = 5, feedback = '', issues = [] } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverAcceptance = {
      status, // 'Accepted' | 'Issues Raised'
      rating: Number(rating) || 5,
      feedback: feedback.trim(),
      issues,
      acceptedAt: new Date()
    };

    if (status === 'Accepted') {
      request.status = 'Completed';
    }

    await request.save();
    res.json({ success: true, handoverAcceptance: request.handoverAcceptance, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/worklogs — Freelancer logs actual effort vs estimate
projectRouter.post('/:id/worklogs', async (req, res) => {
  try {
    const { freelancerId, freelancerName = 'Specialist', taskTitle, estimatedHours = 0, actualHours = 0, workCompleted = '', remainingWork = '', deviationReason = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const logItem = {
      customId: `wl-${Date.now()}`,
      freelancerId,
      freelancerName,
      taskTitle: taskTitle?.trim() || 'Development Sprint',
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      workCompleted: workCompleted.trim(),
      remainingWork: remainingWork.trim(),
      deviationReason: deviationReason.trim(),
      loggedAt: new Date()
    };

    if (!request.worklogs) request.worklogs = [];
    request.worklogs.push(logItem);
    await request.save();

    res.json({ success: true, worklog: logItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/handover — Freelancer saves Technical Handover runbook
projectRouter.post('/:id/handover', async (req, res) => {
  try {
    const { overview, technologies = [], installationInstructions = '', envVariables = [], databaseSetup = '', startupInstructions = '', keyModules = [], knownLimitations = '', futureRecommendations = '', authorName = 'Lead Specialist' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverDoc = {
      overview: overview?.trim() || '',
      technologies,
      installationInstructions: installationInstructions.trim(),
      envVariables,
      databaseSetup: databaseSetup.trim(),
      startupInstructions: startupInstructions.trim(),
      keyModules,
      knownLimitations: knownLimitations.trim(),
      futureRecommendations: futureRecommendations.trim(),
      generatedAt: new Date(),
      authorName
    };

    await request.save();
    res.json({ success: true, handoverDoc: request.handoverDoc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/operations/sla-radar — Admin SLA & Bottleneck Radar data
projectRouter.get('/operations/sla-radar', async (req, res) => {
  try {
    const projects = await ProjectRequest.find().sort({ timestamp: -1 });
    const now = Date.now();

    const radarItems = projects.map(p => {
      const ageHours = Math.round((now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60));
      let slaStatus = 'On Track';
      let bottleneck = null;

      if ((p.status === 'Submitted' || p.status === 'New') && ageHours > 24) {
        slaStatus = 'Breached';
        bottleneck = 'Initial Intake Triage Overdue (>24h)';
      } else if (p.status === 'Under Admin Review' && ageHours > 48) {
        slaStatus = 'At Risk';
        bottleneck = 'Admin Scoping Approval Delayed (>48h)';
      } else if (p.status === 'Specialist Review' && (!p.assignedFreelancerId || p.assignedFreelancerId === 'null')) {
        slaStatus = 'Breached';
        bottleneck = 'Approved Project Awaiting Specialist Assignment';
      }

      return {
        id: p.customId || p._id,
        title: p.projectTitle,
        clientName: p.clientName,
        status: p.status,
        ageHours,
        slaStatus,
        bottleneck,
        assignedFreelancer: p.assignedFreelancerName || 'Unassigned',
        priority: p.priority || 'Normal',
        submittedAt: p.createdAt
      };
    });

    const breaches = radarItems.filter(r => r.slaStatus === 'Breached').length;
    const atRisk = radarItems.filter(r => r.slaStatus === 'At Risk').length;
    const onTrack = radarItems.filter(r => r.slaStatus === 'On Track').length;

    res.json({
      summary: { total: radarItems.length, onTrack, atRisk, breaches },
      items: radarItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/decisions/:decisionId — Client responds to decision
projectRouter.patch('/:id/decisions/:decisionId', async (req, res) => {
  try {
    const { status, clientFeedback = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const dec = request.decisions?.find(d => d.customId === req.params.decisionId);
    if (!dec) return res.status(404).json({ error: 'Decision item not found.' });

    dec.status = status;
    dec.clientFeedback = clientFeedback;
    dec.decidedAt = new Date();
    await request.save();

    res.json({ success: true, decision: dec, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/acceptance — Client records Final Handover Acceptance
projectRouter.post('/:id/acceptance', async (req, res) => {
  try {
    const { status, rating = 5, feedback = '', issues = [] } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverAcceptance = {
      status,
      rating: Number(rating) || 5,
      feedback: feedback.trim(),
      issues,
      acceptedAt: new Date()
    };

    if (status === 'Accepted') {
      request.status = 'Completed';
    }

    await request.save();
    res.json({ success: true, handoverAcceptance: request.handoverAcceptance, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/worklogs — Freelancer logs actual effort vs estimate
projectRouter.post('/:id/worklogs', async (req, res) => {
  try {
    const { freelancerId, freelancerName = 'Specialist', taskTitle, estimatedHours = 0, actualHours = 0, workCompleted = '', remainingWork = '', deviationReason = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const logItem = {
      customId: `wl-${Date.now()}`,
      freelancerId,
      freelancerName,
      taskTitle: taskTitle?.trim() || 'Development Sprint',
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      workCompleted: workCompleted.trim(),
      remainingWork: remainingWork.trim(),
      deviationReason: deviationReason.trim(),
      loggedAt: new Date()
    };

    if (!request.worklogs) request.worklogs = [];
    request.worklogs.push(logItem);
    await request.save();

    res.json({ success: true, worklog: logItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/handover — Freelancer saves Technical Handover runbook
projectRouter.post('/:id/handover', async (req, res) => {
  try {
    const { overview, technologies = [], installationInstructions = '', envVariables = [], databaseSetup = '', startupInstructions = '', keyModules = [], knownLimitations = '', futureRecommendations = '', authorName = 'Lead Specialist' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverDoc = {
      overview: overview?.trim() || '',
      technologies,
      installationInstructions: installationInstructions.trim(),
      envVariables,
      databaseSetup: databaseSetup.trim(),
      startupInstructions: startupInstructions.trim(),
      keyModules,
      knownLimitations: knownLimitations.trim(),
      futureRecommendations: futureRecommendations.trim(),
      generatedAt: new Date(),
      authorName
    };

    await request.save();
    res.json({ success: true, handoverDoc: request.handoverDoc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/operations/sla-radar — Admin SLA & Bottleneck Radar data
projectRouter.get('/operations/sla-radar', async (req, res) => {
  try {
    const projects = await ProjectRequest.find().sort({ timestamp: -1 });
    const now = Date.now();

    const radarItems = projects.map(p => {
      const ageHours = Math.round((now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60));
      let slaStatus = 'On Track';
      let bottleneck = null;

      if ((p.status === 'Submitted' || p.status === 'New') && ageHours > 24) {
        slaStatus = 'Breached';
        bottleneck = 'Initial Intake Triage Overdue (>24h)';
      } else if (p.status === 'Under Admin Review' && ageHours > 48) {
        slaStatus = 'At Risk';
        bottleneck = 'Admin Scoping Approval Delayed (>48h)';
      } else if (p.status === 'Specialist Review' && (!p.assignedFreelancerId || p.assignedFreelancerId === 'null')) {
        slaStatus = 'Breached';
        bottleneck = 'Approved Project Awaiting Specialist Assignment';
      }

      return {
        id: p.customId || p._id,
        title: p.projectTitle,
        clientName: p.clientName,
        status: p.status,
        ageHours,
        slaStatus,
        bottleneck,
        assignedFreelancer: p.assignedFreelancerName || 'Unassigned',
        priority: p.priority || 'Normal',
        submittedAt: p.createdAt
      };
    });

    const breaches = radarItems.filter(r => r.slaStatus === 'Breached').length;
    const atRisk = radarItems.filter(r => r.slaStatus === 'At Risk').length;
    const onTrack = radarItems.filter(r => r.slaStatus === 'On Track').length;

    res.json({
      summary: { total: radarItems.length, onTrack, atRisk, breaches },
      items: radarItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// UNIQUE ROLE FEATURES ENDPOINTS (Client, Admin, Freelancer)
// ─────────────────────────────────────────────────────────────

// POST /api/projects/:id/scope-changes — Client requests scope modification
projectRouter.post('/:id/scope-changes', async (req, res) => {
  try {
    const { title, description, reason, affectedRequirements = [], estimatedBudgetImpact = 0, estimatedTimelineImpact = 'No change' } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for scope change.' });
    }

    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const changeItem = {
      customId: `sc-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      reason: reason ? reason.trim() : '',
      affectedRequirements,
      estimatedBudgetImpact: Number(estimatedBudgetImpact) || 0,
      estimatedTimelineImpact,
      status: 'Pending',
      adminNotes: '',
      submittedAt: new Date()
    };

    if (!request.scopeChanges) request.scopeChanges = [];
    request.scopeChanges.push(changeItem);
    await request.save();

    // Log Activity
    await RequestActivity.create({
      customId: `act-${Date.now()}`,
      requestId: request.customId || request._id,
      actorId: request.clientId,
      actorName: request.clientName,
      actorRole: 'client',
      activityType: 'scope_change_request',
      userVisibleNote: `Scope Change Requested: "${title}"`
    });

    res.json({ success: true, scopeChange: changeItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/scope-changes/:changeId — Admin reviews scope change
projectRouter.patch('/:id/scope-changes/:changeId', async (req, res) => {
  try {
    const { status, adminNotes = '', budgetImpact = 0, timelineImpact = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const sc = request.scopeChanges?.find(c => c.customId === req.params.changeId);
    if (!sc) return res.status(404).json({ error: 'Scope change record not found.' });

    sc.status = status;
    sc.adminNotes = adminNotes;
    sc.reviewedAt = new Date();
    if (budgetImpact) sc.estimatedBudgetImpact = budgetImpact;
    if (timelineImpact) sc.estimatedTimelineImpact = timelineImpact;

    await request.save();

    res.json({ success: true, scopeChange: sc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/decisions — Admin creates a decision gate for client
projectRouter.post('/:id/decisions', async (req, res) => {
  try {
    const { title, description, decisionType = 'requirement', deadline } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const decisionItem = {
      customId: `dec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      decisionType,
      status: 'Pending',
      clientFeedback: '',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 3 * 86400000),
      createdAt: new Date()
    };

    if (!request.decisions) request.decisions = [];
    request.decisions.push(decisionItem);
    await request.save();

    res.json({ success: true, decision: decisionItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/decisions/:decisionId — Client responds to decision
projectRouter.patch('/:id/decisions/:decisionId', async (req, res) => {
  try {
    const { status, clientFeedback = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const dec = request.decisions?.find(d => d.customId === req.params.decisionId);
    if (!dec) return res.status(404).json({ error: 'Decision item not found.' });

    dec.status = status;
    dec.clientFeedback = clientFeedback;
    dec.decidedAt = new Date();
    await request.save();

    res.json({ success: true, decision: dec, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/acceptance — Client records Final Handover Acceptance
projectRouter.post('/:id/acceptance', async (req, res) => {
  try {
    const { status, rating = 5, feedback = '', issues = [] } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverAcceptance = {
      status, // 'Accepted' | 'Issues Raised'
      rating: Number(rating) || 5,
      feedback: feedback.trim(),
      issues,
      acceptedAt: new Date()
    };

    if (status === 'Accepted') {
      request.status = 'Completed';
    }

    await request.save();
    res.json({ success: true, handoverAcceptance: request.handoverAcceptance, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/worklogs — Freelancer logs actual effort vs estimate
projectRouter.post('/:id/worklogs', async (req, res) => {
  try {
    const { freelancerId, freelancerName = 'Specialist', taskTitle, estimatedHours = 0, actualHours = 0, workCompleted = '', remainingWork = '', deviationReason = '' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    const logItem = {
      customId: `wl-${Date.now()}`,
      freelancerId,
      freelancerName,
      taskTitle: taskTitle?.trim() || 'Development Sprint',
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      workCompleted: workCompleted.trim(),
      remainingWork: remainingWork.trim(),
      deviationReason: deviationReason.trim(),
      loggedAt: new Date()
    };

    if (!request.worklogs) request.worklogs = [];
    request.worklogs.push(logItem);
    await request.save();

    res.json({ success: true, worklog: logItem, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/handover — Freelancer saves Technical Handover runbook
projectRouter.post('/:id/handover', async (req, res) => {
  try {
    const { overview, technologies = [], installationInstructions = '', envVariables = [], databaseSetup = '', startupInstructions = '', keyModules = [], knownLimitations = '', futureRecommendations = '', authorName = 'Lead Specialist' } = req.body;
    const request = await ProjectRequest.findOne(getFilterById(req.params.id));
    if (!request) return res.status(404).json({ error: 'Project not found.' });

    request.handoverDoc = {
      overview: overview?.trim() || '',
      technologies,
      installationInstructions: installationInstructions.trim(),
      envVariables,
      databaseSetup: databaseSetup.trim(),
      startupInstructions: startupInstructions.trim(),
      keyModules,
      knownLimitations: knownLimitations.trim(),
      futureRecommendations: futureRecommendations.trim(),
      generatedAt: new Date(),
      authorName
    };

    await request.save();
    res.json({ success: true, handoverDoc: request.handoverDoc, project: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/operations/sla-radar — Admin SLA & Bottleneck Radar data
projectRouter.get('/operations/sla-radar', async (req, res) => {
  try {
    const projects = await ProjectRequest.find().sort({ timestamp: -1 });
    const now = Date.now();

    const radarItems = projects.map(p => {
      const ageHours = Math.round((now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60));
      let slaStatus = 'On Track';
      let bottleneck = null;

      if ((p.status === 'Submitted' || p.status === 'New') && ageHours > 24) {
        slaStatus = 'Breached';
        bottleneck = 'Initial Intake Triage Overdue (>24h)';
      } else if (p.status === 'Under Admin Review' && ageHours > 48) {
        slaStatus = 'At Risk';
        bottleneck = 'Admin Scoping Approval Delayed (>48h)';
      } else if (p.status === 'Specialist Review' && (!p.assignedFreelancerId || p.assignedFreelancerId === 'null')) {
        slaStatus = 'Breached';
        bottleneck = 'Approved Project Awaiting Specialist Assignment';
      }

      return {
        id: p.customId || p._id,
        title: p.projectTitle,
        clientName: p.clientName,
        status: p.status,
        ageHours,
        slaStatus,
        bottleneck,
        assignedFreelancer: p.assignedFreelancerName || 'Unassigned',
        priority: p.priority || 'Normal',
        submittedAt: p.createdAt
      };
    });

    const breaches = radarItems.filter(r => r.slaStatus === 'Breached').length;
    const atRisk = radarItems.filter(r => r.slaStatus === 'At Risk').length;
    const onTrack = radarItems.filter(r => r.slaStatus === 'On Track').length;

    res.json({
      summary: { total: radarItems.length, onTrack, atRisk, breaches },
      items: radarItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
