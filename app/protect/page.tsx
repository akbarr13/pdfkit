'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import SelectedFileCard from '@/components/SelectedFileCard'
import { Err, Ok, ActionBtn, PasswordStrength } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { protectPdf } from '@/lib/protectPdf'
import { validatePdf, passwordStrength } from '@/lib/validate'
import { formatBytes } from '@/lib/format'

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
      setResultMsg(`${stem}_protected.pdf saved · ${formatBytes(bytes.length)}`)
      setStatus('done')
    } catch (e) { setError(String(e)); setStatus('error') }
  }, [file, password, canSubmit])

  useCmdEnter(handleProtect, canSubmit)

  const inputCls = `form-input form-input--md${mismatch ? ' form-input--error' : ''}`

  return (
    <ToolLayout code="06 / PROTECT" title="Protect PDF"
      subtitle="Lock a PDF with a password. Pages are rendered as images — text won't be selectable after.">
      <div className="tool-stack">

        {!file ? (
          <DropZone accept=".pdf" onFiles={handleFiles} label="Drop a PDF file here" />
        ) : (
          <SelectedFileCard file={file} onChange={reset} />
        )}

        {file && (
          <div className="tool-stack tool-stack--tight">
            {/* Password */}
            <div>
              <p className="section-label">Password</p>
              <div className="password-input-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="password-toggle"
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
                {mismatch && <span className="password-mismatch">— passwords don&apos;t match</span>}
              </p>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
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
