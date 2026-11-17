import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface UserProfileMenuProps {
  align?: 'left' | 'right' | 'top';
  compact?: boolean;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ align = 'right', compact = false }) => {
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch {}
    navigate('/login', { replace: true });
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : user?.role === 'freelancer'
      ? 'Specialist'
      : 'Client';

  const firstName = user?.name ? user.name.split(' ')[0] : 'Account';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button - Exactly formatted like university portal screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-[#F0F2FA] dark:hover:bg-[#1A1A32] border border-transparent hover:border-[#E8EAF4] dark:hover:border-[#2A2A46] transition-all cursor-pointer select-none group"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white font-extrabold text-xs flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden border border-white/20">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          )}
        </div>

        {!compact && (
          <div className="hidden sm:flex items-center gap-1.5 text-left">
            <span className="text-xs font-bold text-[#17172B] dark:text-white truncate max-w-[120px]">
              {firstName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8F91A3] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </button>

      {/* Dropdown Card - Exact UI from User's Screenshot */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : align === 'top' ? 'bottom-full left-0 mb-2' : 'right-0'
          } mt-2 w-64 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden`}
        >
          {/* Top User Card Info */}
          <div className="p-4 bg-[#F8F9FD] dark:bg-[#131326] border-b border-[#E8EAF4] dark:border-[#202038] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7357FF] to-[#3978FF] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden border border-white/20">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-display font-extrabold text-xs text-[#17172B] dark:text-white truncate">
                {user?.name || 'NexusCraft User'}
              </h4>
              <span className="text-[11px] font-semibold text-[#8F91A3] dark:text-[#A6A8C0] block truncate">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Menu Action Items */}
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={handleOpenProfile}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#17172B] dark:text-white hover:bg-[#F0F2FA] dark:hover:bg-[#1A1A32] transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#7357FF]" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#E45D6D] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#E45D6D]" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
