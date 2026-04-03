'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn, PasswordStrength } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { protectPdf } from '@/lib/protectPdf'
import { validatePdf, passwordStrength } from '@/lib/validate'

function fmt(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function ProtectPage() {
  const [file, setFile]         = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [status, setStatus]     = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError]       = useState('')
  const [resultMsg, setResultMsg] = useState('')

  const mismatch  = confirm.length > 0 && password !== confirm
  const strength  = passwordStrength(password)
  const canSubmit = !!file && password.length > 0 && !mismatch && status !== 'processing'

  function handleFiles([f]: File[]) {
    const err = validatePdf(f)
    if (err) { setError(err); setStatus('error'); return }
    setFile(f); setStatus('idle'); setError('')
  }

  function reset() { setFile(null); setPassword(''); setConfirm(''); setStatus('idle'); setError('') }

  const handleProtect = useCallback(async () => {
    if (!canSubmit || !file) return
    setStatus('processing'); setError('')
    try {
      const bytes = await protectPdf(file, password, password, (c, t) => setProgress({ current: c, total: t }))
      const stem  = file.name.replace(/\.pdf$/i, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}_protected.pdf`)
      setResultMsg(`${stem}_protected.pdf saved · ${fmt(bytes.length)}`)
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, password, canSubmit])

  useCmdEnter(handleProtect, canSubmit)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    background: 'var(--surface)', color: 'var(--text)',
    border: `1px solid ${mismatch && confirm.length > 0 ? '#fcc' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  }

  return (
    <ToolLayout code="06 / PROTECT" title="Protect PDF"
      subtitle="Lock a PDF with a password. Pages are rendered as images — text won't be selectable after.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface)' }}>
            <div className="file-info-row" style={{ border: 'none', borderRadius: 0 }}>
              <div className="file-info-row__body">
                <p className="file-name">{file.name}</p>
                <p className="mono file-size">{fmt(file.size)}</p>
              </div>
              <button onClick={reset} className="change-btn">change</button>
            </div>
          </div>
        )}

        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Password */}
            <div>
              <p className="section-label">Password</p>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                  onFocus={e => { if (!mismatch || !confirm.length) e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={e => { e.target.style.borderColor = mismatch && confirm.length > 0 ? '#fcc' : 'var(--border)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-3)', fontSize: 11, fontFamily: 'inherit',
                    padding: '2px 4px',
                  }}
                >
                  {showPwd ? 'hide' : 'show'}
                </button>
              </div>
              <PasswordStrength strength={strength} password={password} />
            </div>

            {/* Confirm */}
            <div>
              <p className="section-label">
                Confirm password
                {mismatch && <span style={{ color: '#e03333', marginLeft: 8, fontWeight: 400 }}>— passwords don&apos;t match</span>}
              </p>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                style={inputStyle}
                autoComplete="new-password"
                onFocus={e => { if (!mismatch || !confirm.length) e.target.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.target.style.borderColor = mismatch && confirm.length > 0 ? '#fcc' : 'var(--border)' }}
              />
            </div>
          </div>
        )}

        {status === 'processing' && <ProgressBar current={progress.current} total={progress.total} label="Protecting pages" />}
        {status === 'error'      && <Err msg={error} onRetry={canSubmit ? handleProtect : undefined} />}
        {status === 'done'       && <Ok msg={resultMsg} onReset={reset} />}

        <ActionBtn onClick={handleProtect} disabled={!canSubmit} loading={status === 'processing'} hint="⌘ Enter">
          Protect PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
