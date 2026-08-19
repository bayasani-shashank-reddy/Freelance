import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Users,
  LayoutDashboard,
  Briefcase,
  Wallet,
  Search,
  Menu,
  X,
  ChevronDown,
  FileCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { useUser } from '../context/UserContext';

export const Navbar: React.FC = () => {
  const { role, user, isAuthenticated, logout } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setRoleMenuOpen(false);
  }, [location.pathname]);

  const active = (path: string) => location.pathname === path;

  // Unauthenticated Public Nav Links
  const publicLinks = [
    { path: '/', label: 'Overview', icon: Compass },
    { path: '/designers', label: 'Find Talent', icon: Users },
    { path: '/jobs', label: 'Find Work', icon: Briefcase },
    { path: '/help', label: 'How It Works', icon: FileCheck },
    { path: '/brief', label: 'AI Brief', icon: Sparkles, badge: 'AI' },
  ];

  // Authenticated Role-Specific Nav Links
  const clientLinks = [
    { path: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'My Projects', icon: Briefcase },
    { path: '/brief', label: 'Post Project', icon: Sparkles, badge: 'AI' },
    { path: '/designers', label: 'Find Talent', icon: Users },
    { path: '/proposals', label: 'Proposals', icon: FileCheck },
    { path: '/inbox', label: 'Messages', icon: Compass },
    { path: '/wallet', label: 'Payments', icon: Wallet },
  ];

  const freelancerLinks = [
    { path: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Find Work', icon: Briefcase, badge: 'HOT' },
    { path: '/proposals', label: 'My Proposals', icon: FileCheck },
    { path: '/inbox', label: 'Messages', icon: Compass },
    { path: '/wallet', label: 'Earnings', icon: Wallet },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Admin Hub', icon: Lock, badge: 'ADMIN' },
    { path: '/jobs', label: 'Projects', icon: Briefcase },
    { path: '/designers', label: 'Freelancers', icon: Users },
    { path: '/proposals', label: 'Proposals', icon: FileCheck },
    { path: '/wallet', label: 'Payments', icon: Wallet },
  ];

  const navLinks = !isAuthenticated
    ? publicLinks
    : role === 'client'
    ? clientLinks
    : role === 'freelancer'
    ? freelancerLinks
    : adminLinks;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/50'
          : 'py-5 bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* ── Brand ── */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              NEXUS<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">CRAFT</span>
            </span>
            <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase hidden sm:block font-bold">
              AI Freelance Ecosystem
            </span>
          </div>
        </NavLink>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-slate-800/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = active(link.path);
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-indigo-600/90 to-cyan-600/90 shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
            title="Search (Cmd+K)"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {!isAuthenticated ? (
            /* Logged Out State: Login & Sign Up buttons (NO WALLET BUTTON) */
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-extrabold shadow-md transition-all hover:scale-105"
              >
                Sign Up
              </NavLink>
            </div>
          ) : (
            /* Logged In State: Wallet Pill + Notifications + Role Menu */
            <>
              <button
                onClick={() => navigate('/wallet')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>${(user?.balance || 0).toLocaleString()}</span>
              </button>

              <NotificationDropdown />

              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="User"
                    className="w-5 h-5 rounded-full object-cover border border-slate-700"
                  />
                  <span className="font-bold text-white hidden md:inline">{user?.name || 'Account'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                    {role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 glass-card border border-slate-800 rounded-2xl p-3 bg-slate-900/95 shadow-2xl z-50 text-xs space-y-2 animate-in fade-in">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                      <div className="font-bold text-white text-sm">{user?.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono truncate">{user?.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono capitalize">Role: {user?.role || role}</div>
                    </div>

                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        if (role === 'admin') navigate('/admin/dashboard');
                        else if (role === 'freelancer') navigate('/freelancer/dashboard');
                        else navigate('/client/dashboard');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold flex items-center justify-between shadow-md"
                    >
                      <span>Go to {role.toUpperCase()} Dashboard</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>

                    <div className="border-t border-slate-800/80 pt-2">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden glass-card border-b border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="block px-4 py-2.5 rounded-xl font-bold text-slate-200 hover:bg-slate-900"
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
