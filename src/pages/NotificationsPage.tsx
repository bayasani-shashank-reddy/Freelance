import React, { useState } from 'react';
import { Bell, Briefcase, DollarSign, MessageSquare, RefreshCcw, Check, Trash2, ShieldAlert } from 'lucide-react';
import type { ViewMode } from '../types';

interface NotificationsPageProps {
  onNavigate: (view: ViewMode) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate: _onNavigate }) => {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Projects', 'Payments', 'Messages', 'Updates'];

  const notifications = [
    {
      id: 1,
      type: 'project',
      title: 'Project Milestone Reached',
      message: 'Sarah Developer has completed the "Frontend UI" milestone for E-commerce Redesign.',
      time: '2 hours ago',
      unread: true,
      icon: <Briefcase size={20} className="text-white" />,
      color: 'bg-[#2563EB]'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Escrowed successfully',
      message: 'Your payment of $2,500 has been securely placed in escrow for the new project.',
      time: '5 hours ago',
      unread: true,
      icon: <DollarSign size={20} className="text-white" />,
      color: 'bg-[#10B981]'
    },
    {
      id: 3,
      type: 'message',
      title: 'New message from Mike',
      message: 'Hey, I reviewed the latest designs. Can we jump on a quick call?',
      time: '1 day ago',
      unread: false,
      icon: <MessageSquare size={20} className="text-white" />,
      color: 'bg-[#7C3AED]'
    },
    {
      id: 4,
      type: 'update',
      title: 'Platform Update: AI Assistant',
      message: 'We just launched our new AI Brief generator. Try it out on your next project!',
      time: '2 days ago',
      unread: false,
      icon: <RefreshCcw size={20} className="text-white" />,
      color: 'bg-[#FF6B6B]'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Action Required: Verify ID',
      message: 'Please complete your identity verification to unlock higher payment limits.',
      time: '1 week ago',
      unread: false,
      icon: <ShieldAlert size={20} className="text-white" />,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="mr-3 text-[#7C3AED]" size={32} />
            Notifications
          </h1>
          <p className="text-gray-500 mt-2">Stay updated on your projects, payments, and messages.</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
            <Check size={16} className="mr-2" /> Mark all as read
          </button>
          <button className="text-sm font-medium text-[#FF6B6B] hover:bg-red-50 flex items-center px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
            <Trash2 size={16} className="mr-2" /> Clear
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab ? 'text-[#7C3AED]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 flex items-start transition-colors hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50/20' : ''}`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-5 ${notification.color} shadow-sm`}>
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-base font-semibold truncate ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center">
                      {notification.unread && <span className="w-2 h-2 rounded-full bg-[#2563EB] mr-3"></span>}
                      <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 pr-8">{notification.message}</p>
                  
                  {notification.type === 'project' && notification.unread && (
                    <div className="mt-3">
                      <button className="text-sm font-medium text-[#2563EB] hover:underline">Review Milestone</button>
                    </div>
                  )}
                  {notification.type === 'message' && notification.unread && (
                    <div className="mt-3">
                      <button className="text-sm font-medium text-[#7C3AED] hover:underline">Reply</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Bell size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500">No new notifications right now. Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
