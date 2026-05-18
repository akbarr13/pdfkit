'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import SelectedFileCard from '@/components/SelectedFileCard'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { getPdfMetadata, editMetadata, PdfMetadata } from '@/lib/editMetadata'
import { validatePdf } from '@/lib/validate'

const FIELDS: { key: keyof PdfMetadata; label: string; placeholder: string }[] = [
  { key: 'title',    label: 'Title',    placeholder: 'Document title'             },
  { key: 'author',   label: 'Author',   placeholder: 'Author name'                },
  { key: 'subject',  label: 'Subject',  placeholder: 'Subject or description'     },
  { key: 'keywords', label: 'Keywords', placeholder: 'keyword1, keyword2, ...'    },
  { key: 'creator',  label: 'Creator',  placeholder: 'App or tool that created this' },
]

export default function MetadataPage() {
  const [file, setFile]       = useState<File | null>(null)
  const [meta, setMeta]       = useState<PdfMetadata>({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus]   = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [error, setError]     = useState('')

  const canSave = !!file && status !== 'processing' && !loading

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError(''); setMeta({})
    setLoading(true)
    getPdfMetadata(f)
      .then(m => setMeta(m))
      .catch(() => setMeta({}))
      .finally(() => setLoading(false))
  }

  function reset() { setFile(null); setMeta({}); setStatus('idle'); setError('') }

  const handleSave = useCallback(async () => {
    if (!file) return
    setStatus('processing'); setError('')
    try {
      const bytes = await editMetadata(file, meta)
      const stem  = file.name.replace(/\.pdf$/i, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}_meta.pdf`)
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, meta])

  useCmdEnter(handleSave, canSave)

  function setField(key: keyof PdfMetadata, value: string) {
    setMeta(m => ({ ...m, [key]: value }))
    if (status === 'done') setStatus('idle')
  }

  return (
    <ToolLayout code="09 / METADATA" title="Edit Metadata"
      subtitle="Read and update embedded PDF metadata: title, author, subject, keywords, and creator.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <SelectedFileCard file={file} onChange={reset} showSize={false} />
        )}

        {file && loading && (
          <div className="mono meta-line">reading metadata...</div>
        )}

        {file && !loading && (
          <div className="tool-stack tool-stack--tight">
            {FIELDS.map(f => (
              <div key={f.key}>
                <p className="section-label">{f.label}</p>
                <input
                  type="text"
                  value={meta[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="form-input"
                />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && <Err msg={error} onRetry={canSave ? handleSave : undefined} />}
        {status === 'done'  && <Ok msg="metadata updated — new PDF downloaded" onReset={reset} />}

        <ActionBtn onClick={handleSave} disabled={!canSave} loading={status === 'processing'} hint="⌘ Enter">
          Save Metadata →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
