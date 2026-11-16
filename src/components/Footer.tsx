import React from 'react';
import { Link } from 'react-router-dom';
import { FoundersSection } from './sections/FoundersSection';
import { BoxedButton } from './shared/BoxedButton';

const Footer: React.FC = () => {
  return (
    <footer
      className="border-t transition-colors font-mono"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-main)',
        color: 'var(--text-main)'
      }}
    >
      {/* Global Leadership Section */}
      <FoundersSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div
                className="w-7 h-7 border flex items-center justify-center font-display font-black text-xs"
                style={{
                  backgroundColor: 'var(--text-main)',
                  color: 'var(--bg-surface)',
                  borderColor: 'var(--border-main)'
                }}
              >
                N
              </div>
              <span className="font-display font-black tracking-tight text-base uppercase" style={{ color: 'var(--text-main)' }}>
                NEXUSCRAFT
              </span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              From Idea to Reality. An AI-powered product development studio that turns unstructured concepts into production-grade systems.
            </p>
            <div className="pt-2 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              STUDIO EDITION · 2026
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-main)' }}>
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/submit" className="hover:opacity-75 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                  Submit Project Idea
                </Link>
              </li>
              <li>
                <Link to="/client/dashboard" className="hover:opacity-75 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                  Client Workspace
                </Link>
              </li>
              <li>
                <Link to="/credits" className="hover:opacity-75 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                  NCX Credit Vault
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:opacity-75 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                  How It Works & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div>
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-main)' }}>
              Governance & Security
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Strict Private Review</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Non-Marketplace Model</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Zero Public Bidding</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>End-to-End Encryption</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-main)' }}>
              Studio Dispatch
            </h4>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Subscribe to technical release notes and architecture dispatches.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to NexusCraft dispatches.'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="developer@studio.com"
                className="w-full px-3 py-2 text-xs border focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              />
              <BoxedButton type="submit" variant="primary" size="sm" fullWidth>
                Join Studio Roster
              </BoxedButton>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center text-xs gap-4"
          style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
        >
          <div>
            <p>© {new Date().getFullYear()} NexusCraft Studio Inc. All rights reserved.</p>
            <p className="text-[10px] mt-0.5">
              Protocol: <span style={{ color: 'var(--text-main)' }}>NEXUS-SIGNAL-v3</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link to="/help" className="hover:opacity-80 transition-opacity">
              Documentation
            </Link>
            <span>·</span>
            <Link to="/settings" className="hover:opacity-80 transition-opacity">
              Theme & Settings
            </Link>
            <span>·</span>
            <Link to="/admin/dashboard" className="hover:opacity-80 transition-opacity">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
