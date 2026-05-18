interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="progress anim-fade-down">
      <div className="progress__header">
        <span className="mono progress__title">
          {(label ?? 'PROCESSING').toUpperCase()}
          {total > 0 && (
            <span className="progress__count">
              {current} <span className="progress__count-sep">/</span> {total}
            </span>
          )}
        </span>
        <span className="mono progress__pct">{pct}%</span>
      </div>
      <div className="progress__track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
