import React, { useEffect, useState, useRef } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, ShieldCheck, X, Sparkles, Send, PhoneCall, UploadCloud, Loader2, MessageSquare, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import FestiveButton from '../components/common/FestiveButton';
import { completePayment } from '../lib/payments';
import { apiFetch } from '../lib/api';

interface Post {
  id: string;
  category: 'LOST_PERSON' | 'LOST_ITEM';
  title: string;
  nameOrItem: string;
  age?: number;
  gender?: string;
  description: string;
  lastSeenArea: string;
  lastSeenDate: string;
  lastSeenTime?: string;
  photoUrl?: string;
  createdAt: string;
  poster: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    city: string;
  };
  matchCount: number;
}

interface MatchItem {
  id: string;
  matchConfidence: number;
  matchDetails?: string;
  status: string;
  postA: {
    id: string;
    title: string;
    nameOrItem: string;
    lastSeenArea: string;
    lastSeenDate: string;
    description: string;
    photoUrl?: string;
    user?: {
      id?: string;
      profile?: {
        displayName: string;
        locationCity?: string;
      };
    };
  };
  postB: {
    id: string;
    title: string;
    nameOrItem: string;
    lastSeenArea: string;
    lastSeenDate: string;
    description: string;
    photoUrl?: string;
    user?: {
      id?: string;
      profile?: {
        displayName: string;
        locationCity?: string;
      };
    };
  };
}

export const LostFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { token, isAuthenticated, user } = useAuth();

  const [category, setCategory] = useState<'LOST_PERSON' | 'LOST_ITEM'>('LOST_PERSON');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states
  const [title, setTitle] = useState('');
  const [nameOrItem, setNameOrItem] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [lastSeenArea, setLastSeenArea] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastSeenTime, setLastSeenTime] = useState('Evening');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Device Photo Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDevicePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(lang === 'bn' ? 'ছবির সাইজ ৫MB এর কম হতে হবে।' : 'Photo size must be less than 5MB.');
      return;
    }

    if (!token) {
      setUploadError(lang === 'bn' ? 'ছবি আপলোড করতে লগইন প্রয়োজন।' : 'Please login to upload a photo.');
      return;
    }

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
        setPhotoUrl(data.fileUrl);
      } else {
        setUploadError(data.message || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload photo.'));
      }
    } catch (err) {
      console.error('Photo upload error', err);
      setUploadError(lang === 'bn' ? 'আপলোডে সমস্যা হয়েছে।' : 'Error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Match View Modal state
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postMatches, setPostMatches] = useState<MatchItem[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Contact Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState<{
    postId: string;
    posterName: string;
    postTitle: string;
    posterId?: string;
  } | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isCheckingContactStatus, setIsCheckingContactStatus] = useState(false);
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  const [isPayingContact, setIsPayingContact] = useState(false);
  const [isSendingRelay, setIsSendingRelay] = useState(false);
  const [unlockedConversationId, setUnlockedConversationId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const url = `/api/v1/lost-found?category=${category}${searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : ''}`;
      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Fetch lost & found error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  // Hide global Navbar, Footer, and BottomNav when Create Report modal is open
  useEffect(() => {
    if (isModalOpen || isMatchesModalOpen || isContactModalOpen) {
      document.body.classList.add('hide-nav-footer');
    } else {
      document.body.classList.remove('hide-nav-footer');
    }
    return () => {
      document.body.classList.remove('hide-nav-footer');
    };
  }, [isModalOpen, isMatchesModalOpen, isContactModalOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // Trigger fetch without search
    apiFetch(`/api/v1/lost-found?category=${category}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPosts(d.posts);
      });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert(lang === 'bn' ? 'রিপোর্ট পোস্ট করার জন্য অনুগ্রহ করে লগইন করুন।' : 'Please login to post a report.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/v1/lost-found', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          title,
          nameOrItem,
          age: age ? Number(age) : undefined,
          description,
          lastSeenArea,
          lastSeenDate,
          lastSeenTime,
          photoUrl: photoUrl || (category === 'LOST_PERSON' 
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setNameOrItem('');
        setAge('');
        setDescription('');
        setLastSeenArea('');
        setPhotoUrl('');
        alert(lang === 'bn' ? '🎉 রিপোর্ট সফলভাবে বিনামূল্যে প্রকাশিত হয়েছে! ম্যাচ ইঞ্জিন সক্রিয়।' : '🎉 Report published successfully for free! Match detection active.');
        fetchPosts();
      } else {
        alert(data.message || (lang === 'bn' ? 'রিপোর্ট প্রকাশ করতে ত্রুটি হয়েছে।' : 'Error publishing report'));
      }
    } catch (err) {
      alert(lang === 'bn' ? 'সাবমিট করতে সমস্যা হয়েছে।' : 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMatches = async (post: Post) => {
    setSelectedPost(post);
    setIsMatchesModalOpen(true);
    setIsLoadingMatches(true);
    try {
      const res = await apiFetch(`/api/v1/lost-found/${post.id}/matches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setPostMatches(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleOpenContact = async (postInfo: {
    postId: string;
    posterName: string;
    postTitle: string;
    posterId?: string;
  }) => {
    if (!isAuthenticated) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে যোগাযোগের জন্য লগইন করুন।' : 'Please login to contact the reporter.');
      return;
    }
    setContactTarget(postInfo);
    setContactMessage(`Hello, I saw your report regarding "${postInfo.postTitle}". I have relevant information to share.`);
    setContactPhone('');
    setContactSuccess(false);
    setUnlockedConversationId(null);
    setIsContactModalOpen(true);
    setIsCheckingContactStatus(true);

    try {
      const res = await apiFetch(`/api/v1/lost-found/${postInfo.postId}/contact-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setIsContactUnlocked(data.isUnlocked);
      } else {
        setIsContactUnlocked(false);
      }
    } catch (err) {
      console.error('Failed to check contact status', err);
      setIsContactUnlocked(false);
    } finally {
      setIsCheckingContactStatus(false);
    }
  };

  const handleUnlockContactPayment = async () => {
    if (!contactTarget || !token) return;
    setIsPayingContact(true);
    try {
      const orderRes = await apiFetch('/api/v1/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: 'LOST_FOUND_CONTACT',
          metadata: { postId: contactTarget.postId },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert(orderData.message || 'Failed to create payment order');
        return;
      }
      const paid = await completePayment(token, orderData);
      if (paid) {
        setIsContactUnlocked(true);
      } else {
        alert(lang === 'bn' ? 'পেমেন্ট সম্পন্ন হয়নি।' : 'Payment was not completed.');
      }
    } catch (err) {
      console.error('Contact payment error', err);
      alert('Payment failed. Please try again.');
    } finally {
      setIsPayingContact(false);
    }
  };

  const handleSendRelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactTarget || !token) return;
    setIsSendingRelay(true);
    try {
      const res = await apiFetch(`/api/v1/lost-found/${contactTarget.postId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: contactMessage,
          phone: contactPhone || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUnlockedConversationId(data.conversationId || null);
        setContactSuccess(true);
      } else {
        alert(data.message || (lang === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে।' : 'Failed to send message'));
      }
    } catch (err) {
      console.error('Failed to send contact message', err);
      alert(lang === 'bn' ? 'বার্তা পাঠাতে ত্রুটি হয়েছে।' : 'Error sending message');
    } finally {
      setIsSendingRelay(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-bengali text-cream-100 flex items-center gap-2">
            <span>🧒</span>
            <span>{t.lostFound.heading}</span>
          </h1>
          <p className="text-xs text-gold-400 font-bengali mt-1">
            পুজোর ভিড়ে প্রিয়জনকে খুঁজুন বা খোয়া যাওয়া জিনিসের রিপোর্ট দিন। রিয়েল-টাইম এআই ম্যাচিং প্রযুক্তি।
          </p>
        </div>

        <FestiveButton variant="gold" onClick={() => setIsModalOpen(true)} className="gap-1.5 shadow-lg shadow-gold-950/30">
          <Plus size={16} />
          <span>{t.lostFound.createBtn}</span>
        </FestiveButton>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Categories Tab */}
        <div className="flex items-center gap-2 p-1.5 bg-night-900 border border-gold-500/30 rounded-2xl w-full sm:w-auto shadow-md">
          <button
            onClick={() => setCategory('LOST_PERSON')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              category === 'LOST_PERSON'
                ? 'bg-gradient-to-r from-sindoor-700 to-sindoor-800 text-white shadow-md'
                : 'text-cream-300 hover:text-white'
            }`}
          >
            {t.lostFound.tabPerson}
          </button>
          <button
            onClick={() => setCategory('LOST_ITEM')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              category === 'LOST_ITEM'
                ? 'bg-gradient-to-r from-sindoor-700 to-sindoor-800 text-white shadow-md'
                : 'text-cream-300 hover:text-white'
            }`}
          >
            {t.lostFound.tabItem}
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, pandal, or area..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-night-900 border border-gold-500/30 text-xs text-cream-100 placeholder-cream-400 focus:outline-none focus:border-gold-400 shadow-inner"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cream-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="text-4xl animate-spin inline-block">🪔</span>
          <p className="text-xs text-gold-400 mt-2">Loading active reports...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="puja-card p-12 text-center rounded-3xl space-y-3">
          <span className="text-4xl">🕊️</span>
          <h3 className="text-base font-bold text-cream-100 font-bengali">
            {t.lostFound.emptyNotice}
          </h3>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-gold-400 hover:underline inline-block mt-2"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="puja-card rounded-3xl overflow-hidden flex flex-col justify-between hover:border-gold-400/50 transition-all shadow-xl">
              {/* Photo & Badge */}
              <div className="relative h-56 w-full bg-night-850 overflow-hidden">
                {post.photoUrl ? (
                  <img src={post.photoUrl} alt={post.nameOrItem} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-night-900">
                    {post.category === 'LOST_PERSON' ? '🧒' : '🎒'}
                  </div>
                )}

                {/* Match indicator badge */}
                {post.matchCount > 0 && (
                  <button
                    onClick={() => handleOpenMatches(post)}
                    className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-night-950 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-amber-200"
                    title="Click to view AI detected matches"
                  >
                    <AlertTriangle size={13} className="text-night-950" />
                    <span>{post.matchCount} Possible {post.matchCount === 1 ? 'Match' : 'Matches'}</span>
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-cream-100 font-cinzel leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  <p className="text-xs text-cream-300 font-bengali line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gold-400/90 pt-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-gold-400 shrink-0" />
                      <span>{post.lastSeenArea}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gold-400 shrink-0" />
                      <span>
                        {new Date(post.lastSeenDate).toLocaleDateString()} • {post.lastSeenTime || 'Evening'}
                      </span>
                    </p>
                    {post.age && (
                      <p className="flex items-center gap-1.5 text-cream-400">
                        <span>Age / বয়স: <strong className="text-gold-300">{post.age} yrs</strong></span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gold-500/20 flex items-center justify-between text-xs gap-2">
                  <span className="text-cream-400 text-[11px] truncate">
                    Poster: <span className="text-cream-200 font-medium">{post.poster.displayName}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {post.matchCount > 0 && (
                      <button
                        onClick={() => handleOpenMatches(post)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                      >
                        Matches
                      </button>
                    )}
                    <FestiveButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenContact({
                        postId: post.id,
                        posterName: post.poster.displayName,
                        postTitle: post.title,
                        posterId: post.poster.id,
                      })}
                    >
                      {t.lostFound.contactPoster}
                    </FestiveButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matches Inspection Modal */}
      {isMatchesModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-night-900 border border-gold-500/40 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-cream-100 flex items-center gap-2 font-cinzel">
                  <Sparkles size={18} className="text-gold-400" />
                  <span>AI Match Engine Results</span>
                </h3>
                <p className="text-xs text-cream-400 mt-0.5">
                  Report: <strong className="text-gold-300">{selectedPost.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsMatchesModalOpen(false)}
                className="p-1.5 rounded-xl text-cream-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingMatches ? (
              <div className="text-center py-12 space-y-2">
                <span className="text-3xl animate-spin inline-block">🪔</span>
                <p className="text-xs text-gold-400">Comparing pandal locations and timestamps...</p>
              </div>
            ) : postMatches.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-cream-300">
                <p>No active cross-matches detected at this moment.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {postMatches.map((m) => {
                  const otherPost = m.postA.id === selectedPost.id ? m.postB : m.postA;
                  const reporterName = otherPost.user?.profile?.displayName || 'Puja Attendee';
                  return (
                    <div key={m.id} className="p-4 rounded-2xl bg-night-850 border border-gold-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold">
                            {m.matchConfidence}% Match Confidence
                          </span>
                          <span className="text-[11px] text-cream-400">Status: {m.status}</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsMatchesModalOpen(false);
                            handleOpenContact({
                              postId: otherPost.id,
                              posterName: reporterName,
                              postTitle: otherPost.title,
                              posterId: otherPost.user?.id,
                            });
                          }}
                          className="px-3 py-1 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <PhoneCall size={12} />
                          <span>Contact Reporter</span>
                        </button>
                      </div>

                      {m.matchDetails && (
                        <div className="text-[11px] text-gold-400/90 bg-night-950 p-2.5 rounded-xl border border-gold-500/20">
                          <strong>Overlap factors:</strong> {m.matchDetails}
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs text-cream-200">
                        <p className="font-semibold text-cream-100">{otherPost.title}</p>
                        <p className="text-cream-400 line-clamp-2">{otherPost.description}</p>
                        <p className="text-[11px] text-cream-400 flex items-center gap-1.5">
                          <MapPin size={11} className="text-gold-400" />
                          <span>{otherPost.lastSeenArea}</span>
                          <span>•</span>
                          <Calendar size={11} className="text-gold-400" />
                          <span>{new Date(otherPost.lastSeenDate).toLocaleDateString()}</span>
                        </p>
                        <p className="text-[11px] text-cream-400">
                          Reported by: <span className="text-cream-200 font-medium">{reporterName}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <FestiveButton variant="ghost" onClick={() => setIsMatchesModalOpen(false)}>
                Close
              </FestiveButton>
            </div>
          </div>
        </div>
      )}

      {/* Masked Contact Relay & Direct Chat Modal */}
      {isContactModalOpen && contactTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-night-900 border border-gold-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-cream-100 flex items-center gap-1.5 font-cinzel">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>{lang === 'bn' ? 'রিপোর্টারের সাথে যোগাযোগ' : 'Contact Reporter'}</span>
                </h3>
                <p className="text-xs text-cream-400 mt-0.5">
                  {lang === 'bn' ? 'সংযোগ হচ্ছে:' : 'Connecting to:'} <strong className="text-gold-300">{contactTarget.posterName}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 rounded-xl text-cream-400 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {isCheckingContactStatus ? (
              <div className="py-10 text-center space-y-3">
                <Loader2 size={28} className="animate-spin text-gold-400 mx-auto" />
                <p className="text-xs text-gold-300 font-medium">
                  {lang === 'bn' ? 'সংযোগের অনুমতি যাচাই করা হচ্ছে...' : 'Verifying connection access...'}
                </p>
              </div>
            ) : !isContactUnlocked ? (
              /* Paywall: UserB must pay ₹49 to connect with UserA */
              <div className="py-3 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-night-950 border border-amber-500/30 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-300">
                    <Lock size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-cream-100">
                    {lang === 'bn' ? 'সরাসরি যোগাযোগের জন্য আনলক করুন' : 'Unlock Direct Connection'}
                  </h4>
                  <p className="text-cream-300 text-[11px] leading-relaxed">
                    {lang === 'bn'
                      ? 'ভুয়ো তথ্য বা অযাচিত কল রোধ করতে রিপোর্টারের সাথে সরাসরি যোগাযোগে একবারের ₹৪৯ কানেকশন ফি প্রযোজ্য। পেমেন্টের পর আপনি সরাসরি মেসেজ ও অ্যাপের মধ্যে চ্যাট করতে পারবেন।'
                      : 'To protect the reporting user from spam and authenticate genuine leads, connecting with the reporter requires a one-time connection fee of ₹49. After payment, you can message and chat directly.'}
                  </p>
                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 font-bold text-xs">
                      {lang === 'bn' ? 'এককালীন ফি: ₹৪৯' : 'One-time Fee: ₹49'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <FestiveButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsContactModalOpen(false)}
                    className="flex-1"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </FestiveButton>
                  <FestiveButton
                    type="button"
                    variant="gold"
                    onClick={handleUnlockContactPayment}
                    disabled={isPayingContact}
                    className="flex-1 gap-1.5"
                  >
                    {isPayingContact ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>{lang === 'bn' ? 'পেমেন্ট হচ্ছে...' : 'Processing...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>{lang === 'bn' ? '₹৪৯ দিয়ে আনলক করুন' : 'Pay ₹49 & Connect'}</span>
                      </>
                    )}
                  </FestiveButton>
                </div>
              </div>
            ) : contactSuccess ? (
              /* Contact Success: Message sent & direct conversation opened */
              <div className="py-6 text-center space-y-4 animate-fade-in">
                <CheckCircle size={44} className="text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-cream-100">
                    {lang === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Dispatched!'}
                  </h4>
                  <p className="text-xs text-cream-300 mt-1">
                    {lang === 'bn'
                      ? `আপনার বার্তা ${contactTarget.posterName}-এর কাছে পাঠানো হয়েছে। চ্যাট কথোপকথন আনলক হয়েছে!`
                      : `Your message has been securely sent to ${contactTarget.posterName}. Direct in-app chat is now active!`}
                  </p>
                </div>

                {unlockedConversationId && (
                  <FestiveButton
                    variant="gold"
                    onClick={() => {
                      setIsContactModalOpen(false);
                      navigate(`/chat/${unlockedConversationId}`);
                    }}
                    className="w-full gap-2 py-2.5 shadow-lg shadow-gold-950/40"
                  >
                    <MessageSquare size={16} />
                    <span>{lang === 'bn' ? 'সরাসরি চ্যাটে কথা বলুন' : 'Open Direct Chat with Reporter'}</span>
                  </FestiveButton>
                )}

                <div>
                  <FestiveButton
                    variant="ghost"
                    onClick={() => setIsContactModalOpen(false)}
                    className="text-xs"
                  >
                    {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </FestiveButton>
                </div>
              </div>
            ) : (
              /* Contact Form: Unlocked and ready to send initial relay */
              <form onSubmit={handleSendRelay} className="space-y-3 text-xs">
                <div className="p-3 bg-night-950 rounded-xl border border-emerald-500/30 text-[11px] text-cream-300">
                  🔓 <strong>{lang === 'bn' ? 'কানেকশন সক্রিয়:' : 'Connection Unlocked:'}</strong>{' '}
                  {lang === 'bn'
                    ? `${contactTarget.posterName}-এর সাথে ইন-অ্যাপ চ্যাট এবং সুরক্ষিত বার্তা লিঙ্ক করা হয়েছে।`
                    : `Direct in-app messaging with ${contactTarget.posterName} is unlocked and secure.`}
                </div>

                <div>
                  <label className="text-cream-300 block mb-1">
                    {lang === 'bn' ? 'আপনার বার্তা *' : 'Your Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="text-cream-300 block mb-1">
                    {lang === 'bn' ? 'যোগাযোগের ফোন নম্বর (ঐচ্ছিক)' : 'Optional Phone / WhatsApp for direct callback'}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98300 XXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <FestiveButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsContactModalOpen(false)}
                    className="flex-1"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </FestiveButton>
                  <FestiveButton
                    type="submit"
                    variant="gold"
                    disabled={isSendingRelay}
                    className="flex-1 gap-1.5"
                  >
                    {isSendingRelay ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>{lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
                      </>
                    )}
                  </FestiveButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-night-900 border border-gold-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <h3 className="text-xl font-bold text-cream-100 font-bengali">
                {category === 'LOST_PERSON' ? 'হারিয়ে যাওয়া ব্যক্তির রিপোর্ট' : 'হারিয়ে যাওয়া জিনিসপত্রের রিপোর্ট'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-cream-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="text-cream-300 block mb-1">Title / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lost grandfather in Maddox Square"
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-cream-300 block mb-1">Name or Item Name *</label>
                  <input
                    type="text"
                    required
                    value={nameOrItem}
                    onChange={(e) => setNameOrItem(e.target.value)}
                    placeholder="Full name or Item brand"
                    className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                  />
                </div>
                {category === 'LOST_PERSON' && (
                  <div>
                    <label className="text-cream-300 block mb-1">Age / বয়স</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 68"
                      className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-cream-300 block mb-1">Last Seen Pandal / Area *</label>
                <input
                  type="text"
                  required
                  value={lastSeenArea}
                  onChange={(e) => setLastSeenArea(e.target.value)}
                  placeholder="e.g. Bagbazar Sarbojanin pandal entrance"
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div>
                <label className="text-cream-300 block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Clothing worn, identifying marks, distinctive features..."
                  className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div>
                <label className="text-cream-300 block mb-1">
                  {category === 'LOST_PERSON' 
                    ? (lang === 'bn' ? 'ব্যক্তির ছবি (ঐচ্ছিক)' : 'Person Photo (Optional)')
                    : (lang === 'bn' ? 'জিনিসপত্রের ছবি (ঐচ্ছিক)' : 'Item Photo (Optional)')}
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDevicePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                />

                {/* Upload from Device or Preview */}
                {photoUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-gold-500/40 bg-night-950 p-2.5 flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Uploaded preview"
                      className="w-14 h-14 object-cover rounded-xl border border-gold-500/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cream-100 font-semibold truncate">
                        {lang === 'bn' ? 'ছবি যুক্ত হয়েছে' : 'Photo Attached'}
                      </p>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle size={12} />
                        <span>{lang === 'bn' ? 'রিপোর্টে যুক্ত হবে' : 'Ready for report'}</span>
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
                        onClick={() => setPhotoUrl('')}
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
                          <span>{lang === 'bn' ? 'ডিভাইস থেকে আপলোড হচ্ছে...' : 'Uploading photo from device...'}</span>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 group-hover:scale-110 transition-transform">
                            <UploadCloud size={18} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-cream-100">
                              {lang === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload photo from device'}
                            </p>
                            <p className="text-[10px] text-cream-400 mt-0.5">
                              JPG, PNG, WebP (Max 5MB)
                            </p>
                          </div>
                        </>
                      )}
                    </button>

                    {/* Or URL input */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="h-px bg-gold-500/20 flex-1" />
                      <span className="text-[10px] uppercase tracking-wider text-cream-400">
                        {lang === 'bn' ? 'অথবা ছবির লিঙ্ক দিন' : 'or enter photo url'}
                      </span>
                      <div className="h-px bg-gold-500/20 flex-1" />
                    </div>

                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
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

              <div className="p-3 bg-night-950 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-xs text-cream-300">
                  {lang === 'bn' ? (
                    <>পোস্টিং সম্পূর্ণ <strong className="text-emerald-400">বিনামূল্যে (Free)</strong>। পুজোয় প্রিয়জনকে খুঁজতে কোনো চার্জ লাগবে না।</>
                  ) : (
                    <>Report publication is 100% <strong className="text-emerald-400">FREE</strong>. No charges for reporting lost persons or items.</>
                  )}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
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
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting
                    ? (lang === 'bn' ? 'প্রকাশ হচ্ছে...' : 'Publishing...')
                    : (lang === 'bn' ? 'রিপোর্ট প্রকাশ করুন (ফ্রি)' : 'Publish Report (Free)')}
                </FestiveButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundPage;
