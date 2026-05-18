'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useRecentTools } from '@/lib/useRecentTools'

interface ToolLayoutProps {
  code: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function ToolLayout({ code, title, subtitle, children }: ToolLayoutProps) {
  const pathname = usePathname()
  const [, addRecent] = useRecentTools()

  useEffect(() => {
    addRecent(pathname)
  // addRecent is stable (useCallback), pathname won't change within a mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className="app-shell">
      <Navbar />
      <main className="tool-main">
        <div className="tool-header anim-fade-up">
          <p className="mono tool-header__code">{code}</p>
          <h1 className="tool-header__title">{title}</h1>
          <p className="tool-header__subtitle">{subtitle}</p>
        </div>
        <div className="tool-body anim-fade-up delay-1">
          {children}
        </div>
      </main>
    </div>
  )
}
