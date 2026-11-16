import express from 'express';
import { ProjectTask } from '../models/ProjectTask.js';
import { DocumentShare } from '../models/DocumentShare.js';
import { DeliverableSubmission } from '../models/DeliverableSubmission.js';
import { FreelancerQuotation } from '../models/FreelancerQuotation.js';

export const taskRouter = express.Router();

// GET /api/tasks/project/:projectId — Get tasks for project
taskRouter.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await ProjectTask.find({
      $or: [{ projectId }, { projectTitle: projectId }]
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/freelancer/:freelancerId — Get tasks assigned to freelancer
taskRouter.get('/freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const tasks = await ProjectTask.find({ assigneeId: freelancerId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks — Create task
taskRouter.post('/', async (req, res) => {
  try {
    const { projectId, projectTitle = '', title, description = '', priority = 'Medium', dueDate = '', assigneeId = '', assigneeName = '' } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project ID and Task Title are required.' });
    }

    const customId = `task-${Date.now()}`;
    const task = new ProjectTask({
      customId,
      projectId,
      projectTitle,
      title: title.trim(),
      description,
      priority,
      dueDate,
      assigneeId,
      assigneeName,
      status: 'To Do',
      progress: 0
    });

    await task.save();
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id — Update task / milestone status, progress or log work hours
taskRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      progress,
      logHours,
      logNote,
      startDate,
      dueDate,
      expectedDuration,
      associatedDeliverableId,
      completionNotes
    } = req.body;

    const task = await ProjectTask.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task / Milestone not found.' });
    }

    if (status !== undefined) {
      task.status = status;
      if (status === 'Completed' || status === 'Done') {
        task.completedAt = new Date();
        task.progress = 100;
      }
    }
    if (progress !== undefined) task.progress = Number(progress);
    if (startDate !== undefined) task.startDate = startDate;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (expectedDuration !== undefined) task.expectedDuration = expectedDuration;
    if (associatedDeliverableId !== undefined) task.associatedDeliverableId = associatedDeliverableId;
    if (completionNotes !== undefined) task.completionNotes = completionNotes;

    if (logHours) {
      task.worklog.push({
        hours: Number(logHours),
        note: logNote || 'Engineering progress',
        loggedAt: new Date()
      });
    }

    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/timeline/:freelancerId — Today's Delivery Timeline (Section C)
taskRouter.get('/timeline/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const [tasks, deliverables, quotations, shares] = await Promise.all([
      ProjectTask.find({ assigneeId: freelancerId }).sort({ dueDate: 1 }),
      DeliverableSubmission.find({ freelancerId }).sort({ submittedAt: -1 }),
      FreelancerQuotation.find({ freelancerId }).sort({ submittedAt: -1 }),
      DocumentShare.find({
        $or: [{ freelancerId }, { freelancerId: String(freelancerId) }],
        status: { $ne: 'Revoked' }
      }).sort({ createdAt: -1 })
    ]);

    // Build timeline items with authentic timestamps
    const timelineItems = [];

    // Tasks & Milestones
    tasks.forEach(t => {
      timelineItems.push({
        id: t.customId || t._id,
        type: t.isMilestone ? 'milestone' : 'task',
        title: t.title,
        projectTitle: t.projectTitle,
        status: t.status,
        deadline: t.dueDate || 'Ongoing',
        priority: t.priority,
        progress: t.progress,
        timestamp: t.dueDate ? new Date(t.dueDate) : t.createdAt
      });
    });

    // Deliverables
    deliverables.forEach(d => {
      timelineItems.push({
        id: d.customId || d._id,
        type: 'deliverable',
        title: `Deliverable v${d.version}: ${d.submissionTitle}`,
        projectTitle: d.projectTitle,
        status: d.status,
        deadline: d.submittedAt,
        priority: 'Normal',
        timestamp: d.submittedAt
      });
    });

    // Quotations
    quotations.forEach(q => {
      timelineItems.push({
        id: q.customId || q._id,
        type: 'quotation',
        title: `Quotation: ₹${q.totalCost.toLocaleString('en-IN')}`,
        projectTitle: q.projectTitle,
        status: q.status,
        deadline: q.estimatedTimeline || '30 Days Validity',
        priority: 'High',
        timestamp: q.submittedAt || q.createdAt
      });
    });

    // Pending assessments from active shares
    shares.filter(s => s.status === 'Shared').forEach(s => {
      timelineItems.push({
        id: s.customId || s._id,
        type: 'assessment',
        title: `Technical Assessment Due: ${s.projectTitle}`,
        projectTitle: s.projectTitle,
        status: 'Pending Assessment',
        deadline: 'Review Requested',
        priority: 'Urgent',
        timestamp: s.createdAt
      });
    });

    // Sort by timestamp
    timelineItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      count: timelineItems.length,
      timeline: timelineItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

