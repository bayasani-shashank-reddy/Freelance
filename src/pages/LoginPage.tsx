import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BoxedButton } from '../components/shared/BoxedButton';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticateUser } = useUser();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for redirect query param
  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const res = await authenticateUser(identifier.trim(), password);
    setSubmitting(false);

    if (res.success && res.user) {
      if (redirectTarget) {
        navigate(redirectTarget);
        return;
      }

      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } else {
      setError(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm shadow-[#7357FF]/30">
            N
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#7357FF] block">
            CLIENT & SPECIALIST ACCESS
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
            Log In to Workspace
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Access your NexusCraft dashboard, AI scoping briefs, and credit ledger.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-[#FF826E]/40 bg-[#FFF0ED] dark:bg-[#2A1717] text-xs text-[#FF826E] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
              Email Address or Phone Number
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@company.com or 555-0142"
              className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] focus:ring-2 focus:ring-[#7357FF]/15 transition-all text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] font-bold">
                Password
              </label>
              <Link to="/forgot-password" className="text-[10px] text-[#7357FF] hover:underline font-bold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] focus:ring-2 focus:ring-[#7357FF]/15 transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F91A3] hover:text-[#17172B] dark:hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <BoxedButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </BoxedButton>
          </div>
        </form>

        {/* Admin Quick Fill (Optional helper) */}
        <div className="pt-4 border-t border-[#F0F2F9] dark:border-[#202038] flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => handleFillDemo('admin@nexuscraft.com', 'Admin@12345')}
            className="text-[11px] font-mono text-[#7357FF] hover:underline cursor-pointer"
          >
            ⚡ Autofill Admin (admin@nexuscraft.com)
          </button>
          <Link to="/forgot-password" className="text-[#65677A] hover:underline">
            Need help?
          </Link>
        </div>

        <p className="text-center text-xs text-[#65677A] dark:text-[#A6A8C0]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#7357FF] font-bold hover:underline">
            Sign Up (+500 NCX)
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
