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
        <div className="page-drop-overlay__icon">↓</div>
        <p className="page-drop-overlay__title">Drop to load</p>
        <p className="mono page-drop-overlay__hint">{formatHint}</p>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {overlay}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
        onDrop={handleDrop}
        role="button" tabIndex={0} aria-label="Upload files"
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        className={`dropzone${dragging ? ' is-dragging' : ''}`}
      >
        <div className="dropzone__icon">
          {dragging ? '↓' : '+'}
        </div>

        <div className="dropzone__text">
          <p className="dropzone__title">
            {dragging ? 'Release to load' : (label ?? 'Drop files here or click to browse')}
          </p>
          <p className="mono dropzone__hint">{formatHint}</p>
        </div>

        <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={handleChange} />
      </div>
    </>
  )
}
