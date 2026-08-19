import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-950 flex items-center justify-center p-4 text-slate-200">
      <div className="w-full max-w-md glass-card border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Account Password</h1>
          <p className="text-xs text-slate-300">Enter your email address to receive password reset instructions.</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Reset Email Sent!</h3>
            <p className="text-xs text-slate-300">
              If an account associated with <strong className="text-cyan-300">{email}</strong> exists, instructions have been sent.
            </p>
            <Link to="/login" className="inline-block mt-2 text-xs font-bold text-cyan-400 hover:underline">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono text-slate-300 font-bold mb-1">Registered Email Address</label>
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-white">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
