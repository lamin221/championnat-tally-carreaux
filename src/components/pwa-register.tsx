'use client';

import { useEffect } from 'react';

// Enregistre le service worker côté client — nécessaire pour que Chrome/Android
// propose "Installer l'application". N'affiche rien à l'écran.
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Échec silencieux : l'app reste utilisable normalement sans le SW.
      });
    }
  }, []);

  return null;
}
