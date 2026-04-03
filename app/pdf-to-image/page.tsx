'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import { zipSync } from 'fflate'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { pdfToImages } from '@/lib/pdfToImage'
import { validatePdf } from '@/lib/validate'
import { usePreference } from '@/lib/usePreference'

type Format = 'jpeg' | 'png'

const scales = [
  { value: 1,   label: '72 dpi',  note: 'fast'   },
  { value: 1.5, label: '108 dpi', note: 'good'   },
  { value: 2,   label: '144 dpi', note: 'sharp'  },
  { value: 3,   label: '216 dpi', note: 'hi-res' },
]

export default function PdfToImagePage() {
  const [file, setFile]     = useState<File | null>(null)
  const [format, setFormat] = usePreference<Format>('pdf-to-image:format', 'jpeg')
  const [scale, setScale]   = usePreference<number>('pdf-to-image:scale', 2)
  const [dlMode, setDlMode] = useState<'zip' | 'bulk'>('zip')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError]   = useState('')

  const canConvert = !!file && status !== 'processing'

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError('')
  }

  function reset() { setFile(null); setStatus('idle'); setError('') }

  const handleConvert = useCallback(async () => {
    if (!file) return
    setStatus('processing'); setError(''); setProgress({ current: 0, total: 0 })
    try {
      const blobs = await pdfToImages(file, format, scale, (c, t) => setProgress({ current: c, total: t }))
      const stem = file.name.replace(/\.pdf$/i, '')

      if (dlMode === 'zip') {
        const files: Record<string, Uint8Array> = {}
        for (let i = 0; i < blobs.length; i++) {
          const buf = await blobs[i].arrayBuffer()
          files[`${stem}_${String(i + 1).padStart(3, '0')}.${format}`] = new Uint8Array(buf)
        }
        const zip = zipSync(files)
        saveAs(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }), `${stem}_images.zip`)
      } else {
        for (let i = 0; i < blobs.length; i++) {
          saveAs(blobs[i], `${stem}_${String(i + 1).padStart(3, '0')}.${format}`)
          await new Promise(r => setTimeout(r, 60))
        }
      }

      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, format, scale, dlMode])

  useCmdEnter(handleConvert, canConvert)

  return (
    <ToolLayout code="04 / PDF → IMAGE" title="PDF to Image"
      subtitle="Each page renders as a separate image. All files download automatically.">
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
            <div>
              <p className="section-label">Format</p>
              <div className="seg-control">
                <button onClick={() => setFormat('jpeg')} className={`seg-btn${format === 'jpeg' ? ' active' : ''}`}>
                  JPEG &nbsp;<span style={{ fontWeight: 400, fontSize: 11, opacity: 0.75 }}>smaller, lossy</span>
                </button>
                <button onClick={() => setFormat('png')} className={`seg-btn${format === 'png' ? ' active' : ''}`}>
                  PNG &nbsp;<span style={{ fontWeight: 400, fontSize: 11, opacity: 0.75 }}>lossless, larger</span>
                </button>
              </div>
            </div>

            <div>
              <p className="section-label">Download as</p>
              <div className="seg-control">
                <button onClick={() => setDlMode('zip')} className={`seg-btn${dlMode === 'zip' ? ' active' : ''}`}>ZIP archive</button>
                <button onClick={() => setDlMode('bulk')} className={`seg-btn${dlMode === 'bulk' ? ' active' : ''}`}>Individual files</button>
              </div>
            </div>

            <div>
              <p className="section-label">Resolution</p>
              <div className="grid-4col">
                {scales.map(s => (
                  <button key={s.value} onClick={() => setScale(s.value)} className={`preset-btn${scale === s.value ? ' active' : ''}`}>
                    <p className="mono" style={{ fontSize: 12, fontWeight: 600, color: scale === s.value ? 'var(--accent)' : 'var(--text)', marginBottom: 2 }}>{s.label}</p>
                    <p className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.note}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {status === 'processing' && <ProgressBar current={progress.current} total={progress.total} label="Rendering pages" />}
        {status === 'error'      && <Err msg={error} onRetry={canConvert ? handleConvert : undefined} />}
        {status === 'done'       && <Ok msg={dlMode === 'zip' ? `${progress.total} images packed → ZIP` : `${progress.total} image${progress.total > 1 ? 's' : ''} saved as .${format}`} onReset={reset} />}

        <ActionBtn onClick={handleConvert} disabled={!canConvert} loading={status === 'processing'} hint="⌘ Enter">
          Convert to {format.toUpperCase()} →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
