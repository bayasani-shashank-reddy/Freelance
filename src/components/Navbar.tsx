import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, LogIn, LayoutDashboard, Plus, LogOut, Sun, Moon } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { BoxedButton } from './shared/BoxedButton';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Sample Blueprint', path: '/blueprint-sample' },
    { label: 'Pricing & NCX', path: '/pricing' },
    { label: 'For Clients', path: '/for-clients' },
    { label: 'For Specialists', path: '/for-specialists' },
    { label: 'Case Studies', path: '/case-studies' },
    { label: 'Trust & Security', path: '/trust' },
  ];

  const dashboardRoute = user?.role === 'admin' 
    ? '/admin/dashboard' 
    : user?.role === 'freelancer' 
    ? '/freelancer/dashboard' 
    : '/client/dashboard';

  const handleSignOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E9EAF0] shadow-sm py-3 px-4 sm:px-8 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <NavLink 
          to="/" 
          className="flex items-center gap-2.5 focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <span className="font-display font-extrabold text-base text-[#222438] tracking-tight">
              NexusCraft
            </span>
            <span className="hidden sm:block text-[9px] font-medium text-[#777B8A] -mt-1">
              From Idea to Reality
            </span>
          </div>
        </NavLink>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) =>
                `text-xs font-semibold transition-colors ${
                  isActive ? 'text-[#7357FF] font-bold' : 'text-[#777B8A] hover:text-[#7357FF]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#65677A] dark:text-[#A6A8C0] hover:text-[#7357FF] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Black (Dark)' : 'White (Light)'} Background`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-[#7357FF]" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#222438] hover:text-[#7357FF] hover:bg-[#F5F6FA] transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <BoxedButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                className="bg-[#7357FF] hover:bg-[#5B42D6] text-white font-bold shadow-sm shadow-[#7357FF]/30"
              >
                Get Started
              </BoxedButton>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate(dashboardRoute)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#F5F6FA] text-[#222438] hover:bg-[#E9E3FF] hover:text-[#7357FF] transition-all border border-[#E9EAF0] flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#7357FF]" />
                <span>Workspace</span>
              </button>

              <button
                onClick={() => navigate('/submit-request')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#7357FF] text-white shadow-sm shadow-[#7357FF]/30 hover:bg-[#5B42D6] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Idea</span>
              </button>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-xl text-[#777B8A] hover:text-[#FF4D4F] hover:bg-[#FFF1F0] transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#222438] hover:bg-[#F5F6FA] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#E9EAF0] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive ? 'bg-[#E9E3FF] text-[#7357FF] font-bold' : 'text-[#222438] hover:bg-[#F5F6FA]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E9EAF0] flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full text-center py-2.5 text-sm font-bold text-[#222438] bg-[#F5F6FA] rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#7357FF] rounded-xl shadow-sm"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate(dashboardRoute); }}
                  className="w-full text-center py-2.5 text-sm font-bold text-[#222438] bg-[#F5F6FA] rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#7357FF]" />
                  <span>Open Workspace</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="w-full text-center py-2.5 text-sm font-bold text-[#FF4D4F] bg-[#FFF1F0] rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
