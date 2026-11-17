import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { DocumentShare } from '../models/DocumentShare.js';
import { Notification } from '../models/Notification.js';

export const freelancerRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// GET /api/freelancers — Admin view private freelancer list
freelancerRouter.get('/', async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer' }).sort({ createdAt: -1 });
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/freelancers — Admin adds private vetted freelancer
freelancerRouter.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, title, skills, hourlyRate = 60, availability = 'Available Now', experience = '5+ Years' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    const initialPassword = password && password.trim() ? password.trim() : 'Freelancer@12345';
    const customId = `freelancer-${Date.now()}`;
    const newFreelancer = new User({
      customId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      title: title || 'Full Stack Engineer',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ['React', 'Node.js', 'TypeScript']),
      hourlyRate: Number(hourlyRate) || 0,
      availability,
      experience,
      role: 'freelancer',
      status: 'active',
      approvalStatus: 'approved',
      createdByAdmin: true,
      password: initialPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    });

    await newFreelancer.save();

    // Create system notification
    try {
      await Notification.create({
        customId: `notif-${Date.now()}`,
        userId: 'admin',
        title: 'New Freelancer Account Created',
        message: `Specialist account created for ${newFreelancer.name} (${newFreelancer.email}). Initial password configured.`,
        type: 'user',
        priority: 'high',
        read: false
      });
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Freelancer account created successfully with active credentials.',
      freelancer: newFreelancer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/freelancers/:id — Admin updates freelancer details or status
freelancerRouter.patch('/:id', async (req, res) => {
  try {
    const { name, email, phone, title, skills, hourlyRate, availability, experience, status } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (email) update.email = email.toLowerCase().trim();
    if (phone !== undefined) update.phone = phone;
    if (title !== undefined) update.title = title;
    if (skills) update.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (hourlyRate !== undefined) update.hourlyRate = Number(hourlyRate);
    if (availability !== undefined) update.availability = availability;
    if (experience !== undefined) update.experience = experience;
    if (status !== undefined) update.status = status;

    const freelancer = await User.findOneAndUpdate(
      { ...getFilterById(req.params.id), role: 'freelancer' },
      update,
      { new: true }
    );

    if (!freelancer) return res.status(404).json({ error: 'Freelancer not found.' });
    res.json({ success: true, freelancer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/freelancers/:id — Admin deactivates/archives freelancer & revokes document shares
freelancerRouter.delete('/:id', async (req, res) => {
  try {
    const freelancer = await User.findOne({ ...getFilterById(req.params.id), role: 'freelancer' });
    if (!freelancer) return res.status(404).json({ error: 'Freelancer not found.' });

    freelancer.status = 'archived';
    await freelancer.save();

    // Revoke all active document shares
    const uid = freelancer.customId || freelancer._id;
    await DocumentShare.updateMany(
      { freelancerId: uid, status: { $ne: 'Revoked' } },
      { status: 'Revoked', revokedAt: new Date() }
    );

    res.json({ success: true, message: 'Freelancer archived and document access revoked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freelancers/:id/shares — Freelancer views only documents shared with their account
freelancerRouter.get('/:id/shares', async (req, res) => {
  try {
    const user = await User.findOne(getFilterById(req.params.id));
    const uid = user ? (user.customId || user._id) : req.params.id;

    // Only active shares (not revoked)
    const shares = await DocumentShare.find({
      $or: [{ freelancerId: uid }, { freelancerId: req.params.id }],
      status: { $ne: 'Revoked' }
    }).sort({ createdAt: -1 });

    res.json({ success: true, shares });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate weighted profile completion (Section C)
export const calculateProfileCompletion = (user) => {
  if (!user) return { score: 0, breakdown: {}, missingFields: [] };

  const breakdown = {
    avatar: Boolean(user.avatar && !user.avatar.includes('placeholder')) ? 15 : 0,
    bio: Boolean(user.bio && user.bio.trim().length >= 20) ? 15 : 0,
    skills: Boolean(Array.isArray(user.skills) && user.skills.length >= 2) ? 15 : 0,
    technicalSpecialties: Boolean(Array.isArray(user.technicalSpecialties) && user.technicalSpecialties.length >= 1) ? 15 : 0,
    experience: Boolean(user.experience && user.experience.trim().length > 0) ? 10 : 0,
    portfolio: Boolean(Array.isArray(user.portfolio) && user.portfolio.length >= 1) ? 15 : 0,
    hourlyRate: Boolean(Number(user.hourlyRate) > 0) ? 10 : 0,
    availability: Boolean(user.availability && ['Available', 'Busy', 'On Leave', 'Available Now'].includes(user.availability)) ? 5 : 0
  };

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const missingFields = [];
  if (!breakdown.avatar) missingFields.push('Profile Photo');
  if (!breakdown.bio) missingFields.push('Professional Introduction (min 20 chars)');
  if (!breakdown.skills) missingFields.push('Skills (min 2)');
  if (!breakdown.technicalSpecialties) missingFields.push('Technical Specialties');
  if (!breakdown.experience) missingFields.push('Experience History');
  if (!breakdown.portfolio) missingFields.push('Portfolio Project');
  if (!breakdown.hourlyRate) missingFields.push('Hourly Rate (INR)');
  if (!breakdown.availability) missingFields.push('Availability Status');

  return { score, breakdown, missingFields };
};

// PUT /api/freelancers/profile/:id — Freelancer updates own profile & availability
freelancerRouter.put('/profile/:id', async (req, res) => {
  try {
    const {
      avatar,
      bio,
      skills,
      technicalSpecialties,
      experience,
      portfolio,
      hourlyRate,
      availability,
      title
    } = req.body;

    const update = {};
    if (avatar !== undefined) update.avatar = avatar;
    if (bio !== undefined) update.bio = bio;
    if (title !== undefined) update.title = title;
    if (skills !== undefined) update.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
    if (technicalSpecialties !== undefined) update.technicalSpecialties = Array.isArray(technicalSpecialties) ? technicalSpecialties : (technicalSpecialties ? technicalSpecialties.split(',').map(s => s.trim()) : []);
    if (experience !== undefined) update.experience = experience;
    if (portfolio !== undefined) update.portfolio = portfolio;
    if (hourlyRate !== undefined) update.hourlyRate = Number(hourlyRate);
    if (availability !== undefined) update.availability = availability;

    const user = await User.findOneAndUpdate(
      { ...getFilterById(req.params.id), role: 'freelancer' },
      { $set: update },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'Freelancer profile not found.' });

    const completion = calculateProfileCompletion(user);

    res.json({
      success: true,
      user,
      completion
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freelancers/profile-completion/:id — Get weighted completion score
freelancerRouter.get('/profile-completion/:id', async (req, res) => {
  try {
    const user = await User.findOne({ ...getFilterById(req.params.id), role: 'freelancer' });
    if (!user) return res.status(404).json({ error: 'Freelancer not found.' });

    const completion = calculateProfileCompletion(user);
    res.json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freelancers/matching/:projectId — Smart Freelancer Matching Recommendation Engine (Admin-only)
freelancerRouter.get('/matching/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch project
    const ProjectRequestModel = mongoose.models.ProjectRequest || mongoose.models.IdeaSubmission;
    let project = null;
    if (ProjectRequestModel) {
      project = await ProjectRequestModel.findOne(getFilterById(projectId));
    }

    const projectTech = [];
    if (project) {
      if (project.aiCategory) projectTech.push(project.aiCategory);
      if (Array.isArray(project.aiSuggestedFeatures)) {
        project.aiSuggestedFeatures.forEach(f => {
          if (f.includes('React')) projectTech.push('React');
          if (f.includes('Node')) projectTech.push('Node.js');
          if (f.includes('AI') || f.includes('ML')) projectTech.push('AI / ML');
          if (f.includes('Database') || f.includes('MongoDB')) projectTech.push('MongoDB');
        });
      }
    }

    // Default required skills if empty
    const targetSkills = projectTech.length ? projectTech : ['React', 'Node.js', 'TypeScript', 'Full Stack'];

    // Fetch all active freelancers
    const freelancers = await User.find({ role: 'freelancer', status: 'active' });

    // Count active assignments per freelancer
    const matches = await Promise.all(
      freelancers.map(async (fl) => {
        const uid = fl.customId || fl._id;
        const activeSharesCount = await DocumentShare.countDocuments({
          $or: [{ freelancerId: uid }, { freelancerId: String(fl._id) }],
          status: { $in: ['Shared', 'Reviewing', 'Assessed'] }
        });

        // 1. Skill Match Score (40 pts)
        const flSkills = (fl.skills || []).map(s => s.toLowerCase());
        const flSpecialties = (fl.technicalSpecialties || []).map(s => s.toLowerCase());
        const combined = [...flSkills, ...flSpecialties];

        let matchedSkillsCount = 0;
        targetSkills.forEach(ts => {
          if (combined.some(c => c.includes(ts.toLowerCase()) || ts.toLowerCase().includes(c))) {
            matchedSkillsCount += 1;
          }
        });
        const skillScore = targetSkills.length ? Math.min(40, Math.round((matchedSkillsCount / targetSkills.length) * 40)) : 30;

        // 2. Availability Score (25 pts)
        let availScore = 25;
        const avail = fl.availability || 'Available';
        if (avail === 'Busy') availScore = 10;
        else if (avail === 'On Leave') availScore = 0;

        // 3. Workload Score (20 pts)
        let workloadScore = 20;
        if (activeSharesCount === 1) workloadScore = 18;
        else if (activeSharesCount === 2) workloadScore = 14;
        else if (activeSharesCount >= 3) workloadScore = 5;

        // 4. Experience & Trust Score (15 pts)
        const experienceScore = 15;

        const totalScore = Math.min(100, skillScore + availScore + workloadScore + experienceScore);

        const reasons = [];
        if (matchedSkillsCount > 0) reasons.push(`${matchedSkillsCount} matching skill(s)`);
        reasons.push(avail === 'Available' || avail === 'Available Now' ? 'Currently Available' : `Status: ${avail}`);
        reasons.push(`${activeSharesCount} active assignment(s)`);

        return {
          freelancer: fl,
          matchScore: totalScore,
          matchedSkillsCount,
          activeWorkload: activeSharesCount,
          availability: avail,
          matchReason: `${totalScore}% Match: ${reasons.join(' · ')}`
        };
      })
    );

    // Sort descending by score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      projectId,
      targetSkills,
      recommendations: matches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freelancers/public/:id — Public specialist opt-in profile (ID 107)
freelancerRouter.get('/public/:id', async (req, res) => {
  try {
    const specialist = await User.findOne({
      ...getFilterById(req.params.id),
      role: 'freelancer'
    });

    if (!specialist) {
      return res.status(404).json({ error: 'Specialist profile not found.' });
    }

    res.json({
      success: true,
      specialist: {
        id: specialist.customId || specialist._id,
        name: specialist.name,
        title: specialist.title,
        avatar: specialist.avatar,
        bio: specialist.bio,
        skills: specialist.skills,
        technicalSpecialties: specialist.technicalSpecialties,
        hourlyRate: specialist.hourlyRate,
        availability: specialist.availability,
        vacationMode: specialist.vacationMode,
        verifiedSkills: specialist.verifiedSkills || [],
        portfolio: specialist.portfolio || [],
        trustScore: specialist.trustScore || 98,
        createdAt: specialist.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/freelancers/availability/:id — Availability calendar & vacation mode (ID 108)
freelancerRouter.patch('/availability/:id', async (req, res) => {
  try {
    const { availability, vacationMode, vacationStart, vacationEnd, dailyCapacityHours, workingDays, isPublicProfile } = req.body;
    const specialist = await User.findOne(getFilterById(req.params.id));

    if (!specialist) {
      return res.status(404).json({ error: 'Specialist not found.' });
    }

    if (availability !== undefined) specialist.availability = availability;
    if (vacationMode !== undefined) specialist.vacationMode = Boolean(vacationMode);
    if (vacationStart !== undefined) specialist.vacationStart = vacationStart ? new Date(vacationStart) : null;
    if (vacationEnd !== undefined) specialist.vacationEnd = vacationEnd ? new Date(vacationEnd) : null;
    if (dailyCapacityHours !== undefined) specialist.dailyCapacityHours = Number(dailyCapacityHours);
    if (workingDays !== undefined) specialist.workingDays = workingDays;
    if (isPublicProfile !== undefined) specialist.isPublicProfile = Boolean(isPublicProfile);

    await specialist.save();
    res.json({ success: true, specialist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
