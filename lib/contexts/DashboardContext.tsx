'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { transactionsApi } from '@/lib/api';
import type { DashboardData } from '@/lib/api';
import { useAuth } from './AuthContext';

interface DashboardContextType {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await transactionsApi.getDashboard();
      setData(result);
    } catch {
      setError('Erro ao carregar dados do dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch when authenticated, clear when not
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    } else {
      setData(null);
    }
  }, [isAuthenticated, refetch]);

  // Re-fetch on transaction changes
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => refetch();
    window.addEventListener('transaction-change', handler);
    return () => window.removeEventListener('transaction-change', handler);
  }, [isAuthenticated, refetch]);

  const value = useMemo<DashboardContextType>(() => ({
    data,
    isLoading,
    error,
    refetch,
  }), [data, isLoading, error, refetch]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
