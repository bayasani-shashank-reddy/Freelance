import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Search,
  Plus,
  Coins,
  FileCode2,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  DollarSign,
  Layers
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

export const GlobalCommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();

  // Listen for keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E9EAF0] shadow-2xl overflow-hidden font-sans">
        <Command className="w-full" label="Global Command Palette">
          
          {/* Input Header */}
          <div className="flex items-center px-4 border-b border-[#E9EAF0] gap-3">
            <Search className="w-4 h-4 text-[#777B8A]" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search pages... (e.g. 'submit', 'pricing', 'blueprint')"
              className="w-full py-3.5 text-xs text-[#17172B] focus:outline-none placeholder:text-[#A0A4B8]"
            />
            <kbd className="px-2 py-0.5 rounded bg-[#F7F8FC] border border-[#E9EAF0] text-[10px] font-mono text-[#777B8A]">
              ESC
            </kbd>
          </div>

          {/* List Content */}
          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs space-y-1">
            <Command.Empty className="p-4 text-center text-[#777B8A] text-xs">
              No results found. Try searching 'idea', 'pricing', or 'status'.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#777B8A]">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/submit-request'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <Plus className="w-4 h-4 text-[#7357FF]" />
                <span>Submit New Project Idea (50 NCX)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/pricing'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Top Up NCX Token Vault</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/blueprint-sample'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <FileCode2 className="w-4 h-4 text-[#3978FF]" />
                <span>View 17-Section Blueprint Sample</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/slides'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <Sparkles className="w-4 h-4 text-[#FF9900]" />
                <span>AI Presentation Studio (.pptx generator)</span>
              </Command.Item>
            </Command.Group>

            {/* Workspaces & Portals */}
            <Command.Group heading="Portals & Workspaces" className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#777B8A] pt-2">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/client/dashboard'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#7357FF]" />
                <span>Client Portal & Project Workspace</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/client/vault'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Client NCX Token Vault & Ledger</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/freelancer/dashboard'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <Layers className="w-4 h-4 text-[#3978FF]" />
                <span>Specialist Delivery Workboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/admin/dashboard'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Admin Operations & SLA Radar</span>
              </Command.Item>
            </Command.Group>

            {/* Public Pages */}
            <Command.Group heading="Navigation" className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#777B8A] pt-2">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>Home Page (Wild-Style Hero)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/how-it-works'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>How It Works (5-Step Lifecycle)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/pricing'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>Pricing & NCX Token Packs</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/for-clients'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>For Clients & Product Teams</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/for-specialists'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>For Specialists & Engineers</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/case-studies'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>Case Studies & Before/After</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/trust'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>Trust & Security Centre</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/status'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>System Status & Uptime</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/terms'))}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
              >
                <span>Terms, Privacy & Escrow Policies</span>
              </Command.Item>
            </Command.Group>

            {/* Auth */}
            <Command.Group heading="Account" className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#777B8A] pt-2">
              {isAuthenticated ? (
                <Command.Item
                  onSelect={() => runCommand(() => { logout(); navigate('/'); })}
                  className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-rose-50 text-rose-600 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user?.email})</span>
                </Command.Item>
              ) : (
                <Command.Item
                  onSelect={() => runCommand(() => navigate('/login'))}
                  className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[#F5F6FA] text-[#17172B]"
                >
                  <LogIn className="w-4 h-4 text-[#7357FF]" />
                  <span>Sign In to NexusCraft</span>
                </Command.Item>
              )}
            </Command.Group>

          </Command.List>

          {/* Footer note */}
          <div className="p-2.5 bg-[#F7F8FC] border-t border-[#E9EAF0] flex items-center justify-between text-[11px] text-[#777B8A]">
            <span>Navigate with ↑ ↓ and Press Enter</span>
            <span className="font-mono">NexusCraft Signal v2.0</span>
          </div>

        </Command>
      </div>
    </div>
  );
};

export default GlobalCommandPalette;
