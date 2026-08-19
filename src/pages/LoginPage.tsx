import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const MotionDiv = motion.div as any;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { authenticateUser } = useUser();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    const res = authenticateUser(email.trim(), password);
    if (res.success && res.user) {
      showToast({
        type: 'success',
        title: `Welcome, ${res.user.name}!`,
        message: res.user.role === 'admin' ? 'Signed in as Platform Administrator.' : `Logged in as ${res.user.role}.`,
      });

      // Automatic direct routing based on user's actual role in MongoDB / state
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } else {
      const errMsg = res.error || 'Invalid email or password. Please try again.';
      setError(errMsg);
      showToast({ type: 'error', title: 'Login Failed', message: errMsg });
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-950 flex items-center justify-center p-4 text-slate-200">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-indigo-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sign In to NexusCraft</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access your account workspace.</p>
        </div>

        {/* 2 Role Tabs: Client & Freelancer (Admin automatically detected from credentials) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('client');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'client'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('freelancer');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'freelancer'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Freelancer</span>
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
                placeholder="you@example.com"
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
                placeholder="Enter your password"
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
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs border-t border-slate-800">
          <p className="text-slate-400">
            Need an account?{' '}
            <Link to="/register" className="text-cyan-400 font-bold hover:underline">
              Create Client or Freelancer Account
            </Link>
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default LoginPage;
