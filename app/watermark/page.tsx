'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import SelectedFileCard from '@/components/SelectedFileCard'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { watermarkPdf } from '@/lib/watermarkPdf'
import { validatePdf } from '@/lib/validate'

export default function WatermarkPage() {
  const [file, setFile]       = useState<File | null>(null)
  const [text, setText]       = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.3)
  const [angle, setAngle]     = useState(45)
  const [status, setStatus]   = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [error, setError]     = useState('')

  const canWatermark = !!file && text.trim().length > 0 && status !== 'processing'

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError('')
  }

  function reset() { setFile(null); setStatus('idle'); setError('') }

  const handleWatermark = useCallback(async () => {
    if (!file || !text.trim()) return
    setStatus('processing'); setError('')
    try {
      const bytes = await watermarkPdf(file, { text: text.trim(), opacity, angle })
      const stem  = file.name.replace(/\.pdf$/i, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}_watermarked.pdf`)
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, text, opacity, angle])

  useCmdEnter(handleWatermark, canWatermark)

  return (
    <ToolLayout code="08 / WATERMARK" title="Watermark PDF"
      subtitle="Stamp a text watermark on every page of your PDF.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <SelectedFileCard file={file} onChange={reset} />
        )}

        {file && (
          <div className="tool-stack tool-stack--md">
            <div>
              <p className="section-label">Watermark text</p>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                className="form-input"
              />
            </div>

            <div>
              <div className="range-row">
                <span className="section-label section-label--inline">Opacity</span>
                <span className="mono range-value">{Math.round(opacity * 100)}%</span>
              </div>
              <input type="range" min={0.05} max={0.9} step={0.05} value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="range-input" />
              <div className="mono range-axis">
                <span>subtle</span>
                <span>visible</span>
              </div>
            </div>

            <div>
              <div className="range-row">
                <span className="section-label section-label--inline">Angle</span>
                <span className="mono range-value">{angle}°</span>
              </div>
              <input type="range" min={0} max={90} step={5} value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="range-input" />
              <div className="mono range-axis">
                <span>horizontal</span>
                <span>diagonal</span>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && <Err msg={error} onRetry={file ? handleWatermark : undefined} />}
        {status === 'done'  && <Ok msg="watermarked PDF saved" onReset={reset} />}

        <ActionBtn onClick={handleWatermark} disabled={!canWatermark} loading={status === 'processing'} hint="⌘ Enter">
          Add Watermark →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
