'use client'

import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react'
import { createPortal } from 'react-dom'

interface DropZoneProps {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  label?: string
}

export default function DropZone({ accept, multiple = false, onFiles, label }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]       = useState(false)
  const [pageDragging, setPageDragging] = useState(false)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Filter files by accepted extension
  function filterFiles(files: File[]) {
    const exts = accept.split(',').map(s => s.trim().toLowerCase())
    return files.filter(f => exts.some(ext => f.name.toLowerCase().endsWith(ext.replace(/^\./, ''))))
  }

  // Page-level drop — catch drags anywhere on the page
  useEffect(() => {
    let count = 0

    function onDragEnter(e: globalThis.DragEvent) {
      e.preventDefault()
      count++
      setPageDragging(true)
    }
    function onDragOver(e: globalThis.DragEvent) { e.preventDefault() }
    function onDragLeave() {
      count--
      if (count <= 0) { count = 0; setPageDragging(false) }
    }
    function onDrop(e: globalThis.DragEvent) {
      e.preventDefault()
      count = 0
      setPageDragging(false)
      setDragging(false)
      const files = filterFiles(Array.from(e.dataTransfer?.files ?? []))
      if (files.length) onFiles(multiple ? files : [files[0]])
    }

    document.addEventListener('dragenter', onDragEnter)
    document.addEventListener('dragover',  onDragOver)
    document.addEventListener('dragleave', onDragLeave)
    document.addEventListener('drop',      onDrop)

    return () => {
      document.removeEventListener('dragenter', onDragEnter)
      document.removeEventListener('dragover',  onDragOver)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('drop',      onDrop)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accept, multiple, onFiles])

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = filterFiles(Array.from(e.dataTransfer.files))
    if (files.length) onFiles(multiple ? files : [files[0]])
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(multiple ? files : [files[0]])
    e.target.value = ''
  }

  const formatHint = accept.replace(/\./g, '').toUpperCase().replace(/,\s*/g, ' / ')

  const overlay = mounted && pageDragging ? createPortal(
    <div className="page-drop-overlay">
      <div className="page-drop-overlay__inner">
        <div style={{ fontSize: 40, marginBottom: 12, color: 'var(--accent)', animation: 'fadeUp 0.25s ease both' }}>↓</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Drop to load</p>
        <p className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{formatHint}</p>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {overlay}
      <div
        onClick={() => inputRef.current?.click()}
        onMouseDown={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.998)'}
        onMouseUp={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
        onDrop={handleDrop}
        role="button" tabIndex={0} aria-label="Upload files"
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-2)'}`,
          borderRadius: 'var(--radius)',
          background: dragging ? 'rgba(255,68,0,0.03)' : 'var(--surface)',
          padding: '40px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          cursor: 'pointer', userSelect: 'none', outline: 'none',
          transition: 'border-color 0.15s, background 0.12s, transform 0.1s, box-shadow 0.15s',
          transform: dragging ? 'scale(1.008)' : 'scale(1)',
          boxShadow: dragging ? '0 0 0 4px rgba(255,68,0,0.07), 0 4px 20px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          border: `1.5px solid ${dragging ? 'var(--accent)' : 'var(--border-2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: dragging ? 'var(--accent)' : 'var(--text-3)',
          background: dragging ? 'rgba(255,68,0,0.06)' : 'var(--surface-2)',
          transition: 'all 0.15s',
          transform: dragging ? 'translateY(-3px)' : 'none',
        }}>
          {dragging ? '↓' : '+'}
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: dragging ? 'var(--accent)' : 'var(--text)', marginBottom: 4, transition: 'color 0.15s' }}>
            {dragging ? 'Release to load' : (label ?? 'Drop files here or click to browse')}
          </p>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
            {formatHint}
          </p>
        </div>

        <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={handleChange} />
      </div>
    </>
  )
}
