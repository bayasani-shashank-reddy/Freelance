import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { SubAdminPermission } from '../models/SubAdminPermission.js';
import { User } from '../models/User.js';
import { AdminActivityLog } from '../models/AdminActivityLog.js';

export const subAdminRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// Default role permission presets
const ROLE_PRESETS = {
  super_admin: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: true, edit: true, delete: true, assign: true, status: true },
    clients: { view: true, create: true, edit: true, delete: true },
    documents: { view: true, create_req: true, edit_req: true, delete_req: true, review: true, approve: true, reject: true },
    specialists: { view: true, invite: true, assign: true, remove: true },
    finance: { view: true, manage_credits: true, invoices: true },
    settings: { view: true, edit: true, logs: true }
  },
  operations_admin: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: true, edit: true, delete: false, assign: true, status: true },
    clients: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: false, review: true, approve: true, reject: true },
    specialists: { view: true, invite: true, assign: true, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: true }
  },
  document_admin: {
    dashboard: { view: true, metrics: false },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: true, review: true, approve: true, reject: true },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: true }
  },
  finance_admin: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create_req: false, edit_req: false, delete_req: false, review: false, approve: false, reject: false },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: true, manage_credits: true, invoices: true },
    settings: { view: false, edit: false, logs: true }
  },
  support_admin: {
    dashboard: { view: true, metrics: false },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create_req: false, edit_req: false, delete_req: false, review: false, approve: false, reject: false },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: false }
  },
  project_manager: {
    dashboard: { view: true, metrics: true },
    projects: { view: true, create: true, edit: true, delete: false, assign: true, status: true },
    clients: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: false, review: true, approve: false, reject: false },
    specialists: { view: true, invite: false, assign: true, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: false }
  },
  content_admin: {
    dashboard: { view: true, metrics: false },
    projects: { view: true, create: false, edit: false, delete: false, assign: false, status: false },
    clients: { view: false, create: false, edit: false, delete: false },
    documents: { view: true, create_req: true, edit_req: true, delete_req: false, review: false, approve: false, reject: false },
    specialists: { view: false, invite: false, assign: false, remove: false },
    finance: { view: false, manage_credits: false, invoices: false },
    settings: { view: false, edit: false, logs: false }
  }
};

// Seed initial SubAdmin for primary admin if none exists
const seedSuperAdminPermission = async () => {
  try {
    const existing = await SubAdminPermission.findOne({ email: 'admin@nexuscraft.com' });
    if (existing) return;

    const adminUser = await User.findOne({ email: 'admin@nexuscraft.com' });
    if (!adminUser) return;

    await SubAdminPermission.create({
      customId: 'SUBADM-SUPER',
      userId: adminUser.customId || adminUser._id,
      name: adminUser.name || 'NexusCraft Super Admin',
      email: adminUser.email,
      phone: adminUser.phone || '+1 (555) 900-0000',
      department: 'General Administration',
      designation: 'Chief Administrator & Systems Director',
      role: 'super_admin',
      permissions: ROLE_PRESETS.super_admin,
      status: 'active',
      createdBy: 'System Bootstrap'
    });
    console.log('✅ Registered Super Admin permission profile.');
  } catch (err) {
    console.error('Super admin permission seeding error:', err);
  }
};

// GET /api/sub-admins — List all sub-admins
subAdminRouter.get('/', async (req, res) => {
  try {
    await seedSuperAdminPermission();
    const { department, role, status, search } = req.query;
    const filter = {};

    if (department && department !== 'All') filter.department = department;
    if (role && role !== 'All') filter.role = role;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const subAdmins = await SubAdminPermission.find(filter).sort({ createdAt: -1 });
    res.json(subAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sub-admins/:id — Single sub-admin
subAdminRouter.get('/:id', async (req, res) => {
  try {
    const subAdmin = await SubAdminPermission.findOne(getFilterById(req.params.id));
    if (!subAdmin) return res.status(404).json({ error: 'Sub-admin record not found.' });
    res.json(subAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sub-admins — Super Admin creates a new Sub-Admin
subAdminRouter.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      password = 'Admin@12345',
      department = 'Operations',
      designation = 'Operations Specialist',
      role = 'operations_admin',
      permissions,
      assignedProjects = [],
      assignedClients = [],
      creatorName = 'Super Admin'
    } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Sub-admin name is required.' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Sub-admin email is required.' });

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({
        customId: `usr-admin-${Date.now().toString(36)}`,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        role: 'admin',
        title: designation,
        company: 'NexusCraft Core Operations',
        isEmailVerified: true,
        createdByAdmin: true
      });
      await user.save();
    } else {
      user.role = 'admin';
      user.title = designation;
      await user.save();
    }

    const customId = `SUBADM-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const effectivePermissions = permissions || ROLE_PRESETS[role] || ROLE_PRESETS.operations_admin;

    const subAdmin = new SubAdminPermission({
      customId,
      userId: user.customId || user._id,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      department,
      designation,
      role,
      permissions: effectivePermissions,
      assignedProjects,
      assignedClients,
      status: 'active',
      createdBy: creatorName
    });

    await subAdmin.save();

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: creatorName,
      actorName: creatorName,
      action: 'CREATE_SUB_ADMIN',
      resourceType: 'SubAdmin',
      resourceId: customId,
      details: { name, email: normalizedEmail, role, department }
    });

    res.status(201).json({ success: true, subAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sub-admins/:id/permissions — Update permissions & assignments
subAdminRouter.patch('/:id/permissions', async (req, res) => {
  try {
    const subAdmin = await SubAdminPermission.findOne(getFilterById(req.params.id));
    if (!subAdmin) return res.status(404).json({ error: 'Sub-admin not found.' });

    const { department, designation, role, permissions, assignedProjects, assignedClients, actorName = 'Super Admin' } = req.body;

    if (department) subAdmin.department = department;
    if (designation) subAdmin.designation = designation;
    if (role) {
      subAdmin.role = role;
      if (!permissions && ROLE_PRESETS[role]) {
        subAdmin.permissions = ROLE_PRESETS[role];
      }
    }
    if (permissions) subAdmin.permissions = permissions;
    if (assignedProjects !== undefined) subAdmin.assignedProjects = assignedProjects;
    if (assignedClients !== undefined) subAdmin.assignedClients = assignedClients;
    subAdmin.updatedAt = new Date();

    await subAdmin.save();

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: actorName,
      actorName,
      action: 'UPDATE_SUB_ADMIN_PERMISSIONS',
      resourceType: 'SubAdmin',
      resourceId: subAdmin.customId,
      details: { role: subAdmin.role, designation: subAdmin.designation }
    });

    res.json({ success: true, subAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sub-admins/:id/status — Toggle status (active/suspended)
subAdminRouter.patch('/:id/status', async (req, res) => {
  try {
    const subAdmin = await SubAdminPermission.findOne(getFilterById(req.params.id));
    if (!subAdmin) return res.status(404).json({ error: 'Sub-admin not found.' });

    if (subAdmin.email === 'admin@nexuscraft.com') {
      return res.status(400).json({ error: 'Cannot deactivate the root Super Administrator.' });
    }

    const { status, actorName = 'Super Admin' } = req.body;
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    subAdmin.status = status;
    subAdmin.updatedAt = new Date();
    await subAdmin.save();

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: actorName,
      actorName,
      action: 'TOGGLE_SUB_ADMIN_STATUS',
      resourceType: 'SubAdmin',
      resourceId: subAdmin.customId,
      details: { status }
    });

    res.json({ success: true, subAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sub-admins/:id — Delete sub-admin
subAdminRouter.delete('/:id', async (req, res) => {
  try {
    const subAdmin = await SubAdminPermission.findOne(getFilterById(req.params.id));
    if (!subAdmin) return res.status(404).json({ error: 'Sub-admin not found.' });

    if (subAdmin.email === 'admin@nexuscraft.com') {
      return res.status(400).json({ error: 'Cannot delete the root Super Administrator.' });
    }

    const customId = subAdmin.customId;
    await SubAdminPermission.deleteOne({ _id: subAdmin._id });

    await AdminActivityLog.create({
      customId: `LOG-${Date.now()}`,
      actorId: req.body.actorName || 'Super Admin',
      actorName: req.body.actorName || 'Super Admin',
      action: 'DELETE_SUB_ADMIN',
      resourceType: 'SubAdmin',
      resourceId: customId,
      details: { name: subAdmin.name, email: subAdmin.email }
    });

    res.json({ success: true, message: 'Sub-admin removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ACTIVITY & AUDIT LOGS
// ─────────────────────────────────────────────────────────────

// GET /api/admin-activity-logs — Chronological audit trail
subAdminRouter.get('/logs/activity', async (req, res) => {
  try {
    const { action, resourceType, actorId, search, limit = 50 } = req.query;
    const filter = {};

    if (action && action !== 'All') filter.action = action;
    if (resourceType && resourceType !== 'All') filter.resourceType = resourceType;
    if (actorId) filter.actorId = actorId;
    if (search) {
      filter.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await AdminActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit) || 50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
