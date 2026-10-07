/**
 * AUTH CONTEXT & SESSION PROVIDER
 * File: src/context/AuthContext.tsx
 *
 * Manages active session, current user DTO, and authentication state.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUserDto } from '../../shared/api-contracts.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: AuthUserDto | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getToken();
      if (token) {
        const res = await api.getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          api.clearToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string = 'Demo123!') => {
    setLoading(true);
    const res = await api.login({ email, password });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: res.error || 'Failed to authenticate' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const switchUser = async (email: string) => {
    return login(email, 'Demo123!');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
