'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import FileList from '@/components/FileList'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { imagesToPdf } from '@/lib/imageToPdf'

function fmt(b: number) {
  if (b<1024*1024) return (b/1024).toFixed(0)+' KB'
  return (b/(1024*1024)).toFixed(2)+' MB'
}

export default function ImageToPdfPage() {
  const [files, setFiles]       = useState<File[]>([])
  const [thumbs, setThumbs]     = useState<string[]>([])
  const [status, setStatus]     = useState<'idle'|'processing'|'done'|'error'>('idle')
  const [error, setError]       = useState('')
  const [result, setResult]     = useState<{size:number;pages:number}|null>(null)

  const prevThumbs = useRef<string[]>([])
  useEffect(() => { prevThumbs.current.forEach(URL.revokeObjectURL) }, [thumbs])

  function addFiles(newFiles: File[]) {
    setFiles(p=>[...p,...newFiles])
    setThumbs(p=>[...p,...newFiles.map(f=>URL.createObjectURL(f))])
    if (status==='done') setStatus('idle')
  }
  function removeFile(i: number) {
    URL.revokeObjectURL(thumbs[i])
    setFiles(p=>p.filter((_,j)=>j!==i))
    setThumbs(p=>p.filter((_,j)=>j!==i))
    if (status==='done') setStatus('idle')
  }
  function reorder(from: number, to: number) {
    const mv = <T,>(a: T[]) => { const b=[...a]; const [x]=b.splice(from,1); b.splice(to,0,x); return b }
    setFiles(mv); setThumbs(mv)
  }
  function reset() {
    thumbs.forEach(URL.revokeObjectURL)
    setFiles([]); setThumbs([]); setStatus('idle'); setResult(null); setError('')
  }

  const canConvert = files.length>0 && status!=='processing'

  const handleConvert = useCallback(async () => {
    if (!files.length) return
    setStatus('processing'); setError('')
    try {
      const bytes = await imagesToPdf(files)
      const stem = files[0].name.replace(/\.[^.]+$/, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer],{type:'application/pdf'}),`${stem}.pdf`)
      setResult({size:bytes.length, pages:files.length})
      setStatus('done')
    } catch(e) { setError(String(e)); setStatus('error') }
  }, [files])

  useCmdEnter(handleConvert, canConvert)

  return (
    <ToolLayout code="05 / IMAGE → PDF" title="Image to PDF"
      subtitle="Each image becomes one page. Drag rows to set the page order.">
      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        <DropZone accept=".jpg,.jpeg,.png" multiple onFiles={addFiles}
          label={files.length ? `Add more images (${files.length} added)` : 'Drop JPG or PNG images here'} />

        {files.length>0 && <FileList files={files} onRemove={removeFile} onReorder={reorder} thumbnails={thumbs} />}

        {status==='error' && <Err msg={error} />}
        {status==='done' && result && (
          <Ok msg={`images.pdf saved · ${result.pages} page${result.pages>1?'s':''} · ${fmt(result.size)}`} onReset={reset} />
        )}

        <ActionBtn onClick={handleConvert} disabled={!canConvert} loading={status==='processing'} hint="⌘ Enter">
          {files.length>0 ? `Build PDF from ${files.length} image${files.length>1?'s':''} →` : 'Build PDF →'}
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
