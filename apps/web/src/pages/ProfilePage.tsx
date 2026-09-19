import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, ShieldCheck, Lock, Trash2, LogOut, Check, Save, MapPin, Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FestiveButton from '../components/common/FestiveButton';
import { apiFetch, resolveImageUrl } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { user, token, logout, refreshUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [hideProfile, setHideProfile] = useState(false);
  const [isMatchingActive, setIsMatchingActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !token) {
      navigate('/login');
      return;
    }
    if (user?.profile) {
      setDisplayName(user.profile.displayName || '');
      setBio(user.profile.bio || '');
      setLocationCity(user.profile.locationCity || '');
      setAvatarUrl(user.profile.avatarUrl || '');
      setHideProfile(Boolean(user.profile.hideProfile));
      setIsMatchingActive(user.profile.isMatchingActive ?? true);
    }
  }, [user, token, isLoading]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB');
      return;
    }

    setIsUploadingAvatar(true);
    setImgError(false);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiFetch('/api/v1/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.fileUrl) {
        throw new Error(data.error || 'Upload failed');
      }

      setAvatarUrl(data.fileUrl);

      // Auto-save to profile immediately
      const saveRes = await apiFetch('/api/v1/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatarUrl: data.fileUrl,
        }),
      });

      if (saveRes.ok) {
        await refreshUser();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/v1/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          bio,
          locationCity,
          avatarUrl: avatarUrl || undefined,
          hideProfile,
          isMatchingActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        refreshUser();
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'WARNING: Complete Account Deletion.\nThis will permanently delete your profile, dating matches, and private memories.\nType "DELETE" to confirm:'
    );

    if (confirmation !== 'DELETE') return;

    try {
      const res = await apiFetch('/api/v1/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        logout(true);
        navigate('/');
      }
    } catch (err) {
      alert('Error deleting account');
    }
  };

  const currentAvatar = avatarUrl || user?.profile?.avatarUrl;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleAvatarUpload}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Profile Header */}
      <div className="puja-card p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar with Upload Overlay */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-sindoor-950 border-2 border-gold-500/50 overflow-hidden flex items-center justify-center text-3xl font-bold text-gold-400 shadow-lg">
              {currentAvatar && !imgError ? (
                <img
                  src={resolveImageUrl(currentAvatar)}
                  alt={displayName || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                displayName.charAt(0) || 'U'
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-night-950 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
              title="Upload Profile Photo"
            >
              {isUploadingAvatar ? (
                <Loader2 size={14} className="animate-spin text-night-950" />
              ) : (
                <Camera size={14} className="text-night-950 font-bold" />
              )}
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-cream-100 font-cinzel">
                {displayName || 'Agomoni User'}
              </h1>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-[11px] text-gold-400 hover:text-gold-300 underline font-medium"
              >
                {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
            <p className="text-xs text-cream-400 mt-0.5">{user?.email}</p>
            <p className="text-xs text-gold-400 flex items-center gap-1 mt-1 justify-center sm:justify-start">
              <MapPin size={12} />
              <span>{locationCity || 'Bengal'}</span>
            </p>
          </div>
        </div>

        <FestiveButton
          variant="secondary"
          size="sm"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="gap-1.5 text-xs text-red-400"
        >
          <LogOut size={14} />
          <span>{t.nav.logout}</span>
        </FestiveButton>
      </div>

      {/* Administrator Portal Access */}
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
        <div className="puja-card p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#2B1909]/70 via-[#3D1E0C]/60 to-[#2B1909]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-cream-100 font-cinzel flex items-center gap-2">
                <span>Administrator Console</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.role}
                </span>
              </h4>
              <p className="text-xs text-cream-300/80">
                Manage system users, view analytics, process payments & moderation
              </p>
            </div>
          </div>
          <Link to="/admin" className="self-start sm:self-auto flex-shrink-0">
            <FestiveButton variant="gold" size="sm" className="gap-1.5 font-bold shadow-md">
              <ShieldCheck size={14} className="text-night-950" />
              <span>Open Admin Panel</span>
            </FestiveButton>
          </Link>
        </div>
      )}

      {/* Active Entitlements Banner */}
      <div className="puja-card p-4 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
          👑 Your Entitlements & Badges
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {user?.entitlements && user.entitlements.length > 0 ? (
            user.entitlements.map((e) => (
              <span
                key={e}
                className="px-3 py-1 rounded-xl bg-gold-950 border border-gold-400 text-gold-300 font-semibold"
              >
                ✓ {e.replace(/_/g, ' ')}
              </span>
            ))
          ) : (
            <span className="text-cream-400 text-xs">Free Tier (Standard Access)</span>
          )}
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="puja-card p-6 rounded-3xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gold-500/20">
          <h3 className="text-base font-bold text-cream-100 font-cinzel">
            Edit Profile & Preferences
          </h3>
          {saveSuccess && (
            <span className="text-green-400 font-bold flex items-center gap-1 text-xs">
              <Check size={14} /> Saved!
            </span>
          )}
        </div>

        <div>
          <label className="text-cream-300 block mb-1">Profile Photo / প্রোফাইল ছবি</label>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-night-950 border border-gold-500/20">
            <div className="w-12 h-12 rounded-xl bg-sindoor-950 border border-gold-500/40 overflow-hidden flex items-center justify-center text-lg font-bold text-gold-400 shrink-0">
              {currentAvatar && !imgError ? (
                <img
                  src={resolveImageUrl(currentAvatar)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                displayName.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-3 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Upload New Photo</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-cream-400 mt-1">Supports JPG, PNG, WebP (Max 10MB)</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-cream-300 block mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-cream-300 block mb-1">City / Neighborhood</label>
          <input
            type="text"
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            placeholder="e.g. South Kolkata, Durgapur, Siliguri"
            className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-cream-300 block mb-1">Bio / আপনার কথা</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="অষ্টমীর অঞ্জলি, প্যান্ডেল হপিং বা ফুচকা চ্যালেঞ্জ..."
            className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none font-bengali"
          />
        </div>

        {/* Privacy Controls */}
        <div className="space-y-2 pt-2 border-t border-gold-500/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
            Privacy Controls / গোপনীয়তা
          </h4>
          <div className="flex items-center justify-between p-3 rounded-xl bg-night-950">
            <div>
              <span className="font-bold text-cream-100 block">Hide Profile</span>
              <span className="text-[10px] text-cream-400">
                Do not display profile in Puja Date discovery feed.
              </span>
            </div>
            <input
              type="checkbox"
              checked={hideProfile}
              onChange={(e) => setHideProfile(e.target.checked)}
              className="accent-gold-500"
            />
          </div>
        </div>

        <FestiveButton type="submit" variant="gold" disabled={isSaving} className="w-full gap-2 mt-4">
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
        </FestiveButton>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="puja-card p-6 rounded-3xl border-red-900/50 space-y-3">
        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <Trash2 size={16} /> Complete Account & Data Deletion
        </h4>
        <p className="text-xs text-cream-400 leading-relaxed font-bengali">
          আপনার অ্যাকাউন্ট মুছে ফেললে ব্যক্তিগত সমস্ত ডেটা, ছবি এবং চ্যাট স্থায়ীভাবে অপসারিত হবে।
        </p>
        <FestiveButton variant="danger" size="sm" onClick={handleDeleteAccount}>
          Delete My Account Permanently
        </FestiveButton>
      </div>
    </div>
  );
};

export default ProfilePage;
