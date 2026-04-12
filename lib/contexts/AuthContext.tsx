'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { authApi, usersApi } from '@/lib/api';
import { setAccessToken, setOnAuthFailure } from '@/lib/api/client';
import type { User, RegisterData, LoginData, UpdateUserData } from '@/lib/api';
import { extractError } from '@/lib/utils/extractError';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateUserData) => Promise<string | undefined>;
  uploadAvatar: (file: File) => Promise<string>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  patchUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?._id ?? null;

  const clearError = useCallback(() => setError(null), []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await usersApi.getMe();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  // Register interceptor callback so a failed refresh clears state via React
  useEffect(() => {
    setOnAuthFailure(() => {
      setAccessToken(null);
      setUser(null);
    });
  }, []);

  // Silent auth check on mount — uses httpOnly refresh cookie
  useEffect(() => {
    const initAuth = async () => {
      try { 
        await authApi.refresh();
        const userData = await usersApi.getMe();
        setUser(userData);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setError(null);
    setIsLoading(true);
    try {
      const { user: userData } = await authApi.login(data);
      setUser(userData);
    } catch (err: unknown) {
      const { message, status } = extractError(err, 'Erro ao fazer login');
      setError(message);
      throw new ApiError(message, status);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await authApi.register(data);
      return result;
    } catch (err: unknown) {
      const { message, status } = extractError(err, 'Erro ao cadastrar');
      setError(message);
      throw new ApiError(message, status);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local state even if API call fails
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (data: UpdateUserData): Promise<string | undefined> => {
    const userId = userIdRef.current;
    if (!userId) return undefined;
    setError(null);
    try {
      const updated = await usersApi.update(userId, data);
      const { message, ...userData } = updated;
      setUser(userData);
      return message;
    } catch (err: unknown) {
      const { message, status } = extractError(err, 'Erro ao atualizar perfil');
      setError(message);
      throw new ApiError(message, status);
    }
  }, []);

  const patchUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setError(null);
    try {
      const { avatarUrl } = await usersApi.uploadAvatar(file);
      setUser((prev) => (prev ? { ...prev, avatarUrl } : prev));
      return avatarUrl;
    } catch (err: unknown) {
      const { message, status } = extractError(err, 'Erro ao atualizar avatar');
      setError(message);
      throw new ApiError(message, status);
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    uploadAvatar,
    clearError,
    refreshUser,
    patchUser,
  }), [user, isAuthenticated, isLoading, error, login, register, logout, updateUser, uploadAvatar, clearError, refreshUser, patchUser]);

  return (
    <AuthContext.Provider value={value}>
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

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
