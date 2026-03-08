'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import FileList from '@/components/FileList'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { mergePdfs } from '@/lib/mergePdf'

export default function MergePage() {
  const [files, setFiles]   = useState<File[]>([])
  const [status, setStatus] = useState<'idle'|'processing'|'done'|'error'>('idle')
  const [error, setError]   = useState('')
  const [resultMsg, setResultMsg] = useState('')

  const canMerge = files.length >= 2 && status !== 'processing'

  function addFiles(newFiles: File[]) { setFiles(p => [...p, ...newFiles]); if (status==='done') setStatus('idle') }
  function removeFile(i: number)     { setFiles(p => p.filter((_,j)=>j!==i)); if (status==='done') setStatus('idle') }
  function reorder(from: number, to: number) {
    setFiles(p => { const a=[...p]; const [x]=a.splice(from,1); a.splice(to,0,x); return a })
  }
  function reset() { setFiles([]); setStatus('idle'); setError('') }

  const handleMerge = useCallback(async () => {
    if (!canMerge) return
    setStatus('processing'); setError('')
    try {
      const bytes = await mergePdfs(files)
      const stem = files[0].name.replace(/\.pdf$/i, '')
      const outName = `${stem}_merged.pdf`
      saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), outName)
      setResultMsg(`${outName} saved — ${files.length} files combined`)
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [files, canMerge])

  useCmdEnter(handleMerge, canMerge)

  return (
    <ToolLayout code="01 / MERGE" title="Merge PDF" subtitle="Add files, drag to reorder, then merge into one PDF.">
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <DropZone accept=".pdf" multiple onFiles={addFiles}
          label={files.length ? `Add more PDF files (${files.length} added)` : 'Drop PDF files here'} />

        {files.length > 0 && <FileList files={files} onRemove={removeFile} onReorder={reorder} />}

        {files.length === 1 && status === 'idle' && (
          <p className="mono" style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'0.04em' }}>
            ↑ add at least one more PDF to merge
          </p>
        )}

        {status === 'processing' && <ProgressBar current={1} total={1} label="Merging" />}
        {status === 'error'      && <Err msg={error} />}
        {status === 'done'       && <Ok msg={resultMsg} onReset={reset} />}

        <ActionBtn onClick={handleMerge} disabled={!canMerge} loading={status==='processing'} hint="⌘ Enter">
          Merge {files.length >= 2 ? `${files.length} PDFs` : 'PDFs'} →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
