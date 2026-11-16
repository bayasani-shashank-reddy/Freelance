import express from 'express';
import { WireframeAnnotation } from '../models/WireframeAnnotation.js';

export const wireframeRouter = express.Router();

// GET /api/wireframes/project/:projectId — Get wireframe canvas & annotations
wireframeRouter.get('/project/:projectId', async (req, res) => {
  try {
    const wireframes = await WireframeAnnotation.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(wireframes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wireframes — Save a wireframe canvas or screen
wireframeRouter.post('/', async (req, res) => {
  try {
    const { projectId, title, imageUrl, uploadedById = 'client' } = req.body;
    if (!projectId || !title || !imageUrl) {
      return res.status(400).json({ error: 'Project ID, Title, and Image URL are required.' });
    }

    const wireframe = new WireframeAnnotation({
      customId: `wire-${Date.now()}`,
      projectId,
      title: title.trim(),
      imageUrl,
      uploadedById,
      annotations: []
    });

    await wireframe.save();
    res.status(201).json({ success: true, wireframe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wireframes/:id/annotations — Add pin annotation to wireframe (ID 49)
wireframeRouter.post('/:id/annotations', async (req, res) => {
  try {
    const { x, y, comment, authorId, authorName, authorRole = 'client' } = req.body;
    const wireframe = await WireframeAnnotation.findOne({
      $or: [{ customId: req.params.id }, { _id: req.params.id }]
    });

    if (!wireframe) return res.status(404).json({ error: 'Wireframe not found.' });

    const newAnnotation = {
      id: `ann-${Date.now()}`,
      x: Number(x),
      y: Number(y),
      comment: comment.trim(),
      authorId,
      authorName,
      authorRole,
      status: 'open',
      createdAt: new Date()
    };

    wireframe.annotations.push(newAnnotation);
    await wireframe.save();

    res.status(201).json({ success: true, annotation: newAnnotation, wireframe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
