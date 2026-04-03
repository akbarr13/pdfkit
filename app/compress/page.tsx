'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { compressPdf } from '@/lib/compressPdf'
import { validatePdf } from '@/lib/validate'
import { usePreference } from '@/lib/usePreference'

function fmt(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

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
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface)' }}>
            <div className="file-info-row" style={{ border: 'none', borderRadius: 0 }}>
              <div className="file-info-row__body">
                <p className="file-name">{file.name}</p>
                <p className="mono file-size">{fmt(file.size)}</p>
              </div>
              <button onClick={reset} className="change-btn">change</button>
            </div>
            {file.size < 150 * 1024 && (
              <div className="mono" style={{ padding: '6px 14px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-3)' }}>
                ↑ file already small — compression benefit may be minimal
              </div>
            )}
          </div>
        )}

        {file && (
          <div>
            <p className="section-label">Quality preset</p>
            <div className="grid-4col">
              {presets.map(p => (
                <button key={p.id} onClick={() => setPreset(p.id)} className={`preset-btn${preset === p.id ? ' active' : ''}`}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: preset === p.id ? 'var(--accent)' : 'var(--text)', marginBottom: 2 }}>{p.label}</p>
                  <p className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{p.note}</p>
                </button>
              ))}
            </div>

            {preset === 'custom' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Quality</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{Math.round(customQ * 100)}%</span>
                </div>
                <input type="range" min={0.1} max={1} step={0.05} value={customQ}
                  onChange={e => setCustomQ(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>smallest</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>best quality</span>
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
            return `compressed.pdf saved · ${fmt(result.orig)} → ${fmt(result.next)} (${diff})`
          })()} onReset={reset} />
        )}

        <ActionBtn onClick={handleCompress} disabled={!canCompress} loading={status === 'processing'} hint="⌘ Enter">
          Compress PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
