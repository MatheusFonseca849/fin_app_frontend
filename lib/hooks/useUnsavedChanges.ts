'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesReturn {
  showModal: boolean;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
}

/**
 * Hook that guards against navigation when there are unsaved changes.
 * - Intercepts <a> clicks in capture phase (catches Next.js Link clicks)
 * - Intercepts browser back/forward via popstate
 * - Shows a browser-native dialog on hard navigation (tab close, refresh)
 * - Exposes modal state for the parent to render a confirmation dialog
 */
export function useUnsavedChanges(isDirty: boolean): UseUnsavedChangesReturn {
  const [showModal, setShowModal] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const router = useRouter();

  // Browser-native dialog for hard navigation
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Intercept <a> clicks in capture phase — fires before Next.js handles
  // the click, so we can preventDefault() to block client-side navigation.
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: MouseEvent) => {
      // Walk up from the click target to find the nearest <a>
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only guard internal same-origin links
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
      } catch {
        return;
      }

      e.preventDefault();
      pendingHref.current = href;
      setShowModal(true);
    };

    document.addEventListener('click', handler, true); // capture phase
    return () => document.removeEventListener('click', handler, true);
  }, [isDirty]);

  // Intercept browser back/forward
  useEffect(() => {
    if (!isDirty) return;

    const handler = () => {
      // Push current URL back to undo the pop
      history.pushState(null, '', window.location.href);
      pendingHref.current = null;
      setShowModal(true);
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isDirty]);

  const confirmNavigation = useCallback(() => {
    setShowModal(false);
    const href = pendingHref.current;
    pendingHref.current = null;

    if (href) {
      router.push(href);
    } else {
      // Was a popstate (back/forward) — go back
      history.back();
    }
  }, [router]);

  const cancelNavigation = useCallback(() => {
    pendingHref.current = null;
    setShowModal(false);
  }, []);

  return { showModal, confirmNavigation, cancelNavigation };
}
