import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Briefcase, Code, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { ViewMode, User, UserRole } from '../types';
import { useUser, NEW_USER_CREDITS } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { NcxCoinIcon, NcxCreditBadge } from '../components/NcxCredit';

const MotionDiv = motion.div as any;

interface RegisterPageProps {
  onNavigate?: (view: ViewMode) => void;
  onLogin?: (user: User) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = () => {
  const navigate = useNavigate();
  const { registerUser } = useUser();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const handleNextStep = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const mockUser: User = {
      id: `usr-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      balance: 0,
      escrowBalance: 0,
      credits: role === 'client' ? NEW_USER_CREDITS : 0,
      approvalStatus: role === 'freelancer' ? 'pending' : 'approved',
    };

    const res = registerUser(mockUser);
    if (res.requiresApproval) {
      setRegisteredName(formData.name);
      setPendingNotice(true);
    } else {
      navigate('/client/dashboard');
    }
  };


  if (pendingNotice) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full glass-card border border-cyan-500/40 p-8 rounded-3xl text-center space-y-6 bg-slate-900/95 text-slate-200 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/40">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">Freelancer Application Registered!</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Your freelancer profile has been submitted and is currently <strong className="text-cyan-300">Pending Admin Review & Approval</strong>. Once approved by the Platform Admin, you can log in to view opportunities and submit proposals.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">APPLICANT NAME:</span>
              <span className="text-white font-bold">{registeredName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">EMAIL:</span>
              <span className="text-cyan-300">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">APPROVAL STATUS:</span>
              <span className="text-amber-400 font-bold">● PENDING ADMIN REVIEW</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-950 flex items-center justify-center p-4 text-slate-200">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl glass-card border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>NEXUSCRAFT ONBOARDING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {step === 1 ? 'Choose Account Type' : `Register as ${role === 'freelancer' ? 'Freelancer' : 'Client / User'}`}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 1 ? 'Select whether you are joining to post projects or provide freelance services.' : 'Enter your details to create your account.'}
          </p>
        </div>

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onClick={() => handleNextStep('client')}
              className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950 hover:border-cyan-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Client / Project Owner
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1">
                      <NcxCoinIcon size="xs" />
                      +500 NCX Gift
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Get 500 free NCX digital credits to test & submit ideas directly to admin.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div
              onClick={() => handleNextStep('freelancer')}
              className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950 hover:border-indigo-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Freelancer / Specialist
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    I want to apply for jobs, submit proposals, and earn milestone payouts.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        )}

        {/* STEP 2: USER DETAILS FORM */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {role === 'client' && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-3">
                <NcxCoinIcon size="md" className="shrink-0 animate-bounce" />
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Includes</span>
                    <NcxCreditBadge amount={NEW_USER_CREDITS} size="xs" />
                    <span>Free Digital Credits</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Instantly test project idea submissions upon sign up!</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center font-bold">
                ⚠ {error}
              </div>
            )}

            <div>
              <label className="block font-mono text-slate-300 font-bold mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-slate-300 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-slate-300 font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-slate-300 font-bold mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:bg-slate-900"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <span>Complete Registration</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 text-xs border-t border-slate-800">
          <p className="text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default RegisterPage;
