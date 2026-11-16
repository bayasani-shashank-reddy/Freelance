import express from 'express';
import { IdeaDraft } from '../models/IdeaDraft.js';

export const draftRouter = express.Router();

// Helper to compute a truthful, heuristic feasibility pre-score (1 to 100) based on defined criteria (ID 18)
const calculateFeasibilityPreScore = (title, rawIdea, category, expectedBudget, preferredTimeline) => {
  let titleClarity = 10;
  if (title && title.trim().length >= 5) titleClarity = 18;
  if (title && title.trim().length >= 15) titleClarity = 25;

  let categoryPlausibility = 15;
  if (['Web Application', 'Mobile App', 'AI SaaS', 'E-Commerce', 'Fintech', 'Healthcare'].includes(category)) {
    categoryPlausibility = 25;
  }

  let budgetAlignment = 15;
  if (expectedBudget && expectedBudget.trim()) {
    budgetAlignment = 23;
  }

  let timelineViability = 15;
  if (preferredTimeline && preferredTimeline.trim()) {
    timelineViability = 22;
  }

  const totalScore = Math.min(100, titleClarity + categoryPlausibility + budgetAlignment + timelineViability);

  const factors = [];
  if (titleClarity >= 20) factors.push('Specific, descriptive project title');
  else factors.push('Short title: consider adding more descriptive keywords');

  if (categoryPlausibility >= 20) factors.push(`Standard digital category (${category}) with proven architectures`);
  if (budgetAlignment >= 20) factors.push('Target budget provided for commercial scoping');
  else factors.push('No budget specified: commercial estimate will use baseline market rates');

  if (timelineViability >= 20) factors.push('Target delivery horizon defined');
  else factors.push('Flexible timeline: sprint roadmap will suggest optimal phases');

  return {
    score: totalScore,
    breakdown: {
      titleClarity,
      categoryPlausibility,
      budgetAlignment,
      timelineViability
    },
    factors
  };
};

// GET /api/drafts/client/:clientId — Get all private drafts for a client
draftRouter.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const drafts = await IdeaDraft.find({ clientId }).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drafts — Create an idea draft (100% free, 0 NCX credits charged) with feasibility pre-scoring (ID 15, 18)
draftRouter.post('/', async (req, res) => {
  try {
    const { clientId, title, rawIdea = '', category = 'Web Application', expectedBudget = '', preferredTimeline = '', referenceUrl = '', tags = [] } = req.body;
    if (!clientId || !title) {
      return res.status(400).json({ error: 'Client ID and title are required to save an idea draft.' });
    }

    const { score, breakdown, factors } = calculateFeasibilityPreScore(title, rawIdea, category, expectedBudget, preferredTimeline);

    const customId = `draft-${Date.now()}`;
    const draft = new IdeaDraft({
      customId,
      clientId,
      title: title.trim(),
      rawIdea: rawIdea.trim(),
      category,
      expectedBudget,
      preferredTimeline,
      referenceUrl,
      tags: Array.isArray(tags) ? tags : [],
      isFavorite: false,
      feasibilityScore: score,
      feasibilityBreakdown: breakdown,
      feasibilityFactors: factors
    });

    await draft.save();
    res.status(201).json({ success: true, draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/drafts/:id — Edit idea draft & recalculate feasibility pre-score (ID 16, 18)
draftRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, rawIdea, category, expectedBudget, preferredTimeline, referenceUrl, tags, isFavorite, aiNotes } = req.body;

    const draft = await IdeaDraft.findOne({
      $or: [{ customId: id }, { _id: id }]
    });

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found.' });
    }

    if (title !== undefined) draft.title = title.trim();
    if (rawIdea !== undefined) draft.rawIdea = rawIdea.trim();
    if (category !== undefined) draft.category = category;
    if (expectedBudget !== undefined) draft.expectedBudget = expectedBudget;
    if (preferredTimeline !== undefined) draft.preferredTimeline = preferredTimeline;
    if (referenceUrl !== undefined) draft.referenceUrl = referenceUrl;
    if (tags !== undefined) draft.tags = tags;
    if (isFavorite !== undefined) draft.isFavorite = isFavorite;
    if (aiNotes !== undefined) draft.aiNotes = aiNotes;

    // Recalculate pre-score
    const { score, breakdown, factors } = calculateFeasibilityPreScore(
      draft.title,
      draft.rawIdea,
      draft.category,
      draft.expectedBudget,
      draft.preferredTimeline
    );
    draft.feasibilityScore = score;
    draft.feasibilityBreakdown = breakdown;
    draft.feasibilityFactors = factors;
    draft.updatedAt = new Date();

    await draft.save();
    res.json({ success: true, draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drafts/:id — Delete idea draft
draftRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await IdeaDraft.deleteOne({
      $or: [{ customId: id }, { _id: id }]
    });
    res.json({ success: true, message: 'Draft removed from vault.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
