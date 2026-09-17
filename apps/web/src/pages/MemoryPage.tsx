import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookHeart,
  Plus,
  Share2,
  Lock,
  Globe,
  MapPin,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Image as ImageIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import FestiveButton from '../components/common/FestiveButton';

interface Memory {
  id: string;
  title: string;
  pujaDay: string;
  mediaUrls: string[];
  note?: string;
  mood?: string;
  locationName?: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
}

export const MemoryPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { token, isAuthenticated } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states
  const [title, setTitle] = useState('');
  const [pujaDay, setPujaDay] = useState('Ashtami');
  const [photoUrl, setPhotoUrl] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('Joyful');
  const [locationName, setLocationName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  // Toast / Feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const days = ['Mahalaya', 'Shashti', 'Saptami', 'Ashtami', 'Nabami', 'Dashami'];
  const filterDays = ['All', ...days];
  const moods = ['Festive', 'Emotional', 'Joyful', 'Nostalgic', 'Excited', 'Serene'];

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchMemories = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/v1/memories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories);
      }
    } catch (err) {
      console.error('Fetch memories error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [token]);

  // Hide global Navbar, Footer, and BottomNav when Add Memory modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('hide-nav-footer');
    } else {
      document.body.classList.remove('hide-nav-footer');
    }
    return () => {
      document.body.classList.remove('hide-nav-footer');
    };
  }, [isModalOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ছবির সাইজ ৫MB এর কম হতে হবে।' : 'Image size must be less than 5MB.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.fileUrl) {
        setPhotoUrl(data.fileUrl);
        showToast(lang === 'bn' ? 'ছবি সফলভাবে আপলোড হয়েছে! 📸' : 'Photo uploaded successfully! 📸', 'success');
      } else {
        showToast(data.message || (lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload photo.'), 'error');
      }
    } catch (err) {
      console.error('Upload error', err);
      showToast(lang === 'bn' ? 'আপলোডে সমস্যা হয়েছে।' : 'Upload error occurred.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast(lang === 'bn' ? 'স্মৃতি সংরক্ষণ করতে লগইন করুন।' : 'Please log in to save memories.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          pujaDay,
          mediaUrls: photoUrl ? [photoUrl] : [],
          note,
          mood,
          locationName,
          isPublic,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setTitle('');
        setNote('');
        setPhotoUrl('');
        setLocationName('');
        setIsPublic(false);
        showToast(lang === 'bn' ? '🌸 স্মৃতিমঞ্জুষায় সংরক্ষিত হয়েছে!' : '🌸 Saved into your memory capsule!', 'success');
        fetchMemories();
      } else {
        showToast(data.message || 'Failed to save memory', 'error');
      }
    } catch (err) {
      showToast('Failed to save memory', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleShare = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/memories/${id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (data.isPublic && data.shareUrl) {
          const fullUrl = `${window.location.origin}${data.shareUrl}`;
          navigator.clipboard.writeText(fullUrl);
          showToast(
            lang === 'bn'
              ? `🔗 শেয়ার লিঙ্ক কপি হয়েছে!\n${fullUrl}`
              : `🔗 Public link copied to clipboard!\n${fullUrl}`,
            'success'
          );
        } else {
          showToast(
            lang === 'bn' ? '🔒 স্মৃতিটি এখন সম্পূর্ণ ব্যক্তিগত।' : '🔒 Memory is now private.',
            'info'
          );
        }
        fetchMemories();
      }
    } catch (err) {
      console.error('Toggle share error', err);
      showToast('Error toggling share status', 'error');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm(lang === 'bn' ? 'এই স্মৃতিটি মুছে ফেলতে চান?' : 'Delete this memory permanently?')) return;
    try {
      await fetch(`/api/v1/memories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(lang === 'bn' ? 'স্মৃতি মুছে ফেলা হয়েছে।' : 'Memory deleted.', 'info');
      fetchMemories();
    } catch (err) {
      console.error('Delete error', err);
      showToast('Failed to delete memory', 'error');
    }
  };

  const filteredMemories =
    selectedDay === 'All'
      ? memories
      : memories.filter((m) => m.pujaDay.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 text-xs max-w-md ${
              toastMessage.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : toastMessage.type === 'info'
                ? 'bg-night-850/95 border-gold-500/40 text-cream-200'
                : 'bg-night-850/95 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Sparkles size={16} className="text-gold-400 shrink-0" />
            ) : (
              <Check size={16} className="text-emerald-400 shrink-0" />
            )}
            <span className="font-bengali leading-relaxed">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto p-1 text-cream-400 hover:text-cream-100"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-bengali text-cream-100 flex items-center gap-2">
            <span>📦</span>
            <span>{t.memory.heading}</span>
          </h1>
          <p className="text-xs text-gold-400 font-bengali mt-1">
            {t.memory.subheading} (100% Free & Private)
          </p>
        </div>

        {isAuthenticated ? (
          <FestiveButton variant="gold" onClick={() => setIsModalOpen(true)} className="gap-1.5">
            <Plus size={16} />
            <span>{t.memory.addBtn}</span>
          </FestiveButton>
        ) : (
          <Link to="/login">
            <FestiveButton variant="gold" className="gap-1.5">
              <span>{lang === 'bn' ? 'লগইন করে যোগ করুন' : 'Log in to Add'}</span>
            </FestiveButton>
          </Link>
        )}
      </div>

      {/* Unauthenticated User Banner */}
      {!isAuthenticated && (
        <div className="p-5 rounded-3xl bg-night-850/90 border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sindoor-600/20 border border-gold-500/40 flex items-center justify-center text-xl shrink-0">
              🪔
            </div>
            <div>
              <h3 className="text-sm font-bold text-cream-100 font-bengali">
                {lang === 'bn' ? 'লগইন করে আপনার স্মৃতিমঞ্জুষা সাজান' : 'Log in to unlock your Puja Memory Capsule'}
              </h3>
              <p className="text-xs text-cream-400 font-bengali mt-0.5">
                {lang === 'bn'
                  ? 'মহালয়া থেকে দশমী—পুজোর প্রতিটি মুহূর্তের ছবি, আবেগ ও আড্ডা লিখে রাখুন সম্পূর্ণ ব্যক্তিগত ডায়েরিতে।'
                  : 'Preserve anjali photos, pandal stories, and festive moods in your encrypted digital diary.'}
              </p>
            </div>
          </div>
          <Link to="/login" className="shrink-0 w-full sm:w-auto">
            <FestiveButton variant="gold" size="sm" className="w-full">
              {lang === 'bn' ? 'লগইন করুন' : 'Log In'}
            </FestiveButton>
          </Link>
        </div>
      )}

      {/* Interactive Timeline Days Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterDays.map((d) => {
          const isActive = selectedDay.toLowerCase() === d.toLowerCase();
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gold-500/25 border border-gold-400 text-gold-300 shadow-[0_0_12px_rgba(234,179,8,0.25)] font-bold'
                  : 'bg-night-850/80 border border-gold-500/20 text-cream-300 hover:border-gold-500/50 hover:text-cream-100'
              }`}
            >
              {d === 'All' ? (lang === 'bn' ? 'সব দিন' : 'All Days') : d}
            </button>
          );
        })}
      </div>

      {/* Memories Feed */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="text-4xl animate-bounce inline-block">🪔</span>
          <p className="text-xs font-bengali text-gold-400 mt-2">লোড হচ্ছে...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="puja-card p-12 text-center rounded-3xl space-y-4 border border-gold-500/30">
          <span className="text-5xl">📸</span>
          <h3 className="text-base font-bold text-cream-100 font-bengali">
            {selectedDay !== 'All'
              ? `${selectedDay}-র কোনো স্মৃতি এখনো যোগ করা হয়নি`
              : t.memory.emptyNotice}
          </h3>
          <p className="text-xs text-cream-400 max-w-sm mx-auto font-bengali">
            {lang === 'bn'
              ? 'আপনার পুজোর অঞ্জলি, ফুচকা আড্ডা কিংবা আলোকসজ্জার মুহূর্তগুলো ক্যাপসুলে বন্দি রাখুন।'
              : 'Add your festive pandal memories, bhog moments, and friends gatherings into your capsule.'}
          </p>
          {isAuthenticated && (
            <div className="pt-2">
              <FestiveButton variant="gold" size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
                <Plus size={15} />
                <span>{t.memory.addBtn}</span>
              </FestiveButton>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              className="puja-card rounded-3xl overflow-hidden flex flex-col justify-between border border-gold-500/30 hover:border-gold-500/50 transition-all shadow-lg"
            >
              {m.mediaUrls.length > 0 && (
                <div className="relative h-60 w-full bg-night-850 overflow-hidden">
                  <img src={m.mediaUrls[0]} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-night-950/85 backdrop-blur-md border border-gold-500/40 text-gold-300 text-xs font-bold">
                    {m.pujaDay}
                  </div>
                </div>
              )}

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-cream-100 font-cinzel leading-snug">
                      {m.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-lg bg-sindoor-950 text-sindoor-300 border border-sindoor-600/30 text-[10px] font-semibold shrink-0">
                      {m.mood || 'Joyful'}
                    </span>
                  </div>

                  {m.note && (
                    <p className="text-xs text-cream-300 font-bengali leading-relaxed line-clamp-4">
                      {m.note}
                    </p>
                  )}

                  {m.locationName && (
                    <p className="text-[11px] text-gold-400 flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{m.locationName}</span>
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-gold-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleShare(m.id)}
                      className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 transition-colors font-bengali"
                      title={m.isPublic ? 'Click to make private' : 'Click to generate public share link'}
                    >
                      {m.isPublic ? <Globe size={14} className="text-emerald-400" /> : <Lock size={14} />}
                      <span className={m.isPublic ? 'text-emerald-400 font-semibold' : ''}>
                        {m.isPublic
                          ? lang === 'bn'
                            ? 'পাবলিক লিঙ্ক সক্রিয়'
                            : 'Public Link Active'
                          : lang === 'bn'
                          ? 'ব্যক্তিগত'
                          : 'Private'}
                      </span>
                    </button>

                    {m.isPublic && m.shareToken && (
                      <Link
                        to={`/memory/shared/${m.shareToken}`}
                        target="_blank"
                        className="text-[11px] text-gold-300 hover:underline flex items-center gap-1 bg-gold-500/15 px-2 py-0.5 rounded-lg"
                      >
                        <Share2 size={11} />
                        <span>{lang === 'bn' ? 'দেখুন' : 'View'}</span>
                      </Link>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="p-1.5 text-cream-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/40"
                    title="Delete memory"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {isModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div className="bg-night-900 border border-gold-500/40 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gold-500/20 px-6 py-4 flex-shrink-0 bg-night-900">
              <h3 className="text-xl font-bold text-cream-100 font-bengali flex items-center gap-2">
                <span>🌸</span>
                <span>{lang === 'bn' ? 'নতুন পুজো স্মৃতি যোগ করুন' : 'Add New Puja Memory'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-cream-400 hover:text-cream-100 rounded-lg hover:bg-night-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="flex flex-col min-h-0 flex-1">
              <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
                <div>
                  <label className="text-cream-200 block mb-1.5 font-medium font-bengali text-sm">
                    {lang === 'bn' ? 'স্মৃতির শিরোনাম *' : 'Memory Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ashtami Anjali at Ekdalia Evergreen"
                    className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-sm placeholder-cream-400/50 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-cream-200 block mb-1.5 font-medium font-bengali text-sm">
                      {lang === 'bn' ? 'পুজোর দিন' : 'Puja Day'}
                    </label>
                    <select
                      value={pujaDay}
                      onChange={(e) => setPujaDay(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-sm focus:outline-none focus:border-gold-400"
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-cream-200 block mb-1.5 font-medium font-bengali text-sm">
                      {lang === 'bn' ? 'অনুভূতি / Mood' : 'Mood'}
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-sm focus:outline-none focus:border-gold-400"
                    >
                      {moods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-cream-200 block mb-1.5 font-medium font-bengali text-sm">
                    {lang === 'bn' ? 'স্থান / Location' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Maddox Square, South Kolkata"
                    className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-sm placeholder-cream-400/50 focus:outline-none focus:border-gold-400"
                  />
                </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-cream-300 font-medium font-bengali">
                    {lang === 'bn' ? 'স্মৃতির ছবি (ঐচ্ছিক)' : 'Memory Photo (Optional)'}
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`px-2 py-0.5 rounded-md ${
                        uploadMethod === 'file'
                          ? 'bg-gold-500/25 text-gold-300 font-semibold'
                          : 'text-cream-400 hover:text-cream-200'
                      }`}
                    >
                      {lang === 'bn' ? 'আপলোড' : 'Upload'}
                    </button>
                    <span className="text-cream-500">|</span>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`px-2 py-0.5 rounded-md ${
                        uploadMethod === 'url'
                          ? 'bg-gold-500/25 text-gold-300 font-semibold'
                          : 'text-cream-400 hover:text-cream-200'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {uploadMethod === 'file' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="memory-file-input"
                    />

                    {photoUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gold-500/30 bg-night-950 h-36 flex items-center justify-center">
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-cream-200 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="memory-file-input"
                        className="flex flex-col items-center justify-center p-4 border border-dashed border-gold-500/40 rounded-2xl bg-night-850/60 hover:bg-night-850 hover:border-gold-400 transition-all cursor-pointer text-center"
                      >
                        {isUploading ? (
                          <div className="space-y-1.5 py-2">
                            <span className="text-2xl animate-spin inline-block">🌸</span>
                            <p className="text-gold-300 font-bengali">আপলোড হচ্ছে...</p>
                          </div>
                        ) : (
                          <div className="space-y-1 py-1">
                            <Upload size={20} className="mx-auto text-gold-400" />
                            <p className="text-cream-200 font-bengali font-medium">
                              {lang === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Click to select photo from device'}
                            </p>
                            <p className="text-[10px] text-cream-400">JPEG, PNG, WebP (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 placeholder-cream-400/50 focus:outline-none focus:border-gold-400"
                  />
                )}
              </div>

              <div>
                <label className="text-cream-200 block mb-1.5 font-medium font-bengali text-sm">
                  {lang === 'bn' ? 'অনুভূতির কথা ও গল্প' : 'Your Story & Thoughts'}
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What made this moment unforgettable..."
                  className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-sm placeholder-cream-400/50 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="makePublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="accent-gold-500 rounded w-4 h-4"
                />
                <label htmlFor="makePublic" className="text-cream-300 cursor-pointer text-xs sm:text-sm font-bengali">
                  {lang === 'bn'
                    ? 'শেয়ারযোগ্য পাবলিক লিঙ্ক তৈরি করুন (ডিফল্টভাবে ব্যক্তিগত)'
                    : 'Generate unguessable public share link (Private by default)'}
                </label>
              </div>

              </div>

              {/* Sticky Action Footer */}
              <div className="flex items-center gap-3 p-4 px-6 border-t border-gold-500/20 bg-night-900/95 backdrop-blur-md flex-shrink-0">
                <FestiveButton
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </FestiveButton>
                <FestiveButton
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 shadow-lg shadow-gold-500/20"
                >
                  {isSubmitting
                    ? lang === 'bn'
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : lang === 'bn'
                    ? 'ক্যাপসুলে রাখুন 🌸'
                    : 'Save into Capsule 🌸'}
                </FestiveButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryPage;
