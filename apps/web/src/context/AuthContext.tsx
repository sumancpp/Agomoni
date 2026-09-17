import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  gender: string;
  profile?: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    locationCity: string;
    preferredGender?: string;
    preferredMinAge?: number;
    preferredMaxAge?: number;
  };
  entitlements?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: (permanent?: boolean) => void;
  refreshUser: () => Promise<void>;
  hasEntitlement: (productType: string) => boolean;
}

const TOKEN_KEY = 'agomoni_token';
const AUTO_LOGIN_KEY = 'agomoni_auto_login_token';
const CACHED_USER_KEY = 'agomoni_cached_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // On mount/reload or re-entry, check if there's an active token or persistent auto-login token
  const [token, setToken] = useState<string | null>(() => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (activeToken) return activeToken;
    const autoToken = localStorage.getItem(AUTO_LOGIN_KEY);
    if (autoToken) {
      // Auto-restore active session token from persistent auto-login
      localStorage.setItem(TOKEN_KEY, autoToken);
      return autoToken;
    }
    return null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const hasToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(AUTO_LOGIN_KEY);
    if (!hasToken) return null;
    try {
      const cached = localStorage.getItem(CACHED_USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    let currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      currentToken = localStorage.getItem(AUTO_LOGIN_KEY);
      if (currentToken) {
        localStorage.setItem(TOKEN_KEY, currentToken);
        setToken(currentToken);
      }
    }

    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
        }
      } else if (res.status === 401 || res.status === 403 || res.status === 404) {
        // Token expired, revoked, or user deleted -> full logout
        logout(true);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Keep AUTO_LOGIN_KEY synchronized whenever token is set
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(AUTO_LOGIN_KEY, token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    }
  }, [user]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(AUTO_LOGIN_KEY, newToken);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = (permanent: boolean = false) => {
    // Before clearing active session, capture the token into AUTO_LOGIN_KEY unless permanent
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!permanent && currentToken) {
      localStorage.setItem(AUTO_LOGIN_KEY, currentToken);
      if (user) {
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
      }
    }

    // Clear active session immediately so current page/tab shows logged-out view
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);

    // If permanent logout (e.g. account deletion or hard reset), remove auto-login credentials
    if (permanent) {
      localStorage.removeItem(AUTO_LOGIN_KEY);
      localStorage.removeItem(CACHED_USER_KEY);
    }
  };

  const hasEntitlement = (productType: string): boolean => {
    if (!user || !user.entitlements) return false;
    return user.entitlements.includes(productType) || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        hasEntitlement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
