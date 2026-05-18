import type { PasswordStrength as StrengthLevel } from '@/lib/validate'

export function Err({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="alert alert--error anim-fade-down">
      <p className="mono alert__msg-error">ERROR — {msg}</p>
      {onRetry && (
        <button onClick={onRetry} className="mono alert__retry-btn">
          retry
        </button>
      )}
    </div>
  )
}

export function Ok({ msg, onReset }: { msg: string; onReset: () => void }) {
  return (
    <div className="alert alert--success anim-pop">
      <div className="alert__success-row">
        <span className="alert__success-icon">✓</span>
        <p className="mono alert__msg-success">{msg}</p>
      </div>
      <button onClick={onReset} className="mono alert__reset-btn">
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
      <button onClick={onClick} disabled={disabled} className="btn-action">
        {loading && <span className="btn-action__spinner" />}
        {children}
      </button>
      {hint && !disabled && (
        <p className="mono btn-action__hint">{hint}</p>
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
    <div className="pwd-strength">
      <div className="pwd-strength__track">
        <div
          className="pwd-strength__fill"
          style={{ width: strengthWidths[strength], background: strengthColors[strength] }}
        />
      </div>
      <p className="mono pwd-strength__label" style={{ color: strengthColors[strength] }}>
        {strength.toUpperCase()}
      </p>
    </div>
  )
}
