'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TopLoader() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    // Start loading
    setVisible(true)
    setProgress(0)

    let p = 0
    const tick = () => {
      // Fast at first, slows down approaching 90%
      p += (90 - p) * 0.12
      setProgress(p)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    // Finish
    timer.current = setTimeout(() => {
      if (raf.current) cancelAnimationFrame(raf.current)
      setProgress(100)
      setTimeout(() => setVisible(false), 300)
    }, 400)

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 2, pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'var(--accent)',
        transition: progress === 100 ? 'width 0.1s ease, opacity 0.3s ease' : 'width 0.1s linear',
        opacity: progress === 100 ? 0 : 1,
        boxShadow: '0 0 8px rgba(255,68,0,0.6)',
      }} />
    </div>
  )
}
