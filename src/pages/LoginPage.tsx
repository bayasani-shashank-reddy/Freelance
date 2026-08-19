import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, SEED_ACCOUNTS } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../types';

const MotionDiv = motion.div as any;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { authenticateUser, login } = useUser();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [email, setEmail] = useState('client@nexuscraft.com');
  const [password, setPassword] = useState('Client@12345');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    const seed = SEED_ACCOUNTS.find((a) => a.role === role);
    if (seed) {
      setEmail(seed.email);
      setPassword(seed.password || 'Admin@12345');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = authenticateUser(email, password);
    if (res.success && res.user) {
      showToast({ type: 'success', title: `Welcome back, ${res.user.name}!`, message: `Logged in as ${res.user.role}.` });
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'freelancer') navigate('/freelancer/dashboard');
      else navigate('/client/dashboard');
    } else {
      // Fallback seed match by role if user typed standard demo pass
      const seedMatch = SEED_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (seedMatch) {
        login(seedMatch);
        showToast({ type: 'success', title: `Welcome, ${seedMatch.name}!`, message: `Signed in as ${seedMatch.role}.` });
        if (seedMatch.role === 'admin') navigate('/admin/dashboard');
        else if (seedMatch.role === 'freelancer') navigate('/freelancer/dashboard');
        else navigate('/client/dashboard');
      } else {
        const errMsg = res.error || 'Invalid credentials. Please check your email & password.';
        setError(errMsg);
        showToast({ type: 'error', title: 'Login Failed', message: errMsg });
      }
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-950 flex items-center justify-center p-4 text-slate-200">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg glass-card border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sign In to NexusCraft</h1>
          <p className="text-xs font-mono text-slate-400">Select your account role and enter credentials to access your dashboard.</p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleSelect('client')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'client'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Client / User</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('freelancer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'freelancer'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Freelancer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center font-bold">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-mono text-slate-300 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-mono text-slate-300 font-bold">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Sign In as {selectedRole.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs space-y-2 border-t border-slate-800">
          <p className="text-slate-400">
            Need a new account?{' '}
            <Link to="/register" className="text-cyan-400 font-bold hover:underline">
              Create Client or Freelancer Account
            </Link>
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-slate-400 text-left space-y-1">
            <div className="text-cyan-400 font-bold">DEMO CREDENTIALS REFERENCE:</div>
            <div>• Admin: admin@nexuscraft.com (Pass: Admin@12345)</div>
            <div>• Client: client@nexuscraft.com (Pass: Client@12345)</div>
            <div>• Freelancer: freelancer@nexuscraft.com (Pass: Freelancer@12345)</div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default LoginPage;
