import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Lock,
  LogOut,
  ChevronRight,
  Camera,
  Check,
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-400" />
            Settings
          </h1>
          <p className="text-slate-400 mt-1">Manage your account preferences and configuration</p>
        </motion.div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4"
          >
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 text-white border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                    {tab.label}
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90 text-cyan-400' : ''}`} />
                  </button>
                );
              })}
              <hr className="border-slate-800 my-3" />
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl"
          >
            {activeTab === 'profile' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                      JD
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">John Doe</h3>
                    <p className="text-sm text-slate-400">john@nexuscraft.io</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                    <input
                      type="text"
                      defaultValue="johndoe"
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john@nexuscraft.io"
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        defaultValue="San Francisco, CA"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="Creative director & design enthusiast. Building the future of digital experiences."
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Save */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSave}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      saved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved!
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Email notifications', desc: 'Receive email updates about your projects', default: true },
                    { label: 'Push notifications', desc: 'Get notified in your browser', default: true },
                    { label: 'New messages', desc: 'Notify when designers send you messages', default: true },
                    { label: 'Project milestones', desc: 'Alerts when milestones are reached', default: true },
                    { label: 'Marketing emails', desc: 'Receive news and promotional offers', default: false },
                    { label: 'Weekly digest', desc: 'Summary of platform activity', default: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-white">{item.label}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-cyan-600 peer-checked:after:bg-white"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h4 className="text-sm font-medium text-white">Password</h4>
                          <p className="text-xs text-slate-400">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-xs font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
                        Change
                      </button>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="text-sm font-medium text-white">Two-Factor Authentication</h4>
                          <p className="text-xs text-slate-400">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-xs font-medium text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Billing & Payments</h2>
                <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Current Plan</span>
                      <h3 className="text-xl font-bold text-white mt-1">Professional</h3>
                      <p className="text-sm text-slate-400 mt-0.5">$49/month · Unlimited projects</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-lg transition-all">
                      Upgrade
                    </button>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <h4 className="text-sm font-medium text-white">Visa ending in 4242</h4>
                      <p className="text-xs text-slate-400">Expires 12/2027</p>
                    </div>
                  </div>
                  <button className="text-xs text-cyan-400 hover:underline">Update payment method</button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Theme</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: 'Dark', active: true, colors: 'from-slate-900 to-slate-800' },
                        { name: 'Light', active: false, colors: 'from-slate-100 to-white' },
                        { name: 'System', active: false, colors: 'from-slate-900 via-slate-400 to-white' },
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          className={`p-4 rounded-xl border transition-all text-center ${
                            theme.active
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${theme.colors} mb-2`} />
                          <span className="text-sm font-medium text-slate-200">{theme.name}</span>
                          {theme.active && <Check className="w-4 h-4 text-cyan-400 mx-auto mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
