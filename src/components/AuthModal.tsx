import React from 'react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181818] border border-[rgba(244,244,244,0.18)] p-6 rounded-2xl max-w-sm w-full text-center">
        <h3 className="text-lg font-bold text-[#f4f4f4] mb-2">Authentication</h3>
        <p className="text-xs text-[#dadada] mb-4">Please log in or register through the portal.</p>
        <div className="flex gap-2">
          <a href="#/login" className="flex-1 py-2 rounded-full bg-[#f4f4f4] text-[#111111] text-xs font-bold text-center">Login</a>
          <button onClick={onClose} className="px-4 py-2 rounded-full bg-[#262626] text-[#f4f4f4] text-xs">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
