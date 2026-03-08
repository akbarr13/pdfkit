'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const tools = [
  { href: '/merge',        label: 'Merge' },
  { href: '/split',        label: 'Split' },
  { href: '/compress',     label: 'Compress' },
  { href: '/pdf-to-image', label: 'PDF → Image' },
  { href: '/image-to-pdf', label: 'Image → PDF' },
  { href: '/protect',      label: 'Protect' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close menu on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <header className="anim-fade-in" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(249,248,244,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 48, display: 'flex', alignItems: 'stretch', gap: 16 }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            fontWeight: 900, fontSize: 15, letterSpacing: '-0.03em',
            color: 'var(--text)', flexShrink: 0,
          }}>
            pdf<span style={{ color: 'var(--accent)' }}>kit</span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop">
            {tools.map(t => {
              const active = pathname === t.href
              return (
                <Link key={t.href} href={t.href}
                  className={`nav-link-item${active ? ' active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0 10px', fontSize: 13, whiteSpace: 'nowrap',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text)' : 'var(--text-3)',
                  }}>
                  {t.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open
              ? <span style={{ fontSize: 14, lineHeight: 1 }}>✕</span>
              : (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect width="16" height="2" rx="1" fill="currentColor" />
                  <rect y="5" width="16" height="2" rx="1" fill="currentColor" />
                  <rect y="10" width="16" height="2" rx="1" fill="currentColor" />
                </svg>
              )
            }
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <>
          <div className="nav-backdrop" onClick={() => setOpen(false)} />
          <div className="nav-mobile-menu">
            {tools.map(t => (
              <Link
                key={t.href}
                href={t.href}
                className={`nav-mobile-link${pathname === t.href ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
