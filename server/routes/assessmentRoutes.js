import express from 'express';
import { FeasibilityAssessment } from '../models/FeasibilityAssessment.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export const assessmentRouter = express.Router();

// GET /api/assessments/request/:requestId — Admin view all assessments for a request
assessmentRouter.get('/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const assessments = await FeasibilityAssessment.find({
      $or: [{ requestId }, { projectTitle: requestId }]
    }).sort({ submittedAt: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assessments/freelancer/:freelancerId — Freelancer view their own assessments
assessmentRouter.get('/freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const assessments = await FeasibilityAssessment.find({ freelancerId }).sort({ submittedAt: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assessments — Freelancer submits or updates feasibility assessment
assessmentRouter.post('/', async (req, res) => {
  try {
    const {
      requestId,
      projectTitle,
      freelancerId,
      freelancerName,
      freelancerEmail,
      feasibility,
      technicalApproach = '',
      technologyStack = [],
      estimatedHours = 0,
      estimatedDuration = '',
      requiredResources = [],
      risks = [],
      dependencies = [],
      missingInformation = [],
      taskBreakdown = [],
      notesForAdmin = ''
    } = req.body;

    if (!requestId || !freelancerId || !feasibility) {
      return res.status(400).json({ error: 'Request ID, Freelancer ID, and Feasibility outcome are required.' });
    }

    const customId = `assess-${Date.now()}`;
    const assessment = new FeasibilityAssessment({
      customId,
      requestId,
      projectTitle: projectTitle || 'Project Assessment',
      freelancerId,
      freelancerName: freelancerName || 'Specialist',
      freelancerEmail: freelancerEmail || '',
      feasibility,
      technicalApproach,
      technologyStack: Array.isArray(technologyStack) ? technologyStack : [],
      estimatedHours: Number(estimatedHours) || 0,
      estimatedDuration,
      requiredResources: Array.isArray(requiredResources) ? requiredResources : [],
      risks: Array.isArray(risks) ? risks : [],
      dependencies: Array.isArray(dependencies) ? dependencies : [],
      missingInformation: Array.isArray(missingInformation) ? missingInformation : [],
      taskBreakdown: Array.isArray(taskBreakdown) ? taskBreakdown : [],
      notesForAdmin,
      status: 'Submitted'
    });

    await assessment.save();

    // Notify Admin
    await Notification.create({
      customId: `notif-${Date.now()}-adm`,
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'Feasibility Assessment Submitted',
      message: `${freelancerName} assessed "${projectTitle}" as "${feasibility}".`,
      type: 'info',
      link: `/admin/requests`
    });

    res.status(201).json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/assessments/:id/status — Admin approves or requests revision
assessmentRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback = '', adminId = 'admin' } = req.body;

    const assessment = await FeasibilityAssessment.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    assessment.status = status;
    if (adminFeedback) assessment.adminFeedback = adminFeedback;
    assessment.updatedAt = new Date();

    await assessment.save();

    // Notify Freelancer
    await Notification.create({
      customId: `notif-${Date.now()}-fl`,
      recipientId: assessment.freelancerId,
      recipientRole: 'freelancer',
      title: `Assessment ${status}`,
      message: `Admin marked your assessment for "${assessment.projectTitle}" as ${status}. ${adminFeedback ? `Feedback: ${adminFeedback}` : ''}`,
      type: status === 'Approved' ? 'success' : 'warning',
      link: `/freelancer/dashboard`
    });

    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

