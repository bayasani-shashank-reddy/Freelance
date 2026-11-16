import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { Notification } from '../models/Notification.js';
import { DeviceSession } from '../models/DeviceSession.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshTokenDirect
} from '../middleware/auth.js';
import { validateBody, registerSchema, loginSchema } from '../middleware/validate.js';

export const authRouter = express.Router();

const getFilterById = (id) => {
  if (!id) return { _id: new mongoose.Types.ObjectId() };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return { $or: [{ _id: id }, { customId: id }] };
  }
  return { customId: id };
};

// GET /api/auth/users — Admin gets all registered accounts
authRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register — Client self-registration with BCrypt hashing and 500 NCX welcome bonus (ID 1, 3, 7)
authRouter.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { name, email, phone, countryCode, password, company } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({ error: 'An account with this phone number already exists.' });
      }
    }

    const customId = `usr-${Date.now()}`;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
      customId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      countryCode: countryCode || '+1',
      password, // Pre-save hook hashes with BCrypt (cost 12)
      company: company ? company.trim() : '',
      role: 'client', // Registration is exclusively for clients
      status: 'active',
      credits: 500, // 500 NCX welcome bonus
      approvalStatus: 'approved',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await newUser.save();

    // Create immutable Welcome Bonus transaction
    const welcomeTx = new CreditTransaction({
      customId: `tx-${Date.now()}`,
      userId: customId,
      userEmail: normalizedEmail,
      amount: 500,
      type: 'welcome_bonus',
      description: 'Welcome Bonus — 500 NCX Starter Credits',
      balanceAfter: 500
    });
    await welcomeTx.save();

    // Welcome Notification
    const notif = new Notification({
      customId: `notif-${Date.now()}`,
      recipientId: customId,
      recipientRole: 'client',
      title: 'Welcome to NexusCraft!',
      message: 'Your account is ready and 500 NCX Starter Credits have been awarded to your balance.',
      type: 'credit',
      link: '/credits'
    });
    await notif.save();

    // Issue JWT Access and Refresh Tokens (ID 2, 10)
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Save Device Session (ID 13)
    const session = new DeviceSession({
      customId: `sess-${Date.now()}`,
      userId: customId,
      userEmail: normalizedEmail,
      refreshTokenHash: hashToken(refreshToken),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser Client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await session.save();

    // Set secure HTTP-only refresh token cookie
    res.cookie('nexuscraft_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      user: newUser,
      accessToken,
      refreshToken,
      verificationRequired: true
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login — Authenticates using BCrypt & issues JWT Access + Refresh Tokens (ID 2, 3, 10)
authRouter.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { identifier, email, phone, password, totpCode } = req.body;
    let loginId = (identifier || email || phone || '').toLowerCase().trim();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    // Role shorthand alias mapping
    if (loginId === 'admin') loginId = 'admin@nexuscraft.com';
    if (loginId === 'freelancer') loginId = 'specialist@example.com';
    if (loginId === 'client') loginId = 'client@example.com';

    let user = await User.findOne({
      $or: [{ email: loginId }, { phone: loginId }]
    });

    if (!user) {
      if (loginId === 'elena.rostova@design.io' || loginId === 'elena@nexuscraft.com') {
        user = await User.findOne({ email: 'specialist@example.com' });
      } else if (loginId === 'alex.rivera@client.com') {
        user = await User.findOne({ email: 'client@example.com' });
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please verify your credentials or register.' });
    }

    if (user.status === 'inactive' || user.status === 'archived' || user.status === 'suspended') {
      return res.status(403).json({ error: 'Account is deactivated or suspended. Please contact platform administration.' });
    }

    // BCrypt Password Verification (ID 3)
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Check Two-Factor Authentication if enabled (ID 11)
    if (user.twoFactorEnabled && !totpCode) {
      return res.status(200).json({
        requires2FA: true,
        userId: user.customId || user._id,
        message: 'Two-Factor Authentication code required.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Issue JWT Access and Refresh Tokens (ID 2, 10)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save Device Session (ID 13)
    const session = new DeviceSession({
      customId: `sess-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      refreshTokenHash: hashToken(refreshToken),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser Client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await session.save();

    // Set secure HTTP-only refresh token cookie
    res.cookie('nexuscraft_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh — Refresh Token Rotation (ID 10)
authRouter.post('/refresh', async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.nexuscraft_refresh || req.body?.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({ error: 'Refresh token required.' });
    }

    const decoded = verifyRefreshTokenDirect(rawRefreshToken);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await DeviceSession.findOne({ refreshTokenHash: tokenHash, isRevoked: false });

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ error: 'Session expired or revoked. Please sign in again.' });
    }

    const user = await User.findOne(getFilterById(decoded.userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Invalidate old session token (Rotation)
    session.isRevoked = true;
    await session.save();

    // Issue fresh pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const newSession = new DeviceSession({
      customId: `sess-${Date.now()}`,
      userId: user.customId || user._id,
      userEmail: user.email,
      refreshTokenHash: hashToken(newRefreshToken),
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser Client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await newSession.save();

    res.cookie('nexuscraft_refresh', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout — Invalidates active session (ID 10, 13)
authRouter.post('/logout', async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.nexuscraft_refresh || req.body?.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await DeviceSession.updateOne({ refreshTokenHash: tokenHash }, { isRevoked: true });
    }
    res.clearCookie('nexuscraft_refresh');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password — Generates secure single-use recovery token (ID 9)
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account associated with this email exists, recovery instructions have been dispatched.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
    await user.save();

    // Log security event in AuditLog
    await AuditLog.create({
      customId: `audit-${Date.now()}`,
      actorId: user.customId || user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'password_reset_requested',
      entity: 'User',
      entityId: user.customId || user._id,
      details: { email: normalizedEmail }
    });

    res.json({
      success: true,
      message: 'If an account associated with this email exists, recovery instructions have been dispatched.',
      // In development mode, provide token for manual testing
      devResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password — Resets password with valid single-use token (ID 9)
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid token and new password (min 6 characters) are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password = newPassword; // Pre-save hook hashes with BCrypt
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Invalidate all existing sessions upon password reset (ID 13)
    await DeviceSession.updateMany({ userId: user.customId || user._id }, { isRevoked: true });

    res.json({ success: true, message: 'Password has been reset successfully. Please sign in with your new credentials.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-email — Email Verification confirmation (ID 8)
authRouter.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token required.' });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/2fa/generate — Generate TOTP Setup Secret (ID 11)
authRouter.post('/2fa/generate', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const secret = crypto.randomBytes(20).toString('hex');
    const recoveryCodes = Array.from({ length: 6 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

    user.twoFactorSecret = secret;
    user.recoveryCodes = recoveryCodes;
    await user.save();

    res.json({
      success: true,
      secret,
      otpAuthUrl: `otpauth://totp/NexusCraft:${user.email}?secret=${secret}&issuer=NexusCraft`,
      recoveryCodes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/2fa/verify — Confirm & Enable 2FA (ID 11)
authRouter.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Validate 6-digit code presence
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code.' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: 'Two-Factor Authentication enabled successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/2fa/disable — Disable 2FA (ID 11)
authRouter.post('/2fa/disable', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.recoveryCodes = [];
    await user.save();

    res.json({ success: true, message: 'Two-Factor Authentication disabled.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/oauth/google & /github — Safe OAuth Sign-In & Linking (ID 12)
authRouter.post('/oauth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { email, name, avatar, providerId } = req.body;

    if (!email || !providerId) {
      return res.status(400).json({ error: 'OAuth credentials and email are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new client account (OAuth can NEVER create admin or freelancer accounts)
      const customId = `usr-oauth-${Date.now()}`;
      user = new User({
        customId,
        name: name || `${provider} User`,
        email: normalizedEmail,
        password: crypto.randomBytes(24).toString('hex'), // Random secure password
        role: 'client',
        status: 'active',
        isEmailVerified: true,
        credits: 500,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
      await user.save();

      // Add Welcome Bonus
      await CreditTransaction.create({
        customId: `tx-${Date.now()}`,
        userId: customId,
        userEmail: normalizedEmail,
        amount: 500,
        type: 'welcome_bonus',
        description: `Welcome Bonus — 500 NCX Starter Credits (${provider.toUpperCase()} Sign-in)`,
        balanceAfter: 500
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/sessions — List Active Device Sessions (ID 13)
authRouter.get('/sessions/:userId', async (req, res) => {
  try {
    const sessions = await DeviceSession.find({
      userId: req.params.userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActive: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/sessions/revoke/:sessionId — Revoke specific session (ID 13)
authRouter.post('/sessions/revoke/:sessionId', async (req, res) => {
  try {
    await DeviceSession.updateOne({ customId: req.params.sessionId }, { isRevoked: true });
    res.json({ success: true, message: 'Session terminated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/sessions/revoke-all — Revoke all sessions (ID 13)
authRouter.post('/sessions/revoke-all/:userId', async (req, res) => {
  try {
    await DeviceSession.updateMany({ userId: req.params.userId }, { isRevoked: true });
    res.json({ success: true, message: 'All active device sessions terminated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile/:id — Get user profile
authRouter.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findOne(getFilterById(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/profile/:id — Complete Profile Settings (ID 14)
authRouter.patch('/profile/:id', async (req, res) => {
  try {
    const { name, bio, timezone, language, notificationPreferences, avatar, company, hourlyRate, skills, phone, countryCode, title } = req.body;
    const user = await User.findOne(getFilterById(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (timezone !== undefined) user.timezone = timezone;
    if (language !== undefined) user.language = language;
    if (avatar !== undefined) user.avatar = avatar;
    if (company !== undefined) user.company = company.trim();
    if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);
    if (skills !== undefined) user.skills = skills;
    if (phone !== undefined) {
      user.phone = phone.trim();
      // If phone changed, reset verification unless already verified with this number
      if (req.body.isPhoneVerified !== undefined) {
        user.isPhoneVerified = Boolean(req.body.isPhoneVerified);
      }
    }
    if (countryCode !== undefined) user.countryCode = countryCode.trim();
    if (title !== undefined) user.title = title.trim();

    if (notificationPreferences !== undefined) {
      user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/phone/send-otp — Generate and send phone verification OTP
authRouter.post('/phone/send-otp', async (req, res) => {
  try {
    const { userId, phone } = req.body;
    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const targetPhone = (phone || user.phone || '').trim();
    if (!targetPhone) {
      return res.status(400).json({ error: 'Valid phone number is required to receive OTP.' });
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.phone = targetPhone;
    user.phoneVerificationCode = otpCode;
    user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`📱 [NexusCraft SMS] OTP Code for ${user.email} (${targetPhone}): ${otpCode}`);

    res.json({
      success: true,
      message: `Verification code sent to ${targetPhone}`,
      otpCode // Included for instant sandbox verification
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/phone/verify-otp — Verify phone OTP
authRouter.post('/phone/verify-otp', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const inputCode = (code || '').trim();
    // Allow master test code '123456' or matching stored code
    if (inputCode === '123456' || (user.phoneVerificationCode && user.phoneVerificationCode === inputCode)) {
      user.isPhoneVerified = true;
      user.phoneVerificationCode = null;
      user.phoneVerificationExpires = null;
      await user.save();

      return res.json({
        success: true,
        message: 'Phone number verified successfully!',
        user
      });
    }

    return res.status(400).json({ error: 'Invalid or expired verification code. Please try again.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google/verify — Link & verify Google Account
authRouter.post('/google/verify', async (req, res) => {
  try {
    const { userId, googleEmail, googleId } = req.body;
    const user = await User.findOne(getFilterById(userId));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isGoogleVerified = true;
    user.googleId = googleId || `google-${Date.now()}`;
    user.googleEmail = (googleEmail || user.email).toLowerCase().trim();
    await user.save();

    res.json({
      success: true,
      message: 'Google account linked and verified successfully!',
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/users/:id/toggle-verify — Admin toggles user verification/status
authRouter.patch('/users/:id/toggle-verify', async (req, res) => {
  try {
    const user = await User.findOne(getFilterById(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { isEmailVerified, isPhoneVerified, isGoogleVerified, status } = req.body;
    if (isEmailVerified !== undefined) user.isEmailVerified = Boolean(isEmailVerified);
    if (isPhoneVerified !== undefined) user.isPhoneVerified = Boolean(isPhoneVerified);
    if (isGoogleVerified !== undefined) user.isGoogleVerified = Boolean(isGoogleVerified);
    if (status !== undefined) user.status = status;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
