import React, { useState, useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, LayoutDashboard, Users, Briefcase, Wallet, BarChart3, Lock, ShieldCheck, Scale } from 'lucide-react';
import { animate } from 'animejs/animation';
import { createSpring } from 'animejs/easings/spring';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Toggle open state on Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const openEvent = () => setOpen(true);

    document.addEventListener('keydown', down);
    document.addEventListener('open-command-palette', openEvent);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('open-command-palette', openEvent);
    };
  }, []);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Animation on open/close
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!mounted) return;
    if (prefersReducedMotion) {
      if (!open) setMounted(false);
      return;
    }

    if (open) {
      if (!overlayRef.current || !dialogRef.current) return;

      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 200,
        ease: 'outSine',
      });
      animate(dialogRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        y: [10, 0],
        duration: 520,
        ease: createSpring({ stiffness: 170, damping: 18 }),
      });
    } else {
      if (!overlayRef.current || !dialogRef.current) {
        setMounted(false);
        return;
      }

      animate(overlayRef.current, {
        opacity: [1, 0],
        duration: 160,
        ease: 'inSine',
      });
      animate(dialogRef.current, {
        opacity: [1, 0],
        scale: [1, 0.97],
        y: [0, 8],
        duration: 160,
        ease: 'inSine',
        onComplete: () => setMounted(false),
      });
    }
  }, [mounted, open]);

  if (!mounted) return null;

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4"
      onClick={() => setOpen(false)}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
      >
        <Command label="Command Palette" className="w-full flex flex-col">
          <div className="flex items-center px-4 py-3 border-b border-white/10">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <Command.Input 
              placeholder="Type a command or search..." 
              autoFocus
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base"
            />
          </div>
          
          <Command.List className="max-h-[340px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Marketplace & Jobs" className="text-xs font-semibold text-slate-500 px-2 py-1 [&_[cmdk-group-heading]]:mb-1">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/jobs'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 mr-3 text-cyan-400" />
                Find Open Jobs & Projects
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/proposals'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 mr-3 text-emerald-400" />
                My Proposals & Contracts
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/designers'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <Users className="w-4 h-4 mr-3 text-indigo-400" />
                Find Freelance Talent
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/compare'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <Scale className="w-4 h-4 mr-3 text-purple-400" />
                Compare Freelancers Side-by-Side
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Workspace & AI Tools" className="text-xs font-semibold text-slate-500 px-2 py-1 [&_[cmdk-group-heading]]:mb-1">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/brief'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-3 text-cyan-300" />
                AI Brief Builder
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/workspace/proj-1'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 mr-3 text-indigo-400" />
                Active Project Workspace
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/wallet'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <Wallet className="w-4 h-4 mr-3 text-emerald-400" />
                Escrow Wallet & Payments
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/analytics'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 mr-3 text-purple-400" />
                Performance Analytics
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/admin'))}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <Lock className="w-4 h-4 mr-3 text-rose-400" />
                Admin Hub & Moderation
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

