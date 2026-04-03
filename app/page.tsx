'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { useRecentTools } from '@/lib/useRecentTools'

const tools = [
  { href: '/compress',     code: '01', label: 'Compress PDF',   desc: 'Reduce file size with quality presets. Best suited for scanned documents.',              symbol: '⊘' },
  { href: '/merge',        code: '02', label: 'Merge PDF',      desc: 'Combine multiple PDFs into one file. Drag rows to set the order before merging.',        symbol: '⊕' },
  { href: '/split',        code: '03', label: 'Split PDF',      desc: 'Extract individual pages or define custom ranges into separate files.',                  symbol: '⊗' },
  { href: '/pdf-to-image', code: '04', label: 'PDF → Image',    desc: 'Render each PDF page as a JPEG or PNG image at any resolution.',                        symbol: '◫' },
  { href: '/image-to-pdf', code: '05', label: 'Image → PDF',    desc: 'Pack JPG and PNG files into a single PDF. Drag to set page order.',                     symbol: '◨' },
  { href: '/protect',      code: '06', label: 'Protect PDF',    desc: 'Lock a PDF with a password. Encrypted output works in any PDF reader.',                  symbol: '⊛' },
  { href: '/rotate',       code: '07', label: 'Rotate Pages',   desc: 'Rotate all pages in a PDF clockwise by 90°, 180°, or 270°.',                            symbol: '↻' },
  { href: '/watermark',    code: '08', label: 'Watermark PDF',  desc: 'Stamp a text watermark on every page. Control opacity and angle.',                       symbol: '◈' },
  { href: '/metadata',     code: '09', label: 'Edit Metadata',  desc: 'View and update embedded title, author, subject, keywords, and creator fields.',         symbol: '⊞' },
]

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(255,68,0,0.15)', color: 'var(--accent)', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function ToolCard({ tool, index, query }: { tool: typeof tools[0]; index: number; query: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const delayClass = (['delay-0', 'delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5'] as const)[Math.min(index, 5)]

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%')
    el.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%')
  }

  return (
    <Link ref={ref} href={tool.href} onMouseMove={onMouseMove} className={`tool-card anim-scale-in ${delayClass}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{tool.code}</span>
        <span className="card-symbol" style={{ fontSize: 24, lineHeight: 1, color: 'var(--border-2)', transition: 'color 0.2s' }}>{tool.symbol}</span>
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
          {highlight(tool.label, query)}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
          {highlight(tool.desc, query)}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span className="card-arrow" style={{ fontSize: 17, color: 'var(--border-2)', transition: 'color 0.2s, transform 0.2s', display: 'inline-block' }}>→</span>
      </div>
      <style>{`.tool-card:hover .card-symbol { color: var(--accent) !important; }`}</style>
    </Link>
  )
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [recents] = useRecentTools()

  const recentTools = recents.map(href => tools.find(t => t.href === href)).filter(Boolean) as typeof tools

  const filtered = query.trim()
    ? tools.filter(t => {
        const q = query.toLowerCase()
        return t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
      })
    : tools

  // "/" focuses search, Escape clears
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    import('pdfjs-dist')
    import('pdf-lib')
  }, [])

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--page)' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', padding: '0 24px', width: '100%' }}>

        {/* Hero */}
        <div style={{ padding: '48px 0 40px', borderBottom: '1px solid var(--border)' }}>
          <p className="mono anim-slide-left delay-0" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.13em', marginBottom: 14 }}>
            FREE · NO UPLOAD · NO ACCOUNT
          </p>
          <h1 className="anim-fade-up delay-1" style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            lineHeight: 1.15, letterSpacing: '-0.025em',
            color: 'var(--text)', marginBottom: 10,
          }}>
            iLovePDF loves your data. <span style={{ color: 'var(--accent)' }}>We don&apos;t.</span>
          </h1>
          <p className="anim-fade-up delay-2" style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>
            Everything runs in your browser. Your PDFs never leave your device.
          </p>
        </div>

        {/* Search bar */}
        <div className="anim-fade-up delay-3" style={{ padding: '24px 0 0' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, color: 'var(--text-3)', pointerEvents: 'none',
            }}>⌕</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tools…"
              aria-label="Search tools"
              style={{
                width: '100%', padding: '9px 36px 9px 32px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', color: 'var(--text)',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px rgba(255,68,0,0.08)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {query ? (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                aria-label="Clear search"
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-3)', fontSize: 16, lineHeight: 1, padding: '2px 4px',
                }}
              >×</button>
            ) : (
              <kbd style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 10, color: 'var(--text-3)', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 3,
                padding: '2px 5px', fontFamily: 'inherit', pointerEvents: 'none',
              }}>/</kbd>
            )}
          </div>
        </div>

        {/* Recently used */}
        {!query && recentTools.length > 0 && (
          <div className="anim-fade-in" style={{ padding: '16px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>RECENT</span>
            {recentTools.map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', fontSize: 12, fontWeight: 500,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 99, color: 'var(--text-2)',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(255,68,0,0.3)'
                el.style.color = 'var(--accent)'
                el.style.background = 'rgba(255,68,0,0.04)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'var(--border)'
                el.style.color = 'var(--text-2)'
                el.style.background = 'var(--surface)'
              }}>
                <span style={{ fontSize: 13 }}>{t.symbol}</span>
                {t.label}
              </Link>
            ))}
          </div>
        )}

        {/* Tool cards */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, padding: '16px 0 64px' }}>
            {filtered.map((t, i) => <ToolCard key={t.href} tool={t} index={i} query={query.trim()} />)}
          </div>
        ) : (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 28, marginBottom: 10 }}>⊘</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 6 }}>
              No tools match <strong>&ldquo;{query}&rdquo;</strong>
            </p>
            <button
              onClick={() => setQuery('')}
              className="mono"
              style={{
                fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none',
                cursor: 'pointer', letterSpacing: '0.06em', padding: '4px 8px',
              }}
            >clear search</button>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '14px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>pdfkit — client-side only</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>files never leave your device</span>
        </div>
      </footer>
    </div>
  )
}
