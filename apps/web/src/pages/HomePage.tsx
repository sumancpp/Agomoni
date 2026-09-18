import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Pause, Heart, Search, Shirt, BookHeart, ShieldAlert, Music, ArrowRight, Calendar, Clock, Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import FestiveButton from '../components/common/FestiveButton';
import AlponaDivider from '../components/common/AlponaDivider';
import AlponaCorner from '../components/common/AlponaCorner';
import ChalchitraHalo from '../components/puja-mode/ChalchitraHalo';
import KashfulHorizon from '../components/puja-mode/KashfulHorizon';
import { apiFetch } from '../lib/api';

export const HomePage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { activeTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();

  const [liveUsers, setLiveUsers] = useState<number>(1);
  const [targetDateStr, setTargetDateStr] = useState<string>('2026-10-16T08:00:00Z');
  const [countdown, setCountdown] = useState<{
    daysLeft: number;
    statusText: string;
    statusTextBengali: string;
  }>({
    daysLeft: 29,
    statusText: '29 Days Until Durga Puja',
    statusTextBengali: 'মা আসতে আর মাত্র ২৯ দিন বাকি',
  });

  // Real-time ticking countdown state
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 29,
    hours: 23,
    minutes: 14,
    seconds: 56,
  });

  useEffect(() => {
    // 1. Fetch active calendar data
    apiFetch('/api/v1/calendar/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.countdown) {
          setCountdown(data.countdown);
          if (data.countdown.targetDate) {
            setTargetDateStr(data.countdown.targetDate);
          }
        }
      })
      .catch(() => {
        // Handled gracefully with fallback countdown state
      });

    // 2. Tab session token for live user count
    let sessionId = sessionStorage.getItem('agomoni_presence_session');
    if (!sessionId) {
      sessionId = 'tab-' + Math.random().toString(36).slice(2, 11);
      sessionStorage.setItem('agomoni_presence_session', sessionId);
    }

    const fetchLiveUsers = () => {
      apiFetch(`/api/v1/stats/live-users?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.count === 'number') {
            setLiveUsers(data.count);
          }
        })
        .catch(() => { });
    };

    fetchLiveUsers();
    const liveInterval = setInterval(fetchLiveUsers, 8000);
    return () => clearInterval(liveInterval);
  }, []);

  // Real-time ticking down to the second
  useEffect(() => {
    const updateTick = () => {
      const targetTime = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateTick();
    const ticker = setInterval(updateTick, 1000);
    return () => clearInterval(ticker);
  }, [targetDateStr]);

  const handleStartMusic = () => {
    if (isPlaying) {
      togglePlay();
    } else {
      if (activeTrack) {
        togglePlay();
      } else {
        apiFetch('/api/v1/music/playlists')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.playlists.length > 0) {
              const all = data.playlists.flatMap((p: any) => p.tracks);
              const duggaElo = all.find((t: any) => t.title.toLowerCase().includes('dugga elo')) || all[0];
              playTrack(duggaElo, all, false);
            }
          })
          .catch(() => { });
      }
    }
  };

  const formatDigit = (num: number) => {
    if (lang === 'bn') {
      return num.toLocaleString('bn-BD');
    }
    return num.toString().padStart(2, '0');
  };

  const pujaDaysList = [
    {
      day: 'মহালয়া',
      dayEn: 'Mahalaya',
      ritual: 'পিতৃতর্পণ ও আগমনী সুর',
      desc: 'ভোরের বীরেন্দ্রকৃষ্ণ ভদ্রের চণ্ডীপাঠ ও কাশফুলের দোলায় দেবীপক্ষের সূচনা।',
      symbol: '🌾',
      tag: 'দেবীপক্ষ',
    },
    {
      day: 'মহাষষ্ঠী',
      dayEn: 'Maha Shashti',
      ritual: 'বোধন ও অধিবাস',
      desc: 'মায়ের মুখ উন্মোচন, আমলকী ও বেলশাখায় দেবীর মর্ত্যে শুভ প্রবেশ।',
      symbol: '🌸',
      tag: 'বোধন',
    },
    {
      day: 'মহাসপ্তমী',
      dayEn: 'Maha Saptami',
      ritual: 'নবপত্রিকা স্নান',
      desc: 'গঙ্গাতীরে কলাবউ স্নান, নবপত্রিকা প্রবেশ ও প্রাণপ্রতিষ্ঠার পুণ্য মুহূর্ত।',
      symbol: '🪔',
      tag: 'প্রাণপ্রতিষ্ঠা',
    },
    {
      day: 'মহাঅষ্টমী',
      dayEn: 'Maha Ashtami',
      ritual: 'পুষ্পাঞ্জলি ও সন্ধিপূজা',
      desc: 'সবার প্রিয় অঞ্জলি, ঢাকের গমগম আওয়াজ ও ১০৮ মাটির প্রদীপে সন্ধিক্ষণের আরতি।',
      symbol: '🌺',
      tag: 'সন্ধিপূজা',
    },
    {
      day: 'মহানবমী',
      dayEn: 'Maha Nabami',
      ritual: 'ধুনুচি নাচ ও হোমযজ্ঞ',
      desc: 'ধুনুচির ধোঁয়া, কাঁসি-ঢাকের উদ্দাম নাচ আর উৎসবের শেষ সান্ধ্য আলোকমালা।',
      symbol: '✨',
      tag: 'ধুনুচি নাচ',
    },
    {
      day: 'বিজয়া দশমী',
      dayEn: 'Bijoya Dashami',
      ritual: 'সিঁদুর খেলা ও বিসর্জন',
      desc: 'মায়ের মিষ্টিমুখ ও সিঁদুরবরণ; কান্নাভেজা চোখে—"আসছে বছর আবার হবে!"',
      symbol: '🕊️',
      tag: 'শুভ বিজয়া',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-[#120909]">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC DURGA PUJA HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 text-center">
        {/* Full-screen Cinematic Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[center_top] bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: "url('/images/hero-bg.png')",
          }}
          aria-hidden="true"
        />

        {/* Cinematic Gradient Scrim: Dark maroon/black center overlay so text is 100% readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center, rgba(18, 9, 9, 0.88) 0%, rgba(42, 11, 11, 0.75) 45%, rgba(18, 9, 9, 0.92) 100%),
              linear-gradient(to bottom, rgba(18, 9, 9, 0.85) 0%, transparent 25%, transparent 70%, rgba(18, 9, 9, 0.98) 100%),
              linear-gradient(to right, rgba(18, 9, 9, 0.6) 0%, transparent 30%, transparent 70%, rgba(18, 9, 9, 0.6) 100%)
            `,
          }}
          aria-hidden="true"
        />

        {/* Ambient Warm Pandal Light & Diya Glow Accents */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] bg-gradient-to-tr from-sindoor-600/20 via-gold-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Layer */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-10 sm:pt-14 pb-12 animate-fade-in">
          {/* Eyebrow & Live Visitor Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Sharadiya Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180C0C]/80 border border-gold-500/40 text-gold-300 text-xs font-semibold tracking-wider backdrop-blur-md shadow-lg shadow-black/50">
              <span className="text-sm">🪔</span>
              <span className="font-bengali">শারদীয়া ১৪৩৩</span>
              {lang === 'en' && <span className="text-gold-400/80 text-[10px] pl-1 border-l border-gold-500/30">Sharadotsav 2026</span>}
            </div>

            {/* Warm Festival Visitor Counter (Subtle Diya Pulse instead of harsh neon) */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180C0C]/80 border border-gold-400/30 text-gold-300 text-xs font-semibold shadow-lg shadow-black/50 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500 shadow-[0_0_8px_#D4AF37]"></span>
              </span>
              <span className="font-bengali">
                {lang === 'bn'
                  ? (liveUsers === 1
                    ? '১ জন এখন আগমনীতে যুক্ত'
                    : `${liveUsers.toLocaleString('bn-BD')} জন এখন আগমনীতে যুক্ত`)
                  : (liveUsers === 1
                    ? '1 devotee live on Agomoni'
                    : `${liveUsers.toLocaleString()} devotees live on Agomoni`)}
              </span>
            </div>
          </div>

          {/* Maa Durga Divine Eye Motif */}

          {/* Headings Hierarchy */}
          <div className="space-y-3">
            {/* Visual Centerpiece Title: আগমনী */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-bengali tracking-tight gold-gradient-text drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              আগমনী
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl font-bengali text-sindoor-400 font-semibold italic drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              "মা আসছেন..."
            </p>

            {/* Supporting Bengali Copy */}
            <p className="text-sm sm:text-base md:text-lg text-[#FFF8EC] max-w-xl mx-auto font-bengali font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] px-2">
              ঢাকের তালে, কাশফুলের দোলে,<br className="hidden sm:inline" />
              আবার আসছে মায়ের আগমনী।
            </p>
          </div>

          {/* ========================================================================= */}
          {/* HERO BUTTONS (Strictly connected to existing actions) */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {/* Primary Action: 🌸 পুজোর ডেট খুঁজুন */}
            <Link to="/puja-date">
              <FestiveButton
                size="lg"
                variant="primary"
                className="gap-2.5 px-7 py-3 text-base shadow-xl shadow-sindoor-950/80 group"
              >
                <span className="group-hover:scale-110 transition-transform">🌸</span>
                <span className="font-bengali font-bold">পুজোর ডেট খুঁজুন</span>
                {lang === 'en' && <span className="text-[11px] text-white/80 font-normal pl-1 border-l border-white/30">(Find Puja Date)</span>}
              </FestiveButton>
            </Link>

            {/* Secondary Action: 🎵 গান শুনুন */}
            <FestiveButton
              size="lg"
              variant="secondary"
              onClick={handleStartMusic}
              className="gap-2.5 px-6 py-3 text-base"
            >
              {isPlaying ? (
                <>
                  <Pause size={18} className="text-gold-400" />
                  <span className="font-bengali">{lang === 'bn' ? 'গান থামান (Pause)' : 'Pause Music'}</span>
                </>
              ) : (
                <>
                  <span>🎵</span>
                  <span className="font-bengali">{lang === 'bn' ? 'গান শুনুন' : 'Listen Puja Song'}</span>
                </>
              )}
            </FestiveButton>
          </div>

          {/* TRADITIONAL FESTIVAL COUNTDOWN (Invitation-Card Style) */}
          {/* ========================================================================= */}
          <div className="pt-2 pb-2">
            <div className="inline-block p-4 sm:p-5 rounded-2xl bg-[#2A0B0B]/75 border border-gold-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-md ring-1 ring-gold-400/20 max-w-xl mx-auto">
              <div className="text-[11px] text-gold-300 font-bengali font-semibold mb-3 flex items-center justify-center gap-1.5">
                <Sparkles size={13} className="text-gold-400" />
                <span>মহাষষ্ঠীর পুণ্য লগ্নের অপেক্ষা</span>
                <Sparkles size={13} className="text-gold-400" />
              </div>

              {/* Countdown Digits Grid */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {/* Days */}
                <div className="p-2 sm:p-3 rounded-xl bg-[#180C0C]/80 border border-gold-500/30 flex flex-col items-center justify-center min-w-[64px] sm:min-w-[84px]">
                  <span className="text-2xl sm:text-4xl font-bold font-bengali text-gold-300 drop-shadow-sm">
                    {formatDigit(timeRemaining.days)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#FFF8EC]/80 font-bengali mt-0.5 font-medium">
                    {lang === 'bn' ? 'দিন বাকি' : 'Days'}
                  </span>
                </div>

                {/* Hours */}
                <div className="p-2 sm:p-3 rounded-xl bg-[#180C0C]/80 border border-gold-500/30 flex flex-col items-center justify-center min-w-[64px] sm:min-w-[84px]">
                  <span className="text-2xl sm:text-4xl font-bold font-bengali text-gold-300 drop-shadow-sm">
                    {formatDigit(timeRemaining.hours)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#FFF8EC]/80 font-bengali mt-0.5 font-medium">
                    {lang === 'bn' ? 'ঘণ্টা' : 'Hours'}
                  </span>
                </div>

                {/* Minutes */}
                <div className="p-2 sm:p-3 rounded-xl bg-[#180C0C]/80 border border-gold-500/30 flex flex-col items-center justify-center min-w-[64px] sm:min-w-[84px]">
                  <span className="text-2xl sm:text-4xl font-bold font-bengali text-gold-300 drop-shadow-sm">
                    {formatDigit(timeRemaining.minutes)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#FFF8EC]/80 font-bengali mt-0.5 font-medium">
                    {lang === 'bn' ? 'মিনিট' : 'Mins'}
                  </span>
                </div>

                {/* Seconds */}
                <div className="p-2 sm:p-3 rounded-xl bg-[#180C0C]/80 border border-gold-500/30 flex flex-col items-center justify-center min-w-[64px] sm:min-w-[84px]">
                  <span className="text-2xl sm:text-4xl font-bold font-bengali text-sindoor-400 drop-shadow-sm animate-pulse">
                    {formatDigit(timeRemaining.seconds)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#FFF8EC]/80 font-bengali mt-0.5 font-medium">
                    {lang === 'bn' ? 'সেকেন্ড' : 'Secs'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* English Tagline */}
          <p className="text-[10px] sm:text-xs text-gold-400/90 max-w-md mx-auto uppercase tracking-[0.25em] font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            CELEBRATE. CONNECT. REMEMBER. STAY ROOTED.
          </p>

        </div>

        {/* AUTHENTIC BENGALI KASHFUL & CLAY DIYA HORIZON */}
        <KashfulHorizon />
      </section>


      {/* 4. SIX CORE FESTIVE FEATURES */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <AlponaDivider />

        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold font-cinzel text-[#FFF8EC]">
            {t.features.title}
          </h2>
          <p className="text-sm text-gold-400/90 font-bengali">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Puja Date (Featured) */}
          <div className="puja-card p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-2 border-sindoor-500/70 bg-gradient-to-b from-sindoor-950/70 via-[#2A0B0B]/60 to-[#120909]/80 shadow-2xl shadow-sindoor-950/60 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-sindoor-600/90 border border-gold-400/50 text-[10px] font-bold text-gold-200 tracking-wider flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
              <span className="font-bengali">{lang === 'bn' ? 'জনপ্রিয় ফিচার' : 'Featured'}</span>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sindoor-900/80 border border-sindoor-500/60 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-sindoor-950/50">
                ❤️
              </div>
              <h3 className="text-xl font-bold text-[#FFF8EC] font-cinzel">
                {t.features.pujaDate.title}
              </h3>
              <p className="text-xs text-cream-200 leading-relaxed font-bengali">
                {t.features.pujaDate.desc}
              </p>
            </div>
            <Link to="/puja-date">
              <FestiveButton variant="primary" size="sm" className="w-full gap-2 shadow-md shadow-sindoor-950/50">
                <Heart size={14} className="fill-current" />
                <span className="font-bengali">{t.features.pujaDate.cta}</span>
                <ArrowRight size={14} />
              </FestiveButton>
            </Link>
          </div>

          {/* Card 2: Lost & Found */}
          <div className="puja-card p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-gold-500/20 bg-gradient-to-b from-[#2A0B0B]/50 to-[#140808]/70">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#4A1010]/60 border border-gold-500/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🧒
              </div>
              <h3 className="text-xl font-bold text-[#FFF8EC] font-cinzel">
                {t.features.lostFound.title}
              </h3>
              <p className="text-xs text-cream-300 leading-relaxed font-bengali">
                {t.features.lostFound.desc}
              </p>
            </div>
            <Link to="/lost-found">
              <FestiveButton variant="secondary" size="sm" className="w-full gap-2">
                <span className="font-bengali">{t.features.lostFound.cta}</span>
                <ArrowRight size={14} />
              </FestiveButton>
            </Link>
          </div>


          {/* Card 4: Memory Capsule */}
          <div className="puja-card p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-gold-500/20 bg-gradient-to-b from-[#2A0B0B]/50 to-[#140808]/70">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#14203D]/60 border border-gold-500/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                📦
              </div>
              <h3 className="text-xl font-bold text-[#FFF8EC] font-cinzel">
                {t.features.memories.title}
              </h3>
              <p className="text-xs text-cream-300 leading-relaxed font-bengali">
                {t.features.memories.desc}
              </p>
            </div>
            <Link to="/memories">
              <FestiveButton variant="secondary" size="sm" className="w-full gap-2">
                <span className="font-bengali">{t.features.memories.cta}</span>
                <ArrowRight size={14} />
              </FestiveButton>
            </Link>
          </div>

          {/* Card 5: Emergency */}
          <div className="puja-card p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-red-800/40 bg-gradient-to-b from-[#330F14]/60 to-[#18080A]/80 hover:border-red-600/50">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-600/40 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🚨
              </div>
              <h3 className="text-xl font-bold text-red-400 font-cinzel">
                {t.features.emergency.title}
              </h3>
              <p className="text-xs text-cream-300 leading-relaxed font-bengali">
                {t.features.emergency.desc}
              </p>
            </div>
            <Link to="/emergency">
              <FestiveButton variant="danger" size="sm" className="w-full gap-2">
                <span className="font-bengali">{t.features.emergency.cta}</span>
                <ArrowRight size={14} />
              </FestiveButton>
            </Link>
          </div>

          {/* Card 6: Puja Songs */}
          <div className="puja-card p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-gold-500/30 bg-gradient-to-b from-[#3D2808]/50 to-[#180F04]/80 hover:border-gold-400/60">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-gold-500/40 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🎵
              </div>
              <h3 className="text-xl font-bold text-gold-300 font-cinzel">
                {t.features.songs.title}
              </h3>
              <p className="text-xs text-cream-300 leading-relaxed font-bengali">
                {t.features.songs.desc}
              </p>
            </div>
            <Link to="/songs">
              <FestiveButton variant="gold" size="sm" className="w-full gap-2">
                <span className="font-bengali">{t.features.songs.cta}</span>
                <ArrowRight size={14} />
              </FestiveButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PUJA ATMOSPHERE SECTION: "শরৎ এসেছে..." */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <AlponaDivider />

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-bold font-bengali text-[#FFF8EC] gold-gradient-text">
            শরৎ এসেছে...
          </h2>
          <p className="text-sm sm:text-base text-cream-200 font-bengali leading-relaxed">
            কাশফুলের দোলা, শিউলির গন্ধ,<br />
            আর ঢাকের প্রথম আওয়াজে<br />
            বাংলা অপেক্ষায় মায়ের আগমনের।
          </p>
        </div>

        {/* Three Atmospheric Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: কাশফুল */}
          <div className="puja-card p-6 sm:p-7 rounded-3xl space-y-4 border border-gold-500/30 bg-gradient-to-b from-[#2A0B0B]/70 to-[#180C0C]/80 group hover:border-gold-400/60 transition-all shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#4A1010]/60 border border-gold-500/40 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md">
              🌾
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-bengali text-gold-300">
                কাশফুল
              </h3>
              <p className="text-xs text-sindoor-300 font-bengali font-semibold">
                "শরতের প্রথম বার্তা"
              </p>
              <p className="text-xs text-cream-200 font-bengali leading-relaxed pt-1">
                নীল আকাশে সাদা মেঘের ভেলা আর নদীর পাড়ে শুভ্র কাশফুল জানান দেয়—উৎসবে মেতে ওঠার শুভ লগ্ন সমাগত।
              </p>
            </div>
          </div>

          {/* Card 2: শিউলি */}
          <div className="puja-card p-6 sm:p-7 rounded-3xl space-y-4 border border-gold-500/30 bg-gradient-to-b from-[#2A0B0B]/70 to-[#180C0C]/80 group hover:border-gold-400/60 transition-all shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#4A1010]/60 border border-gold-500/40 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md">
              🌼
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-bengali text-gold-300">
                শিউলি
              </h3>
              <p className="text-xs text-sindoor-300 font-bengali font-semibold">
                "ভোরের মিষ্টি গন্ধ"
              </p>
              <p className="text-xs text-cream-200 font-bengali leading-relaxed pt-1">
                আশ্বিনের শিশিরভেজা ঘাসে ঝরে থাকা শিউলি ফুলের ভেজা ঘ্রাণে মনে করিয়ে দেয় শৈশবের দুর্গোৎসবের দিনগুলো।
              </p>
            </div>
          </div>

          {/* Card 3: ঢাক */}
          <div className="puja-card p-6 sm:p-7 rounded-3xl space-y-4 border border-gold-500/30 bg-gradient-to-b from-[#2A0B0B]/70 to-[#180C0C]/80 group hover:border-gold-400/60 transition-all shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#4A1010]/60 border border-gold-500/40 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md">
              🥁
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-bengali text-gold-300">
                ঢাক
              </h3>
              <p className="text-xs text-sindoor-300 font-bengali font-semibold">
                "আগমনের প্রথম সুর"
              </p>
              <p className="text-xs text-cream-200 font-bengali leading-relaxed pt-1">
                কাঁসি আর ঢাকের সেই চিরচেনা প্রথম বোলে বাঙালির হৃদয় বলে ওঠে—বছর ঘুরে মা আবার ঘরে ফিরেছেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PUJA DAYS SACRED JOURNEY (Section 14: মহালয়া to দশমী) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A0B0B]/80 border border-gold-500/30 text-gold-400 text-xs font-semibold">
            <span>🪔</span>
            <span className="font-bengali">উৎসবের দিনপঞ্জিকা</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-bengali text-[#FFF8EC] gold-gradient-text">
            দেবীপক্ষের ছয়টি পবিত্র দিন
          </h2>
          <p className="text-xs sm:text-sm text-cream-300 font-bengali">
            প্রতিটি দিনের আচার, আবেগ ও আধ্যাত্মিক ঐতিহ্য
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {pujaDaysList.map((item, idx) => (
            <div
              key={idx}
              className="puja-card p-4 rounded-2xl flex flex-col justify-between space-y-3 border border-gold-500/25 bg-gradient-to-b from-[#2A0B0B]/60 to-[#140808]/80 hover:border-gold-400/60 transition-all text-center group"
            >
              <div className="space-y-2">
                <span className="text-2xl group-hover:scale-125 transition-transform inline-block">
                  {item.symbol}
                </span>
                <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-sindoor-600/30 text-gold-300 border border-gold-500/20 font-bengali">
                  {item.tag}
                </span>
                <h3 className="text-base font-bold font-bengali text-[#FFF8EC]">
                  {item.day}
                </h3>
                <p className="text-[10px] text-gold-400 font-bengali font-semibold">
                  {item.ritual}
                </p>
              </div>
              <p className="text-[11px] text-cream-300/90 font-bengali leading-relaxed pt-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}

      {/* 5. DEVOTIONAL CLOSING SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 pb-6">
        <AlponaDivider />
        <h3 className="text-2xl font-bold font-bengali text-gold-400">
          "নিরাপদ পুজো, আনন্দময় উৎসব"
        </h3>
        <p className="text-xs sm:text-sm text-cream-300 leading-relaxed max-w-2xl mx-auto font-bengali">
          আগমনী শুধুমাত্র একটি সামাজিক প্ল্যাটফর্ম নয়—এটি বাঙালির সবচেয়ে প্রিয় উৎসবের একটি বিশ্বস্ত ডিজিটাল সঙ্গী।
          ভিড়ের মাঝে প্রিয়জনকে সুরক্ষিত রাখা, অষ্টমীর অঞ্জলি কিংবা ঢাকের তালে হারিয়ে যাওয়া—সবকিছুর জন্যই আগমনী আপনার পাশে।
        </p>
      </section>
    </div>
  );
};

export default HomePage;
