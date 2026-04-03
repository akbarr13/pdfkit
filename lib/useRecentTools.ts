'use client'

import { useCallback } from 'react'
import { usePreference } from './usePreference'

const MAX_RECENTS = 3

/** Tracks the last N visited tool hrefs in localStorage. */
export function useRecentTools(): [string[], (href: string) => void] {
  const [recents, setRecents] = usePreference<string[]>('recent-tools', [])

  const add = useCallback((href: string) => {
    setRecents(prev => {
      const filtered = prev.filter(h => h !== href)
      return [href, ...filtered].slice(0, MAX_RECENTS)
    })
  }, [setRecents])

  return [recents, add]
}
