import express from 'express';
import crypto from 'crypto';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';

export const teamRouter = express.Router();

// GET /api/teams/client/:clientId — Get team for client
teamRouter.get('/client/:clientId', async (req, res) => {
  try {
    let team = await Team.findOne({ ownerId: req.params.clientId });
    if (!team) {
      team = new Team({
        customId: `team-${Date.now()}`,
        ownerId: req.params.clientId,
        teamName: 'Client Workspace Team',
        members: []
      });
      await team.save();
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/invite — Invite a teammate with owner, approver, or viewer role (ID 52)
teamRouter.post('/invite', async (req, res) => {
  try {
    const { clientId, name, email, role = 'viewer' } = req.body;
    if (!clientId || !name || !email) {
      return res.status(400).json({ error: 'Client ID, Name, and Email are required.' });
    }

    let team = await Team.findOne({ ownerId: clientId });
    if (!team) {
      team = new Team({
        customId: `team-${Date.now()}`,
        ownerId: clientId,
        teamName: 'Client Workspace Team',
        members: []
      });
    }

    const inviteToken = crypto.randomBytes(24).toString('hex');
    team.members.push({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: 'pending',
      inviteToken,
      invitedAt: new Date()
    });

    await team.save();
    res.status(201).json({ success: true, team, inviteToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams/member/:clientId/:memberId — Remove team member
teamRouter.delete('/member/:clientId/:memberId', async (req, res) => {
  try {
    const team = await Team.findOne({ ownerId: req.params.clientId });
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    team.members = team.members.filter(m => m._id.toString() !== req.params.memberId && m.email !== req.params.memberId);
    await team.save();
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
