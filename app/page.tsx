'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'

const tools = [
  { href: '/compress',     code: '01', label: 'Compress PDF', desc: 'Reduce file size with quality presets. Best suited for scanned documents.', symbol: '⊘' },
  { href: '/merge',        code: '02', label: 'Merge PDF',    desc: 'Combine multiple PDFs into one file. Drag rows to set the order before merging.', symbol: '⊕' },
  { href: '/split',        code: '03', label: 'Split PDF',    desc: 'Extract individual pages or define custom ranges into separate files.', symbol: '⊗' },
  { href: '/pdf-to-image', code: '04', label: 'PDF → Image',  desc: 'Render each PDF page as a JPEG or PNG image at any resolution.', symbol: '◫' },
  { href: '/image-to-pdf', code: '05', label: 'Image → PDF',  desc: 'Pack JPG and PNG files into a single PDF. Drag to set page order.', symbol: '◨' },
  { href: '/protect',      code: '06', label: 'Protect PDF',  desc: 'Lock a PDF with a password. Encrypted output works in any PDF reader.', symbol: '⊛' },
]

function ToolCard({ tool, index }: { tool: typeof tools[0]; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const delayClass = (['delay-0','delay-1','delay-2','delay-3','delay-4'] as const)[index]

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%')
    el.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%')
  }

  return (
    <Link
      ref={ref}
      href={tool.href}
      onMouseMove={onMouseMove}
      className={`tool-card anim-scale-in ${delayClass}`}
    >
      {/* Top: number + symbol */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
          {tool.code}
        </span>
        <span className="card-symbol" style={{ fontSize: 24, lineHeight: 1, color: 'var(--border-2)', transition: 'color 0.2s' }}>
          {tool.symbol}
        </span>
      </div>

      {/* Middle: text */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
          {tool.label}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
          {tool.desc}
        </p>
      </div>

      {/* Bottom: arrow */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span className="card-arrow" style={{ fontSize: 17, color: 'var(--border-2)', transition: 'color 0.2s, transform 0.2s', display: 'inline-block' }}>
          →
        </span>
      </div>

      <style>{`.tool-card:hover .card-symbol { color: var(--accent) !important; }`}</style>
    </Link>
  )
}

export default function HomePage() {
  useEffect(() => {
    // Prefetch heavy libs used by compress + image tools
    import('pdfjs-dist')
    import('pdf-lib')
  }, [])

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--page)' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', padding: '0 24px', width: '100%' }}>

        {/* Hero — smaller, tighter */}
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

        {/* Inline cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, padding: '28px 0 64px' }}>
          {tools.map((t, i) => <ToolCard key={t.href} tool={t} index={i} />)}
        </div>
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
