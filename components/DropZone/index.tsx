'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface DropZoneProps {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  label?: string
}

export default function DropZone({ accept, multiple = false, onFiles, label }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [pressing, setPressing] = useState(false)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f =>
      accept.split(',').map(s => s.trim().toLowerCase()).some(ext => f.name.toLowerCase().endsWith(ext))
    )
    if (files.length) onFiles(multiple ? files : [files[0]])
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(multiple ? files : [files[0]])
    e.target.value = ''
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
      onDrop={handleDrop}
      role="button" tabIndex={0} aria-label="Upload files"
      onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-2)'}`,
        borderRadius: 'var(--radius)',
        background: dragging ? 'rgba(255,68,0,0.03)' : pressing ? 'var(--surface-2)' : 'var(--surface)',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        cursor: 'pointer', userSelect: 'none', outline: 'none',
        transition: 'border-color 0.15s, background 0.12s, transform 0.1s',
        transform: pressing ? 'scale(0.998)' : dragging ? 'scale(1.006)' : 'scale(1)',
        boxShadow: dragging ? '0 0 0 4px rgba(255,68,0,0.06)' : 'none',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 8,
        border: `1.5px solid ${dragging ? 'var(--accent)' : 'var(--border-2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: dragging ? 'var(--accent)' : 'var(--text-3)',
        background: dragging ? 'rgba(255,68,0,0.06)' : 'var(--surface-2)',
        transition: 'all 0.15s',
        transform: dragging ? 'translateY(-2px)' : 'none',
      }}>
        {dragging ? '↓' : '+'}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3, transition: 'color 0.15s' }}>
          {dragging ? 'Release to add' : (label ?? 'Drop files here or click to browse')}
        </p>
        <p className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          {accept.replace(/\./g, '').toUpperCase().replace(/,\s*/g, ' / ')}
        </p>
      </div>

      <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={handleChange} />
    </div>
  )
}
