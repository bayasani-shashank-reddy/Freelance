import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BoxedButton } from '../components/shared/BoxedButton';
import confetti from 'canvas-confetti';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser } = useUser();

  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+1',
    phone: '',
    company: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const fullPhone = formData.phone ? `${formData.countryCode} ${formData.phone.trim()}` : '';

    const res = await registerUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhone,
      countryCode: formData.countryCode,
      password: formData.password,
      company: formData.company.trim()
    });

    setSubmitting(false);

    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      if (redirectTarget) {
        navigate(redirectTarget);
      } else {
        navigate('/client/dashboard');
      }
    } else {
      setError(res.error || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm shadow-[#7357FF]/30">
            N
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#7357FF] block">
            CLIENT ONBOARDING PROTOCOL
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
            Create Client Account
          </h1>
          <p className="text-xs text-[#65677A] dark:text-[#A6A8C0]">
            Get started with <span className="font-bold text-[#7357FF]">500 NCX Starter Credits</span> automatically credited upon sign-up.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-[#FF826E]/40 bg-[#FFF0ED] dark:bg-[#2A1717] text-xs text-[#FF826E] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] focus:ring-2 focus:ring-[#7357FF]/15 transition-all text-xs"
            />
          </div>

          <div>
            <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
              Work Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] focus:ring-2 focus:ring-[#7357FF]/15 transition-all text-xs"
            />
          </div>

          <div>
            <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
              Mobile Phone (Optional)
            </label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="w-24 px-2 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-xs font-semibold focus:outline-none"
              >
                <option value="+1">+1 (US)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+49">+49 (DE)</option>
                <option value="+971">+971 (AE)</option>
              </select>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-0142"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
              Company or Studio (Optional)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Aura Dynamics LLC"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#7357FF] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white text-xs focus:outline-none focus:border-[#7357FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F91A3] hover:text-[#17172B] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#65677A] dark:text-[#A6A8C0] uppercase text-[10px] mb-1 font-bold">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-white text-xs focus:outline-none focus:border-[#7357FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F91A3] hover:text-[#17172B] dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bonus Incentive Tag */}
          <div className="p-3 rounded-xl bg-[#EBF8EB] dark:bg-[#142E1B] border border-[#BCE8BD] dark:border-[#22572D] flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#1B7020] dark:text-[#4ADE80] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Complimentary Starter Allocation</span>
            </span>
            <span className="font-mono font-bold text-[#1B7020] dark:text-[#4ADE80]">+500 NCX Credits</span>
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
              Create Client Account
            </BoxedButton>
          </div>
        </form>

        <p className="text-center text-xs text-[#65677A] dark:text-[#A6A8C0]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7357FF] font-bold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
