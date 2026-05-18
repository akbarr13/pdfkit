'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const tools = [
  { href: '/merge',        label: 'Merge'     },
  { href: '/split',        label: 'Split'     },
  { href: '/compress',     label: 'Compress'  },
  { href: '/pdf-to-image', label: 'PDF→Image' },
  { href: '/image-to-pdf', label: 'Image→PDF' },
  { href: '/protect',      label: 'Protect'   },
  { href: '/rotate',       label: 'Rotate'    },
  { href: '/watermark',    label: 'Watermark' },
  { href: '/metadata',     label: 'Metadata'  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <header className="navbar anim-fade-in">
        <div className="navbar__row">
          <Link href="/" className="navbar__brand">
            pdf<span className="navbar__brand-accent">kit</span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop">
            {tools.map(t => {
              const active = pathname === t.href
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`nav-link nav-link-item${active ? ' active' : ''}`}
                >
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
