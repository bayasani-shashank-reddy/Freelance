import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { BoxedButton } from '../shared/BoxedButton';

export const FinalCtaFooter: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/submit-request');
    } else {
      navigate('/register');
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <footer id="contact" className="bg-white border-t border-[#E9EAF0] text-[#222438]">
      
      {/* ─── Final Call To Action Banner ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] text-white shadow-2xl shadow-[#7357FF]/25 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          {/* Subtle geometric background accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>START BUILDING WITH NEXUSCRAFT</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Your Next Big Idea Starts Here.
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Bring your idea to NexusCraft and take the next step toward building something real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <BoxedButton
              variant="accent"
              size="lg"
              onClick={handleGetStarted}
              icon={<ArrowRight className="w-4 h-4 text-[#222438]" />}
              iconPosition="right"
              className="bg-white hover:bg-[#F5F6FA] text-[#222438] font-bold shadow-lg"
            >
              Get Started
            </BoxedButton>

            {!isAuthenticated && (
              <button
                onClick={handleSignIn}
                className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-all border border-white/25 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Standard Multi-Column SaaS Footer ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E9EAF0]">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Column (2 cols on tablet/desktop) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-sm shadow-sm">
                N
              </div>
              <span className="font-display font-extrabold text-lg text-[#222438]">
                NexusCraft
              </span>
            </div>

            <p className="text-xs text-[#777B8A] leading-relaxed max-w-sm">
              NexusCraft — From Idea to Reality. An AI-powered project intelligence and freelancer coordination platform connecting clients, administrators, and verified specialists.
            </p>

            <div className="text-xs text-[#777B8A] font-mono">
              <NavLink to="/status" className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status: All Systems Operational (Cluster0)</span>
              </NavLink>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#222438]">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-[#777B8A]">
              <li><NavLink to="/how-it-works" className="hover:text-[#7357FF] transition-colors">How It Works (5 Steps)</NavLink></li>
              <li><NavLink to="/blueprint-sample" className="hover:text-[#7357FF] transition-colors font-semibold text-[#7357FF]">Sample 17-Sec Blueprint</NavLink></li>
              <li><NavLink to="/pricing" className="hover:text-[#7357FF] transition-colors">NCX Tokens & Pricing</NavLink></li>
              <li><NavLink to="/case-studies" className="hover:text-[#7357FF] transition-colors">Case Studies</NavLink></li>
            </ul>
          </div>

          {/* Client Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#222438]">
              For Clients
            </h4>
            <ul className="space-y-2 text-xs text-[#777B8A]">
              <li><NavLink to="/submit-request" className="hover:text-[#7357FF] transition-colors">Submit an Idea (50 NCX)</NavLink></li>
              <li><NavLink to="/for-clients" className="hover:text-[#7357FF] transition-colors">Why Founders Choose Us</NavLink></li>
              <li><NavLink to="/client/dashboard" className="hover:text-[#7357FF] transition-colors">Client Workspace</NavLink></li>
              <li><NavLink to="/pricing" className="hover:text-[#7357FF] transition-colors">Token Packs & Escrow</NavLink></li>
            </ul>
          </div>

          {/* Specialist & Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#222438]">
              Specialists & Trust
            </h4>
            <ul className="space-y-2 text-xs text-[#777B8A]">
              <li><NavLink to="/for-specialists" className="hover:text-[#7357FF] transition-colors">For Specialists</NavLink></li>
              <li><NavLink to="/trust" className="hover:text-[#7357FF] transition-colors">Security & Trust Centre</NavLink></li>
              <li><NavLink to="/status" className="hover:text-[#7357FF] transition-colors">System Uptime & Status</NavLink></li>
              <li><NavLink to="/admin/dashboard" className="hover:text-[#7357FF] transition-colors">Admin Command</NavLink></li>
            </ul>
          </div>

        </div>

        {/* ─── Bottom Copyright & Terms ─── */}
        <div className="pt-12 mt-12 border-t border-[#E9EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777B8A]">
          <p>© {new Date().getFullYear()} NexusCraft Inc. All rights reserved. From Idea to Reality.</p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <NavLink to="/terms" className="hover:text-[#7357FF]">Terms of Service</NavLink>
            <NavLink to="/privacy" className="hover:text-[#7357FF]">Privacy Policy</NavLink>
            <NavLink to="/refund-policy" className="hover:text-[#7357FF]">Escrow & Refund</NavLink>
            <NavLink to="/status" className="hover:text-[#7357FF]">Status</NavLink>
            <a href="#overview" className="hover:text-[#7357FF]">Back to Top ↑</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default FinalCtaFooter;

