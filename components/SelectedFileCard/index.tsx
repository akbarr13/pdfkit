import { formatBytes } from '@/lib/format'

interface SelectedFileCardProps {
  file: File
  onChange: () => void
  hint?: string
  showSize?: boolean
}

export default function SelectedFileCard({ file, onChange, hint, showSize = true }: SelectedFileCardProps) {
  return (
    <div className="file-card">
      <div className="file-card__row">
        <div className="file-card__body">
          <p className="file-name">{file.name}</p>
          {showSize && <p className="mono file-size">{formatBytes(file.size)}</p>}
        </div>
        <button onClick={onChange} className="change-btn">change</button>
      </div>
      {hint && <div className="mono file-card__hint">{hint}</div>}
    </div>
  )
}
