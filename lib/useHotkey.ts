import { useEffect } from 'react'

/** Fires callback on Ctrl+Enter or Cmd+Enter */
export function useCmdEnter(callback: () => void, enabled: boolean) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && enabled) {
        e.preventDefault()
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [callback, enabled])
}
