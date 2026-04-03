'use client'

import { useEffect } from 'react'

/** Registers the service worker for PWA / offline support. Renders nothing. */
export default function PwaInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration is best-effort — fail silently
      })
    }
  }, [])
  return null
}
