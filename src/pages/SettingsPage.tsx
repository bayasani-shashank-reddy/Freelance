import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import BoxedButton from '../components/shared/BoxedButton';
import {
  User,
  Bell,
  Shield,
  Palette,
  Sun,
  Moon,
  Check,
  Coins
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, credits } = useUser();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'notifications' | 'security'>('appearance');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Rivera',
    email: user?.email || 'alex.rivera@client.com',
    phone: user?.phone || '+1 555-0142',
    company: user?.company || 'Aura Dynamics',
  });

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

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
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
          { id: 'appearance', label: 'Theme & Palette', icon: Palette },
          { id: 'profile', label: 'User Profile', icon: User },
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
          TAB 2: USER PROFILE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white">
                Personal & Organization Information
              </h2>
              <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] mt-1">
                Your registered contact details used by administrators for follow-up and brief scoping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#65677A] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#65677A] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-[#F7F8FC] dark:bg-[#111122] text-xs opacity-75 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#65677A] mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#65677A] mb-2">
                  Company / Studio
                </label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF4] dark:border-[#2A2A46] bg-white dark:bg-[#131326] text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#F0F2F9] dark:border-[#202038]">
              <BoxedButton type="submit" variant="primary" size="md">
                Save Profile Changes
              </BoxedButton>
            </div>
          </div>
        </form>
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
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
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
