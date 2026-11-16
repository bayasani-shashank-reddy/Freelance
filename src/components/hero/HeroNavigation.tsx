import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, LayoutDashboard, Plus } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface HeroNavigationProps {
  onNavClick?: (targetId: string) => void;
  displayMode?: 'nexuscraft' | 'wild';
  onToggleMode?: (mode: 'nexuscraft' | 'wild') => void;
}

export const HeroNavigation = forwardRef<HTMLElement, HeroNavigationProps>(({ onNavClick, displayMode = 'nexuscraft', onToggleMode }, ref) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    if (target.startsWith('/')) {
      navigate(target);
      return;
    }
    if (onNavClick) {
      onNavClick(target);
    } else {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const dashboardRoute = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'freelancer'
    ? '/freelancer/dashboard'
    : '/client/dashboard';

  if (displayMode === 'wild') {
    return (
      <header
        ref={ref}
        id="heroNav"
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between will-change-transform"
        style={{
          padding: 'calc(0.14 * var(--fs)) calc(0.27 * var(--fs))',
          fontSize: 'max(12px, calc(0.072 * var(--fs)))',
          fontWeight: 450,
          color: '#1d1d1d',
          transform: 'translateY(-140%)',
          opacity: 0,
        }}
      >
        {/* Wild Navigation Links: Home · Features · Templates · Contact Us */}
        <nav className="flex items-center gap-[0.7em]">
          <a href="#home" onClick={(e) => handleLinkClick(e, 'overview')} className="text-[#1d1d1d] hover:opacity-65 transition-opacity">
            Home
          </a>
          <span className="text-[#a9a9a6] text-[0.85em] leading-none">·</span>
          <a href="#features" onClick={(e) => handleLinkClick(e, 'features')} className="text-[#1d1d1d] hover:opacity-65 transition-opacity">
            Features
          </a>
          <span className="text-[#a9a9a6] text-[0.85em] leading-none">·</span>
          <a href="#templates" onClick={(e) => handleLinkClick(e, 'templates')} className="text-[#1d1d1d] hover:opacity-65 transition-opacity">
            Templates
          </a>
          <span className="text-[#a9a9a6] text-[0.85em] leading-none">·</span>
          <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')} className="text-[#1d1d1d] hover:opacity-65 transition-opacity">
            Contact Us
          </a>
        </nav>

        {/* Center / Right: Mode Switcher & Wild Socials */}
        <div className="flex items-center gap-4">
          {onToggleMode && (
            <button
              onClick={() => onToggleMode('nexuscraft')}
              type="button"
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#1d1d1d] text-white hover:bg-black transition-colors font-sans"
              title="Switch to NexusCraft Hero Mode"
            >
              Switch to NexusCraft ➔
            </button>
          )}
          <div className="hidden sm:flex items-center gap-[0.7em]">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#1d1d1d] hover:opacity-65 transition-opacity">
              Instagram
            </a>
            <span className="text-[#a9a9a6] text-[0.85em] leading-none">·</span>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-[#1d1d1d] hover:opacity-65 transition-opacity">
              Facebook
            </a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      ref={ref}
      id="heroNav"
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between will-change-transform"
      style={{
        padding: 'calc(0.12 * var(--fs)) calc(0.24 * var(--fs))',
        fontSize: 'max(12px, calc(0.068 * var(--fs)))',
        fontWeight: 500,
        color: '#1d1d1d',
        transform: 'translateY(-140%)',
        opacity: 0,
      }}
    >
      {/* Left: NexusCraft Brand Logo & Title */}
      <a
        href="#home"
        onClick={(e) => handleLinkClick(e, 'overview')}
        className="flex items-center gap-2.5 text-[#1d1d1d] hover:opacity-80 transition-opacity"
      >
        <div className="w-[calc(0.18*var(--fs))] h-[calc(0.18*var(--fs))] rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-sm shadow-sm shadow-[#7357FF]/30">
          N
        </div>
        <div>
          <span className="font-display font-extrabold tracking-tight text-[1.1em] text-[#1d1d1d]">
            NexusCraft
          </span>
          <span className="hidden sm:block text-[0.7em] font-medium text-[#777B8A] tracking-normal -mt-0.5">
            From Idea to Reality
          </span>
        </div>
      </a>

      {/* Center Links: Home · Features · How It Works · For Clients · For Freelancers · About · Contact */}
      <nav className="hidden lg:flex items-center gap-[0.8em]">
        <a
          href="#overview"
          onClick={(e) => handleLinkClick(e, 'overview')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          Home
        </a>
        <span className="text-[#c0c0be] text-[0.85em] leading-none">·</span>
        <a
          href="#features"
          onClick={(e) => handleLinkClick(e, 'features')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          Features
        </a>
        <span className="text-[#c0c0be] text-[0.85em] leading-none">·</span>
        <a
          href="#how-it-works"
          onClick={(e) => handleLinkClick(e, 'how-it-works')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          How It Works
        </a>
        <span className="text-[#c0c0be] text-[0.85em] leading-none">·</span>
        <a
          href="#for-clients"
          onClick={(e) => handleLinkClick(e, 'for-clients')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          For Clients
        </a>
        <span className="text-[#c0c0be] text-[0.85em] leading-none">·</span>
        <a
          href="#for-freelancers"
          onClick={(e) => handleLinkClick(e, 'for-freelancers')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          For Freelancers
        </a>
        <span className="text-[#c0c0be] text-[0.85em] leading-none">·</span>
        <a
          href="#why-nexuscraft"
          onClick={(e) => handleLinkClick(e, 'why-nexuscraft')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          About
        </a>
        <span className="text-[#c0c0be] text-[0.85em] leading-none">·</span>
        <a
          href="#contact"
          onClick={(e) => handleLinkClick(e, 'contact')}
          className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors"
        >
          Contact
        </a>
      </nav>

      {/* Right Actions: Mode Switcher & Sign In / Get Started or Workspace */}
      <div className="flex items-center gap-[0.7em]">
        {onToggleMode && (
          <button
            onClick={() => onToggleMode('wild')}
            type="button"
            className="hidden md:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#f0f0ee] hover:bg-[#e4e4e1] text-[#333] transition-colors border border-[#d8d8d4]"
            title="Switch to Wild Reference Style"
          >
            <span>🏝️ Wild Reference</span>
          </button>
        )}
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => navigate('/login')}
              type="button"
              className="text-[#1d1d1d] hover:text-[#7357FF] transition-colors flex items-center gap-1 font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              type="button"
              className="bg-[#7357FF] hover:bg-[#5B42D6] text-white px-3.5 py-1.5 rounded-full font-bold shadow-sm shadow-[#7357FF]/25 flex items-center gap-1 hover:scale-105 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate(dashboardRoute)}
              type="button"
              className="bg-white/80 border border-[#E9EAF0] text-[#1d1d1d] hover:text-[#7357FF] px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#7357FF]" />
              <span>Workspace</span>
            </button>
            <button
              onClick={() => navigate('/submit-request')}
              type="button"
              className="bg-[#7357FF] hover:bg-[#5B42D6] text-white px-3.5 py-1.5 rounded-full font-bold shadow-sm shadow-[#7357FF]/25 flex items-center gap-1 hover:scale-105 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Submit Idea</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
});

HeroNavigation.displayName = 'HeroNavigation';
export default HeroNavigation;
