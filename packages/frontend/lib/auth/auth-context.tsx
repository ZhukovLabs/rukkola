'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, getToken, setToken, removeToken } from '@/lib/api/client';

type UserRole = 'admin' | 'moderator';

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (username: string, password: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: 'loading',
  login: async () => ({ ok: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    try {
      const response = await apiClient.get<{ success: boolean; data: AuthUser }>('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
        setStatus('authenticated');
      } else {
        removeToken();
        document.cookie = 'auth_token=; path=/; max-age=0';
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch {
      removeToken();
      document.cookie = 'auth_token=; path=/; max-age=0';
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (username: string, password: string, captchaToken?: string) => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message?: string;
        data?: { accessToken: string; user: AuthUser };
      }>('/auth/login', { username, password, captchaToken });

      if (response.success && response.data) {
        setToken(response.data.accessToken);
        document.cookie = `auth_token=${response.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        setUser(response.data.user);
        setStatus('authenticated');
        return { ok: true };
      }

      return { ok: false, error: response.message || 'Ошибка при входе' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при входе';
      return { ok: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors during logout
    } finally {
      removeToken();
      document.cookie = 'auth_token=; path=/; max-age=0';
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    login,
    logout,
  }), [user, status, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useSession() {
  const { user, status } = useAuth();
  return {
    data: user ? { user } : null,
    status,
  };
}
