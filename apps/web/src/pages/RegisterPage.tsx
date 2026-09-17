import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import FestiveButton from '../components/common/FestiveButton';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export const RegisterPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [locationCity, setLocationCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side quick check
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) {
        setError('Agomoni requires members to be at least 18 years old.');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email,
          password,
          dateOfBirth,
          gender,
          locationCity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        navigate('/puja-date');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="puja-card p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl border border-gold-500/30">
        <div className="text-center space-y-2">
          <img src="/icons/durga-eye.svg" alt="Agomoni" className="w-12 h-12 mx-auto object-contain" />
          <h2 className="text-2xl font-bold font-cinzel text-cream-100">
            Create Your Agomoni Account
          </h2>
          <p className="text-xs text-gold-400 font-bengali">
            "এই পুজোয়, কিছু মানুষ আপন হোক।"
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-cream-300 block mb-1 font-medium">Full Name / নাম *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Riya Sen"
              className="w-full px-4 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="text-cream-300 block mb-1 font-medium">Email Address / ইমেইল *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. riya@example.com"
              className="w-full px-4 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cream-300 block mb-1 font-medium">Date of Birth (18+) *</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="text-cream-300 block mb-1 font-medium">Gender / লিঙ্গ *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
              >
                <option value="FEMALE">নারী (Female)</option>
                <option value="MALE">পুরুষ (Male)</option>
                <option value="OTHER">অন্যান্য (Other)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-cream-300 block mb-1 font-medium">City / এলাকা *</label>
            <input
              type="text"
              required
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="e.g. South Kolkata, Durgapur, Siliguri"
              className="w-full px-4 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="text-cream-300 block mb-1 font-medium">Password (Min 8 chars) *</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
            />
          </div>

          <FestiveButton type="submit" variant="gold" size="lg" disabled={loading} className="w-full gap-2 mt-2">
            <UserPlus size={16} />
            <span>{loading ? 'Creating account...' : 'রেজিস্ট্রেশন করুন (Register)'}</span>
          </FestiveButton>
        </form>

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gold-500/20" />
          <span className="text-[11px] text-cream-400 font-semibold uppercase tracking-wider">
            {lang === 'bn' ? 'অথবা' : 'OR'}
          </span>
          <div className="flex-1 h-px bg-gold-500/20" />
        </div>

        {/* Google Sign-Up */}
        <GoogleAuthButton
          mode="register"
          onError={(msg) => setError(msg)}
        />

        <div className="text-center pt-2 border-t border-gold-500/20 text-xs text-cream-400">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="text-gold-400 hover:underline font-semibold">
            লগইন করুন (Login)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
