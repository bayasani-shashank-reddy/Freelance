import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  countryCode: { type: String, default: '+1' },
  password: { type: String, required: true, default: 'Client@12345' },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
  status: { type: String, enum: ['active', 'inactive', 'archived', 'suspended'], default: 'active' },
  credits: { type: Number, default: 500 },
  balance: { type: Number, default: 0 },
  escrowBalance: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  title: { type: String, default: '' },
  skills: [{ type: String }],
  technicalSpecialties: [{ type: String }],
  company: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  experience: { type: String, default: '' },
  bio: { type: String, default: '' },
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' },
  
  // Email Verification (ID 8)
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },

  // Password Recovery (ID 9)
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

  // Two-Factor Authentication (ID 11)
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  recoveryCodes: [{ type: String }],

  // Profile Preferences (ID 14)
  notificationPreferences: {
    emailUpdates: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    milestoneAlerts: { type: Boolean, default: true },
    browserPush: { type: Boolean, default: true }
  },

  // Availability & Vacation Mode (ID 108)
  availability: { type: String, enum: ['Available', 'Busy', 'On Leave', 'Available Now'], default: 'Available' },
  vacationMode: { type: Boolean, default: false },
  vacationStart: { type: Date },
  vacationEnd: { type: Date },
  dailyCapacityHours: { type: Number, default: 8 },
  workingDays: [{ type: String }],

  // Skill Verification & Badges (ID 112)
  verifiedSkills: [
    {
      skill: { type: String },
      score: { type: Number },
      verifiedAt: { type: Date, default: Date.now },
      badge: { type: String, default: 'Verified Specialist' }
    }
  ],

  portfolio: [
    {
      title: { type: String },
      url: { type: String },
      description: { type: String }
    }
  ],
  isPublicProfile: { type: Boolean, default: false }, // ID 107
  createdByAdmin: { type: Boolean, default: false },
  verificationBadge: { type: String, default: 'Verified Member' },
  trustScore: { type: Number, default: 98 },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook for password hashing (ID 3)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    // Only hash if not already a valid bcrypt hash
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare candidate password (ID 3)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  // If stored password is not yet bcrypt hashed (legacy transition support)
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    const isMatch = this.password === candidatePassword;
    if (isMatch) {
      // Opportunistically rehash
      this.password = candidatePassword;
      await this.save();
    }
    return isMatch;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization: NEVER return passwords or 2FA secrets
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.recoveryCodes;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    return ret;
  }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
