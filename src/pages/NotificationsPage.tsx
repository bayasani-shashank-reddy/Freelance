import React, { useState } from 'react';
import { Bell, Check, ArrowLeft, Shield, Coins, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BoxedButton } from '../components/shared/BoxedButton';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useUser();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <Coins className="w-4 h-4 text-[#7357FF]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#3978FF]" />;
      case 'security':
        return <Shield className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Bell className="w-4 h-4 text-[#7357FF]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
        <BoxedButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => navigate(-1)}
        >
          Back
        </BoxedButton>

        {unreadCount > 0 && (
          <BoxedButton
            variant="tertiary"
            size="sm"
            icon={<Check className="w-3.5 h-3.5" />}
            onClick={markAllNotificationsRead}
          >
            Mark All Read ({unreadCount})
          </BoxedButton>
        )}
      </div>

      {/* Main Banner Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#EBF8EB] text-[#1B7020]">
              SYSTEM SIGNALS // LIVE
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
            Operational Activity & Signals
          </h1>
          <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0]">
            Real-time status changes, brief distribution events, and NCX credit transactions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-[#7357FF] text-white' : 'bg-[#F7F8FC] dark:bg-[#1C1C33] text-[#65677A]'
            }`}
          >
            All Signals ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'unread' ? 'bg-[#7357FF] text-white' : 'bg-[#F7F8FC] dark:bg-[#1C1C33] text-[#65677A]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#65677A] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEE9FF] dark:bg-[#252445] text-[#7357FF] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-[#17172B] dark:text-white">All systems quiet</p>
            <p>You have no pending notification signals right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F2F9] dark:divide-[#202038]">
            {filtered.map((n) => (
              <div
                key={n.customId || n.id}
                onClick={() => {
                  if (!n.read) markNotificationRead(n.customId || n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#F7F8FC] dark:hover:bg-[#1F1F38] transition-colors ${
                  !n.read ? 'bg-[#F5F2FF]/60 dark:bg-[#252445]/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#E8EAF4] dark:border-[#2A2A46] flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${!n.read ? 'text-[#17172B] dark:text-white' : 'text-[#65677A] dark:text-[#A6A8C0]'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[#65677A] dark:text-[#A6A8C0] leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] font-mono text-[#8F91A3] block pt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7357FF] flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
