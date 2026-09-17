import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import FestiveButton from '../components/common/FestiveButton';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="puja-card p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-gold-500/30">
        <div className="text-center space-y-2">
          <img src="/icons/durga-eye.svg" alt="Agomoni" className="w-12 h-12 mx-auto object-contain" />
          <h2 className="text-2xl font-bold font-cinzel text-cream-100">
            Welcome to Agomoni
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
            <label className="text-cream-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. puja.lover@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="text-cream-300 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-night-850 border border-gold-500/30 text-cream-100 focus:outline-none focus:border-gold-400"
            />
          </div>

          <FestiveButton type="submit" variant="gold" size="lg" disabled={loading} className="w-full gap-2">
            <LogIn size={16} />
            <span>{loading ? 'Entering Agomoni...' : 'লগইন করুন / Login'}</span>
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

        {/* Google Sign-In */}
        <GoogleAuthButton
          mode="login"
          onError={(msg) => setError(msg)}
        />

        <div className="text-center pt-2 border-t border-gold-500/20 text-xs text-cream-400">
          নতুন সদস্য?{' '}
          <Link to="/register" className="text-gold-400 hover:underline font-semibold">
            অ্যাকাউন্ট তৈরি করুন (Register)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
