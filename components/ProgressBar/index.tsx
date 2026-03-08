interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '12px 14px', background: 'var(--surface)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          {(label ?? 'PROCESSING').toUpperCase()} — {current}/{total}
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2 }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: 'var(--accent)',
          borderRadius: 2, transition: 'width 0.25s ease',
        }} />
      </div>
    </div>
  )
}
