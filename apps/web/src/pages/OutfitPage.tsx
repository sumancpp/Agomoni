import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Sparkles, Lock, Palette, CheckCircle2, History, UploadCloud, Camera, X, Image as ImageIcon, UserCheck, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import FestiveButton from '../components/common/FestiveButton';
import { completePayment } from '../lib/payments';
import { apiFetch, apiUrl } from '../lib/api';

export const OutfitPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { token, isAuthenticated } = useAuth();

  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [style, setStyle] = useState('Bengali Traditional');
  const [pujaDay, setPujaDay] = useState('Ashtami');
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [aiMode, setAiMode] = useState<'auto' | 'vton' | 'photomaker' | 'instantid' | 'faceswap'>('auto');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [generationsLeft, setGenerationsLeft] = useState<number>(5);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const resolveOutfitUrl = (url: string | null | undefined, itemGender: string): string => {
    if (!url) {
      return itemGender === 'MALE' ? '/outfits/male-traditional.jpg' : '/outfits/female-traditional.jpg';
    }
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/outfits/')) {
      return url;
    }
    if (url.startsWith('/uploads/outfits/')) {
      return url.replace('/uploads/outfits/', '/outfits/');
    }
    if (url.startsWith('/uploads/')) {
      return apiUrl(url);
    }
    return apiUrl(url);
  };

  const generationSteps = [
    {
      icon: '🪔',
      titleBn: 'মুখাবয়ব ও স্কিন টোন বিশ্লেষণ হচ্ছে...',
      titleEn: 'Analyzing face landmarks & skin tone...',
      subBn: 'হাই-রেজোলিউশন ফেস ম্যাপিং সক্রিয়',
      subEn: 'Facial keypoint geometry mapped',
    },
    {
      icon: '👗',
      titleBn: `ঐতিহ্যবাহী ${style} পোশাক বিন্যাস চলছে...`,
      titleEn: `Synthesizing authentic ${style} attire...`,
      subBn: 'IDM-VTON ও PhotoMaker নিউরাল ড্রেসিং সক্রিয়',
      subEn: 'Neural textile draping & texture synthesis',
    },
    {
      icon: '✨',
      titleBn: 'ফেস রিস্টোরেশন ও স্কিন টেক্সচার রিটাচিং...',
      titleEn: 'Restoring photorealistic skin & face details...',
      subBn: 'CodeFormer / GFPGAN এনহ্যান্সার সক্রিয়',
      subEn: 'CodeFormer neural face enhancement active',
    },
    {
      icon: '🪘',
      titleBn: 'কলকাতা দুর্গাপূজা মণ্ডপের আলোকসজ্জা যুক্ত হচ্ছে...',
      titleEn: 'Illuminating with Kolkata Durga Puja pandal lights...',
      subBn: 'চূড়ান্ত ফিনিশিং সম্পন্ন হচ্ছে...',
      subEn: 'Applying festival colors & final touches...',
    },
  ];

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setGenerationStep(0);
      timer = setInterval(() => {
        setGenerationStep((prev) => (prev < 3 ? prev + 1 : 0));
      }, 3000);
    } else {
      setGenerationStep(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating]);

  const styles = [
    'Bengali Traditional',
    'Ashtami Special',
    'Traditional',
    'Modern',
    'Elegant',
    'Night Puja',
    'Casual Puja',
    'Family Puja',
  ];

  const days = ['Shashti', 'Saptami', 'Ashtami', 'Nabami', 'Dashami'];

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/v1/outfit/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setGenerationsLeft(data.generationsLeft);
        setIsUnlimited(data.isUnlimited);
      }
    } catch (err) {
      console.error('Outfit status fetch error', err);
    }
  };

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/v1/outfit/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.generations);
      }
    } catch (err) {
      console.error('Fetch history error', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, [token]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'bn' ? 'ছবির সাইজ ৫ মেগাবাইটের কম হতে হবে।' : 'File size must be under 5MB.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // If authenticated, upload to server
    if (token) {
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
          setInputImageUrl(data.fileUrl);
        } else {
          // Fallback to base64 data URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setInputImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('Upload error, using local data URL', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setInputImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingPhoto(false);
      }
    } else {
      // Unauthenticated, load as local base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setInputImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to use the AI Outfit Generator.');
      return;
    }

    setIsGenerating(true);
    try {
      const sourceImage = previewUrl || inputImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

      // Request generation from API
      const res = await apiFetch('/api/v1/outfit/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inputImageUrl: inputImageUrl || sourceImage,
          gender,
          style,
          pujaDay,
          aiMode,
        }),
      });

      const data = await res.json();
      if (res.status === 402 || data.requiresPayment) {
        setPaymentModalOpen(true);
      } else if (data.success) {
        setResult(data);
        setGenerationsLeft(data.generationsLeft);
        fetchHistory();
      } else {
        alert(data.message || 'Generation error');
      }
    } catch (err) {
      alert('AI Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlockUnlimited = async () => {
    try {
      const orderRes = await apiFetch('/api/v1/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 'OUTFIT_UNLIMITED' }),
      });
      const orderData = await orderRes.json();

      if (orderData.success) {
        if (await completePayment(token!, orderData)) {
          setPaymentModalOpen(false);
          setIsUnlimited(true);
          alert('🎉 Unlimited AI Outfit Generation Unlocked!');
          fetchStatus();
        }
      }
    } catch (err) {
      alert('Payment processing error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-bengali text-cream-100 flex items-center gap-2">
            <span>👗</span>
            <span>{t.outfit.heading}</span>
          </h1>
          <p className="text-xs text-gold-400 font-bengali mt-1">
            {t.outfit.subheading}
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-night-900 border border-gold-500/40 text-xs font-semibold flex items-center gap-2">
          <Sparkles size={14} className="text-gold-400" />
          {isUnlimited ? (
            <span className="text-gold-400 font-bold">✨ Unlimited Access Active</span>
          ) : (
            <span className="text-cream-200">
              <strong className="text-gold-400">{generationsLeft}</strong> {t.outfit.freeLeft}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 puja-card p-6 rounded-3xl space-y-5">
          <h3 className="text-base font-bold text-cream-100 font-cinzel">
            Customize Festive Style
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Gender Selection */}
            <div>
              <label className="text-cream-300 block mb-1.5 font-medium">Gender / লিঙ্গ</label>
              <div className="grid grid-cols-3 gap-2">
                {(['FEMALE', 'MALE', 'OTHER'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      gender === g
                        ? 'bg-sindoor-900/60 border-sindoor-500 text-gold-300 font-semibold'
                        : 'bg-night-850 border-gold-500/20 text-cream-300'
                    }`}
                  >
                    {g === 'FEMALE' ? 'নারী (Female)' : g === 'MALE' ? 'পুরুষ (Male)' : 'অন্যান্য'}
                  </button>
                ))}
              </div>
            </div>

            {/* Puja Day Selection */}
            <div>
              <label className="text-cream-300 block mb-1.5 font-medium">Select Puja Day / পুজোর দিন</label>
              <div className="flex flex-wrap gap-1.5">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPujaDay(d)}
                    className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${
                      pujaDay === d
                        ? 'bg-gold-500 text-night-950 font-bold border-gold-400'
                        : 'bg-night-850 border-gold-500/20 text-cream-300 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="text-cream-300 block mb-1.5 font-medium">Styling Motif / শৈলী</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-xs focus:outline-none"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Engine Selector (IDM-VTON / PhotoMaker / InstantID / FaceRestore) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-cream-300 font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="text-gold-400" />
                  <span>AI Engine / এআই মডেল</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  100% Free
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAiMode('auto')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    aiMode === 'auto'
                      ? 'bg-gold-500/20 border-gold-400 text-gold-300 font-semibold shadow-sm'
                      : 'bg-night-850 border-gold-500/20 text-cream-300 hover:border-gold-500/40'
                  }`}
                >
                  <div className="font-semibold text-cream-100 flex items-center gap-1">
                    <span>✨ Auto (Best Result)</span>
                  </div>
                  <div className="text-[10px] text-cream-400 mt-0.5">স্বয়ংক্রিয় সেরা রেজাল্ট</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiMode('vton')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    aiMode === 'vton'
                      ? 'bg-gold-500/20 border-gold-400 text-gold-300 font-semibold shadow-sm'
                      : 'bg-night-850 border-gold-500/20 text-cream-300 hover:border-gold-500/40'
                  }`}
                >
                  <div className="font-semibold text-cream-100 flex items-center gap-1">
                    <span>👗 IDM-VTON</span>
                  </div>
                  <div className="text-[10px] text-cream-400 mt-0.5">ভার্চুয়াল পোশাক ট্রাই-অন</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiMode('photomaker')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    aiMode === 'photomaker'
                      ? 'bg-gold-500/20 border-gold-400 text-gold-300 font-semibold shadow-sm'
                      : 'bg-night-850 border-gold-500/20 text-cream-300 hover:border-gold-500/40'
                  }`}
                >
                  <div className="font-semibold text-cream-100 flex items-center gap-1">
                    <span>📸 PhotoMaker</span>
                  </div>
                  <div className="text-[10px] text-cream-400 mt-0.5">প্যান্ডেল উৎসব ফটোশুট</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiMode('faceswap')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    aiMode === 'faceswap'
                      ? 'bg-gold-500/20 border-gold-400 text-gold-300 font-semibold shadow-sm'
                      : 'bg-night-850 border-gold-500/20 text-cream-300 hover:border-gold-500/40'
                  }`}
                >
                  <div className="font-semibold text-cream-100 flex items-center gap-1">
                    <span>👑 Royal Studio</span>
                  </div>
                  <div className="text-[10px] text-cream-400 mt-0.5">রাজকীয় পুজো পোর্ট্রেট</div>
                </button>
              </div>
            </div>

            {/* Photo Upload from Device */}
            <div>
              <label className="text-cream-300 block mb-1.5 font-medium flex items-center justify-between">
                <span>{lang === 'bn' ? 'আপনার ছবি আপলোড করুন' : 'Upload Your Photo'}</span>
                <span className="text-[10px] text-gold-400 font-normal">
                  {lang === 'bn' ? 'ডিভাইস থেকে ফাইল নিন' : 'Upload from device'}
                </span>
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                /* Uploaded Photo Preview Card */
                <div className="relative rounded-2xl overflow-hidden border border-gold-500/40 bg-[#161215] p-3 space-y-2.5 shadow-md">
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/60 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gold-300 font-medium">
                          {lang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading photo...'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-cream-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Camera size={14} className="text-gold-400" />
                      <span>{lang === 'bn' ? 'অন্য ছবি দিন' : 'Change Photo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <X size={14} />
                      <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Clickable Dropzone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-5 rounded-2xl border-2 border-dashed border-gold-500/30 hover:border-gold-400/80 bg-night-850 hover:bg-white/5 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:scale-105 group-hover:bg-gold-500/20 transition-all shadow-sm">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cream-100 group-hover:text-gold-300">
                      {lang === 'bn'
                        ? 'ডিভাইস থেকে ছবি আপলোড করতে ট্যাপ করুন'
                        : 'Tap to upload photo from your device'}
                    </p>
                    <p className="text-[10px] text-cream-400 mt-0.5">
                      JPEG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Optional fallback URL toggle */}
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-gold-400 hover:underline"
                >
                  {showUrlInput
                    ? (lang === 'bn' ? 'ছবি আপলোড মোডে ফিরুন' : 'Back to photo upload')
                    : (lang === 'bn' ? 'অথবা ছবির লিঙ্ক ব্যবহার করতে চান?' : 'Or use an image URL instead?')}
                </button>
                {!previewUrl && !inputImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const sample = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                      setInputImageUrl(sample);
                      setPreviewUrl(sample);
                    }}
                    className="text-cream-400 hover:text-cream-200"
                  >
                    {lang === 'bn' ? 'নমুনা মডেল ছবি ব্যবহার করুন' : 'Use sample model photo'}
                  </button>
                )}
              </div>

              {showUrlInput && (
                <div className="mt-2 space-y-1">
                  <input
                    type="url"
                    value={inputImageUrl}
                    onChange={(e) => {
                      setInputImageUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>
              )}
            </div>

            <FestiveButton
              type="submit"
              variant="gold"
              size="lg"
              disabled={isGenerating}
              className="w-full gap-2 mt-4"
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'AI Transforming...' : t.outfit.generateBtn}</span>
            </FestiveButton>
          </form>
        </div>

        {/* Right: AI Result & Styling Insights */}
        <div className="lg:col-span-7 puja-card p-6 rounded-3xl flex flex-col justify-between space-y-6">
          {isGenerating ? (
            /* Live Festive AI Photo Scanner & Transformation Animation */
            <div className="space-y-5 animate-fade-in my-auto py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping" />
                  <span className="text-xs font-bold text-gold-400 font-cinzel tracking-wide">
                    ✨ {pujaDay} • {style} AI Transforming...
                  </span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 font-semibold animate-pulse">
                  {aiMode === 'vton'
                    ? 'IDM-VTON Try-On'
                    : aiMode === 'photomaker'
                    ? 'PhotoMaker Photoshoot'
                    : aiMode === 'faceswap'
                    ? 'Royal Studio Swap'
                    : 'Multi-Model AI Active'}
                </span>
              </div>

              {/* The Animated Photo Scanner Container */}
              <div className="relative aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-gold-500/70 shadow-[0_0_50px_rgba(212,175,55,0.4)] bg-night-950 flex items-center justify-center group">
                {/* Background image preview with blur */}
                {previewUrl || inputImageUrl ? (
                  <img
                    src={previewUrl || inputImageUrl}
                    alt="Source preview"
                    className="absolute inset-0 w-full h-full object-cover filter blur-[2px] opacity-35 scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-sindoor-950/70 via-night-900 to-gold-950/50" />
                )}

                {/* Decorative Golden Bengali Mandap Radial Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0,transparent_75%)]" />

                {/* Pulsing Concentric Energy Rings */}
                <div className="absolute w-52 h-52 rounded-full border border-gold-400/40 animate-pulse-ring pointer-events-none" />
                <div className="absolute w-72 h-72 rounded-full border border-sindoor-400/30 animate-pulse-ring [animation-delay:1.1s] pointer-events-none" />

                {/* Laser Scanner Line traversing up and down across the photo */}
                <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-gold-300 to-transparent shadow-[0_0_20px_#D4AF37,0_0_8px_#FFF] animate-scanner pointer-events-none z-20">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-gold-400/80 rounded-full blur-[2px]" />
                </div>

                {/* Diagonal Shimmer Sweep Light */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer-sweep" />
                </div>

                {/* Center Floating Stage Badge */}
                <div className="relative z-30 flex flex-col items-center justify-center text-center p-6 space-y-3.5 bg-night-950/80 rounded-2xl border border-gold-500/40 backdrop-blur-md max-w-[280px] shadow-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-night-900 border border-gold-400/60 flex items-center justify-center text-3xl shadow-xl animate-bounce">
                      {generationSteps[generationStep].icon}
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-500" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-cream-100 font-cinzel leading-snug">
                      {lang === 'bn' ? generationSteps[generationStep].titleBn : generationSteps[generationStep].titleEn}
                    </h4>
                    <p className="text-[10px] text-gold-300 font-bengali">
                      {lang === 'bn' ? generationSteps[generationStep].subBn : generationSteps[generationStep].subEn}
                    </p>
                  </div>

                  {/* Live Animated Progress Bar */}
                  <div className="w-44 h-1.5 rounded-full bg-night-800 border border-gold-500/30 overflow-hidden relative mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-sindoor-500 via-gold-400 to-amber-300 transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${(generationStep + 1) * 25}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Generation Steps List Pill */}
              <div className="bg-night-950/70 p-4 rounded-2xl border border-gold-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gold-400 font-semibold uppercase tracking-wider pb-1 border-b border-gold-500/10">
                  <span>{lang === 'bn' ? 'এআই রূপান্তর পর্যায়' : 'Transformation Pipeline'}</span>
                  <span>Step {generationStep + 1} of 4</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {generationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border text-[11px] flex items-center gap-2 transition-all ${
                        generationStep === idx
                          ? 'bg-gold-500/20 border-gold-400 text-gold-200 font-semibold shadow-sm scale-[1.02]'
                          : generationStep > idx
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 opacity-80'
                          : 'bg-night-900/40 border-white/5 text-cream-400 opacity-40'
                      }`}
                    >
                      <span className="text-sm">{step.icon}</span>
                      <span className="truncate">
                        {lang === 'bn' ? step.titleBn.split('...')[0] : step.titleEn.split('...')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-400 font-cinzel">
                  ✨ {pujaDay} • {style} Transformation
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
                    <UserCheck size={12} />
                    <span>{lang === 'bn' ? 'মুখাবয়ব সংরক্ষিত' : 'Face Preserved'}</span>
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 font-semibold">
                    AI Generated
                  </span>
                </div>
              </div>

              {/* Rendered Image with reliable local fallback and grand reveal animation */}
              <div className="relative aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-gold-500/60 shadow-2xl bg-night-850 group transition-all duration-500 hover:shadow-[0_0_45px_rgba(212,175,55,0.4)]">
                <img
                  src={resolveOutfitUrl(result.generation?.resultImageUrl, gender)}
                  alt="Transformed Outfit"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 animate-in fade-in zoom-in-95 duration-700"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = gender === 'MALE' ? '/outfits/male-traditional.jpg' : '/outfits/female-traditional.jpg';
                    const fullFallback = window.location.origin + fallback;
                    if (target.src !== fullFallback) {
                      target.src = fallback;
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <a
                    href={resolveOutfitUrl(result.generation?.resultImageUrl, gender)}
                    target="_blank"
                    rel="noreferrer"
                    download="agomoni-festive-outfit.jpg"
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur text-gold-300 hover:text-gold-200 text-[11px] font-medium border border-gold-500/30 flex items-center gap-1 transition-all"
                  >
                    <Sparkles size={12} />
                    <span>{lang === 'bn' ? 'ছবি দেখুন' : 'View Full'}</span>
                  </a>
                </div>
              </div>

              {/* Cultural Breakdown & Tips */}
              <div className="space-y-3 bg-night-950/70 p-4 rounded-2xl border border-gold-500/20 text-xs">
                {result.details?.styleDescriptionBengali && (
                  <p className="text-cream-100 font-bengali leading-relaxed italic border-l-2 border-gold-400 pl-3">
                    "{result.details.styleDescriptionBengali}"
                  </p>
                )}

                {/* Festive Color Palette */}
                {result.details?.colorPalette && result.details.colorPalette.length > 0 && (
                  <div className="pt-2 border-t border-gold-500/20">
                    <h4 className="text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Palette size={13} />
                      <span>{lang === 'bn' ? 'উৎসবের রঙের মেলবন্ধন (Color Palette)' : 'Festive Color Palette'}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.details.colorPalette.map((col: string, idx: number) => {
                        const hexMatch = col.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
                        const hex = hexMatch ? hexMatch[0] : '#D4AF37';
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-night-900 border border-gold-500/30 text-[11px] text-cream-200"
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                            <span>{col}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Styling Tips */}
                {result.details?.stylingTips && result.details.stylingTips.length > 0 && (
                  <div className="pt-2 border-t border-gold-500/20">
                    <h4 className="text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1.5">
                      {t.outfit.tipsTitle}
                    </h4>
                    <ul className="space-y-1.5 text-cream-300">
                      {result.details.stylingTips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-gold-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 space-y-4 my-auto">
              <span className="text-6xl inline-block animate-bounce">👗</span>
              <h3 className="text-lg font-bold text-cream-100 font-cinzel">
                Ready for Puja AI Transformation
              </h3>
              <p className="text-xs text-cream-400 max-w-sm mx-auto font-bengali">
                বামদিকের ফর্ম থেকে আপনার পছন্দের পুজোর দিন ও ঐতিহ্যবাহী স্টাইল নির্বাচন করে বাটনে ক্লিক করুন।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Past Outfits Gallery */}
      {history.length > 0 && (
        <div className="puja-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
            <h3 className="text-sm font-bold text-cream-100 font-cinzel flex items-center gap-2">
              <History size={16} className="text-gold-400" />
              <span>{lang === 'bn' ? 'পূর্ববর্তী সাজসজ্জার গ্যালারি' : 'Your Previous Festive Styles'}</span>
            </h3>
            <span className="text-[11px] text-cream-400">
              {history.length} {lang === 'bn' ? 'টি রূপান্তর' : 'transformations'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
            {history.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  setResult({
                    generation: item,
                    details: {
                      styleDescriptionBengali: item.style === 'Modern'
                        ? 'আধুনিক ফিউশন সাজ—উৎসবের সমকালীন ট্রেন্ড।'
                        : 'ঐতিহ্যবাহী শারদীয়া সাজসজ্জা।',
                      stylingTips: ['উৎসবের সাজে বিশেষ ছোঁয়া আনুন মানানসই অলঙ্কারে।'],
                    },
                  });
                  setPujaDay(item.pujaDay || 'Ashtami');
                  setStyle(item.style || 'Bengali Traditional');
                  setGender(item.gender || 'FEMALE');
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-gold-500/20 hover:border-gold-400/80 bg-night-850 hover:bg-night-800 transition-all p-2 space-y-2 shadow-md"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60">
                  <img
                    src={resolveOutfitUrl(item.resultImageUrl, item.gender || 'FEMALE')}
                    alt={item.style}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = item.gender === 'MALE' ? '/outfits/male-traditional.jpg' : '/outfits/female-traditional.jpg';
                      const fullFallback = window.location.origin + fallback;
                      if (target.src !== fullFallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur text-[9px] font-bold text-gold-300">
                    {item.pujaDay}
                  </span>
                </div>
                <div className="text-[10px]">
                  <p className="font-bold text-cream-200 truncate">{item.style}</p>
                  <p className="text-cream-400 text-[9px]">
                    {item.gender === 'MALE' ? 'পুরুষ' : item.gender === 'FEMALE' ? 'নারী' : 'অন্যান্য'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal commented out: All features are currently 100% free */}
      {/*
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-night-900 border-2 border-gold-500 rounded-3xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-3xl">
              <Lock size={24} className="text-gold-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-cream-100 font-cinzel">
                5 Free Generations Exhausted
              </h3>
              <p className="text-xs text-cream-300 font-bengali">
                আপনি আপনার ৫টি ফ্রি ট্রায়াল শেষ করেছেন। মাত্র ₹২৯ দিয়ে আনলক করুন আনলিমিটেড AI পোশাক জেনারেশন।
              </p>
            </div>

            <div className="p-4 bg-night-950 rounded-2xl border border-gold-500/30 text-center">
              <span className="text-3xl font-extrabold text-gold-400 font-cinzel">₹29</span>
              <span className="text-xs text-cream-400 block mt-1">Unlimited Lifetime Access</span>
            </div>

            <div className="space-y-2 pt-2">
              <FestiveButton variant="gold" size="lg" onClick={handleUnlockUnlimited} className="w-full">
                Pay ₹29 with Razorpay
              </FestiveButton>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-xs text-cream-400 hover:text-white py-1 block w-full"
              >
                পরে করব / Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default OutfitPage;
