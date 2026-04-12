'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CategoriesContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  const refreshCategories = useCallback(async () => {
    try {
      const cats = await categoriesApi.getAll();
      setCategories(cats);
    } catch {
      setCategories([]);
    }
  }, []);

  // Fetch categories when authenticated, clear when not
  useEffect(() => {
    if (isAuthenticated) {
      refreshCategories();
    } else {
      setCategories([]);
    }
  }, [isAuthenticated, refreshCategories]);

  const value = useMemo<CategoriesContextType>(() => ({
    categories,
    setCategories,
    refreshCategories,
  }), [categories, refreshCategories]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
