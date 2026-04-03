'use client'

import { useEffect, useState } from 'react'

type State = 'loading' | 'fading' | 'done'

const STEPS = [
  { label: 'PDF ENGINE',  weight: 40, load: () => import('pdfjs-dist').then(lib => { lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs' }) },
  { label: 'PDF TOOLS',   weight: 25, load: () => import('pdf-lib') },
  { label: 'COMPRESSOR',  weight: 20, load: () => import('browser-image-compression') },
  { label: 'ENCRYPTION',  weight: 15, load: () => import('jspdf') },
]

const SYMBOLS = ['⊘', '⊕', '⊗', '◫', '◨', '⊛']

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [progress, setProgress]   = useState(0)
  const [stepLabel, setStepLabel] = useState(STEPS[0].label)
  const [state, setState]         = useState<State>('loading')
  const [symIdx, setSymIdx]       = useState(0)
  const [showSkip, setShowSkip]   = useState(false)

  // Cycle symbols
  useEffect(() => {
    const id = setInterval(() => setSymIdx(i => (i + 1) % SYMBOLS.length), 650)
    return () => clearInterval(id)
  }, [])

  // Show skip button after 3.5s for returning users with cached libs
  useEffect(() => {
    const id = setTimeout(() => setShowSkip(true), 3500)
    return () => clearTimeout(id)
  }, [])

  function finish() {
    setState('fading')
    setTimeout(() => setState('done'), 550)
  }

  // Load libraries
  useEffect(() => {
    async function run() {
      let accumulated = 0
      for (const step of STEPS) {
        setStepLabel(step.label)
        await step.load()
        accumulated += step.weight
        setProgress(accumulated)
      }
      await new Promise(r => setTimeout(r, 250))
      finish()
    }
    run()
  }, [])

  if (state === 'done') return <>{children}</>

  const fading = state === 'fading'

  return (
    <>
      {children}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'var(--page)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none',
        pointerEvents: fading ? 'none' : 'all',
        overflow: 'hidden',
      }}>

        {/* Ambient pulse ring */}
        <div style={{
          position: 'absolute',
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,68,0,0.07) 0%, transparent 70%)',
          animation: 'loaderRing 2.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Cycling symbol */}
        <div style={{ marginBottom: 24, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span key={symIdx} style={{
            fontSize: 56, lineHeight: 1, color: 'var(--accent)',
            animation: 'symbolPop 0.6s cubic-bezier(0.22,1,0.36,1) both',
            display: 'inline-block',
          }}>
            {SYMBOLS[symIdx]}
          </span>
        </div>

        {/* Logo */}
        <div style={{
          fontFamily: "'Roboto Mono', 'SF Mono', monospace",
          fontSize: 13, fontWeight: 500, letterSpacing: '0.14em',
          color: 'var(--text-3)', marginBottom: 28,
        }}>
          pdfkit
        </div>

        {/* Percentage */}
        <div style={{
          fontFamily: "'Roboto Mono', 'SF Mono', monospace",
          fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em',
          color: 'var(--text)', marginBottom: 14, transition: 'all 0.3s ease', lineHeight: 1,
        }}>
          {progress}<span style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 400 }}>%</span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: 160, height: 2,
          background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
          marginBottom: 14,
        }}>
          <div className="progress-fill" style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(255,68,0,0.45)' }} />
        </div>

        {/* Step label */}
        <div style={{
          fontFamily: "'Roboto Mono', 'SF Mono', monospace",
          fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ color: 'var(--accent)', opacity: 0.7 }}>▶</span>
          {stepLabel}
        </div>

        {/* Skip button — shown after 3.5s */}
        {showSkip && (
          <button
            onClick={finish}
            className="mono anim-fade-in"
            style={{
              position: 'absolute', bottom: 32,
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 11, padding: '5px 14px',
              letterSpacing: '0.08em', fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-2)'
              e.currentTarget.style.color = 'var(--text-2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-3)'
            }}
          >
            skip →
          </button>
        )}
      </div>
    </>
  )
}
