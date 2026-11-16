import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Layers,
  Briefcase,
  Users,
  UserCheck,
  Bot,
  DollarSign,
  FileText,
  PackageCheck,
  Bell,
  ShieldCheck,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Coins,
  HelpCircle,
  ArrowRight,
  Bookmark,
  Calendar,
  Archive,
  RefreshCw,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { GlobalCommandPalette } from './shared/GlobalCommandPalette';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout, credits, unreadCount } = useUser();
  const { theme, setTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isPublicRoute =
    location.pathname === '/' ||
    location.pathname === '/how-it-works' ||
    location.pathname === '/pricing' ||
    location.pathname === '/tokens' ||
    location.pathname === '/for-clients' ||
    location.pathname === '/for-specialists' ||
    location.pathname === '/for-freelancers' ||
    location.pathname === '/blueprint-sample' ||
    location.pathname === '/case-studies' ||
    location.pathname === '/trust' ||
    location.pathname === '/security' ||
    location.pathname === '/status' ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy' ||
    location.pathname === '/refund-policy';

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    navigate('/', { replace: true });
  };

  // 1. PUBLIC MARKETING PAGES: Full-width public layout + Global Command Palette
  if (isPublicRoute) {
    return (
      <>
        <GlobalCommandPalette />
        {children}
      </>
    );
  }

  // 2. AUTHENTICATION PAGES (Login / Register): Clean centered layout
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F4F5F9] text-[#222438] flex flex-col font-sans">
        <GlobalCommandPalette />
        <header className="bg-white border-b border-[#E9EAF0] py-3.5 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-display font-extrabold text-base text-[#222438] tracking-tight">
                NexusCraft
              </span>
            </NavLink>

            <NavLink
              to="/"
              className="text-xs font-semibold text-[#777B8A] hover:text-[#3978FF] transition-colors flex items-center gap-1"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. AUTHENTICATED PORTALS: ONLY LEFT SIDEBAR (NO TOP BAR)
  // ─────────────────────────────────────────────────────────────

  // Admin Navigation Groups (Strictly matching Section 2 of prompt with Dedicated Routes)
  const adminNavGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, tab: 'overview' },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, tab: 'analytics' },
      ],
    },
    {
      group: 'PROJECT OPERATIONS',
      items: [
        { label: 'Request Queue', path: '/admin/requests', icon: Layers, tab: 'intake' },
        { label: 'Project Management', path: '/admin/projects', icon: Briefcase, tab: 'intake' },
        { label: 'Assignments', path: '/admin/assignments', icon: UserCheck, tab: 'assignments' },
        { label: 'Feasibility & Quotations', path: '/admin/assessments', icon: CheckSquare, tab: 'assessments-quotes' },
      ],
    },
    {
      group: 'PEOPLE',
      items: [
        { label: 'Clients', path: '/admin/clients', icon: Users, tab: 'clients' },
        { label: 'Freelancers', path: '/admin/freelancers', icon: UserCheck, tab: 'freelancers' },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { label: 'AI Project Intelligence', path: '/admin/ai-intelligence', icon: Bot, tab: 'ai-intelligence' },
        { label: 'Cost Intelligence', path: '/admin/cost-intelligence', icon: DollarSign, tab: 'cost-intelligence' },
      ],
    },
    {
      group: 'DOCUMENTS & DELIVERY',
      items: [
        { label: 'Document Studio', path: '/admin/document-studio', icon: FileText, tab: 'document-studio' },
        { label: 'ZIP Deliverables', path: '/admin/deliverables', icon: PackageCheck, tab: 'deliverables' },
      ],
    },
    {
      group: 'SYSTEM & AUDIT',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck, tab: 'audit' },
        { label: 'Admin Tasks', path: '/admin/tasks', icon: CheckSquare, tab: 'tasks' },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  // Client Navigation Groups (Strictly matching Section 2 of prompt with Dedicated Routes)
  const clientNavGroups = [
    {
      group: 'CLIENT WORKSPACE',
      items: [
        { label: 'Overview', path: '/client/dashboard', icon: LayoutDashboard, tab: 'overview' },
        { label: 'Idea Vault', path: '/client/vault', icon: Bookmark, tab: 'vault' },
        { label: 'My Projects', path: '/client/projects', icon: Briefcase, tab: 'workspace' },
        { label: 'Documents & Files', path: '/client/documents', icon: FileText, tab: 'documents' },
        { label: 'Clarifications', path: '/client/clarifications', icon: CheckSquare, tab: 'clarifications' },
        { label: 'Project Exports', path: '/client/exports', icon: Archive, tab: 'exports' },
        { label: 'AI Idea Assistant', path: '/client/ai-assistant', icon: Bot, tab: 'ai-assistant' },
        { label: 'NCX Wallet', path: '/credits', icon: Coins, badge: `${credits} NCX` },
        { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        { label: 'Help Center', path: '/help', icon: HelpCircle },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  // Freelancer Navigation Groups (Strictly matching Section 2 of prompt with Dedicated Routes)
  const freelancerNavGroups = [
    {
      group: 'STUDIO OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard, tab: 'timeline' },
        { label: 'Assigned Projects', path: '/freelancer/projects', icon: Briefcase, tab: 'workspace' },
        { label: 'Assigned Briefs', path: '/freelancer/briefs', icon: FileText, tab: 'briefs' },
      ],
    },
    {
      group: 'SCOPING & QUOTES',
      items: [
        { label: 'Feasibility Assessments', path: '/freelancer/assessments', icon: CheckSquare, tab: 'assessment' },
        { label: 'Quotations', path: '/freelancer/quotations', icon: DollarSign, tab: 'quotation' },
      ],
    },
    {
      group: 'EXECUTION & TASKS',
      items: [
        { label: 'Tasks & Workboard', path: '/freelancer/tasks', icon: Layers, tab: 'tasks' },
        { label: 'Deadline Calendar', path: '/freelancer/calendar', icon: Calendar, tab: 'timeline' },
        { label: 'Shared Documents', path: '/freelancer/documents', icon: FileText, tab: 'documents' },
      ],
    },
    {
      group: 'DELIVERABLE CENTER',
      items: [
        { label: 'Deliverable Center', path: '/freelancer/deliverables', icon: PackageCheck, tab: 'deliverables' },
        { label: 'ZIP Submissions', path: '/freelancer/deliverables', icon: Archive, tab: 'deliverables' },
        { label: 'Revision Tracker', path: '/freelancer/revisions', icon: RefreshCw, tab: 'revisions' },
        { label: 'Submission History', path: '/freelancer/history', icon: CheckCircle2, tab: 'history' },
      ],
    },
    {
      group: 'ACCOUNT & SIGNALS',
      items: [
        { label: 'NCX Ledger', path: '/credits', icon: Coins, badge: `${credits} NCX` },
        { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        { label: 'Profile & Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const currentNavGroups = user?.role === 'admin' 
    ? adminNavGroups 
    : user?.role === 'freelancer' 
    ? freelancerNavGroups 
    : clientNavGroups;

  const currentRoleLabel = user?.role === 'admin'
    ? 'ADMIN OPERATIONS'
    : user?.role === 'freelancer'
    ? 'FREELANCER WORKSPACE'
    : 'CLIENT WORKSPACE';

  // Filter items by sidebar search query if typed
  const filteredNavGroups = currentNavGroups.map(grp => ({
    ...grp,
    items: grp.items.filter(item => 
      !searchQuery.trim() || item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(grp => grp.items.length > 0);

  return (
    <div className="min-h-screen bg-[#F4F5F9] dark:bg-[#0F0F1D] text-[#222438] dark:text-[#F7F8FC] flex font-sans antialiased transition-colors duration-150">
      <GlobalCommandPalette />
      
      {/* ─────────────────────────────────────────────────────────────
          1. PRIMARY & ONLY GLOBAL NAVIGATION: THE LEFT SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-[#131326] border-r border-[#E9EAF0] dark:border-[#202038] h-screen sticky top-0 z-30 transition-[width] duration-300 ease-in-out select-none flex-shrink-0 ${
          sidebarCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E9EAF0] dark:border-[#202038] flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
              N
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-display font-extrabold text-base text-[#222438] dark:text-white tracking-tight block leading-tight truncate">
                  NexusCraft
                </span>
                <span className="text-[10px] font-bold text-[#777B8A] dark:text-[#A6A8C0] block -mt-0.5 tracking-wider uppercase truncate">
                  {currentRoleLabel}
                </span>
              </div>
            )}
          </NavLink>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1 rounded-lg text-[#8F91A3] hover:text-[#222438] dark:hover:text-white hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Search Input (Moved directly into sidebar below Logo) */}
        {!sidebarCollapsed && (
          <div className="px-3 pt-3 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8F91A3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search (Ctrl+K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-12 py-1.5 bg-[#F5F6FA] dark:bg-[#1B1B32] border border-[#E9EAF0] dark:border-[#2A2A46] rounded-xl text-xs text-[#222438] dark:text-white placeholder-[#8F91A3] focus:outline-none focus:border-[#3978FF] focus:bg-white dark:focus:bg-[#131326] transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#131326] border border-[#E9EAF0] dark:border-[#2A2A46] text-[#777B8A] dark:text-[#A6A8C0] select-none pointer-events-none">
                ⌘K
              </span>
            </div>
          </div>
        )}

        {/* Primary Action Button (for Client: + Submit New Idea) */}
        {user?.role === 'client' && !sidebarCollapsed && (
          <div className="px-3 pt-2.5 flex-shrink-0">
            <NavLink
              to="/submit-request"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#7357FF] to-[#3978FF] hover:from-[#6446F0] hover:to-[#2A65F5] text-white text-xs font-bold shadow-sm shadow-[#7357FF]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Idea</span>
            </NavLink>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto overflow-x-hidden">
          {filteredNavGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#8F91A3] dark:text-[#73758C] uppercase">
                  {grp.group}
                </div>
              )}
              {grp.items.map((item: any, iIdx) => {
                const Icon = item.icon;
                const isItemActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/requests' && location.pathname === '/admin/projects') ||
                  (item.path === '/admin/dashboard' && (location.pathname === '/admin' || (location.pathname === '/admin/dashboard' && !location.search))) ||
                  (item.path === '/client/dashboard' && (location.pathname === '/client' || (location.pathname === '/client/dashboard' && !location.search))) ||
                  (item.path === '/client/projects' && location.pathname === '/client/workspace') ||
                  (item.path === '/freelancer/dashboard' && (location.pathname === '/freelancer' || (location.pathname === '/freelancer/dashboard' && !location.search))) ||
                  (Boolean(item.tab) && location.search.includes(`tab=${item.tab}`));

                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isItemActive
                        ? 'bg-gradient-to-r from-[#E9F1FF] to-[#F4F8FF] dark:from-[#25234A] dark:to-[#1E1E38] text-[#3978FF] dark:text-[#9D8BFF] shadow-xs font-bold border-l-3 border-[#3978FF] dark:border-[#7357FF] pl-2.5'
                        : item.highlight
                        ? 'bg-[#E9E3FF] dark:bg-[#201F3E] text-[#7357FF] dark:text-[#A798FF] hover:bg-[#7357FF] hover:text-white'
                        : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#222438] dark:hover:text-white hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isItemActive ? 'text-[#3978FF] dark:text-[#9D8BFF]' : 'text-[#777B8A] dark:text-[#8F91A3]'}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        typeof item.badge === 'number'
                          ? 'bg-[#E45D6D] text-white'
                          : 'bg-[#E9EAF0] dark:bg-[#2A2A46] text-[#65677A] dark:text-[#A6A8C0]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            THEME SELECTOR (White / Black Background Switcher)
        ───────────────────────────────────────────────────────────── */}
        <div className="px-3 pt-2 pb-1 border-t border-[#E9EAF0] dark:border-[#202038] flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center p-1 rounded-xl bg-[#F0F2F9] dark:bg-[#1A1A32] border border-[#E9EAF0] dark:border-[#2A2A46]">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-[#17172B] shadow-xs'
                    : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                }`}
                title="Switch to White (Light) Background"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>White</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#131326] text-white shadow-xs'
                    : 'text-[#65677A] dark:text-[#A6A8C0] hover:text-[#17172B] dark:hover:text-white'
                }`}
                title="Switch to Black (Dark) Background"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Black</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-center p-2 rounded-xl text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F0F2F9] dark:hover:bg-[#1A1A32] cursor-pointer"
              title={`Currently ${theme === 'light' ? 'White' : 'Black'}. Click to toggle.`}
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          )}
        </div>

        {/* Authenticated User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-[#E9EAF0] dark:border-[#202038] bg-white dark:bg-[#131326] flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1A32] border border-[#E9EAF0] dark:border-[#252545]">
                <div className="w-8 h-8 rounded-full bg-[#E9E3FF] dark:bg-[#2A2356] text-[#7357FF] dark:text-[#A798FF] font-bold text-xs flex items-center justify-center border border-[#7357FF]/20 flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#222438] dark:text-white truncate leading-tight">
                    {user?.name || 'NexusCraft User'}
                  </div>
                  <div className="text-[10px] text-[#777B8A] dark:text-[#A6A8C0] font-semibold truncate capitalize leading-tight">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'freelancer' ? 'Specialist' : 'Client'}
                  </div>
                </div>
              </div>

              {/* Explicit Sign Out Button */}
              <button
                onClick={handleLogout}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-[#E45D6D] bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700 transition-colors cursor-pointer"
                title="Sign Out of NexusCraft"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E9E3FF] dark:bg-[#2A2356] text-[#7357FF] dark:text-[#A798FF] font-bold text-xs flex items-center justify-center border border-[#7357FF]/20" title={user?.name || 'User'}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-[#E45D6D] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 text-[#8F91A3] hover:text-[#222438] dark:hover:text-white transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT VIEWPORT (ZERO REDUNDANT TOP BAR ON DESKTOP)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile-Only Minimal Header Bar (Hidden on desktop: lg:hidden) */}
        <div className="lg:hidden h-14 bg-white dark:bg-[#131326] border-b border-[#E9EAF0] dark:border-[#202038] px-4 flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-xl text-[#222438] dark:text-white hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-xs">
                N
              </div>
              <span className="font-extrabold text-sm text-[#222438] dark:text-white">NexusCraft</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 text-[#65677A] dark:text-[#A6A8C0] hover:text-[#222438] dark:hover:text-white"
              title={`Switch to ${theme === 'light' ? 'Black' : 'White'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-[#65677A] dark:text-[#A6A8C0] hover:text-[#222438] dark:hover:text-white"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E45D6D]" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-[#777B8A] dark:text-[#A6A8C0] hover:text-[#E45D6D]"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Dashboard Content - Starts Directly at Top of Viewport */}
        <main className="flex-1 w-full bg-[#F4F5F9] dark:bg-[#0F0F1D] p-5 sm:p-7 lg:p-8 min-w-0 overflow-y-auto transition-colors duration-150">
          {children}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RESPONSIVE MOBILE DRAWER
      ───────────────────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 bg-white dark:bg-[#131326] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 border-r border-[#E9EAF0] dark:border-[#202038]">
            {/* Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E9EAF0] dark:border-[#202038]">
              <NavLink to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white flex items-center justify-center font-black text-sm">
                  N
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#222438] dark:text-white">NexusCraft</span>
                  <span className="text-[9px] font-bold text-[#777B8A] dark:text-[#A6A8C0] block -mt-0.5 uppercase">{currentRoleLabel}</span>
                </div>
              </NavLink>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
              {currentNavGroups.map((grp, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#8F91A3] dark:text-[#73758C] uppercase">
                    {grp.group}
                  </div>
                  {grp.items.map((item: any, iIdx) => {
                    const Icon = item.icon;
                    const isItemActive =
                      location.pathname === item.path ||
                      (item.path === '/admin/requests' && location.pathname === '/admin/projects') ||
                      (item.path === '/admin/dashboard' && (location.pathname === '/admin' || (location.pathname === '/admin/dashboard' && !location.search))) ||
                      (item.path === '/client/dashboard' && (location.pathname === '/client' || (location.pathname === '/client/dashboard' && !location.search))) ||
                      (item.path === '/client/projects' && location.pathname === '/client/workspace') ||
                      (item.path === '/freelancer/dashboard' && (location.pathname === '/freelancer' || (location.pathname === '/freelancer/dashboard' && !location.search))) ||
                      (Boolean(item.tab) && location.search.includes(`tab=${item.tab}`));

                    return (
                      <NavLink
                        key={iIdx}
                        to={item.path}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                          isItemActive
                            ? 'bg-[#E9F1FF] dark:bg-[#25234A] text-[#3978FF] dark:text-[#9D8BFF] font-bold'
                            : 'text-[#65677A] dark:text-[#A6A8C0] hover:bg-[#F5F6FA] dark:hover:bg-[#1E1E38]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Drawer Theme Selector & Logout */}
            <div className="p-3 border-t border-[#E9EAF0] dark:border-[#202038] space-y-2">
              <div className="flex items-center p-1 rounded-xl bg-[#F0F2F9] dark:bg-[#1A1A32] border border-[#E9EAF0] dark:border-[#2A2A46]">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === 'light' ? 'bg-white text-[#17172B] shadow-xs' : 'text-[#65677A] dark:text-[#A6A8C0]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>White</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === 'dark' ? 'bg-[#131326] text-white shadow-xs' : 'text-[#65677A] dark:text-[#A6A8C0]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Black</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#E45D6D] bg-rose-50 dark:bg-rose-950/30 rounded-xl cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;
