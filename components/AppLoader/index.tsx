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
      <div className={`app-loader${fading ? ' is-fading' : ''}`}>
        <div className="app-loader__ring" />

        <div className="app-loader__symbol-wrap">
          <span key={symIdx} className="app-loader__symbol">{SYMBOLS[symIdx]}</span>
        </div>

        <div className="app-loader__brand">pdfkit</div>

        <div className="app-loader__pct">
          {progress}<span className="app-loader__pct-unit">%</span>
        </div>

        <div className="app-loader__track">
          <div className="progress-fill app-loader__fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="app-loader__step">
          <span className="app-loader__step-arrow">▶</span>
          {stepLabel}
        </div>

        {showSkip && (
          <button
            onClick={finish}
            className="mono app-loader__skip anim-fade-in"
          >
            skip →
          </button>
        )}
      </div>
    </>
  )
}
