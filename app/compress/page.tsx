'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import SelectedFileCard from '@/components/SelectedFileCard'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { compressPdf } from '@/lib/compressPdf'
import { validatePdf } from '@/lib/validate'
import { usePreference } from '@/lib/usePreference'
import { formatBytes } from '@/lib/format'

const presets = [
  { id: 'screen', label: 'Screen', q: 0.35, note: 'smallest' },
  { id: 'web',    label: 'Web',    q: 0.60, note: 'balanced' },
  { id: 'print',  label: 'Print',  q: 0.85, note: 'sharp'    },
  { id: 'custom', label: 'Custom', q: -1,   note: 'manual'   },
]

export default function CompressPage() {
  const [file, setFile]     = useState<File | null>(null)
  const [preset, setPreset] = usePreference('compress:preset', 'web')
  const [customQ, setCustomQ] = usePreference('compress:customQ', 0.6)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError]   = useState('')
  const [result, setResult] = useState<{ orig: number; next: number } | null>(null)

  const quality    = preset === 'custom' ? customQ : (presets.find(p => p.id === preset)?.q ?? 0.6)
  const canCompress = !!file && status !== 'processing'

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError(''); setResult(null)
  }

  function reset() { setFile(null); setStatus('idle'); setResult(null); setError('') }

  const handleCompress = useCallback(async () => {
    if (!file) return
    setStatus('processing'); setError(''); setResult(null)
    try {
      const bytes = await compressPdf(file, quality, (c, t) => setProgress({ current: c, total: t }))
      const stem  = file.name.replace(/\.pdf$/i, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}_compressed.pdf`)
      setResult({ orig: file.size, next: bytes.length })
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, quality])

  useCmdEnter(handleCompress, canCompress)

  return (
    <ToolLayout code="03 / COMPRESS" title="Compress PDF"
      subtitle="Converts pages to compressed images. Best for scanned documents — text won't be selectable after.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <SelectedFileCard
            file={file}
            onChange={reset}
            hint={file.size < 150 * 1024 ? '↑ file already small — compression benefit may be minimal' : undefined}
          />
        )}

        {file && (
          <div>
            <p className="section-label">Quality preset</p>
            <div className="grid-4col">
              {presets.map(p => (
                <button key={p.id} onClick={() => setPreset(p.id)} className={`preset-btn${preset === p.id ? ' active' : ''}`}>
                  <p className="preset-btn__title">{p.label}</p>
                  <p className="mono preset-btn__note">{p.note}</p>
                </button>
              ))}
            </div>

            {preset === 'custom' && (
              <div style={{ marginTop: 12 }}>
                <div className="range-row">
                  <span className="range-label section-label section-label--inline">Quality</span>
                  <span className="mono range-value">{Math.round(customQ * 100)}%</span>
                </div>
                <input type="range" min={0.1} max={1} step={0.05} value={customQ}
                  onChange={e => setCustomQ(Number(e.target.value))}
                  className="range-input" />
                <div className="mono range-axis">
                  <span>smallest</span>
                  <span>best quality</span>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'processing' && <ProgressBar current={progress.current} total={progress.total} label="Compressing pages" />}
        {status === 'error'      && <Err msg={error} onRetry={file ? handleCompress : undefined} />}
        {status === 'done' && result && (
          <Ok msg={(() => {
            const pct  = Math.round((1 - result.next / result.orig) * 100)
            const diff = pct > 0 ? `${pct}% smaller` : pct < 0 ? `${Math.abs(pct)}% larger` : 'same size'
            return `compressed.pdf saved · ${formatBytes(result.orig)} → ${formatBytes(result.next)} (${diff})`
          })()} onReset={reset} />
        )}

        <ActionBtn onClick={handleCompress} disabled={!canCompress} loading={status === 'processing'} hint="⌘ Enter">
          Compress PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
