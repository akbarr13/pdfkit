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
      <mark className="home-mark">{text.slice(idx, idx + query.length)}</mark>
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
      <div className="tool-card__top">
        <span className="mono tool-card__code">{tool.code}</span>
        <span className="card-symbol tool-card__symbol">{tool.symbol}</span>
      </div>
      <div className="tool-card__main">
        <h2 className="tool-card__title">{highlight(tool.label, query)}</h2>
        <p className="tool-card__desc">{highlight(tool.desc, query)}</p>
      </div>
      <div className="tool-card__arrow-row">
        <span className="card-arrow tool-card__arrow">→</span>
      </div>
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
    <div className="app-shell">
      <Navbar />

      <main className="home-main">
        <div className="home-hero">
          <p className="mono home-hero__eyebrow anim-slide-left delay-0">
            FREE · NO UPLOAD · NO ACCOUNT
          </p>
          <h1 className="home-hero__title anim-fade-up delay-1">
            iLovePDF loves your data. <span className="home-hero__title-accent">We don&apos;t.</span>
          </h1>
          <p className="home-hero__subtitle anim-fade-up delay-2">
            Everything runs in your browser. Your PDFs never leave your device.
          </p>
        </div>

        <div className="home-search anim-fade-up delay-3">
          <div className="home-search__wrap">
            <span className="home-search__icon">⌕</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tools…"
              aria-label="Search tools"
              className="home-search__input"
            />
            {query ? (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                aria-label="Clear search"
                className="home-search__clear"
              >×</button>
            ) : (
              <kbd className="home-search__kbd">/</kbd>
            )}
          </div>
        </div>

        {!query && recentTools.length > 0 && (
          <div className="home-recent anim-fade-in">
            <span className="mono home-recent__label">RECENT</span>
            {recentTools.map(t => (
              <Link key={t.href} href={t.href} className="home-recent__pill">
                <span className="home-recent__pill-symbol">{t.symbol}</span>
                {t.label}
              </Link>
            ))}
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="home-grid">
            {filtered.map((t, i) => <ToolCard key={t.href} tool={t} index={i} query={query.trim()} />)}
          </div>
        ) : (
          <div className="home-empty">
            <p className="home-empty__icon">⊘</p>
            <p className="home-empty__msg">
              No tools match <strong>&ldquo;{query}&rdquo;</strong>
            </p>
            <button onClick={() => setQuery('')} className="mono home-empty__clear">
              clear search
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="app-footer__row">
          <span className="mono app-footer__note">pdfkit — client-side only</span>
          <span className="mono app-footer__note">files never leave your device</span>
        </div>
      </footer>
    </div>
  )
}
