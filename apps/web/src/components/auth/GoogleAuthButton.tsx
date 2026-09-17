import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from '../../lib/firebase';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  className?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = 'login',
  onSuccess,
  onError,
  className = '',
}) => {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  // Check for returning redirect login result on mount
  useEffect(() => {
    let isMounted = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result || !result.user || !isMounted) return;
        setIsLoading(true);

        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();

        const authRes = await fetch('/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: idToken,
            userInfo: {
              email: firebaseUser.email?.toLowerCase(),
              name: firebaseUser.displayName || 'Google User',
              picture: firebaseUser.photoURL,
              sub: firebaseUser.uid,
            },
          }),
        });

        const authData = await authRes.json();

        if (authData.success && authData.token && authData.user) {
          login(authData.token, authData.user);
          if (onSuccess) onSuccess();
          navigate(mode === 'register' ? '/puja-date' : '/');
        }
      })
      .catch((err) => {
        console.warn('Redirect auth notice:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [login, mode, navigate, onSuccess]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // 1. Trigger Firebase Google popup with 'select_account' prompt
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('No Google account email retrieved.');
      }

      // 2. Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // 3. Authenticate with Agomoni backend (registers if new, logs in if existing)
      const authRes = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: idToken,
          userInfo: {
            email: firebaseUser.email.toLowerCase(),
            name: firebaseUser.displayName || 'Google User',
            picture: firebaseUser.photoURL,
            sub: firebaseUser.uid,
          },
        }),
      });

      const authData = await authRes.json();

      if (authData.success && authData.token && authData.user) {
        login(authData.token, authData.user);
        if (onSuccess) onSuccess();
        navigate(mode === 'register' ? '/puja-date' : '/');
      } else {
        const errorMsg = authData.message || 'Authentication with Agomoni failed.';
        if (onError) onError(errorMsg);
      }
    } catch (err: any) {
      // If user closed the popup, silently stop loading without alarming error
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        setIsLoading(false);
        return;
      }

      // If popup was blocked by browser or extensions, seamless redirect fallback
      if (err?.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error('Redirect sign-in fallback failed:', redirectErr);
        }
      }

      console.error('Firebase Google Sign-In Error:', err);
      const message =
        err?.message || 'Failed to sign in with Google. Please try again.';
      if (onError) onError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 active:scale-98 transition-all flex items-center justify-center gap-3 text-cream-100 text-xs font-semibold shadow-sm hover:border-gold-500/40 disabled:opacity-60 cursor-pointer ${className}`}
    >
      {isLoading ? (
        <Loader2 size={16} className="text-gold-400 animate-spin" />
      ) : (
        /* Official Google Multi-color G Icon */
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}

      <span>
        {isLoading
          ? lang === 'bn'
            ? 'গুগল অ্যাকাউন্ট খোলা হচ্ছে...'
            : 'Connecting Google Account...'
          : mode === 'register'
          ? lang === 'bn'
            ? 'গুগল দিয়ে সাইন আপ করুন'
            : 'Sign up with Google'
          : lang === 'bn'
          ? 'গুগল দিয়ে লগইন করুন'
          : 'Continue with Google'}
      </span>
    </button>
  );
};

export default GoogleAuthButton;
