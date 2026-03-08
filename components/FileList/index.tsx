'use client'

import { useState, useRef } from 'react'

interface FileListProps {
  files: File[]
  onRemove: (index: number) => void
  onReorder?: (from: number, to: number) => void
  thumbnails?: string[]
}

function fmt(b: number) {
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function FileList({ files, onRemove, onReorder, thumbnails }: FileListProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const dragNode = useRef<HTMLDivElement | null>(null)

  if (!files.length) return null

  function handleDragStart(e: React.DragEvent, i: number) {
    setDragIdx(i)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => { if (dragNode.current) dragNode.current.style.opacity = '0.4' }, 0)
  }
  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'
    if (i !== overIdx) setOverIdx(i)
  }
  function handleDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== i) onReorder?.(dragIdx, i)
    setDragIdx(null); setOverIdx(null)
  }
  function handleDragEnd() {
    if (dragNode.current) dragNode.current.style.opacity = ''
    setDragIdx(null); setOverIdx(null)
  }

  const colTemplate = thumbnails ? '24px 48px 1fr 64px 28px' : '24px 1fr 64px 28px'

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Header */}
      <div className="mono" style={{
        display: 'grid', gridTemplateColumns: colTemplate, gap: 10,
        padding: '7px 14px', background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', alignItems: 'center',
      }}>
        <span>#</span>
        {thumbnails && <span />}
        <span>FILE</span>
        <span style={{ textAlign: 'right' }}>SIZE</span>
        <span />
      </div>

      {files.map((f, i) => {
        const isDragging = dragIdx === i
        const isOver = overIdx === i && dragIdx !== null && dragIdx !== i
        return (
          <div
            key={i}
            ref={isDragging ? dragNode : null}
            draggable={!!onReorder}
            onDragStart={e => handleDragStart(e, i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={e => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            style={{
              display: 'grid', gridTemplateColumns: colTemplate, gap: 10,
              padding: '10px 14px', alignItems: 'center',
              background: isDragging ? 'var(--surface-3)' : i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
              borderBottom: i < files.length - 1 ? '1px solid var(--border)' : 'none',
              borderTop: isOver && overIdx! < dragIdx! ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: onReorder ? 'grab' : 'default',
              transition: 'background 0.1s',
              userSelect: 'none',
            }}
          >
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>

            {thumbnails && (
              thumbnails[i]
                ? <img src={thumbnails[i]} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, display: 'block', border: '1px solid var(--border)' }} />
                : <div style={{ width: 40, height: 40, background: 'var(--surface-3)', borderRadius: 4, border: '1px solid var(--border)' }} />
            )}

            <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>
              {f.name}
            </span>

            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right' }}>
              {fmt(f.size)}
            </span>

            <button onClick={e => { e.stopPropagation(); onRemove(i) }} title="Remove"
              style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: '1px solid transparent', borderRadius: 4,
                cursor: 'pointer', color: 'var(--text-3)', fontSize: 15, transition: 'all 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#cc2222'
                e.currentTarget.style.borderColor = 'rgba(200,40,40,0.2)'
                e.currentTarget.style.background = 'rgba(200,40,40,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-3)'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.background = 'none'
              }}>×</button>
          </div>
        )
      })}

      {onReorder && files.length > 1 && (
        <div className="mono" style={{
          padding: '5px 14px', background: 'var(--surface-2)',
          borderTop: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em',
        }}>
          drag rows to reorder
        </div>
      )}
    </div>
  )
}
