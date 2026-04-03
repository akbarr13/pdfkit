'use client'

import { useState, useCallback } from 'react'

/**
 * Persist a user preference in localStorage.
 * Falls back to defaultValue on SSR or when storage is unavailable.
 */
export function usePreference<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const storageKey = `pdfkit:${key}`

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === null) return defaultValue
      return JSON.parse(stored) as T
    } catch {
      return defaultValue
    }
  })

  const set = useCallback((v: T) => {
    setValue(v)
    try {
      localStorage.setItem(storageKey, JSON.stringify(v))
    } catch {
      // localStorage unavailable (private mode, quota exceeded, etc.)
    }
  }, [storageKey])

  return [value, set]
}
