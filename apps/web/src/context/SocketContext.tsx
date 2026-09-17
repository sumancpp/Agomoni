import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { apiUrl } from '../lib/api';

interface RealtimeToast {
  id: string;
  type: 'MESSAGE' | 'VIBE' | 'MATCH';
  title: string;
  message: string;
  targetUrl?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeToast: RealtimeToast | null;
  dismissToast: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeToast: null,
  dismissToast: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeToast, setActiveToast] = useState<RealtimeToast | null>(null);
  const toastTimerRef = useRef<any>(null);

  const showToast = (toast: RealtimeToast) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(toast);
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 5000);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(null);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(apiUrl('/'), {
      auth: { token },
      path: '/socket.io',
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user?.id) {
        newSocket.emit('join_user', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time message notification from another user
    newSocket.on('new_message_notification', (data: {
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
    }) => {
      // Don't show toast if sender is self
      if (data.senderId === user?.id) return;

      showToast({
        id: `msg-${Date.now()}`,
        type: 'MESSAGE',
        title: `💬 New SMS from ${data.senderName}`,
        message: data.content,
        targetUrl: `/chat/${data.conversationId}`,
      });
    });

    // Real-time Vibe received from Puja Date
    newSocket.on('vibe_received', (data: {
      fromUserId: string;
      fromName: string;
      message: string;
    }) => {
      showToast({
        id: `vibe-${Date.now()}`,
        type: 'VIBE',
        title: '❤️ New Puja Vibe Received!',
        message: data.message || `${data.fromName} sent you a festive Puja vibe! 🌸`,
        targetUrl: '/puja-date',
      });
    });

    // Real-time Mutual Match celebration
    newSocket.on('match_received', (data: {
      conversationId: string;
      fromUserId: string;
      fromName: string;
      message: string;
    }) => {
      showToast({
        id: `match-${Date.now()}`,
        type: 'MATCH',
        title: '🎉 It’s a Mutual Match!',
        message: data.message || `You and ${data.fromName} liked each other! Start chatting now.`,
        targetUrl: `/chat/${data.conversationId}`,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeToast, dismissToast }}>
      {children}
      {/* Global Real-Time Toast Banner */}
      {activeToast && (
        <div
          onClick={() => {
            if (activeToast.targetUrl) {
              window.location.href = activeToast.targetUrl;
            }
            dismissToast();
          }}
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-32px)] bg-[#171114]/98 border-2 border-gold-500/80 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl cursor-pointer animate-bounce-in transition-all hover:scale-[1.02]"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-sindoor-600/30 border border-gold-500/40 flex items-center justify-center text-lg shrink-0">
              {activeToast.type === 'MATCH' ? '🎉' : activeToast.type === 'VIBE' ? '❤️' : '💬'}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-cream-100 font-cinzel truncate">
                {activeToast.title}
              </h5>
              <p className="text-xs text-cream-300 line-clamp-2 mt-0.5">
                {activeToast.message}
              </p>
              <span className="text-[10px] text-gold-400 font-semibold block mt-1">
                Click to open ➔
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast();
              }}
              className="text-cream-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
