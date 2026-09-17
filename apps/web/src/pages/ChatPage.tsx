import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Flag,
  Ban,
  ArrowLeft,
  MoreVertical,
  Smile,
  MessageCircle,
  X,
  Search,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import FestiveButton from '../components/common/FestiveButton';
import { apiFetch } from '../lib/api';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  unreadCount?: number;
  otherUser?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    locationCity: string;
  } | null;
  lastMessage?: Message | null;
  lastMessageAt?: string;
}

const FESTIVE_EMOJIS = ['🌸', '🪔', '✨', '🥁', '🌺', '📿', '🙏', '👑', '🕊️', '🏮', '🎆', '🌾'];
const LOVE_EMOJIS = ['❤️', '💖', '😍', '💕', '💐', '😘', '🥰', '🔥', '💫', '🌹', '💌', '💞'];
const SMILEY_EMOJIS = ['😊', '😂', '🥳', '👍', '👏', '👋', '😎', '💃', '🕺', '🤝', '🎉', '😇'];

// Helper to format WhatsApp-like date headers
function formatWhatsAppDate(dateStr: string, lang: string): string {
  const msgDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return lang === 'bn' ? 'আজ' : 'Today';
  }

  const isYesterday =
    msgDate.getDate() === yesterday.getDate() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  }

  return msgDate.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

// Helper to format message timestamp
function formatMessageTime(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper to format conversation list preview time
function formatListTime(dateStr?: string | null, lang?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [activeOtherUser, setActiveOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojiTab, setEmojiTab] = useState<'puja' | 'love' | 'smile'>('puja');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // WhatsApp-like scroll tracking
  const [showScrollDownBtn, setShowScrollDownBtn] = useState<boolean>(false);
  const [newMessagesWhileScrolledUp, setNewMessagesWhileScrolledUp] = useState<number>(0);
  const isAtBottomRef = useRef<boolean>(true);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Smooth or instant scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
      setShowScrollDownBtn(false);
      setNewMessagesWhileScrolledUp(0);
      isAtBottomRef.current = true;
    }
  };

  // Scroll listener to detect if user has scrolled up (WhatsApp behavior)
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 90;
    isAtBottomRef.current = atBottom;

    if (atBottom) {
      setShowScrollDownBtn(false);
      setNewMessagesWhileScrolledUp(0);
    } else {
      setShowScrollDownBtn(true);
    }
  };

  // Fetch all user conversations
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/v1/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Fetch conversations error', err);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const uniqueMessages: Message[] = [];
        const seenIds = new Set<string>();
        for (const m of data.messages || []) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            uniqueMessages.push(m);
          }
        }
        setMessages(uniqueMessages);

        // Reset unread count for this conversation in state
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );

        // Instantly scroll to bottom on initial message load
        requestAnimationFrame(() => {
          scrollToBottom('auto');
        });
      }
    } catch (err) {
      console.error('Fetch messages error', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  // Handle active conversation change
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      const active = conversations.find((c) => c.id === conversationId);
      if (active?.otherUser) {
        setActiveOtherUser(active.otherUser);
      }
      setNewMessagesWhileScrolledUp(0);
      setShowScrollDownBtn(false);
    } else {
      setActiveOtherUser(null);
      setMessages([]);
    }
  }, [conversationId, conversations]);

  // Socket room joining and event listeners
  useEffect(() => {
    if (!socket) return;

    if (conversationId) {
      socket.emit('join_conversation', conversationId);
    }

    const handleNewMessage = (payload: { conversationId: string; message: Message }) => {
      if (payload.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) {
            return prev;
          }
          return [...prev, payload.message];
        });

        // WhatsApp rule: If already at bottom, scroll down automatically
        if (isAtBottomRef.current) {
          requestAnimationFrame(() => {
            scrollToBottom('smooth');
          });
        } else {
          // If scrolled up reading previous chats, show notification count on scroll-down button
          setNewMessagesWhileScrolledUp((prev) => prev + 1);
          setShowScrollDownBtn(true);
        }
      }
      // Re-sync conversation list so last message and unread badges update in real-time
      fetchConversations();
    };

    const handleUserTyping = (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
        if (isAtBottomRef.current && data.isTyping) {
          requestAnimationFrame(() => {
            scrollToBottom('smooth');
          });
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, conversationId]);

  // Emit typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (socket && conversationId) {
      socket.emit('typing_start', { conversationId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId });
      }, 1500);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversationId) return;

    const content = messageInput.trim();
    setMessageInput('');
    setShowEmojiPicker(false);

    if (socket && conversationId) {
      socket.emit('typing_stop', { conversationId });
    }

    try {
      const res = await fetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });
        fetchConversations();

        // Always smoothly scroll to bottom when user sends a message
        requestAnimationFrame(() => {
          scrollToBottom('smooth');
        });
      }
    } catch (err) {
      console.error('Send message error', err);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBlockUser = async () => {
    if (!activeOtherUser?.id || !token) return;
    if (!window.confirm(`Are you sure you want to block ${activeOtherUser.displayName}?`)) return;

    await apiFetch('/api/v1/chat/block', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId: activeOtherUser.id }),
    });

    alert('User blocked successfully.');
    navigate('/chat');
    fetchConversations();
  };

  const handleReportUser = async () => {
    if (!activeOtherUser?.id || !token) return;
    const reason = window.prompt(
      'Please state the reason for report (Harassment, Spam, Fake profile, Inappropriate content):'
    );
    if (!reason) return;

    await apiFetch('/api/v1/chat/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reportedUserId: activeOtherUser.id,
        reason: 'Inappropriate content',
        details: reason,
      }),
    });

    alert('Report submitted to Agomoni moderation.');
  };

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUser?.displayName.toLowerCase().includes(q) ||
        c.otherUser?.locationCity.toLowerCase().includes(q) ||
        c.lastMessage?.content.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Find active conversation unread count
  const activeConversation = conversations.find((c) => c.id === conversationId);
  const currentUnreadCount = activeConversation?.unreadCount || 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-0 sm:p-2 md:p-3 h-full min-h-0 flex flex-col flex-1">
      {/* WhatsApp Web Style Main Shell: Locked Height, Zero Outer Scroll */}
      <div className="puja-card flex-1 min-h-0 h-full rounded-none sm:rounded-3xl overflow-hidden flex flex-col md:flex-row border-0 sm:border border-gold-500/30 shadow-2xl bg-[#120909]/98 relative">
        
        {/* ========================================================================= */}
        {/* LEFT PANE: Conversations Sidebar (WhatsApp Style, Scrollable) */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col h-full min-h-0 flex-shrink-0 border-r border-gold-500/20 bg-[#160B0B]/95 ${
            conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b border-gold-500/20 flex items-center justify-between flex-shrink-0 bg-[#1D0E0E]">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-gold-400" />
              <h2 className="text-sm sm:text-base font-bold font-cinzel text-[#FFF8EC]">
                {lang === 'bn' ? 'পুজো সাথী বার্তা' : 'Puja Messages'}
              </h2>
            </div>
            <span className="text-[11px] text-gold-300 font-semibold bg-[#2A0B0B] px-2.5 py-0.5 rounded-full border border-gold-500/30">
              {conversations.length} {lang === 'bn' ? 'জন' : 'Active'}
            </span>
          </div>

          {/* WhatsApp Search Bar */}
          <div className="p-2 sm:p-2.5 border-b border-gold-500/15 flex-shrink-0 bg-[#140A0A]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#240F0F]/80 border border-gold-500/20 text-xs text-cream-200 focus-within:border-gold-400/60 transition-colors">
              <Search size={14} className="text-gold-400/70 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'সাথী বা বার্তা খুঁজুন...' : 'Search chat or companion...'}
                className="w-full bg-transparent text-xs text-[#FFF8EC] placeholder-cream-400/60 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-cream-400 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation List Scrollable Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-1 chat-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 px-4 text-xs text-cream-400 space-y-2 font-bengali">
                <span className="text-3xl block">🪔</span>
                <p>{searchQuery ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'এখনও কোনো কথোপকথন শুরু হয়নি।'}</p>
                <p className="text-gold-400 font-semibold">পুজো ডেট থেকে সাথী খুঁজুন ও হাই বলুন!</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === conversationId;
                const unread = conv.unreadCount || 0;
                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    className={`p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 relative select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4A1010] to-[#2A0B0B] border border-gold-400/60 text-gold-200 shadow-lg'
                        : 'hover:bg-[#2A0B0B]/40 border border-transparent text-cream-200'
                    }`}
                  >
                    {/* User Avatar with Real-Time Corner SMS Badge */}
                    <div className="relative flex-shrink-0">
                      {unread > 0 && (
                        <span
                          title={`${unread} unread messages`}
                          className="absolute -top-1.5 -left-1.5 min-w-[20px] h-5 px-1 rounded-full bg-sindoor-600 text-white text-[10px] font-black border-2 border-[#120909] flex items-center justify-center shadow-lg z-20 animate-pulse"
                        >
                          {unread}
                        </span>
                      )}

                      <div className="w-11 h-11 rounded-full bg-[#240F0F] border border-gold-500/30 overflow-hidden flex items-center justify-center text-sm font-bold text-gold-300">
                        {conv.otherUser?.avatarUrl ? (
                          <img
                            src={conv.otherUser.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          conv.otherUser?.displayName?.charAt(0) || 'U'
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#FFF8EC] truncate font-bengali">
                          {conv.otherUser?.displayName || 'Puja Companion'}
                        </h4>
                        <span className="text-[10px] text-cream-400 flex-shrink-0">
                          {formatListTime(conv.lastMessageAt || conv.lastMessage?.createdAt, lang)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[11px] text-cream-300/80 truncate font-bengali">
                          {conv.lastMessage?.content || (lang === 'bn' ? 'বলো দুর্গা মায়কী জয়! 🌸' : 'Say Dugga Dugga! 🌸')}
                        </p>
                        {unread > 0 && (
                          <span className="text-[9px] text-sindoor-300 font-extrabold bg-sindoor-950/90 px-1.5 py-0.2 rounded-md border border-sindoor-500/40 flex-shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: Active Chat Window (Fixed Top & Bottom, Isolated Feed Scroll) */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 min-w-0 flex flex-col h-full min-h-0 bg-[#120909] relative ${
            !conversationId ? 'hidden md:flex items-center justify-center' : 'flex'
          }`}
        >
          {!conversationId ? (
            <div className="text-center p-8 space-y-3 font-bengali">
              <span className="text-5xl inline-block animate-bounce">🪔</span>
              <h3 className="text-lg font-bold font-cinzel text-gold-300">
                {lang === 'bn' ? 'কথোপকথন নির্বাচন করুন' : 'Select a conversation'}
              </h3>
              <p className="text-xs text-cream-300 max-w-sm">
                {lang === 'bn'
                  ? 'পুজো সাথীর সাথে কানেক্ট করুন, চ্যাট করুন আর একসাথে প্যান্ডেল হপিংয়ের প্ল্যান বানান।'
                  : 'Connect, chat and plan your pandal hopping together safely.'}
              </p>
            </div>
          ) : (
            <>
              {/* WhatsApp Sticky Chat Header */}
              <div className="p-3 sm:p-3.5 border-b border-gold-500/25 flex items-center justify-between bg-[#1A0B0B]/95 backdrop-blur-md flex-shrink-0 z-20 shadow-md">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => navigate('/chat')}
                    className="md:hidden p-1.5 -ml-1 text-gold-400 hover:text-white rounded-lg active:scale-95"
                    title="Back to conversations"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {/* Companion Profile Card in Header */}
                  <div className="relative flex items-center gap-2.5 p-1 pr-3 rounded-2xl bg-[#2A0B0B]/60 border border-gold-500/25 shadow-inner min-w-0">
                    {/* Unread SMS badge */}
                    {currentUnreadCount > 0 && (
                      <span
                        title={`${currentUnreadCount} unread SMS`}
                        className="absolute -top-2 -left-2 min-w-[20px] h-5 px-1 rounded-full bg-sindoor-600 text-white text-[10px] font-black border-2 border-[#120909] flex items-center justify-center shadow-lg animate-pulse z-20"
                      >
                        {currentUnreadCount}
                      </span>
                    )}

                    <div className="w-10 h-10 rounded-full bg-[#240F0F] border border-gold-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-gold-300 shrink-0">
                      {activeOtherUser?.avatarUrl ? (
                        <img
                          src={activeOtherUser.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeOtherUser?.displayName?.charAt(0) || 'U'
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#FFF8EC] truncate font-bengali">
                        {activeOtherUser?.displayName || 'Companion'}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-gold-300/90 truncate font-bengali">
                        {isTyping ? (
                          <span className="text-emerald-400 font-semibold animate-pulse flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>{lang === 'bn' ? 'টাইপ করছেন...' : 'Typing message...'}</span>
                          </span>
                        ) : (
                          activeOtherUser?.locationCity || 'Kolkata, Bengal'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety & Moderation Options */}
                <div className="relative flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 text-cream-400 hover:text-white rounded-xl hover:bg-[#2A0B0B] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#180C0C] border border-gold-500/35 rounded-2xl shadow-2xl py-1.5 z-40 space-y-1 text-xs">
                      <button
                        onClick={handleReportUser}
                        className="w-full text-left px-4 py-2 hover:bg-[#2A0B0B] text-yellow-400 flex items-center gap-2 font-bengali"
                      >
                        <Flag size={14} /> {lang === 'bn' ? 'রিপোর্ট করুন' : 'Report User'}
                      </button>
                      <button
                        onClick={handleBlockUser}
                        className="w-full text-left px-4 py-2 hover:bg-[#2A0B0B] text-red-400 flex items-center gap-2 font-bengali"
                      >
                        <Ban size={14} /> {lang === 'bn' ? 'ব্লক করুন' : 'Block User'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================================== */}
              {/* WhatsApp Message Feed Container (Pure Isolated Scrolling) */}
              {/* =================================================================== */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-2 chat-scrollbar relative"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(42, 11, 11, 0.4) 0%, rgba(18, 9, 9, 0.95) 100%)`,
                }}
              >
                {/* Subtle Festive Watermark Background Texture */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.035] bg-repeat z-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 C35 15 45 25 55 30 C45 35 35 45 30 55 C25 45 15 35 5 30 C15 25 25 15 30 5 Z' fill='%23D4AF37' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                  }}
                />

                <div className="relative z-10 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-xs text-cream-300 font-bengali space-y-2">
                      <span className="text-4xl block animate-bounce">🌸</span>
                      <p className="text-sm font-semibold text-gold-300">কথোপকথন শুরু করুন!</p>
                      <p className="text-cream-400">পুজোর শুভেচ্ছা পাঠান এবং আড্ডা শুরু করুন।</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      const currentDateHeader = formatWhatsAppDate(msg.createdAt, lang);
                      const prevMessage = idx > 0 ? messages[idx - 1] : null;
                      const prevDateHeader = prevMessage ? formatWhatsAppDate(prevMessage.createdAt, lang) : null;
                      const showDateSeparator = currentDateHeader !== prevDateHeader;

                      return (
                        <React.Fragment key={msg.id}>
                          {/* WhatsApp Date Separator Pill */}
                          {showDateSeparator && (
                            <div className="flex justify-center my-3 sticky top-1 z-10">
                              <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold font-bengali bg-[#240F0F]/90 backdrop-blur-md text-gold-300 border border-gold-500/25 shadow-md">
                                {currentDateHeader}
                              </span>
                            </div>
                          )}

                          {/* WhatsApp Message Bubble */}
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-1`}>
                            <div
                              className={`max-w-[85%] sm:max-w-[72%] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm leading-relaxed break-words shadow-md transition-all ${
                                isMe
                                  ? 'bg-gradient-to-br from-[#7A1515] via-[#520C0C] to-[#3B0707] text-[#FFF8EC] border border-gold-500/30 rounded-2xl rounded-tr-xs'
                                  : 'bg-[#240F0F]/95 backdrop-blur-md border border-gold-500/20 text-[#FFF8EC] rounded-2xl rounded-tl-xs'
                              }`}
                            >
                              <span className="font-bengali">{msg.content}</span>
                              
                              {/* Inline WhatsApp Timestamp & Seen Ticks */}
                              <div className="flex items-center justify-end gap-1 mt-1 select-none float-right ml-3 -mr-1">
                                <span className={`text-[9px] sm:text-[10px] ${isMe ? 'text-gold-300/80' : 'text-cream-400/80'}`}>
                                  {formatMessageTime(msg.createdAt, lang)}
                                </span>
                                {isMe && (
                                  <CheckCheck size={13} className="text-gold-400 inline -mb-0.5" />
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>

              {/* =================================================================== */}
              {/* WhatsApp Floating "Scroll To Bottom" Button (with New Messages Badge) */}
              {/* =================================================================== */}
              {showScrollDownBtn && (
                <div className="absolute bottom-20 right-4 sm:right-6 z-30 animate-fade-in">
                  <button
                    onClick={() => scrollToBottom('smooth')}
                    className="relative w-10 h-10 rounded-full bg-[#2A0B0B]/95 hover:bg-[#3D1414] border border-gold-500/40 text-gold-300 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    title={lang === 'bn' ? 'সর্বশেষ বার্তায় যান' : 'Scroll to latest messages'}
                  >
                    <ChevronDown size={20} className="text-gold-300" />
                    {newMessagesWhileScrolledUp > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sindoor-600 text-white text-[10px] font-black border-2 border-[#120909] flex items-center justify-center shadow-lg animate-bounce">
                        {newMessagesWhileScrolledUp}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Floating Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="p-3 bg-[#180C0C]/98 backdrop-blur-2xl border border-gold-500/40 rounded-2xl shadow-2xl mx-3 mb-1 animate-scale-up z-30 flex-shrink-0">
                  <div className="flex items-center justify-between border-b border-gold-500/20 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 font-bengali">
                      <button
                        type="button"
                        onClick={() => setEmojiTab('puja')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          emojiTab === 'puja'
                            ? 'bg-gold-500 text-night-950 font-bold'
                            : 'text-cream-300 hover:text-white'
                        }`}
                      >
                        🪔 পুজো স্পেশাল
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmojiTab('love')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          emojiTab === 'love'
                            ? 'bg-gold-500 text-night-950 font-bold'
                            : 'text-cream-300 hover:text-white'
                        }`}
                      >
                        ❤️ ভালোবাসা
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmojiTab('smile')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          emojiTab === 'smile'
                            ? 'bg-gold-500 text-night-950 font-bold'
                            : 'text-cream-300 hover:text-white'
                        }`}
                      >
                        😊 স্মাইলি
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-cream-400 hover:text-white p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Emoji Grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-xl max-h-32 overflow-y-auto chat-scrollbar">
                    {(emojiTab === 'puja'
                      ? FESTIVE_EMOJIS
                      : emojiTab === 'love'
                      ? LOVE_EMOJIS
                      : SMILEY_EMOJIS
                    ).map((em, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddEmoji(em)}
                        className="p-1.5 rounded-xl hover:bg-white/10 active:scale-125 transition-transform flex items-center justify-center"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick 1-Tap Festive Emoji Strip */}
              <div className="px-3 py-1 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 bg-[#160B0B]/80 border-t border-gold-500/10 chat-scrollbar">
                <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider shrink-0 font-bengali">
                  {lang === 'bn' ? 'দ্রুত:' : 'Quick:'}
                </span>
                {['🌸', '🪔', '✨', '🥁', '❤️', '😍', '🙏', '🎉', '🌾', '🌺'].map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="px-2 py-0.5 text-xs rounded-full bg-[#240F0F] border border-gold-500/20 hover:border-gold-400 hover:scale-110 active:scale-95 transition-all text-cream-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* WhatsApp Fixed Bottom Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-2 sm:p-3 border-t border-gold-500/20 bg-[#180C0C] flex items-center gap-2 flex-shrink-0 z-20 shadow-xl"
              >
                {/* Emoji Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insert Emojis"
                  className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                    showEmojiPicker
                      ? 'bg-gold-500 text-night-950 border-gold-400 shadow-md'
                      : 'bg-[#240F0F] border-gold-500/30 text-gold-400 hover:bg-[#331414]'
                  }`}
                >
                  <Smile size={18} />
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={lang === 'bn' ? 'বার্তা লিখুন (যেমন: বলো দুর্গা মায়কী জয়!)...' : 'Type a festive message...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#240F0F] border border-gold-500/30 text-[#FFF8EC] placeholder-cream-400/60 text-xs sm:text-sm focus:outline-none focus:border-gold-400 transition-colors font-bengali"
                />

                {/* Send Button */}
                <FestiveButton
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="px-4 py-2.5 flex-shrink-0 gap-1.5 shadow-md shadow-gold-950/40"
                  disabled={!messageInput.trim()}
                >
                  <Send size={15} />
                </FestiveButton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
