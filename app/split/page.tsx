'use client'

import { useState, useCallback, useMemo } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { splitPdf, splitPdfByPage, SplitRange } from '@/lib/splitPdf'

function parseRanges(text: string): SplitRange[] {
  return text.split(',').map(s => s.trim()).filter(Boolean).flatMap(s => {
    const p = s.split('-').map(n => parseInt(n.trim(), 10))
    if (p.length===2 && !isNaN(p[0]) && !isNaN(p[1]) && p[0]>0 && p[1]>=p[0]) return [{from:p[0],to:p[1]}]
    if (p.length===1 && !isNaN(p[0]) && p[0]>0) return [{from:p[0],to:p[0]}]
    return []
  })
}

const field: React.CSSProperties = {
  width:'100%', padding:'9px 12px',
  background:'var(--surface)', border:'1px solid var(--border)',
  borderRadius:'var(--radius-sm)', color:'var(--text)',
  fontSize:14, outline:'none', fontFamily:'inherit',
  transition: 'border-color 0.15s',
}

export default function SplitPage() {
  const [file, setFile]     = useState<File|null>(null)
  const [mode, setMode]     = useState<'pages'|'ranges'>('pages')
  const [rangesText, setRangesText] = useState('')
  const [status, setStatus] = useState<'idle'|'processing'|'done'|'error'>('idle')
  const [progress, setProgress] = useState({current:0,total:0})
  const [error, setError]   = useState('')

  const parsed       = useMemo(()=>parseRanges(rangesText),[rangesText])
  const rangeInvalid = !!rangesText.trim() && parsed.length===0
  const preview      = rangesText.trim() ? (parsed.length>0 ? `→ ${parsed.length} file${parsed.length>1?'s':''}` : '→ invalid') : null

  const canSplit = !!file && status!=='processing' && (mode==='pages' || parsed.length>0)

  function reset() { setFile(null); setStatus('idle'); setError(''); setRangesText('') }

  const handleSplit = useCallback(async () => {
    if (!file || !canSplit) return
    setStatus('processing'); setError('')
    try {
      const results = mode==='pages' ? await splitPdfByPage(file) : await splitPdf(file, parsed)
      setProgress({current:0, total:results.length})
      for (let i=0; i<results.length; i++) {
        const stem = file.name.replace(/\.pdf$/i, '')
        saveAs(new Blob([results[i].buffer as ArrayBuffer],{type:'application/pdf'}),`${stem}_${String(i+1).padStart(3,'0')}.pdf`)
        setProgress({current:i+1, total:results.length})
        await new Promise(r=>setTimeout(r,80))
      }
      setStatus('done')
    } catch(e) { setError(String(e)); setStatus('error') }
  }, [file, mode, parsed, canSplit])

  useCmdEnter(handleSplit, canSplit)

  const segStyle = (active: boolean, borderRight: boolean): React.CSSProperties => ({
    flex:1, padding:'9px', border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
    background: active ? 'var(--accent)' : 'var(--surface-2)',
    color: active ? '#fff' : 'var(--text-2)',
    borderRight: borderRight ? '1px solid var(--border)' : 'none',
    transition:'background 0.12s, color 0.12s', fontFamily:'inherit',
  })

  return (
    <ToolLayout code="02 / SPLIT" title="Split PDF" subtitle="Extract individual pages, or define custom page ranges.">
      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        {!file ? (
          <DropZone accept=".pdf" onFiles={([f])=>setFile(f)} label="Drop a PDF file here" />
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',background:'var(--surface)'}}>
            <span style={{flex:1,fontSize:13,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</span>
            <button onClick={reset} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',fontSize:12,fontFamily:'inherit'}}>change file</button>
          </div>
        )}

        {file && (
          <>
            <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',overflow:'hidden',background:'var(--surface)'}}>
              <button onClick={()=>setMode('pages')} style={segStyle(mode==='pages',true)}>One file per page</button>
              <button onClick={()=>setMode('ranges')} style={segStyle(mode==='ranges',false)}>Custom ranges</button>
            </div>

            {mode==='ranges' && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
                  <label style={{fontSize:12,color:'var(--text-2)',fontWeight:500}}>Page ranges — comma-separated</label>
                  {preview && <span className="mono" style={{fontSize:11,color:rangeInvalid?'#c0392b':'var(--accent)'}}>{preview}</span>}
                </div>
                <input type="text" value={rangesText} onChange={e=>setRangesText(e.target.value)}
                  placeholder="1-3, 4-6, 7"
                  style={{...field, borderColor: rangeInvalid?'#f5c6c6':'var(--border)'}}
                  onFocus={e=>(e.target.style.borderColor=rangeInvalid?'#e07070':'var(--accent)')}
                  onBlur={e=>(e.target.style.borderColor=rangeInvalid?'#f5c6c6':'var(--border)')} />
                <p className="mono" style={{marginTop:5,fontSize:10,color:'var(--text-3)'}}>
                  each range → one PDF · single page: 7 · range: 2-5
                </p>
              </div>
            )}
          </>
        )}

        {status==='processing' && <ProgressBar current={progress.current} total={progress.total} label="Downloading" />}
        {status==='error'      && <Err msg={error} />}
        {status==='done'       && <Ok msg={`${progress.total} file${progress.total>1?'s':''} downloaded`} onReset={reset} />}

        <ActionBtn onClick={handleSplit} disabled={!canSplit} loading={status==='processing'} hint="⌘ Enter">
          Split PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
