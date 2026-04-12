'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface UseRequireAuthOptions {
  redirectTo?: string;
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const { redirectTo = '/login' } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated };
};
