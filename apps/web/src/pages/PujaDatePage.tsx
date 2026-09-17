import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CheckCircle,
  Lock, 
  UploadCloud, 
  Loader2, 
  X, 
  UserPlus, 
  Edit3, 
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import FestiveButton from '../components/common/FestiveButton';
import { completePayment } from '../lib/payments';
import { apiFetch } from '../lib/api';

const PUJA_DAYS = [
  { id: 'SHASHTI', name: 'Shashti', bengali: 'মহাষষ্ঠী', icon: '🌸' },
  { id: 'SAPTAMI', name: 'Saptami', bengali: 'মহাসপ্তমী', icon: '🪔' },
  { id: 'ASHTAMI', name: 'Ashtami', bengali: 'মহাঅষ্টমী', icon: '🌺' },
  { id: 'NABAMI', name: 'Nabami', bengali: 'মহানবমী', icon: '✨' },
  { id: 'DASHAMI', name: 'Dashami', bengali: 'বিজয়া দশমী', icon: '🕊️' },
];

const TIME_SLOTS = [
  { id: 'MORNING', name: 'Morning', bengali: 'সকাল', icon: '☀️' },
  { id: 'AFTERNOON', name: 'Lunch / Afternoon', bengali: 'দুপুর', icon: '🍛' },
  { id: 'EVENING', name: 'Evening', bengali: 'সন্ধ্যা', icon: '🌆' },
  { id: 'NIGHT', name: 'Night', bengali: 'রাত', icon: '🌙' },
];

interface Candidate {
  userId: string;
  displayName: string;
  age: number;
  gender: string;
  avatarUrl?: string;
  bio?: string;
  locationCity: string;
  vibeScore: number;
  matchReasons: string[];
  pujaDays: string[];
  timeSlots: string[];
  interests: { id: string; name: string; nameBengali: string }[];
}

interface MyPujaProfile {
  hasPujaDateProfile: boolean;
  isMatchingActive: boolean;
  displayName: string;
  avatarUrl?: string | null;
  locationCity: string;
  bio?: string | null;
  pujaDays: string[];
  timeSlots: string[];
}

export const PujaDatePage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [feed, setFeed] = useState<Candidate[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [freeChatsLeft, setFreeChatsLeft] = useState<number>(3);
  const [sentVibes, setSentVibes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true);

  // My Puja Date Profile State
  const [myProfile, setMyProfile] = useState<MyPujaProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [formDisplayName, setFormDisplayName] = useState<string>('');
  const [formLocationCity, setFormLocationCity] = useState<string>('');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string>('');
  const [formBio, setFormBio] = useState<string>('');
  const [formPujaDays, setFormPujaDays] = useState<string[]>([]);
  const [formTimeSlots, setFormTimeSlots] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFeedAndProfile = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const [feedRes, convRes, myProfRes] = await Promise.all([
        apiFetch('/api/v1/dating/feed', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/v1/chat/conversations', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/v1/dating/my-profile', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const feedData = await feedRes.json();
      const convData = await convRes.json();
      const myProfData = await myProfRes.json();

      if (feedData.success) {
        setFeed(feedData.feed || []);
      }
      if (convData.success) {
        setConversations(convData.conversations || []);
        if (typeof convData.freeChatsLeft === 'number') {
          setFreeChatsLeft(convData.freeChatsLeft);
        }
      }
      if (myProfData.success) {
        setMyProfile(myProfData);
      }
    } catch (err) {
      console.error('Failed to fetch dating feed or profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedAndProfile();
    apiFetch('/api/v1/calendar/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.calendar) {
          setCalendarData(data);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleOpenProfileModal = () => {
    if (myProfile) {
      setFormDisplayName(myProfile.displayName || user?.profile?.displayName || '');
      setFormLocationCity(myProfile.locationCity || user?.profile?.locationCity || '');
      setFormAvatarUrl(myProfile.avatarUrl || user?.profile?.avatarUrl || '');
      setFormBio(myProfile.bio || user?.profile?.bio || '');
      setFormPujaDays(myProfile.pujaDays.length > 0 ? myProfile.pujaDays : ['ASHTAMI', 'NABAMI']);
      setFormTimeSlots(myProfile.timeSlots.length > 0 ? myProfile.timeSlots : ['EVENING']);
    } else {
      setFormDisplayName(user?.profile?.displayName || '');
      setFormLocationCity(user?.profile?.locationCity || 'Kolkata');
      setFormAvatarUrl(user?.profile?.avatarUrl || '');
      setFormBio('');
      setFormPujaDays(['ASHTAMI', 'NABAMI']);
      setFormTimeSlots(['EVENING']);
    }
    setUploadError(null);
    setIsProfileModalOpen(true);
  };

  const handleToggleDay = (dayId: string) => {
    setFormPujaDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleToggleSlot = (slotId: string) => {
    setFormTimeSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleDevicePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError(lang === 'bn' ? 'শুধুমাত্র ছবি ফাইল আপলোড করুন।' : 'Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(lang === 'bn' ? 'ছবির সাইজ ৫MB এর কম হতে হবে।' : 'Photo size must be less than 5MB.');
      return;
    }
    if (!token) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiFetch('/api/v1/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.fileUrl) {
        setFormAvatarUrl(data.fileUrl);
      } else {
        setUploadError(data.message || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload photo.'));
      }
    } catch (err) {
      console.error('Photo upload error', err);
      setUploadError(lang === 'bn' ? 'আপলোডে সমস্যা হয়েছে।' : 'Error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formPujaDays.length === 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একটি পুজোর দিন নির্বাচন করুন যখন আপনি একা থাকবেন।' : 'Please select at least one Puja day you will be alone.');
      return;
    }
    if (formTimeSlots.length === 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একটি সময় নির্বাচন করুন।' : 'Please select at least one time slot you are free.');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const res = await apiFetch('/api/v1/dating/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: formDisplayName.trim(),
          locationCity: formLocationCity.trim(),
          avatarUrl: formAvatarUrl.trim() || undefined,
          bio: formBio.trim() || undefined,
          pujaDays: formPujaDays,
          timeSlots: formTimeSlots,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsProfileModalOpen(false);
        setStatusMessage(data.message || 'Profile saved successfully!');
        setTimeout(() => setStatusMessage(null), 4000);
        await fetchFeedAndProfile();
      } else {
        alert(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Failed to save profile', err);
      alert('Error saving profile');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleStartChat = async (targetUserId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await apiFetch('/api/v1/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();
      if (res.status === 402 || data.requiresPayment) {
        setPaymentModalOpen(true);
      } else if (data.success) {
        if (typeof data.freeChatsLeft === 'number') {
          setFreeChatsLeft(data.freeChatsLeft);
        }
        navigate(`/chat/${data.conversationId}`);
      }
    } catch (err) {
      console.error('Chat start error', err);
    }
  };

  const handleSendLike = async (targetUserId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSentVibes((prev) => new Set(prev).add(targetUserId));

    try {
      const res = await apiFetch('/api/v1/dating/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();
      if (res.status === 402 || data.requiresPayment) {
        setPaymentModalOpen(true);
        return;
      }
      if (data.success) {
        setStatusMessage(data.message || 'Vibe request sent!');
        if (data.isMutualMatch && data.conversationId) {
          setTimeout(() => navigate(`/chat/${data.conversationId}`), 1500);
        } else {
          setTimeout(() => setStatusMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error('Like error', err);
    }
  };

  const handleUnlockUnlimitedChat = async () => {
    setPaymentLoading(true);
    try {
      const orderRes = await apiFetch('/api/v1/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 'PUJA_DATE_UNLIMITED_CHAT' }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.message || 'Order creation failed');
        setPaymentLoading(false);
        return;
      }

      if (await completePayment(token!, orderData)) {
        setPaymentModalOpen(false);
        setFreeChatsLeft(999);
        alert(lang === 'bn' ? '🎉 আনলিমিটেড চ্যাট সক্রিয় হয়েছে! শুভ পুজো!' : '🎉 Unlimited Chat Unlocked! Happy Pandal Hopping!');
        fetchFeedAndProfile();
      }
    } catch (err) {
      alert('Payment processing error');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 18+ Safety Warning Banner */}
      <div className="bg-[#2A0B0B]/80 border border-sindoor-600/50 rounded-2xl p-4 flex items-start gap-3.5 shadow-lg shadow-black/50">
        <ShieldAlert size={22} className="text-sindoor-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-cream-200">
          <h4 className="font-bold text-[#FFF8EC] uppercase tracking-wider font-cinzel">
            18+ Puja Date Safety Protocol
          </h4>
          <p className="font-bengali leading-relaxed text-cream-300">
            {t.pujaDate.safetyWarning}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-[#3D1414] border border-gold-400 text-gold-300 px-4 py-3 rounded-2xl text-center text-sm font-semibold animate-fade-in shadow-xl">
          {statusMessage}
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-[#FFF8EC] flex items-center gap-2.5">
            <span className="text-sindoor-500">🌸</span>
            <span className="gold-gradient-text">Puja Date</span>
            <span className="text-sm font-bengali font-normal text-gold-400">/ পুজোর ডেট</span>
          </h1>
          <p className="text-xs sm:text-sm text-gold-300 font-bengali mt-1">
            "এই পুজোয়, কিছু মানুষ আপন হোক।" — সমভাবাপন্ন সঙ্গী ও উৎসবের দিনপঞ্জিকা।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAuthenticated && (
            freeChatsLeft >= 999 ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
                <Sparkles size={14} className="text-emerald-400" />
                <span>{lang === 'bn' ? '✨ আনলিমিটেড চ্যাট সক্রিয়' : '✨ Unlimited Chat Active'}</span>
              </div>
            ) : freeChatsLeft > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold shadow-sm">
                <MessageCircle size={14} className="text-gold-400" />
                <span>
                  {lang === 'bn'
                    ? `💬 ৩টি ফ্রি চ্যাট: ${freeChatsLeft}টি বাকি`
                    : `💬 3 Free Chats: ${freeChatsLeft} left`}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sindoor-600/30 hover:bg-sindoor-600/40 border border-sindoor-500/50 text-gold-300 text-xs font-semibold shadow-sm transition-all animate-pulse cursor-pointer"
                title={lang === 'bn' ? 'আনলিমিটেড চ্যাট আনলক করুন' : 'Unlock Unlimited Chat'}
              >
                <Lock size={14} className="text-gold-400" />
                <span>
                  {lang === 'bn'
                    ? '🔒 ৩টি ফ্রি শেষ — ৪র্থ থেকে আনলিমিটেড ₹৪৯'
                    : '🔒 3 Free Used — Unlock 4th & Unlimited for ₹49'}
                </span>
              </button>
            )
          )}

          {!isAuthenticated ? (
            <FestiveButton variant="gold" onClick={() => navigate('/login')}>
              {t.nav.login} to Explore
            </FestiveButton>
          ) : myProfile?.hasPujaDateProfile ? (
            <FestiveButton
              variant="gold"
              onClick={handleOpenProfileModal}
              className="gap-2 shadow-lg shadow-gold-950/30"
            >
              <Edit3 size={15} />
              <span>{t.pujaDate.editProfileBtn}</span>
            </FestiveButton>
          ) : null}
        </div>
      </div>

      {/* Traditional Festival Calendar & Tithi Card */}
      {calendarData?.calendar && (
        <div className="puja-card p-5 rounded-3xl border border-gold-500/35 bg-gradient-to-r from-[#2A0B0B]/85 via-[#3D1414]/70 to-[#2A0B0B]/85 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-gold-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gold-400" />
              <h3 className="text-sm font-bold font-bengali text-gold-200">
                {lang === 'bn' ? 'শারদোৎসব ২০২৬ ক্যালেন্ডার ও দিনক্ষণ' : 'Durga Puja 2026 Festival Dates'}
              </h3>
            </div>
            {calendarData.countdown?.daysLeft > 0 && (
              <span className="text-xs text-gold-400 font-bengali font-semibold px-2.5 py-0.5 rounded-full bg-black/40 border border-gold-500/30">
                {calendarData.countdown.statusTextBengali || `${calendarData.countdown.daysLeft} দিন বাকি`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-center">
            {[
              { name: 'মহালয়া', date: calendarData.calendar.mahalayaDate, icon: '🌾' },
              { name: 'মহাষষ্ঠী', date: calendarData.calendar.shashtiDate, icon: '🌸' },
              { name: 'মহাসপ্তমী', date: calendarData.calendar.saptamiDate, icon: '🪔' },
              { name: 'মহাঅষ্টমী', date: calendarData.calendar.ashtamiDate, icon: '🌺' },
              { name: 'মহানবমী', date: calendarData.calendar.nabamiDate, icon: '✨' },
              { name: 'বিজয়া দশমী', date: calendarData.calendar.dashamiDate, icon: '🕊️' },
            ].map((d, i) => (
              <div key={i} className="p-2 rounded-xl bg-[#180C0C]/80 border border-gold-500/20 space-y-1">
                <span className="text-base">{d.icon}</span>
                <p className="text-xs font-bold font-bengali text-gold-300">{d.name}</p>
                <p className="text-[10px] text-cream-300 font-mono">
                  {new Date(d.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opt-In Status Callout Banner */}
      {isAuthenticated && (
        myProfile?.hasPujaDateProfile ? (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-night-900 via-night-850 to-night-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-bold text-cream-100 font-cinzel">
                  {t.pujaDate.activeProfileBanner}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-cream-300">
                <span className="flex items-center gap-1 text-gold-300">
                  <MapPin size={12} className="text-gold-400" />
                  <strong>{myProfile.locationCity}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-gold-400" />
                  <span>Alone on: <strong>{myProfile.pujaDays.map((d) => d.charAt(0) + d.slice(1).toLowerCase()).join(', ')}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-gold-400" />
                  <span>Free time: <strong>{myProfile.timeSlots.map((s) => s.charAt(0) + s.slice(1).toLowerCase()).join(', ')}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} className="text-gold-400" />
                  <span>
                    {freeChatsLeft >= 999
                      ? (lang === 'bn' ? 'চ্যাট: আনলিমিটেড' : 'Chat: Unlimited')
                      : (lang === 'bn' ? `ফ্রি চ্যাট: ${freeChatsLeft}/৩ বাকি` : `Free chats: ${freeChatsLeft}/3 left`)}
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenProfileModal}
              className="px-3.5 py-1.5 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-end md:self-auto"
            >
              <Edit3 size={13} />
              <span>{lang === 'bn' ? 'শিডিউল পরিবর্তন' : 'Edit Schedule'}</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-sindoor-950/80 via-night-900 to-amber-950/60 border-2 border-gold-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl animate-fade-in">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>{lang === 'bn' ? 'প্রোফাইল তৈরি প্রয়োজন' : 'Profile Setup Required'}</span>
              </div>
              <h3 className="text-lg font-bold text-cream-100 font-cinzel">
                {t.pujaDate.notActiveBannerTitle}
              </h3>
              <p className="text-xs text-cream-300 font-bengali leading-relaxed">
                {t.pujaDate.notActiveBannerDesc}
              </p>
            </div>

            <FestiveButton
              variant="gold"
              onClick={handleOpenProfileModal}
              className="gap-2 self-start md:self-auto px-5 py-2.5 shadow-lg shadow-gold-950/40"
            >
              <UserPlus size={16} />
              <span>{t.pujaDate.createProfileBtn}</span>
            </FestiveButton>
          </div>
        )
      )}

      {/* Candidates Feed */}
      {isLoading ? (
        <div className="text-center py-20 space-y-3">
          <span className="text-4xl animate-bounce inline-block">🪔</span>
          <p className="text-sm text-gold-400 font-bengali">খোঁজা হচ্ছে আপনার পুজো vibe...</p>
        </div>
      ) : feed.length === 0 ? (
        <div className="puja-card p-12 text-center rounded-3xl space-y-4">
          <span className="text-5xl">❤️</span>
          <h3 className="text-lg font-bold text-cream-100 font-cinzel">{t.pujaDate.emptyTitle}</h3>
          <p className="text-xs text-cream-300 max-w-md mx-auto font-bengali">{t.pujaDate.emptyDesc}</p>
          {!myProfile?.hasPujaDateProfile && (
            <div className="pt-2">
              <FestiveButton variant="gold" onClick={handleOpenProfileModal}>
                {t.pujaDate.createProfileBtn}
              </FestiveButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-cream-400 px-1">
            <span>
              {lang === 'bn' ? 'ম্যাচ স্কোর অনুযায়ী সাজানো (সর্বোচ্চ মিল প্রথমে):' : 'Sorted by schedule compatibility (Best matches first):'}
            </span>
            <span className="text-gold-300 font-semibold">{feed.length} candidates active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((person) => {
              const userConv = conversations.find((c) => c.otherUser?.id === person.userId);
              const unreadCount = userConv?.unreadCount || 0;
              const isVibeSent = sentVibes.has(person.userId);
              const isPerfectMatch = person.vibeScore >= 95;

              return (
                <div
                  key={person.userId}
                  className={`puja-card rounded-3xl overflow-hidden flex flex-col justify-between group relative transition-all duration-300 ${
                    isPerfectMatch
                      ? 'border-2 border-gold-400/80 shadow-2xl shadow-gold-500/10 hover:border-gold-300'
                      : 'hover:border-gold-500/40'
                  }`}
                >
                  {/* Photo & Badges */}
                  <div className="relative h-64 w-full bg-night-850 overflow-hidden">
                    {/* SMS Unread badge */}
                    {unreadCount > 0 && (
                      <div
                        onClick={() => handleStartChat(person.userId)}
                        title={`${unreadCount} new messages from ${person.displayName}`}
                        className="absolute top-3 left-3 px-3 py-1 rounded-full bg-sindoor-600 text-white border-2 border-night-950 shadow-2xl flex items-center gap-1.5 text-xs font-black animate-pulse z-20 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <MessageCircle size={13} className="text-gold-300" />
                        <span>{unreadCount} SMS</span>
                      </div>
                    )}

                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt={person.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-night-900 to-sindoor-950">
                        🌸
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-black/30" />

                    {/* Vibe Score Badge */}
                    <div
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 text-xs ${
                        isPerfectMatch
                          ? 'bg-gradient-to-r from-amber-600 to-sindoor-600 text-white font-black border border-gold-300 animate-pulse'
                          : 'bg-sindoor-900/90 border border-gold-400/60 text-gold-300 font-bold'
                      }`}
                    >
                      <Sparkles size={13} className={isPerfectMatch ? 'text-amber-200' : 'text-gold-300'} />
                      <span>{isPerfectMatch ? `🔥 ${person.vibeScore}% Best Match` : `${person.vibeScore}% Vibe Match`}</span>
                    </div>

                    {/* Name & Age Overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white font-cinzel truncate">
                        {person.displayName}, {person.age}
                      </h3>
                      <p className="text-xs text-cream-300 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-gold-400 flex-shrink-0" />
                        <span className="truncate">{person.locationCity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {person.bio && (
                        <p className="text-xs text-cream-200 line-clamp-2 font-bengali leading-relaxed italic">
                          "{person.bio}"
                        </p>
                      )}

                      {/* Overlap Highlights / Match Reasons */}
                      {person.matchReasons && person.matchReasons.length > 0 && (
                        <div className="bg-night-950/80 p-2.5 rounded-xl border border-gold-500/25 space-y-1">
                          {person.matchReasons.map((reason, idx) => (
                            <p key={idx} className="text-[11px] text-gold-300 font-medium flex items-center gap-1.5">
                              <CheckCircle2 size={11} className="text-gold-400 flex-shrink-0" />
                              <span className="truncate">{reason}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Alone Days & Free Times Badges */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-cream-300">
                          <Calendar size={12} className="text-gold-400 flex-shrink-0" />
                          <span className="text-cream-400">Alone on:</span>
                          <div className="flex flex-wrap gap-1">
                            {person.pujaDays.map((d) => (
                              <span key={d} className="px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-300 border border-gold-500/20 font-medium">
                                {d.charAt(0) + d.slice(1).toLowerCase()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-cream-300">
                          <Clock size={12} className="text-gold-400 flex-shrink-0" />
                          <span className="text-cream-400">Free time:</span>
                          <div className="flex flex-wrap gap-1">
                            {person.timeSlots.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-md bg-sindoor-500/15 text-sindoor-300 border border-sindoor-500/25 font-medium">
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold-500/15">
                      <FestiveButton
                        variant={isVibeSent ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => handleSendLike(person.userId)}
                        disabled={isVibeSent}
                        className="gap-1.5 text-xs"
                      >
                        <Heart
                          size={14}
                          className={
                            isVibeSent
                              ? 'text-night-950 fill-night-950'
                              : 'text-sindoor-400 fill-sindoor-400'
                          }
                        />
                        <span>
                          {isVibeSent
                            ? lang === 'bn'
                              ? 'পাঠানো হয়েছে!'
                              : 'Vibe Sent!'
                            : t.pujaDate.sendLike}
                        </span>
                      </FestiveButton>

                      <FestiveButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartChat(person.userId)}
                        className="gap-1.5 text-xs relative"
                      >
                        <MessageCircle size={14} />
                        <span>{t.pujaDate.message}</span>
                        {unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-sindoor-400 animate-ping absolute top-2 right-2" />
                        )}
                      </FestiveButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Puja Date Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-night-900 border border-gold-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-cream-100 flex items-center gap-2 font-cinzel">
                  <span>❤️</span>
                  <span>{t.pujaDate.profileModalTitle}</span>
                </h3>
                <p className="text-xs text-cream-400 font-bengali mt-0.5">
                  {t.pujaDate.profileModalSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-xl text-cream-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Profile Photo Upload */}
              <div>
                <label className="text-cream-300 block mb-1 font-semibold">
                  {lang === 'bn' ? 'প্রোফাইল ছবি (ডিভাইস থেকে আপলোড করুন)' : 'Profile Photo (Upload from Device)'}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDevicePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                />

                {formAvatarUrl ? (
                  <div className="rounded-2xl border border-gold-500/40 bg-night-950 p-2.5 flex items-center gap-3">
                    <img
                      src={formAvatarUrl}
                      alt="Uploaded avatar preview"
                      className="w-14 h-14 object-cover rounded-full border-2 border-gold-500/40 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cream-100 font-semibold truncate">
                        {lang === 'bn' ? 'ছবি যুক্ত হয়েছে' : 'Photo Attached'}
                      </p>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle size={12} />
                        <span>{lang === 'bn' ? 'প্রোফাইলে প্রদর্শিত হবে' : 'Ready for profile'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-2.5 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/30 text-[11px] font-semibold transition-colors"
                      >
                        {lang === 'bn' ? 'পরিবর্তন' : 'Change'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormAvatarUrl('')}
                        className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 transition-colors"
                        title="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-gold-500/40 hover:border-gold-400 bg-night-950/60 hover:bg-gold-500/5 transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
                    >
                      {isUploadingPhoto ? (
                        <div className="flex items-center gap-2 text-gold-300 text-xs py-1">
                          <Loader2 size={18} className="animate-spin text-gold-400" />
                          <span>{lang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading photo from device...'}</span>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 group-hover:scale-110 transition-transform">
                            <UploadCloud size={18} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-cream-100">
                              {t.pujaDate.uploadPhotoPrompt}
                            </p>
                            <p className="text-[10px] text-cream-400 mt-0.5">
                              JPG, PNG, WebP (Max 5MB)
                            </p>
                          </div>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="h-px bg-gold-500/20 flex-1" />
                      <span className="text-[10px] uppercase tracking-wider text-cream-400">
                        {lang === 'bn' ? 'অথবা ছবির লিঙ্ক দিন' : 'or enter image url'}
                      </span>
                      <div className="h-px bg-gold-500/20 flex-1" />
                    </div>

                    <input
                      type="url"
                      value={formAvatarUrl}
                      onChange={(e) => setFormAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-xs focus:outline-none focus:border-gold-400"
                    />
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Name & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-cream-300 block mb-1 font-semibold">
                    {lang === 'bn' ? 'আপনার নাম *' : 'Display Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="e.g. Suman Roy"
                    className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="text-cream-300 block mb-1 font-semibold">
                    {t.pujaDate.locationLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocationCity}
                    onChange={(e) => setFormLocationCity(e.target.value)}
                    placeholder="e.g. Bagbazar or Salt Lake"
                    className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Days You Will Be Alone (Multi-select) */}
              <div className="space-y-1.5">
                <label className="text-cream-200 block font-semibold flex items-center justify-between">
                  <span>{t.pujaDate.daysAloneLabel} *</span>
                  <span className="text-[10px] text-gold-400 font-normal">
                    {formPujaDays.length} selected
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PUJA_DAYS.map((day) => {
                    const isSelected = formPujaDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDay(day.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-sindoor-900 to-sindoor-950 border-gold-400 text-white shadow-md'
                            : 'bg-night-850 border-gold-500/20 text-cream-300 hover:border-gold-500/40 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{day.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">{day.name}</p>
                          <p className="text-[10px] text-cream-400 font-bengali leading-tight truncate">{day.bengali}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Free (Multi-select) */}
              <div className="space-y-1.5">
                <label className="text-cream-200 block font-semibold flex items-center justify-between">
                  <span>{t.pujaDate.timeSlotsLabel} *</span>
                  <span className="text-[10px] text-gold-400 font-normal">
                    {formTimeSlots.length} selected
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = formTimeSlots.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleToggleSlot(slot.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-700/80 to-sindoor-900 border-gold-400 text-white shadow-md'
                            : 'bg-night-850 border-gold-500/20 text-cream-300 hover:border-gold-500/40 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{slot.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">{slot.name}</p>
                          <p className="text-[10px] text-cream-400 font-bengali leading-tight truncate">{slot.bengali}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio / Companion Wish */}
              <div>
                <label className="text-cream-300 block mb-1">
                  {lang === 'bn' ? 'আপনার সম্পর্কে সংক্ষিপ্ত বর্ণনা (ঐচ্ছিক)' : 'Short Bio / What you look for in a companion (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="e.g. Love north Kolkata traditional pandals, photography, and trying roll & phuchka!"
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <FestiveButton
                  type="button"
                  variant="ghost"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </FestiveButton>
                <FestiveButton
                  type="submit"
                  variant="gold"
                  disabled={isSubmittingProfile || isUploadingPhoto}
                  className="flex-1 gap-2 shadow-lg shadow-gold-950/40"
                >
                  {isSubmittingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{t.pujaDate.saveProfileBtn}</span>
                    </>
                  )}
                </FestiveButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3 Free Conversations Limit Reached -> Razorpay ₹49 Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-night-900 border-2 border-gold-500 rounded-3xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-sindoor-950 border-2 border-gold-500/50 flex items-center justify-center shadow-inner shadow-gold-500/20">
              <Sparkles size={28} className="text-gold-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-sindoor-500/20 border border-sindoor-500/40 text-gold-400 text-xs font-bold uppercase tracking-wider">
                {lang === 'bn' ? '৪র্থ ব্যক্তি থেকে আনলিমিটেড চ্যাট' : '4th Person Onwards: Unlimited Chat'}
              </div>
              <h3 className="text-xl font-bold text-cream-100 font-cinzel">
                {lang === 'bn'
                  ? '৩টি ফ্রি চ্যাট শেষ — আনলিমিটেড চ্যাট আনলক করুন'
                  : '3 Free Chats Used — Unlock Unlimited Chat'}
              </h3>
              <p className="text-xs text-cream-300 font-bengali leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার ১ম ৩ জনের সাথে চ্যাট ছিল সম্পূর্ণ ফ্রি! ৪র্থ ব্যক্তি এবং পরবর্তী সবার সাথে কোনো সীমা ছাড়াই কথা বলতে মাত্র ₹৪৯ এককালীন ফি দিয়ে আনলক করুন।'
                  : 'You have used your 3 free companion chats! To start chatting with the 4th person onwards with unlimited access, unlock with a one-time fee of ₹49.'}
              </p>
            </div>

            <div className="p-4 bg-night-950/90 rounded-2xl border border-gold-500/40 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-extrabold text-gold-400 font-cinzel">₹49</span>
                <span className="text-xs text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                  {lang === 'bn' ? 'এককালীন ফি' : 'One-Time Fee'}
                </span>
              </div>
              <span className="text-xs text-cream-400 block">
                {lang === 'bn' ? 'আজীবন সীমাহীন চ্যাটের সম্পূর্ণ সুবিধা' : 'Unlimited Companion Chats Forever'}
              </span>
            </div>

            <div className="bg-night-850/70 rounded-2xl p-3 border border-night-750 text-left text-xs space-y-2 text-cream-200 font-bengali">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                <span>{lang === 'bn' ? '১ম, ২য় ও ৩য় জনের সাথে চ্যাট ফ্রি ছিল' : '1st, 2nd & 3rd person chats were free'}</span>
              </div>
              <div className="flex items-center gap-2 text-gold-400">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                <span>{lang === 'bn' ? '৪র্থ ব্যক্তি থেকে আনলিমিটেড মানুষের সাথে চ্যাট' : 'Unlimited chats from the 4th person onwards'}</span>
              </div>
              <div className="flex items-center gap-2 text-cream-300">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                <span>{lang === 'bn' ? 'ভেরিফায়েড পুজো সাথীদের সাথে ইনস্ট্যান্ট কানেক্ট' : 'Verified companion profiles & instant messaging'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <FestiveButton
                variant="gold"
                size="lg"
                onClick={handleUnlockUnlimitedChat}
                disabled={paymentLoading}
                className="w-full gap-2 shadow-xl shadow-gold-950/50 text-sm font-bold"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{lang === 'bn' ? 'প্রসেস হচ্ছে...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>{lang === 'bn' ? 'এখনই আনলক করুন (₹৪৯ Razorpay)' : 'Pay with Razorpay (₹49)'}</span>
                )}
              </FestiveButton>

              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-xs text-cream-400 hover:text-white py-1 block w-full transition-colors"
              >
                {lang === 'bn' ? 'পরে করব / Dismiss' : 'Maybe Later / Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaDatePage;
