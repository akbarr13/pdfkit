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
    let p = 0
    const start = () => {
      setVisible(true)
      setProgress(0)
      const tick = () => {
        p += (90 - p) * 0.12
        setProgress(p)
        raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }
    const startRaf = requestAnimationFrame(start)

    // Finish
    timer.current = setTimeout(() => {
      if (raf.current) cancelAnimationFrame(raf.current)
      setProgress(100)
      setTimeout(() => setVisible(false), 300)
    }, 400)

    return () => {
      cancelAnimationFrame(startRaf)
      if (raf.current) cancelAnimationFrame(raf.current)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [pathname])

  if (!visible) return null

  const done = progress === 100

  return (
    <div className="top-loader">
      <div
        className={`top-loader__bar top-loader__bar--${done ? 'done' : 'running'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
