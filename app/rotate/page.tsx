'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import SelectedFileCard from '@/components/SelectedFileCard'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { rotatePdf, RotateAngle } from '@/lib/rotatePdf'
import { validatePdf } from '@/lib/validate'

const angles: { value: RotateAngle; label: string; symbol: string; note: string }[] = [
  { value: 90,  label: '90°',  symbol: '↻', note: 'clockwise'  },
  { value: 180, label: '180°', symbol: '↕', note: 'upside-down' },
  { value: 270, label: '270°', symbol: '↺', note: 'counter-cw'  },
]

export default function RotatePage() {
  const [file, setFile]     = useState<File | null>(null)
  const [angle, setAngle]   = useState<RotateAngle>(90)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [error, setError]   = useState('')

  const canRotate = !!file && status !== 'processing'

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError('')
  }

  function reset() { setFile(null); setStatus('idle'); setError('') }

  const handleRotate = useCallback(async () => {
    if (!file) return
    setStatus('processing'); setError('')
    try {
      const bytes = await rotatePdf(file, angle)
      const stem  = file.name.replace(/\.pdf$/i, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}_rotated.pdf`)
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, angle])

  useCmdEnter(handleRotate, canRotate)

  return (
    <ToolLayout code="07 / ROTATE" title="Rotate Pages"
      subtitle="Rotate all pages in a PDF clockwise by 90°, 180°, or 270°.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <SelectedFileCard file={file} onChange={reset} />
        )}

        {file && (
          <div>
            <p className="section-label">Rotation</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {angles.map(a => (
                <button
                  key={a.value}
                  onClick={() => setAngle(a.value)}
                  className={`preset-btn preset-btn--flex preset-btn--lg${angle === a.value ? ' active' : ''}`}
                >
                  <p className="preset-btn__symbol">{a.symbol}</p>
                  <p className="preset-btn__title">{a.label}</p>
                  <p className="mono preset-btn__note">{a.note}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'error' && <Err msg={error} onRetry={file ? handleRotate : undefined} />}
        {status === 'done'  && <Ok msg="rotated PDF saved" onReset={reset} />}

        <ActionBtn onClick={handleRotate} disabled={!canRotate} loading={status === 'processing'} hint="⌘ Enter">
          Rotate PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
