import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BoxedButton } from '../components/shared/BoxedButton';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xl space-y-6">
        <div className="text-center space-y-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center mx-auto mb-2 shadow-sm">
            <KeyRound className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#7357FF] block">
            CREDENTIAL RECOVERY
          </span>
          <h1 className="font-display font-extrabold text-2xl text-[#17172B] dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Enter your registered email to receive secure recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
            <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
              Dispatch Initiated
            </h3>
            <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
              If an account associated with <strong className="text-[#17172B] dark:text-white">{email}</strong> exists, verification instructions have been dispatched.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <BoxedButton variant="primary" size="md">
                  Return to Sign In
                </BoxedButton>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
                Registered Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] text-xs"
              />
            </div>

            <div className="pt-2">
              <BoxedButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Instructions
              </BoxedButton>
            </div>

            <div className="text-center pt-3 border-t border-[#F0F2F9] dark:border-[#202038]">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#7357FF] hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
