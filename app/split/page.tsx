'use client'

import { useState, useCallback, useMemo } from 'react'
import { saveAs } from 'file-saver'
import { zipSync } from 'fflate'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { splitPdf, splitPdfByPage, SplitRange } from '@/lib/splitPdf'
import { validatePdf } from '@/lib/validate'

function parseRanges(text: string): SplitRange[] {
  return text.split(',').map(s => s.trim()).filter(Boolean).flatMap(s => {
    const p = s.split('-').map(n => parseInt(n.trim(), 10))
    if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]) && p[0] > 0 && p[1] >= p[0]) return [{ from: p[0], to: p[1] }]
    if (p.length === 1 && !isNaN(p[0]) && p[0] > 0) return [{ from: p[0], to: p[0] }]
    return []
  })
}

export default function SplitPage() {
  const [file, setFile]     = useState<File | null>(null)
  const [mode, setMode]     = useState<'pages' | 'ranges'>('pages')
  const [dlMode, setDlMode] = useState<'zip' | 'bulk'>('zip')
  const [rangesText, setRangesText] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError]   = useState('')

  const parsed       = useMemo(() => parseRanges(rangesText), [rangesText])
  const rangeInvalid = !!rangesText.trim() && parsed.length === 0
  const preview      = rangesText.trim() ? (parsed.length > 0 ? `→ ${parsed.length} file${parsed.length > 1 ? 's' : ''}` : '→ invalid') : null

  const canSplit = !!file && status !== 'processing' && (mode === 'pages' || parsed.length > 0)

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError('')
  }

  function reset() { setFile(null); setStatus('idle'); setError(''); setRangesText('') }

  const handleSplit = useCallback(async () => {
    if (!file || !canSplit) return
    setStatus('processing'); setError('')
    try {
      const results = mode === 'pages' ? await splitPdfByPage(file) : await splitPdf(file, parsed)
      const stem = file.name.replace(/\.pdf$/i, '')
      setProgress({ current: 0, total: results.length })

      if (dlMode === 'zip') {
        const files: Record<string, Uint8Array> = {}
        for (let i = 0; i < results.length; i++) {
          files[`${stem}_${String(i + 1).padStart(3, '0')}.pdf`] = results[i]
          setProgress({ current: i + 1, total: results.length })
        }
        const zip = zipSync(files)
        saveAs(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }), `${stem}_split.zip`)
      } else {
        for (let i = 0; i < results.length; i++) {
          saveAs(new Blob([results[i].buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}_${String(i + 1).padStart(3, '0')}.pdf`)
          setProgress({ current: i + 1, total: results.length })
          await new Promise(r => setTimeout(r, 80))
        }
      }

      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, mode, dlMode, parsed, canSplit])

  useCmdEnter(handleSplit, canSplit)

  return (
    <ToolLayout code="02 / SPLIT" title="Split PDF" subtitle="Extract individual pages, or define custom page ranges.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <div className="file-info-row">
            <span className="file-name">{file.name}</span>
            <button onClick={reset} className="change-btn">change file</button>
          </div>
        )}

        {file && (
          <>
            <div className="seg-control">
              <button onClick={() => setMode('pages')} className={`seg-btn${mode === 'pages' ? ' active' : ''}`}>One file per page</button>
              <button onClick={() => setMode('ranges')} className={`seg-btn${mode === 'ranges' ? ' active' : ''}`}>Custom ranges</button>
            </div>

            {mode === 'ranges' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <label className="section-label" style={{ marginBottom: 0 }}>Page ranges — comma-separated</label>
                  {preview && <span className="mono" style={{ fontSize: 11, color: rangeInvalid ? '#c0392b' : 'var(--accent)' }}>{preview}</span>}
                </div>
                <input type="text" value={rangesText} onChange={e => setRangesText(e.target.value)}
                  placeholder="1-3, 4-6, 7"
                  className="form-input"
                  style={{ borderColor: rangeInvalid ? '#f5c6c6' : undefined }}
                  onFocus={e => (e.target.style.borderColor = rangeInvalid ? '#e07070' : 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = rangeInvalid ? '#f5c6c6' : 'var(--border)')} />
                <p className="mono" style={{ marginTop: 5, fontSize: 10, color: 'var(--text-3)' }}>
                  each range → one PDF · single page: 7 · range: 2-5
                </p>
              </div>
            )}

            <div>
              <label className="section-label">Download as</label>
              <div className="seg-control">
                <button onClick={() => setDlMode('zip')} className={`seg-btn${dlMode === 'zip' ? ' active' : ''}`}>ZIP archive</button>
                <button onClick={() => setDlMode('bulk')} className={`seg-btn${dlMode === 'bulk' ? ' active' : ''}`}>Individual files</button>
              </div>
            </div>
          </>
        )}

        {status === 'processing' && <ProgressBar current={progress.current} total={progress.total} label={dlMode === 'zip' ? 'Packing' : 'Downloading'} />}
        {status === 'error'      && <Err msg={error} onRetry={canSplit ? handleSplit : undefined} />}
        {status === 'done'       && <Ok msg={dlMode === 'zip' ? `${progress.total} files packed → ZIP` : `${progress.total} file${progress.total > 1 ? 's' : ''} downloaded`} onReset={reset} />}

        <ActionBtn onClick={handleSplit} disabled={!canSplit} loading={status === 'processing'} hint="⌘ Enter">
          Split PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
