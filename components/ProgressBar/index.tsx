interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="anim-fade-down" style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '12px 14px', background: 'var(--surface)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          {(label ?? 'PROCESSING').toUpperCase()}
          {total > 0 && (
            <span style={{ marginLeft: 8, color: 'var(--text-2)' }}>
              {current} <span style={{ opacity: 0.5 }}>/</span> {total}
            </span>
          )}
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
