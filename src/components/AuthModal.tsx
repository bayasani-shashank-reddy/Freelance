import React, { useState } from 'react';
import { X, Lock, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  title = 'Login Required',
  subtitle = 'Please log in or create an account to access project workspace and proposals.',
}) => {
  const { login, registerUser } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [email, setEmail] = useState('client@nexuscraft.io');
  const [name, setName] = useState('Alex Rivera');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login({
        id: `usr-${Date.now()}`,
        name: name || 'Demo User',
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        balance: 45000,
        escrowBalance: 12500,
        approvalStatus: 'approved',
      });
      if (onSuccess) onSuccess();
      onClose();
    } else {
      const res = registerUser({
        id: `usr-${Date.now()}`,
        name: name || 'New User',
        email,
        role,
        avatar: 'https://i.pravatar.cc/150?u=5',
        balance: 0,
        escrowBalance: 0,
      });

      if (res.requiresApproval) {
        setNotice('Freelancer account registered! Your account is pending Admin approval from the Admin Hub.');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{subtitle}</p>
        </div>

        {notice ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono text-center space-y-3">
            <div>{notice}</div>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono text-slate-300 mb-1">Select Account Role:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    role === 'client' ? 'bg-indigo-600 border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Client Mode
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    role === 'freelancer' ? 'bg-indigo-600 border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Freelancer Mode
                </button>
              </div>
            </div>

            <div>
              <label className="block font-mono text-slate-300 mb-1">Full Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-300 mb-1">Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold shadow-lg flex items-center justify-center gap-2"
            >
              <span>{mode === 'login' ? 'Log In to Continue' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-cyan-400 font-bold hover:underline"
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
