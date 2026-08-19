import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Clock,
  Paperclip,
  Send,
  Circle,
  Sparkles,
  Phone,
  Video,
  X,
  Zap,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Play,
  Eye,
} from 'lucide-react';
import { NexusAIAssistantModal } from '../components/NexusAIAssistantModal';
import { useUser } from '../context/UserContext';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  role: string;
  contractTitle?: string;
  contractAmount?: number;
}



const BASE_SMART_REPLIES = [
  { label: '🖼️ Share UI Mockup', text: '🖼️ Here is the updated design mockup preview: https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80' },
  { label: '🎥 Share Demo Video', text: '🎥 Check out our project video recording: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { label: '🔗 Share Figma Link', text: '🔗 Live Figma Workspace: https://figma.com/file/nexuscraft-prototype-v2' },
  { label: '✨ Schedule Video Sync', text: 'Can we schedule a 15-minute video call to align on the technical milestones?' },
  { label: '💰 Release Escrow', text: "I've reviewed the latest progress and released the $1,200 milestone escrow payment!" },
];

const getAIReplies = (lastMsg: string): { label: string; text: string }[] => {
  const msg = lastMsg.toLowerCase();
  if (msg.includes('figma') || msg.includes('design') || msg.includes('mockup') || msg.includes('ui') || msg.includes('wireframe')) {
    return [
      { label: '✅ Looks Great!', text: "The design looks fantastic! I love the attention to detail in the micro-interactions." },
      { label: '🔄 Request Revision', text: "Can we revisit the color palette on the dashboard header? I'd like something closer to our brand guidelines." },
      { label: '✨ Approve & Fund Next', text: "Approved! I'm releasing the milestone escrow now. Ready for the next phase!" },
      { label: '🖼️ Share Reference', text: '🖼️ Here is my reference design: https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80' },
      { label: '📅 Book Review Call', text: "Can we jump on a quick 20-minute video call to review the design together?" },
    ];
  }
  if (msg.includes('milestone') || msg.includes('payment') || msg.includes('escrow') || msg.includes('fund') || msg.includes('paid')) {
    return [
      { label: '💰 Confirm Release', text: "Payment confirmed! Releasing escrow for this milestone now." },
      { label: '📋 Share Invoice', text: "Please find the invoice for this milestone attached: #INV-2026-084" },
      { label: '🔐 Funds Secured', text: "Escrow funds are secured. You're safe to proceed with the next deliverable." },
      { label: '✅ Milestone Approved', text: "Milestone reviewed and approved. Great work on delivery ahead of schedule!" },
      { label: '⏭️ Next Milestone', text: "Moving on to Milestone 3! Let's aim for delivery by end of next week." },
    ];
  }
  if (msg.includes('bug') || msg.includes('error') || msg.includes('issue') || msg.includes('fix') || msg.includes('broken')) {
    return [
      { label: '🐛 Share Bug Details', text: "Here's the bug report: The modal doesn't close on mobile safari when tapping outside." },
      { label: '🔧 Fix Deployed', text: "The fix has been deployed to staging. Please verify on your end." },
      { label: '📸 Share Screenshot', text: '🖼️ Screenshot of the bug: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
      { label: '⏰ ETA for Fix', text: "Working on it now. ETA for the fix is within 4 hours." },
      { label: '✅ Confirmed Fixed', text: "Confirmed! The issue is resolved and pushed to production." },
    ];
  }
  if (msg.includes('video') || msg.includes('call') || msg.includes('sync') || msg.includes('meeting')) {
    return [
      { label: '✅ Accept Call', text: "Sure! I'm available for a call now. Joining the link." },
      { label: '📅 Schedule for Tomorrow', text: "Let's schedule for tomorrow at 10 AM IST. Does that work for you?" },
      { label: '🎥 Start Video Call', text: 'Join the call here: https://meet.google.com/nexuscraft-demo-call' },
      { label: '⏰ Need 30 Mins', text: "Can we reschedule? I need about 30 more minutes to finish the current milestone." },
    ];
  }
  // default replies
  return BASE_SMART_REPLIES;
};

export const InboxPage: React.FC = () => {
  const { user, role, chatMessages, sendChatMessage, dynamicJobs } = useUser();

  const baseJobs = role === 'admin' 
    ? dynamicJobs.filter((j) => !!j.assignedFreelancerId)
    : dynamicJobs.filter((j) => (role === 'client' ? j.clientId === user?.id : j.assignedFreelancerId === user?.id) && !!j.assignedFreelancerId);

  const userConversations: Conversation[] = baseJobs.map((j) => ({
    id: j.id,
    name: role === 'admin' 
      ? `${j.clientName} & ${j.assignedFreelancerName}` 
      : (role === 'client' ? j.assignedFreelancerName || 'Freelancer' : j.clientName || 'Client'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    lastMessage: chatMessages[j.id]?.slice(-1)[0]?.text || 'Project workspace created.',
    time: chatMessages[j.id]?.slice(-1)[0]?.timestamp || j.postedAt,
    unread: 0,
    online: true,
    role: role === 'admin' ? 'Active Contract' : (role === 'client' ? 'Assigned Freelancer' : 'Project Client'),
    contractTitle: j.title,
    contractAmount: j.maxBudget,
  }));

  const [selected, setSelected] = useState<string>(userConversations.length > 0 ? userConversations[0].id : '');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [callModal, setCallModal] = useState<'voice' | 'video' | null>(null);

  // Media Attachment Modal & Lightbox
  const [attachmentModal, setAttachmentModal] = useState(false);
  const [attachType, setAttachType] = useState<'image' | 'video' | 'link' | 'file'>('image');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});

  const activeConvo = userConversations.find((c) => c.id === selected) || userConversations[0];
  const activeMessages = selected ? chatMessages[selected] || [] : [];

  // Dynamic AI reply suggestions based on last received message
  const smartReplies = useMemo(() => {
    const lastReceived = [...activeMessages].reverse().find((m) => !m.isSelf);
    return getAIReplies(lastReceived?.text || '');
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendChatMessage(selected, messageText);
    setMessageText('');
  };

  const handleSendMediaAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    let payload = '';
    if (attachType === 'image') {
      payload = `🖼️ [IMAGE] ${mediaTitle || 'Shared Image'}: ${mediaUrl}`;
    } else if (attachType === 'video') {
      payload = `🎥 [VIDEO] ${mediaTitle || 'Shared Video Walkthrough'}: ${mediaUrl}`;
    } else if (attachType === 'link') {
      payload = `🔗 [LINK] ${mediaTitle || 'Shared Web Link'}: ${mediaUrl}`;
    } else {
      payload = `📎 [FILE] ${mediaTitle || 'Document File'}: ${mediaUrl}`;
    }

    sendChatMessage(selected, payload);
    setMediaTitle('');
    setMediaUrl('');
    setAttachmentModal(false);
  };

  const handlePresetSelect = (presetType: 'image' | 'video' | 'link', title: string, url: string) => {
    setAttachType(presetType);
    setMediaTitle(title);
    setMediaUrl(url);
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[msgId] || [];
      if (current.includes(emoji)) return { ...prev, [msgId]: current.filter((e) => e !== emoji) };
      return { ...prev, [msgId]: [...current, emoji] };
    });
  };

  const filtered = userConversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper parser for embedded media in messages
  const parseMediaInText = (text: string) => {
    const isImage = text.includes('🖼️') || text.match(/\.(jpeg|jpg|gif|png|webp)/i) || text.includes('unsplash.com');
    const isVideo = text.includes('🎥') || text.match(/\.(mp4|webm|ogg)/i) || text.includes('commondatastorage');
    const isLink = text.includes('🔗') || text.includes('http://') || text.includes('https://') || text.includes('figma.com') || text.includes('github.com');
    
    // Extract URL
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/g);
    const url = urlMatch ? urlMatch[0] : null;

    return { isImage, isVideo, isLink, url };
  };

  return (
    <div className="pt-28 pb-16 bg-slate-950 min-h-screen text-slate-200 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>REALTIME PERSISTENT MEDIA CHAT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Project Chat <span className="gradient-text">& Media Sharing</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Share images, video walkthroughs, Figma links, source code, and project files in real time.</p>
          </div>
        </motion.div>

        {/* Chat Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-0 h-[calc(100vh-230px)] min-h-[560px] rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/95 backdrop-blur-xl shadow-2xl w-full max-w-full"
        >
          {/* Sidebar */}
          <div className="border-r border-slate-800 flex flex-col bg-slate-950/60 min-w-0">
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p>No active chat conversations yet.</p>
                  <p className="text-[10px] text-slate-400">Real-time chats will appear here as you submit proposals or post projects!</p>
                </div>
              ) : (
                filtered.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelected(convo.id)}
                    className={`w-full text-left px-3.5 py-3 flex items-start gap-2.5 transition-all border-b border-slate-800/50 ${
                      selected === convo.id
                        ? 'bg-indigo-600/20 border-l-4 border-l-cyan-400'
                        : 'hover:bg-slate-900 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={convo.avatar}
                        alt={convo.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      {convo.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-sm animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${selected === convo.id ? 'text-white' : 'text-slate-200'}`}>
                          {convo.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">{convo.time}</span>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-300 font-medium truncate">{convo.role}</div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{convo.lastMessage}</p>
                    </div>

                    {/* Unread badge */}
                    {convo.unread > 0 && (
                      <span className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-cyan-500 text-[9px] font-extrabold text-slate-950 font-mono mt-1">
                        {convo.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col bg-slate-900/95 min-w-0 overflow-hidden">
            {!activeConvo ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No Conversation Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Real-time encrypted chat channel will activate here when you connect with project partners.
                </p>
              </div>
            ) : (
              <>
              <div className="px-3 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40 shrink-0 w-full overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={activeConvo.avatar}
                      alt={activeConvo.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-700"
                    />
                    {activeConvo.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">{activeConvo.name}</h3>
                      {activeConvo.contractTitle && (
                        <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 truncate max-w-[140px]">
                          {activeConvo.contractTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 truncate">
                      {activeConvo.online ? (
                        <>
                          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 shrink-0" />
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold truncate">ONLINE // ENCRYPTED</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 truncate">Offline • {activeConvo.time}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
                  <button
                    onClick={() => setAttachmentModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono font-bold hover:border-cyan-500/40 flex items-center gap-1 shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">+ Media</span>
                  </button>

                  <button
                    onClick={() => setCallModal('voice')}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shrink-0"
                    title="Start Voice Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => setCallModal('video')}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shrink-0"
                    title="Start Video Call"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                  </button>

                  <button
                    onClick={() => setAiModalOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-indigo-600/30 flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Summarize</span>
                    <span className="inline sm:hidden">AI</span>
                  </button>
                </div>
              </div>

            {aiModalOpen && <NexusAIAssistantModal onClose={() => setAiModalOpen(false)} />}

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-4 w-full min-w-0">
              {activeMessages.map((msg) => {
                const msgReactions = reactions[msg.id] || [];
                const mediaInfo = parseMediaInText(msg.text);
                const isSelf = msg.senderId === user?.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isSelf ? 'items-end text-right' : 'items-start text-left'} group w-full`}
                  >
                    <div className={`flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-400 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-bold text-slate-300">{msg.senderName}</span>
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div className={`relative flex items-center gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Emoji Quick Picker on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                        {['👍', '❤️', '🚀', '🎉'].map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => handleAddReaction(msg.id, e)}
                            className="hover:scale-125 transition-transform text-xs"
                          >
                            {e}
                          </button>
                        ))}
                      </div>

                      <div
                        className={`w-full px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-md break-words ${
                          isSelf
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-tr-none border border-cyan-400/30 text-left'
                            : 'bg-slate-950 text-slate-100 rounded-tl-none border border-slate-800 text-left'
                        }`}
                      >
                        <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

                        {/* 🖼️ INLINE IMAGE PREVIEW CARD */}
                        {mediaInfo.isImage && mediaInfo.url && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-900 shadow-xl group/img relative">
                            <img
                              src={mediaInfo.url}
                              alt="Shared preview"
                              className="w-full h-44 object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setLightboxImage(mediaInfo.url)}
                                className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Expand Image</span>
                              </button>
                            </div>
                            <div className="p-2 bg-slate-950/90 text-[10px] font-mono text-cyan-300 font-bold flex items-center justify-between border-t border-slate-800">
                              <span>🖼️ Shared Image Spec</span>
                              <span className="text-slate-400">Click to view full screen</span>
                            </div>
                          </div>
                        )}

                        {/* 🎥 INLINE VIDEO PLAYER CARD */}
                        {mediaInfo.isVideo && mediaInfo.url && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-purple-500/40 bg-slate-900 shadow-xl">
                            <video
                              controls
                              className="w-full max-h-48 object-cover rounded-t-xl bg-black"
                              src={mediaInfo.url}
                            />
                            <div className="p-2.5 bg-slate-950 text-[10px] font-mono text-purple-300 font-bold flex items-center justify-between border-t border-slate-800">
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3 text-purple-400 fill-purple-400" /> 🎥 Shared Video Walkthrough
                              </span>
                              <span className="text-emerald-400">● 1080p HD</span>
                            </div>
                          </div>
                        )}

                        {/* 🔗 INLINE HYPERLINK CARD */}
                        {mediaInfo.isLink && mediaInfo.url && !mediaInfo.isImage && !mediaInfo.isVideo && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-3 text-[11px] font-mono">
                            <div className="flex items-center gap-2 truncate">
                              <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                              <div className="truncate">
                                <div className="text-white font-bold truncate">Web Resource / Link</div>
                                <div className="text-[10px] text-slate-400 truncate">{mediaInfo.url}</div>
                              </div>
                            </div>
                            <a
                              href={mediaInfo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1 shrink-0 hover:bg-cyan-500/30"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reactions display */}
                    {msgReactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {msgReactions.map((e, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px]">
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* AI Smart Reply Chips */}
            <div className="px-6 py-3 border-t border-slate-800/60 bg-slate-950/60">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">AI Contextual Replies</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {smartReplies.map((reply, idx) => (
                  <motion.button
                    key={reply.label + idx}
                    initial={{ opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    onClick={() => setMessageText(reply.text)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-medium bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-slate-800 text-slate-300 whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5"
                  >
                    {reply.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="px-6 py-4 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAttachmentModal(true)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1"
                  title="Attach Image, Video, Link or File"
                >
                  <Paperclip className="w-5 h-5 text-cyan-400" />
                </button>

                <input
                  type="text"
                  placeholder="Type your message, paste link, or share images & videos..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />

                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Supports Inline Images, Video Playback & Web Links
                </span>
                <span>Press Enter to send</span>
              </div>
            </form>
            </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lightbox Fullscreen Image Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="relative max-w-4xl w-full space-y-3">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxImage} alt="Expanded Lightbox" className="w-full max-h-[80vh] object-contain rounded-2xl border border-cyan-500/40 shadow-2xl" />
          </div>
        </div>
      )}

      {/* Voice/Video Call Modal Simulator */}
      {callModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-card border border-purple-500/30 p-8 rounded-3xl text-center space-y-5 bg-slate-900/95">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/40 animate-pulse">
              {callModal === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Starting {callModal === 'video' ? 'Video' : 'Voice'} Call...</h3>
              <p className="text-xs text-slate-300 mt-1">Connecting to {activeConvo.name} via WebRTC Encrypted Channel.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
              ● CONTRACT SESSION: {activeConvo.contractTitle}
            </div>
            <button
              onClick={() => setCallModal(null)}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              End Call Session
            </button>
          </div>
        </div>
      )}

      {/* Rich Media & Link Attachment Modal */}
      {attachmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-4 bg-slate-900/95 text-xs">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Share Media, Video or Link</h2>
              <button onClick={() => setAttachmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setAttachType('image')}
                className={`py-2 rounded-lg ${attachType === 'image' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
              >
                🖼️ Image
              </button>
              <button
                type="button"
                onClick={() => setAttachType('video')}
                className={`py-2 rounded-lg ${attachType === 'video' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400'}`}
              >
                🎥 Video
              </button>
              <button
                type="button"
                onClick={() => setAttachType('link')}
                className={`py-2 rounded-lg ${attachType === 'link' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400'}`}
              >
                🔗 Link
              </button>
              <button
                type="button"
                onClick={() => setAttachType('file')}
                className={`py-2 rounded-lg ${attachType === 'file' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'}`}
              >
                📄 File
              </button>
            </div>

            {/* Quick Demo Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Quick Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('image', 'Figma Dashboard Mockup', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-mono text-cyan-300"
                >
                  🖼️ UI Mockup
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('video', 'Platform Video Walkthrough', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-[10px] font-mono text-purple-300"
                >
                  🎥 Demo Video
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('link', 'Live Figma Spec', 'https://figma.com/file/nexuscraft-v2-prototype')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-[10px] font-mono text-indigo-300"
                >
                  🔗 Figma Link
                </button>
              </div>
            </div>

            <form onSubmit={handleSendMediaAttachment} className="space-y-3 pt-2">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Title / Description:</label>
                <input
                  type="text"
                  required
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="e.g. Dashboard UI Concept v2.4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Media URL / Web Link:</label>
                <input
                  type="url"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or MP4 / Figma link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAttachmentModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold"
                >
                  Share to Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxPage;
