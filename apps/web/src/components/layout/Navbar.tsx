import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Globe, User, Menu, X, ShieldAlert, Music, Bell, CheckCheck, Sparkles, Home, Search, BookHeart, LogIn } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import FestiveButton from '../common/FestiveButton';
import { apiFetch, resolveImageUrl } from '../../lib/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export const Navbar: React.FC = () => {
  const { lang, t, toggleLang } = useLanguage();
  const { user, token, isAuthenticated, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Smart Scroll: Hide when scrolling down, show when scrolling up; reduce height on scroll
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 30);

          // Always visible near the top of the page
          if (currentScrollY <= 20) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 70) {
            // Scrolling DOWN -> smoothly hide nav
            setIsVisible(false);
            setIsNotifOpen(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling UP -> smoothly show nav
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/puja-date', label: t.nav.pujaDate, icon: Heart },
    { to: '/lost-found', label: t.nav.lostFound, icon: Search },
    { to: '/memories', label: t.nav.memories, icon: BookHeart },
    { to: '/songs', label: t.nav.songs, icon: Music },
  ];

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        return;
      }
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Silently catch network errors
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const timer = setInterval(fetchNotifications, 15000);

      // Real-time notification listener via Socket
      if (socket) {
        const handleRealtimeUpdate = () => {
          fetchNotifications();
        };

        socket.on('new_message_notification', handleRealtimeUpdate);
        socket.on('vibe_received', handleRealtimeUpdate);
        socket.on('match_received', handleRealtimeUpdate);

        return () => {
          clearInterval(timer);
          socket.off('new_message_notification', handleRealtimeUpdate);
          socket.off('vibe_received', handleRealtimeUpdate);
          socket.off('match_received', handleRealtimeUpdate);
        };
      }

      return () => clearInterval(timer);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, token, socket]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      await apiFetch(`/api/v1/notifications/${notif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {}

    setIsNotifOpen(false);
    if (notif.targetUrl) {
      // If targetUrl has a sub-path like /lost-found/:id, route safely to /lost-found
      const cleanUrl = notif.targetUrl.startsWith('/lost-found') ? '/lost-found' : notif.targetUrl;
      navigate(cleanUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/v1/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out border-b border-gold-500/25 shadow-xl shadow-black/60 ${
        isMobileMenuOpen || isScrolled
          ? 'bg-[#120909] py-0'
          : 'bg-[#120909]/95 backdrop-blur-xl py-0.5'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 transition-all duration-300 ${
        isScrolled ? 'h-14' : 'h-16'
      }`}>
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-gold-500/40 p-0.5 bg-[#2A0B0B]/60 backdrop-blur-md group-hover:border-gold-400 group-hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all">
            <img src="/icons/durga-eye.svg" alt="Agomoni" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-cinzel text-[#FFF8EC] tracking-wider">
              AGOMONI
            </span>
            <span className="text-xs text-gold-400 font-bengali font-semibold hidden md:inline">
              আগমনী
            </span>
          </div>
        </Link>

        {/* Desktop & Tablet Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-5 xl:gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const isPujaDate = link.to === '/puja-date';
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 py-1 px-1.5 relative ${
                  isActive
                    ? 'text-gold-300 font-bold'
                    : isPujaDate
                    ? 'text-sindoor-400 hover:text-sindoor-300 font-semibold'
                    : 'text-cream-200 hover:text-white'
                }`}
              >
                {isPujaDate && <Heart size={12} className="fill-sindoor-500 text-sindoor-400 flex-shrink-0" />}
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Highlighted Puja Date Action Button (Wide Screens) */}
          <Link
            to="/puja-date"
            className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sindoor-600 via-sindoor-500 to-sindoor-600 text-white shadow-lg shadow-sindoor-950/60 border border-gold-500/50 hover:border-gold-300 hover:brightness-110 backdrop-blur-md transition-all active:scale-95 flex-shrink-0"
            title="Puja Date"
          >
            <Heart size={13} className="text-gold-200 fill-sindoor-400" />
            <span className="font-bengali font-bold tracking-wide">
              {lang === 'bn' ? 'পুজো ডেট' : 'Puja Date'}
            </span>
            <span className="hidden md:inline text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#120909]/60 text-gold-300 border border-gold-400/30 uppercase">
              Hot 🔥
            </span>
          </Link>

          {/* Emergency Quick Action (Desktop/Tablet) */}
          <Link
            to="/emergency"
            className="hidden md:flex p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/35 backdrop-blur-md transition-all shadow-sm"
            title={t.nav.emergency}
          >
            <ShieldAlert size={16} />
          </Link>

          {/* Language Switcher (Desktop/Tablet) */}
          <button
            onClick={toggleLang}
            className="hidden md:flex px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-cream-200 border border-white/15 hover:border-white/25 text-xs font-semibold items-center gap-1 backdrop-blur-md transition-all shadow-sm"
            title="Switch Language"
          >
            <Globe size={13} className="text-gold-400" />
            <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Notification Bell (Logged in only, Desktop/Tablet) */}
          {isAuthenticated && (
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/15 text-cream-200 border border-white/15 hover:border-white/25 transition-all shadow-sm"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-sindoor-600 text-white text-[10px] font-bold border border-white/30 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-[#161214] border border-gold-500/40 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gold-500/20 pb-2.5">
                    <h4 className="text-xs font-bold text-cream-100 flex items-center gap-1.5 font-cinzel">
                      <Sparkles size={14} className="text-gold-400" />
                      <span>Agomoni Alerts</span>
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck size={12} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-cream-400 text-center py-6">No notifications yet 🪔</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead
                              ? 'bg-night-850/60 border-gold-500/10 text-cream-300'
                              : 'bg-gold-500/10 border-gold-500/40 text-cream-100 font-medium'
                          } hover:border-gold-400`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-semibold text-gold-300 text-[11px]">{n.title}</span>
                            <span className="text-[9px] text-cream-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-cream-200 line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Profile / Login (Desktop/Tablet) */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm"
                title="My Profile"
              >
                {user?.profile?.avatarUrl ? (
                  <img
                    src={resolveImageUrl(user.profile.avatarUrl)}
                    alt={user.profile.displayName || 'User'}
                    onError={(e) => {
                      // Gracefully fallback to initial circle if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.avatar-fallback')) {
                        const div = document.createElement('div');
                        div.className = 'avatar-fallback w-8 h-8 rounded-full bg-sindoor-800 text-white flex items-center justify-center text-xs font-bold border border-gold-500/30';
                        div.innerText = user?.profile?.displayName?.charAt(0) || 'U';
                        parent.appendChild(div);
                      }
                    }}
                    className="w-8 h-8 rounded-full object-cover border border-gold-500/40 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sindoor-800 text-white flex items-center justify-center text-xs font-bold border border-gold-500/30 shadow-sm">
                    {user?.profile?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
            ) : (
              <Link to="/login" className="inline-flex items-center">
                <FestiveButton size="sm" variant="gold" className="flex items-center gap-1.5 font-bold shadow-md">
                  <LogIn size={13} className="text-night-950" />
                  <span>{t.nav.login}</span>
                </FestiveButton>
              </Link>
            )}
          </div>

          {/* Mobile 3-Line Menu Toggle Button (Mobile Only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 text-gold-400 border border-gold-500/30 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`md:hidden fixed inset-0 ${isScrolled ? 'top-14' : 'top-16'} bg-black/80 backdrop-blur-sm z-40`}
        />
      )}

      {/* Mobile Full-Featured Drawer */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed inset-x-0 ${isScrolled ? 'top-14' : 'top-16'} bg-[#160A0A] border-b-2 border-gold-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-50 max-h-[calc(100vh-4rem)] overflow-y-auto animate-fade-in`}>
          <div className="p-4 sm:p-6 space-y-4">
            {/* Quick Puja Date Banner inside Mobile Menu */}
            <Link
              to="/puja-date"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2A0B0B] via-[#4A1010] to-[#2A0B0B] border border-gold-500/50 flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sindoor-600 flex items-center justify-center text-gold-200 shadow-md">
                  <Heart size={20} className="fill-current animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#FFF8EC] font-bengali">
                    {lang === 'bn' ? '🌸 পুজো ডেট — সাথী খুঁজুন' : '🌸 Puja Date — Find Match'}
                  </h4>
                  <p className="text-[11px] text-gold-300 font-bengali">
                    {lang === 'bn' ? '১৮+ ভেরিফায়েড পুজো সাথী' : '18+ Verified festive companion'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sindoor-600 text-white uppercase tracking-wider shadow-sm border border-gold-400/30">
                HOT
              </span>
            </Link>

            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-3 rounded-2xl border text-sm font-semibold transition-all flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4A1010] to-[#2A0B0B] border-gold-400 text-gold-300 font-bold shadow-lg shadow-black/50'
                        : 'bg-[#240F0F] hover:bg-[#331414] border-gold-500/20 text-cream-100 hover:text-white hover:border-gold-500/40 shadow-sm'
                    }`}
                  >
                    <Icon size={17} className={isActive ? 'text-gold-400' : 'text-gold-500/80'} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Emergency Quick Item */}
              <Link
                to="/emergency"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl border border-red-500/40 bg-[#2A0E12] hover:bg-[#3D141A] text-red-300 text-sm font-semibold flex items-center gap-2.5 shadow-sm col-span-2"
              >
                <ShieldAlert size={18} className="text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center justify-between">
                    <span>{t.nav.emergency}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 border border-red-500/30">SOS</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Language Switcher & Notifications inside Mobile Drawer */}
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#240F0F] border border-gold-500/20 text-cream-100 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-cream-200">
                  <Globe size={15} className="text-gold-400" />
                  <span>{lang === 'bn' ? 'ভাষা নির্বাচন' : 'Language'}</span>
                </div>
                <button
                  onClick={toggleLang}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gold-300 border border-gold-500/30 text-xs font-bold transition-all"
                >
                  {lang === 'bn' ? 'English (EN)' : 'বাংলা (বাং)'}
                </button>
              </div>

              {isAuthenticated && (
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsNotifOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-[#240F0F] border border-gold-500/30 flex items-center justify-between cursor-pointer hover:bg-[#331414] transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-cream-100">
                    <Bell size={15} className="text-gold-400" />
                    <span>Agomoni Alerts</span>
                  </div>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-sindoor-600 text-white text-[10px] font-bold animate-pulse">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[11px] text-cream-400">View</span>
                  )}
                </div>
              )}
            </div>

            {/* Auth / Account Controls inside Drawer */}
            <div className="pt-3 border-t border-gold-500/20 flex items-center justify-between gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#240F0F] border border-gold-500/30 text-xs font-semibold text-gold-300 hover:text-white flex items-center gap-2 shadow-sm flex-1"
                  >
                    <User size={15} className="text-gold-400" />
                    <span className="truncate">{user?.profile?.displayName || 'My Profile'}</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 transition-colors shadow-sm"
                  >
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2.5 w-full">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <FestiveButton size="sm" variant="gold" className="w-full justify-center">
                      {t.nav.login}
                    </FestiveButton>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <FestiveButton size="sm" variant="secondary" className="w-full justify-center">
                      {t.nav.register}
                    </FestiveButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
