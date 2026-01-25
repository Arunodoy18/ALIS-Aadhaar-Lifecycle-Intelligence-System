'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signOut 
} from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    
    // If onAuthChange returns undefined (Firebase not configured), set loading to false
    if (!unsubscribe) {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getIdToken = async () => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithGoogle,
    logout: signOut,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
