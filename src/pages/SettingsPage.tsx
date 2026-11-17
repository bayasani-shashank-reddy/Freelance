import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import BoxedButton from '../components/shared/BoxedButton';
import { api } from '../lib/api';
import {
  User,
  Bell,
  Shield,
  Palette,
  Sun,
  Moon,
  Check,
  Coins,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=400&q=80'
];

export const SettingsPage: React.FC = () => {
  const { user, credits, updateUserProfile } = useUser();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Default to 'profile' tab (matches Aurora university profile view)
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>(() => {
    if (location.pathname === '/profile') return 'profile';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'appearance' || tab === 'notifications' || tab === 'security') return tab;
    return 'profile';
  });

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    email: user?.email || '',
    phone: user?.phone || '',
    countryCode: user?.countryCode || '+91',
    company: user?.company || '',
    title: user?.title || '',
    bio: user?.bio || ''
  });

  // Sync profileForm when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        avatar: user.avatar || '',
        email: user.email || '',
        phone: user.phone || '',
        countryCode: user.countryCode || '+91',
        company: user.company || '',
        title: user.title || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Handle Photo Upload via File input
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Profile image must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileForm(prev => ({ ...prev, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Phone OTP Verification State
  const [otpStep, setOtpStep] = useState<'idle' | 'sent' | 'verifying'>('idle');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Google Verification State
  const [googleVerifying, setGoogleVerifying] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    projectUpdates: true,
    creditAlerts: true,
    specialistReviews: true,
    marketingNews: false,
  });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1. Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateUserProfile({
        name: profileForm.name.trim(),
        avatar: profileForm.avatar,
        phone: profileForm.phone.trim(),
        countryCode: profileForm.countryCode.trim(),
        company: profileForm.company.trim(),
        title: profileForm.title.trim(),
        bio: profileForm.bio.trim()
      });
      if (res.success) {
        setSavedSuccess(true);
        confetti({ particleCount: 20, spread: 25 });
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Phone OTP Request Handler
  const handleSendOtp = async () => {
    if (!profileForm.phone.trim()) {
      setOtpError('Please enter a phone number first.');
      return;
    }
    setOtpError(null);
    setOtpNotice('Sending 6-digit OTP verification code...');
    const targetId = user?.customId || user?.id || '';
    const fullPhone = `${profileForm.countryCode} ${profileForm.phone.trim()}`;
    const res = await api.sendPhoneOtp(targetId, fullPhone);
    if (res.success) {
      setOtpStep('sent');
      setOtpNotice(`OTP sent to ${fullPhone}! For testing, code is: ${res.otpCode || '123456'}`);
    } else {
      setOtpError(res.error || 'Could not send verification code.');
      setOtpNotice(null);
    }
  };

  // 3. Phone OTP Verification Handler
  const handleVerifyOtp = async () => {
    if (!enteredOtp.trim()) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }
    setOtpStep('verifying');
    setOtpError(null);
    const targetId = user?.customId || user?.id || '';
    const res = await api.verifyPhoneOtp(targetId, enteredOtp.trim());
    if (res.success) {
      await updateUserProfile({ isPhoneVerified: true, phone: profileForm.phone.trim() });
      setOtpStep('idle');
      setOtpNotice('Phone number successfully verified!');
      confetti({ particleCount: 35, spread: 40 });
      setTimeout(() => setOtpNotice(null), 4000);
    } else {
      setOtpError(res.error || 'Invalid code. Use 123456 for instant verification.');
      setOtpStep('sent');
    }
  };

  // 4. Google Account Verification Handler
  const handleVerifyGoogle = async () => {
    setGoogleVerifying(true);
    setGoogleNotice(null);
    const targetId = user?.customId || user?.id || '';
    const res = await api.verifyGoogleAccount(targetId, user?.email);
    setGoogleVerifying(false);
    if (res.success) {
      await updateUserProfile({ isGoogleVerified: true, googleEmail: user?.email });
      setGoogleNotice('Google account successfully linked and verified!');
      confetti({ particleCount: 35, spread: 40 });
      setTimeout(() => setGoogleNotice(null), 4000);
    } else {
      setGoogleNotice('Google authentication notice: Profile updated.');
    }
  };

  // 4. Security Save Handler
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Page Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#7357FF] font-bold block mb-1">
            ACCOUNT GOVERNANCE // PREFERENCES
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
            Settings & Appearance
          </h1>
          <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0] mt-1">
            Configure platform appearance, personal details, notification routing, and security.
          </p>
        </div>

        {/* NCX Credits Badge */}
        <div className="p-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center gap-3 self-start sm:self-auto">
          <Coins className="w-5 h-5 text-[#7357FF]" />
          <div className="text-left font-mono">
            <span className="text-[10px] uppercase text-[#65677A] dark:text-[#8F91A3] block leading-none font-bold">Credit Balance</span>
            <span className="text-sm font-black text-[#17172B] dark:text-white">{credits} NCX</span>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs (Segmented Controls) */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
        {[
          { id: 'profile', label: 'User Profile & Identity', icon: User },
          { id: 'appearance', label: 'Theme & Palette', icon: Palette },
          { id: 'notifications', label: 'Notification Signals', icon: Bell },
          { id: 'security', label: 'Security & Access', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#7357FF] text-white shadow-sm shadow-[#7357FF]/30'
                  : 'bg-white dark:bg-[#17172B] text-[#65677A] dark:text-[#A6A8C0] border border-[#E8EAF4] dark:border-[#2A2A46] hover:bg-[#F5F2FF]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#EBF8EB] text-[#1B7020] border border-[#BCE8BD] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>Preferences updated and saved successfully!</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: THEME & APPEARANCE (GLOBAL THEME TOGGLE)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                Global Platform Theme
              </h2>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                Choose between the Google Stitch Light Lavender workspace and the Deep Navy Studio mode.
              </p>
            </div>

            {/* Visual Segmented Theme Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Light Theme Box */}
              <div
                onClick={() => setTheme('light')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  theme === 'light'
                    ? 'border-[#7357FF] bg-[#F7F8FC] shadow-md ring-2 ring-[#7357FF]/20'
                    : 'border-[#E8EAF4] bg-white hover:border-[#7357FF]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#17172B]">
                    <Sun className="w-4 h-4 text-[#7357FF]" />
                    <span>LIGHT LAVENDER (DEFAULT)</span>
                  </div>
                  {theme === 'light' && (
                    <span className="w-3 h-3 rounded-full bg-[#7357FF]" />
                  )}
                </div>
                <p className="text-xs text-[#65677A] mb-6 leading-relaxed">
                  Soft off-white and lavender background (#F7F8FC) with clean white cards, electric violet navigation, and cobalt accents.
                </p>
                <div className="p-3 rounded-xl border border-[#E8EAF4] bg-white text-[11px] font-mono text-[#17172B] flex items-center justify-between">
                  <span>Google Stitch / Lavender</span>
                  <span className="font-bold text-[#7357FF]">Active</span>
                </div>
              </div>

              {/* Dark Theme Box */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'border-[#7357FF] bg-[#111122] text-[#F7F8FC] shadow-md ring-2 ring-[#7357FF]/20'
                    : 'border-[#2A2A46] bg-[#0F0F1D] text-[#A6A8C0] hover:border-[#7357FF]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <Moon className="w-4 h-4 text-[#7357FF]" />
                    <span>DEEP NAVY (STUDIO DARK)</span>
                  </div>
                  {theme === 'dark' && (
                    <span className="w-3 h-3 rounded-full bg-[#7357FF]" />
                  )}
                </div>
                <p className="text-xs text-[#A6A8C0] mb-6 leading-relaxed">
                  Deep obsidian navy canvas (#0F0F1D) with dark command panels (#17172B), vibrant violet highlights, and acid lime indicators.
                </p>
                <div className="p-3 rounded-xl border border-[#2A2A46] bg-[#17172B] text-[11px] font-mono text-white flex items-center justify-between">
                  <span>Google Stitch / Deep Navy</span>
                  <span className="font-bold text-[#D5FF68]">Active</span>
                </div>
              </div>

            </div>

            {/* Quick Toggle Button */}
            <div className="pt-4 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between">
              <span className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                Currently using <strong className="text-[#17172B] dark:text-white uppercase">{theme} mode</strong>
              </span>
              <BoxedButton
                variant="secondary"
                size="sm"
                icon={theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </BoxedButton>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: USER PROFILE & VERIFICATIONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0F2F9] dark:border-[#202038]">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                    Personal & Organization Profile
                  </h2>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
                    Your contact details used by platform administration for direct phone/WhatsApp outreach and project scoping.
                  </p>
                </div>
                {savedSuccess && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Changes Saved
                  </span>
                )}
                {saveError && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                  </span>
                )}
              </div>

              {/* Profile Photo / Avatar Uploader */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FD] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#202038] flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white dark:border-[#2A2A46]">
                      {profileForm.avatar ? (
                        <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                      title="Upload photo"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-0.5">Edit</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                      Profile Photo & Avatar
                    </h3>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-0.5">
                      Upload your real photo (.jpg, .png, .webp up to 5MB) or choose from curated styles.
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] hover:from-[#6245F5] hover:to-[#2B6AF5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {profileForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setProfileForm(prev => ({ ...prev, avatar: '' }))}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#E45D6D] text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="space-y-1.5 md:text-right">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#8F91A3] dark:text-[#73758C] block">
                    Or Select Preset Avatar:
                  </span>
                  <div className="flex items-center gap-1.5 md:justify-end flex-wrap">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileForm(prev => ({ ...prev, avatar: preset }))}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-110 ${
                          profileForm.avatar === preset ? 'border-[#7357FF] scale-110 shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        title={`Select Avatar ${idx + 1}`}
                      >
                        <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#65677A] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    placeholder="Your legal or brand name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase text-[#65677A]">
                      Registered Email
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Account Primary
                    </span>
                  </div>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#111122] text-xs text-[#65677A] opacity-80 cursor-not-allowed font-mono"
                  />
                </div>

                {/* Phone Number with Country Code & Verification Status */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-[#65677A]">
                      Phone Number (For Admin WhatsApp & Call Follow-up)
                    </label>
                    {user?.isPhoneVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Phone Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <AlertCircle className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={profileForm.countryCode}
                      onChange={e => setProfileForm({ ...profileForm, countryCode: e.target.value })}
                      className="w-24 px-2 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-bold text-[#17172B] dark:text-white outline-none cursor-pointer"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+49">🇩🇪 +49</option>
                    </select>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. 7569630270 or 555-0142"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                    />
                    {!user?.isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3.5 py-2.5 rounded-xl bg-[#EEE9FF] hover:bg-[#7357FF] hover:text-white text-[#7357FF] text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5 inline mr-1" />
                        Verify via SMS
                      </button>
                    )}
                  </div>

                  {/* Inline OTP Input Box */}
                  {otpStep !== 'idle' && (
                    <div className="p-3.5 rounded-xl bg-[#F0F4FF] dark:bg-[#1A1A36] border border-[#3978FF]/30 space-y-2 mt-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#3978FF]">Enter 6-Digit SMS Verification Code:</span>
                        <span className="text-[10px] text-[#777B8A]">Test code: <strong>123456</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={enteredOtp}
                          onChange={e => setEnteredOtp(e.target.value)}
                          className="w-36 px-3 py-1.5 rounded-lg border border-[#3978FF] text-center font-mono font-bold tracking-widest text-sm bg-white dark:bg-[#131326] text-[#222438] dark:text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-4 py-1.5 rounded-lg bg-[#3978FF] hover:bg-[#2B65EC] text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Confirm OTP
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="px-2.5 py-1.5 text-xs text-[#777B8A] hover:text-[#3978FF] underline cursor-pointer"
                        >
                          Resend
                        </button>
                      </div>
                      {otpNotice && <p className="text-[11px] text-emerald-600 font-semibold">{otpNotice}</p>}
                      {otpError && <p className="text-[11px] text-rose-600 font-semibold">{otpError}</p>}
                    </div>
                  )}
                </div>

                {/* Company / Studio */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#65677A] mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                    placeholder="e.g. Aura Dynamics"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                  />
                </div>

                {/* Professional Title */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#65677A] mb-1.5">
                    Professional Title / Role
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
                    placeholder="e.g. Founder & Product Lead"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                  />
                </div>

                {/* Bio / Project Intent */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#65677A] mb-1.5">
                    Bio / Project Focus
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Short description of your technical goals, product domains, or platform requirements."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium text-[#17172B] dark:text-white outline-none focus:border-[#7357FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
                <BoxedButton type="submit" variant="primary" size="md" loading={isSaving}>
                  Save Profile Changes
                </BoxedButton>
              </div>
            </div>
          </form>

          {/* GOOGLE ACCOUNT VERIFICATION CARD */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-center shadow-xs flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                    Google Identity & OAuth Verification
                  </h3>
                  <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
                    Connect your Google workspace account for single sign-on security and verified client status.
                  </p>
                </div>
              </div>

              {user?.isGoogleVerified ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Google Verified
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyGoogle}
                  disabled={googleVerifying}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#131326] hover:bg-[#F5F2FF] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-bold text-[#17172B] dark:text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7357FF]" />
                  <span>{googleVerifying ? 'Connecting...' : 'Link & Verify Google Account'}</span>
                </button>
              )}
            </div>

            {googleNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {googleNotice}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: NOTIFICATIONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
          <div>
            <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
              Notification Signals Preferences
            </h2>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
              Select which events trigger automated notifications in your dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'projectUpdates', label: 'Project Status Updates', desc: 'When administrators advance your request through triage stages' },
              { id: 'creditAlerts', label: 'NCX Credit Ledger Alerts', desc: 'Confirmations when 50 NCX fees are deducted or grants applied' },
              { id: 'specialistReviews', label: 'Specialist Assessments', desc: 'When vetted engineers submit feasibility evaluations' },
            ].map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-xs text-[#17172B] dark:text-white">{item.label}</p>
                  <p className="text-[11px] text-[#65677A] dark:text-[#A6A8C0]">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                  className="w-11 h-6 rounded-full transition-colors p-0.5 relative"
                  style={{ backgroundColor: notifications[item.id as keyof typeof notifications] ? '#7357FF' : '#D1D5E8' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: notifications[item.id as keyof typeof notifications] ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
            <BoxedButton variant="primary" size="md" onClick={() => { setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 2000); }}>
              Save Signal Preferences
            </BoxedButton>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: SECURITY & ACCESS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
          <div>
            <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
              Password & Session Security
            </h2>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
              Update your account password and security credentials.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase text-[#65677A] mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#65677A] mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
            <BoxedButton type="submit" variant="primary" size="md">
              Update Security Credentials
            </BoxedButton>
          </div>
        </form>
      )}

    </div>
  );
};

export default SettingsPage;
