import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Lock, Trash2, LogOut, Check, Save, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FestiveButton from '../components/common/FestiveButton';

export const ProfilePage: React.FC = () => {
  const { user, token, logout, refreshUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [hideProfile, setHideProfile] = useState(false);
  const [isMatchingActive, setIsMatchingActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      navigate('/login');
      return;
    }
    if (user?.profile) {
      setDisplayName(user.profile.displayName || '');
      setBio(user.profile.bio || '');
      setLocationCity(user.profile.locationCity || '');
    }
  }, [user, token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          bio,
          locationCity,
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
      const res = await fetch('/api/v1/auth/account', {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="puja-card p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sindoor-950 border-2 border-gold-500/40 overflow-hidden flex items-center justify-center text-2xl font-bold text-gold-400">
            {user?.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0) || 'U'
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-cream-100 font-cinzel">
              {displayName || 'Agomoni User'}
            </h1>
            <p className="text-xs text-cream-400">{user?.email}</p>
            <p className="text-xs text-gold-400 flex items-center gap-1 mt-0.5">
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
