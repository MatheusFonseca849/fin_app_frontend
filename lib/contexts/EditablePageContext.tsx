'use client';

import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';

interface Feedback {
  message: string;
  severity: 'success' | 'error';
}

interface EditablePageContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  feedback: Feedback | null;
  setFeedback: (fb: Feedback | null) => void;
  registerSave: (fn: () => Promise<void>) => void;
  registerCancel: (fn: () => void) => void;
  triggerSave: () => Promise<void>;
  triggerCancel: () => void;
}

const EditablePageContext = createContext<EditablePageContextType | undefined>(undefined);

export const EditablePageProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const saveRef = useRef<(() => Promise<void>) | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const registerSave = useCallback((fn: () => Promise<void>) => {
    saveRef.current = fn;
  }, []);

  const registerCancel = useCallback((fn: () => void) => {
    cancelRef.current = fn;
  }, []);

  const triggerSave = useCallback(async () => {
    if (saveRef.current) {
      await saveRef.current();
    }
  }, []);

  const triggerCancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
  }, []);

  const value = useMemo(() => ({
    isDirty, setIsDirty,
    isSaving, setIsSaving,
    feedback, setFeedback,
    registerSave, registerCancel,
    triggerSave, triggerCancel,
  }), [isDirty, isSaving, feedback, registerSave, registerCancel, triggerSave, triggerCancel]);

  return (
    <EditablePageContext.Provider value={value}>
      {children}
    </EditablePageContext.Provider>
  );
};

export const useEditablePage = (): EditablePageContextType => {
  const context = useContext(EditablePageContext);
  if (!context) {
    throw new Error('useEditablePage must be used within an EditablePageProvider');
  }
  return context;
};
