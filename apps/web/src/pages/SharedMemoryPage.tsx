import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Share2, Sparkles, BookHeart, Check, ArrowLeft } from 'lucide-react';
import FestiveButton from '../components/common/FestiveButton';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';

interface SharedMemory {
  id: string;
  title: string;
  pujaDay: string;
  mediaUrls: string[];
  note?: string;
  mood?: string;
  locationName?: string;
  createdAt: string;
  creatorName: string;
}

export const SharedMemoryPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { lang } = useLanguage();
  const [memory, setMemory] = useState<SharedMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedMemory = async () => {
      if (!token) {
        setError('Invalid share link.');
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiFetch(`/api/v1/memories/shared/${token}`);
        const data = await res.json();
        if (data.success && data.memory) {
          setMemory(data.memory);
        } else {
          setError(data.message || 'Memory not found or is no longer public.');
        }
      } catch (err) {
        console.error('Fetch shared memory error:', err);
        setError('Failed to load shared memory.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedMemory();
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <span className="text-5xl animate-bounce inline-block">🪔</span>
        <p className="text-sm font-bengali text-gold-300">
          {lang === 'bn' ? 'স্মৃতি লোড হচ্ছে...' : 'Loading sacred memory...'}
        </p>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="puja-card p-10 rounded-3xl space-y-4 border border-gold-500/30">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold font-bengali text-cream-100">
            {lang === 'bn'
              ? 'এই পুজোর স্মৃতি লিঙ্কটি মেয়াদোত্তীর্ণ, ব্যক্তিগত অথবা অস্তিত্বহীন।'
              : 'This Puja memory link is expired, private, or does not exist.'}
          </h2>
          <p className="text-xs text-cream-400 font-bengali">
            {lang === 'bn'
              ? 'ব্যবহারকারী এই স্মৃতিটি ব্যক্তিগত করে রেখেছেন অথবা লিঙ্কটি আর সক্রিয় নেই।'
              : 'The creator may have switched this memory back to private mode.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/">
              <FestiveButton variant="gold" className="gap-2">
                <ArrowLeft size={16} />
                <span>{lang === 'bn' ? 'হোম পেজে ফিরুন' : 'Go to Home'}</span>
              </FestiveButton>
            </Link>
            <Link to="/memories">
              <FestiveButton variant="ghost" className="gap-2">
                <BookHeart size={16} />
                <span>{lang === 'bn' ? 'আমার স্মৃতিমঞ্জুষা' : 'My Capsule'}</span>
              </FestiveButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between text-xs">
        <Link
          to="/memories"
          className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 transition-colors font-bengali"
        >
          <ArrowLeft size={14} />
          <span>{lang === 'bn' ? 'সব স্মৃতি দেখুন' : 'View Memory Capsule'}</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-night-850 border border-gold-500/30 text-gold-300 hover:border-gold-400 transition-all font-bengali"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
          <span>
            {copied
              ? lang === 'bn'
                ? 'লিঙ্ক কপি হয়েছে!'
                : 'Link Copied!'
              : lang === 'bn'
              ? 'শেয়ার করুন'
              : 'Share Link'}
          </span>
        </button>
      </div>

      {/* Memory Card */}
      <div className="puja-card rounded-3xl overflow-hidden border border-gold-500/40 shadow-2xl space-y-0">
        {/* Creator Header Bar */}
        <div className="px-6 py-4 bg-night-850/90 border-b border-gold-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sindoor-600/30 border border-gold-500/40 flex items-center justify-center text-lg">
              🌸
            </div>
            <div>
              <p className="text-xs text-cream-400 font-bengali">
                {lang === 'bn' ? 'স্মৃতি প্রকাশ করেছেন' : 'Puja Memory by'}
              </p>
              <h4 className="text-sm font-bold text-cream-100 font-cinzel">
                {memory.creatorName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-bold font-bengali">
              {memory.pujaDay}
            </span>
            {memory.mood && (
              <span className="px-2.5 py-1 rounded-lg bg-sindoor-950 text-sindoor-300 border border-sindoor-600/40 text-[11px] font-semibold">
                {memory.mood}
              </span>
            )}
          </div>
        </div>

        {/* Media Photo */}
        {memory.mediaUrls && memory.mediaUrls.length > 0 && (
          <div className="relative w-full max-h-[460px] bg-night-950 overflow-hidden flex items-center justify-center">
            <img
              src={memory.mediaUrls[0]}
              alt={memory.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-cream-100 tracking-wide">
              {memory.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gold-400/90">
              {memory.locationName && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gold-400" />
                  <span>{memory.locationName}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gold-400" />
                <span>{formatDate(memory.createdAt)}</span>
              </span>
            </div>
          </div>

          {/* Story Note */}
          {memory.note && (
            <div className="p-5 rounded-2xl bg-night-850/60 border border-gold-500/20 relative">
              <span className="absolute top-2 left-3 text-gold-500/30 text-3xl font-serif">“</span>
              <p className="text-sm text-cream-200 font-bengali leading-relaxed whitespace-pre-wrap pl-4">
                {memory.note}
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="pt-4 border-t border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-cream-400">
              <Sparkles size={14} className="text-gold-400" />
              <span>
                {lang === 'bn'
                  ? 'আগমনী স্মৃতিমঞ্জুষা — শারদোৎসবের প্রতিটি অনুভূতি অক্ষয় হোক।'
                  : 'Agomoni Memory Capsule — Preserving the festival of moments.'}
              </span>
            </div>

            <Link to="/memories">
              <FestiveButton variant="gold" size="sm" className="gap-2">
                <BookHeart size={15} />
                <span>{lang === 'bn' ? 'নিজের স্মৃতি যোগ করুন' : 'Create Your Capsule'}</span>
              </FestiveButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedMemoryPage;
