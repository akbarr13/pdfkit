import type { PasswordStrength as StrengthLevel } from '@/lib/validate'

export function Err({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="anim-fade-down" style={{
      padding: '10px 14px',
      background: '#fff5f5',
      border: '1px solid #fcc',
      borderLeft: '3px solid #e03333',
      borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <p className="mono" style={{ fontSize: 11, color: '#b91c1c', letterSpacing: '0.04em' }}>
        ERROR — {msg}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mono"
          style={{
            background: 'none', border: '1px solid #fcc', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', color: '#b91c1c', fontSize: 10, padding: '3px 8px',
            letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'inherit',
            transition: 'all 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#e03333'
            e.currentTarget.style.background = 'rgba(224,51,51,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#fcc'
            e.currentTarget.style.background = 'none'
          }}>
          retry
        </button>
      )}
    </div>
  )
}

export function Ok({ msg, onReset }: { msg: string; onReset: () => void }) {
  return (
    <div className="anim-pop" style={{
      padding: '14px 16px',
      background: 'linear-gradient(135deg, #fff9f7 0%, #fff4ef 100%)',
      border: '1px solid rgba(255,68,0,0.18)',
      borderLeft: '3px solid var(--accent)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>✓</span>
        <p className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.04em', lineHeight: 1.5 }}>
          {msg}
        </p>
      </div>
      <button onClick={onReset} className="mono"
        style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', color: 'var(--text-3)', fontSize: 10, padding: '4px 10px',
          letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'inherit',
          transition: 'all 0.12s', flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-2)'
          e.currentTarget.style.color = 'var(--text-2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-3)'
        }}>
        new file
      </button>
    </div>
  )
}

export function ActionBtn({ children, onClick, disabled, loading, hint }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  hint?: string
}) {
  return (
    <div>
      <button onClick={onClick} disabled={disabled}
        style={{
          width: '100%', padding: '13px',
          background: disabled ? 'var(--surface-3)' : 'var(--accent)',
          color: disabled ? 'var(--text-3)' : '#fff',
          border: `1px solid ${disabled ? 'var(--border)' : 'var(--accent)'}`,
          borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: disabled ? 'none' : '0 2px 10px rgba(255,68,0,0.22)',
          transition: 'box-shadow 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(255,68,0,0.35)' }}
        onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(255,68,0,0.22)' }}
      >
        {loading && (
          <span style={{
            width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
            borderRadius: '50%', display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }} />
        )}
        {children}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>
      {hint && !disabled && (
        <p className="mono" style={{ marginTop: 6, textAlign: 'center', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.07em' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

const strengthColors: Record<StrengthLevel, string> = {
  weak:   '#e03333',
  medium: '#d97706',
  strong: '#059669',
}
const strengthWidths: Record<StrengthLevel, string> = {
  weak:   '33%',
  medium: '66%',
  strong: '100%',
}

export function PasswordStrength({ strength, password }: { strength: StrengthLevel; password: string }) {
  if (!password) return null
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 2, background: 'var(--surface-3)', borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: strengthWidths[strength],
          background: strengthColors[strength],
          borderRadius: 2,
          transition: 'width 0.3s ease, background 0.3s ease',
        }} />
      </div>
      <p className="mono" style={{ marginTop: 4, fontSize: 10, letterSpacing: '0.06em', color: strengthColors[strength] }}>
        {strength.toUpperCase()}
      </p>
    </div>
  )
}
