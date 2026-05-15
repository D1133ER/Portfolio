'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker at /sw.js.
 * Renders nothing — purely a side-effect component.
 * Placed once in the root layout so it runs on every page.
 */
export default function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for a new SW version every hour
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => {
        // Non-fatal — portfolio works without SW
        console.warn('[SW] Registration failed:', err);
      });
  }, []);

  return null;
}
