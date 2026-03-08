'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { compressPdf } from '@/lib/compressPdf'

function fmt(b: number) {
  if (b<1024) return b+' B'
  if (b<1024*1024) return (b/1024).toFixed(0)+' KB'
  return (b/(1024*1024)).toFixed(2)+' MB'
}

const presets = [
  {id:'screen', label:'Screen', q:0.35, note:'smallest'},
  {id:'web',    label:'Web',    q:0.60, note:'balanced'},
  {id:'print',  label:'Print',  q:0.85, note:'sharp'},
  {id:'custom', label:'Custom', q:-1,   note:'manual'},
]

export default function CompressPage() {
  const [file, setFile]     = useState<File|null>(null)
  const [preset, setPreset] = useState('web')
  const [customQ, setCustomQ] = useState(0.6)
  const [status, setStatus] = useState<'idle'|'processing'|'done'|'error'>('idle')
  const [progress, setProgress] = useState({current:0,total:0})
  const [error, setError]   = useState('')
  const [result, setResult] = useState<{orig:number;next:number}|null>(null)

  const quality = preset==='custom' ? customQ : (presets.find(p=>p.id===preset)?.q ?? 0.6)
  const canCompress = !!file && status!=='processing'

  function reset() { setFile(null); setStatus('idle'); setResult(null); setError('') }

  const handleCompress = useCallback(async () => {
    if (!file) return
    setStatus('processing'); setError(''); setResult(null)
    try {
      const bytes = await compressPdf(file, quality, (c,t)=>setProgress({current:c,total:t}))
      const stem = file.name.replace(/\.pdf$/i, '')
      saveAs(new Blob([bytes.buffer as ArrayBuffer],{type:'application/pdf'}),`${stem}_compressed.pdf`)
      setResult({orig:file.size, next:bytes.length})
      setStatus('done')
    } catch(e) { setError(String(e)); setStatus('error') }
  }, [file, quality])

  useCmdEnter(handleCompress, canCompress)

  const presetBtnStyle = (active: boolean): React.CSSProperties => ({
    padding:'10px 6px', textAlign:'center', cursor:'pointer', fontFamily:'inherit',
    background: active ? 'rgba(255,68,0,0.06)' : 'var(--surface)',
    border: `1px solid ${active ? 'rgba(255,68,0,0.35)' : 'var(--border)'}`,
    borderRadius:'var(--radius-sm)', transition:'all 0.12s',
  })

  return (
    <ToolLayout code="03 / COMPRESS" title="Compress PDF"
      subtitle="Converts pages to compressed images. Best for scanned documents — text won't be selectable after.">
      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        {!file ? (
          <DropZone accept=".pdf" onFiles={([f])=>setFile(f)} label="Drop a PDF file here" />
        ) : (
          <div style={{border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',overflow:'hidden',background:'var(--surface)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px'}}>
              <div style={{flex:1,overflow:'hidden'}}>
                <p style={{fontSize:13,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</p>
                <p className="mono" style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{fmt(file.size)}</p>
              </div>
              <button onClick={reset} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',fontSize:12,fontFamily:'inherit'}}>change</button>
            </div>
            {file.size < 150*1024 && (
              <div className="mono" style={{padding:'6px 14px',background:'var(--surface-2)',borderTop:'1px solid var(--border)',fontSize:10,color:'var(--text-3)'}}>
                ↑ file already small — compression benefit may be minimal
              </div>
            )}
          </div>
        )}

        {file && (
          <div>
            <p style={{fontSize:12,color:'var(--text-2)',marginBottom:8,fontWeight:500}}>Quality preset</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {presets.map(p=>(
                <button key={p.id} onClick={()=>setPreset(p.id)} style={presetBtnStyle(preset===p.id)}>
                  <p style={{fontSize:13,fontWeight:700,color:preset===p.id?'var(--accent)':'var(--text)',marginBottom:2}}>{p.label}</p>
                  <p className="mono" style={{fontSize:10,color:'var(--text-3)'}}>{p.note}</p>
                </button>
              ))}
            </div>

            {preset==='custom' && (
              <div style={{marginTop:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,color:'var(--text-2)'}}>Quality</span>
                  <span className="mono" style={{fontSize:11,color:'var(--accent)',fontWeight:600}}>{Math.round(customQ*100)}%</span>
                </div>
                <input type="range" min={0.1} max={1} step={0.05} value={customQ}
                  onChange={e=>setCustomQ(Number(e.target.value))}
                  style={{width:'100%',accentColor:'var(--accent)',cursor:'pointer'}} />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  <span className="mono" style={{fontSize:10,color:'var(--text-3)'}}>smallest</span>
                  <span className="mono" style={{fontSize:10,color:'var(--text-3)'}}>best quality</span>
                </div>
              </div>
            )}
          </div>
        )}

        {status==='processing' && <ProgressBar current={progress.current} total={progress.total} label="Compressing pages" />}
        {status==='error'      && <Err msg={error} />}
        {status==='done' && result && (
          <Ok msg={(() => {
            const pct = Math.round((1 - result.next / result.orig) * 100)
            const diff = pct > 0 ? `${pct}% smaller` : pct < 0 ? `${Math.abs(pct)}% larger` : 'same size'
            return `compressed.pdf saved · ${fmt(result.orig)} → ${fmt(result.next)} (${diff})`
          })()} onReset={reset} />
        )}

        <ActionBtn onClick={handleCompress} disabled={!canCompress} loading={status==='processing'} hint="⌘ Enter">
          Compress PDF →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
