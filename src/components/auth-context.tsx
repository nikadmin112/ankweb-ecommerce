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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
      try {
        // Validate credentials against database
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Invalid credentials' };
        }

        const authenticatedUser: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isGuest: false,
          isAdmin: result.user.isAdmin
        };
        setUser(authenticatedUser);
        return { success: true };
      } catch (err) {
        return { success: false, error: 'Login failed. Please try again.' };
      }
    };

    const signup = async (firstName: string, lastName: string, email: string, password: string) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Signup failed' };
        }

        const newUser: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isGuest: false,
          isAdmin: false
        };
        setUser(newUser);
        return { success: true };
      } catch (err) {
        return { success: false, error: 'Signup failed. Please try again.' };
      }
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

    const logout = () => {
      setUser(null);
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.clear();
        // Redirect to login page
        window.location.href = '/auth/login';
      }
    };

    return { user, login, signup, guestCheckout, logout };
  }, [user]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
