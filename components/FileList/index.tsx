'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { formatBytes } from '@/lib/format'

interface FileListProps {
  files: File[]
  onRemove: (index: number) => void
  onReorder?: (from: number, to: number) => void
  thumbnails?: string[]
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
    <div className="file-list">
      <div className="mono file-list__head" style={{ gridTemplateColumns: colTemplate }}>
        <span>#</span>
        {thumbnails && <span />}
        <span>FILE</span>
        <span className="file-list__head--right">SIZE</span>
        <span />
      </div>

      {files.map((f, i) => {
        const isDragging = dragIdx === i
        const isOver = overIdx === i && dragIdx !== null && dragIdx !== i
        const rowCls = [
          'file-list__row',
          onReorder ? 'is-draggable' : '',
          isDragging ? 'is-dragging' : '',
          isOver && overIdx! < dragIdx! ? 'is-over' : '',
        ].filter(Boolean).join(' ')

        return (
          <div
            key={i}
            ref={isDragging ? dragNode : null}
            draggable={!!onReorder}
            onDragStart={e => handleDragStart(e, i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={e => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            className={rowCls}
            style={{ gridTemplateColumns: colTemplate }}
          >
            <span className="mono file-list__num">
              {String(i + 1).padStart(2, '0')}
            </span>

            {thumbnails && (
              thumbnails[i]
                ? <Image src={thumbnails[i]} alt="" width={40} height={40} unoptimized className="file-list__thumb-img" />
                : <div className="file-list__thumb-empty" />
            )}

            <span className="file-list__name" title={f.name}>{f.name}</span>

            <span className="mono file-list__size">{formatBytes(f.size)}</span>

            <button
              onClick={e => { e.stopPropagation(); onRemove(i) }}
              title="Remove"
              className="file-list__remove"
            >×</button>
          </div>
        )
      })}

      {onReorder && files.length > 1 && (
        <div className="mono file-list__hint">drag rows to reorder</div>
      )}
    </div>
  )
}
