'use client';

import { createContext, useContext, useState, useMemo } from 'react';

interface PreferencesContextType {
  themeModeOverride: 'light' | 'dark' | null;
  setThemeModeOverride: (mode: 'light' | 'dark' | null) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeModeOverride, setThemeModeOverride] = useState<'light' | 'dark' | null>(null);

  const value = useMemo<PreferencesContextType>(() => ({
    themeModeOverride,
    setThemeModeOverride,
  }), [themeModeOverride]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
