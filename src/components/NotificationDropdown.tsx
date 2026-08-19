import React, { useContext, useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationDropdown: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative ml-4">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center text-slate-300 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-mono text-white">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="font-medium text-slate-200">Notifications</span>
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-400 hover:underline"
              >
                Mark all as read
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-2 border-b border-slate-800 cursor-pointer hover:bg-slate-800/60 ${n.read ? 'text-slate-500' : 'text-white font-medium'}`}
                  onClick={() => {
                    markAsRead(n.id);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{n.title}</span>
                    <span className="text-xs text-slate-400">
                      {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
