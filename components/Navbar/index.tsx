'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tools = [
  { href: '/merge',        label: 'Merge' },
  { href: '/split',        label: 'Split' },
  { href: '/compress',     label: 'Compress' },
  { href: '/pdf-to-image', label: 'PDF → Image' },
  { href: '/image-to-pdf', label: 'Image → PDF' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="anim-fade-in" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(249,248,244,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 48, display: 'flex', alignItems: 'stretch', gap: 16, overflow: 'hidden' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center',
          fontWeight: 900, fontSize: 15, letterSpacing: '-0.03em',
          color: 'var(--text)', flexShrink: 0,
        }}>
          pdf<span style={{ color: 'var(--accent)' }}>kit</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'stretch', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
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
      </div>
    </header>
  )
}
