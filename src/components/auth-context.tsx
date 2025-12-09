"use client";

import { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isGuest: boolean;
  isAdmin?: boolean;
};

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  guestCheckout: (firstName: string, lastName: string, email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'ankweb_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.warn('Failed to parse user cache', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [user]);

  const api = useMemo<AuthContextValue>(() => {
    const login = async (email: string, password: string) => {
      // Check for admin credentials
      if (email.toLowerCase() === 'admin' && password === 'admin') {
        const adminUser: User = {
          id: 'admin-' + Date.now(),
          email: 'admin@ankweb.com',
          firstName: 'Admin',
          lastName: 'User',
          isGuest: false,
          isAdmin: true
        };
        setUser(adminUser);
        return;
      }
      
      // Regular user login
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        firstName: 'Demo',
        lastName: 'User',
        isGuest: false,
        isAdmin: false
      };
      setUser(mockUser);
    };

    const signup = async (firstName: string, lastName: string, email: string, password: string) => {
      // TODO: Replace with real Supabase auth
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        firstName,
        lastName,
        isGuest: false
      };
      setUser(mockUser);
    };

    const guestCheckout = (firstName: string, lastName: string, email?: string) => {
      const guestUser: User = {
        id: 'guest-' + Date.now(),
        email: email || '',
        firstName,
        lastName,
        isGuest: true
      };
      setUser(guestUser);
    };

    const logout = () => setUser(null);

    return { user, login, signup, guestCheckout, logout };
  }, [user]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
