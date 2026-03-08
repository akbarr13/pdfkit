'use client'

import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import ToolLayout from '@/components/ToolLayout'
import DropZone from '@/components/DropZone'
import ProgressBar from '@/components/ProgressBar'
import { Err, Ok, ActionBtn } from '@/components/ToolUI'
import { useCmdEnter } from '@/lib/useHotkey'
import { pdfToImages } from '@/lib/pdfToImage'

type Format = 'jpeg'|'png'

const scales = [
  {value:1,   label:'72 dpi',  note:'fast'},
  {value:1.5, label:'108 dpi', note:'good'},
  {value:2,   label:'144 dpi', note:'sharp'},
  {value:3,   label:'216 dpi', note:'hi-res'},
]

export default function PdfToImagePage() {
  const [file, setFile]     = useState<File|null>(null)
  const [format, setFormat] = useState<Format>('jpeg')
  const [scale, setScale]   = useState(2)
  const [status, setStatus] = useState<'idle'|'processing'|'done'|'error'>('idle')
  const [progress, setProgress] = useState({current:0,total:0})
  const [error, setError]   = useState('')

  const canConvert = !!file && status!=='processing'
  function reset() { setFile(null); setStatus('idle'); setError('') }

  const handleConvert = useCallback(async () => {
    if (!file) return
    setStatus('processing'); setError(''); setProgress({current:0,total:0})
    try {
      const blobs = await pdfToImages(file, format, scale, (c,t)=>setProgress({current:c,total:t}))
      for (let i=0; i<blobs.length; i++) {
        const stem = file.name.replace(/\.pdf$/i, '')
        saveAs(blobs[i], `${stem}_${String(i+1).padStart(3,'0')}.${format}`)
        await new Promise(r=>setTimeout(r,60))
      }
      setStatus('done')
    } catch(e) { setError(String(e)); setStatus('error') }
  }, [file, format, scale])

  useCmdEnter(handleConvert, canConvert)

  const segStyle = (active: boolean, hasBorder: boolean): React.CSSProperties => ({
    flex:1, padding:'9px', border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
    background: active ? 'var(--accent)' : 'var(--surface-2)',
    color: active ? '#fff' : 'var(--text-2)',
    borderRight: hasBorder ? '1px solid var(--border)' : 'none',
    transition:'background 0.12s, color 0.12s', fontFamily:'inherit',
  })

  const scaleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding:'10px 4px', textAlign:'center', cursor:'pointer', fontFamily:'inherit',
    background: active ? 'rgba(255,68,0,0.06)' : 'var(--surface)',
    border: `1px solid ${active ? 'rgba(255,68,0,0.35)' : 'var(--border)'}`,
    borderRadius:'var(--radius-sm)', transition:'all 0.12s',
  })

  return (
    <ToolLayout code="04 / PDF → IMAGE" title="PDF to Image"
      subtitle="Each page renders as a separate image. All files download automatically.">
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
            <div>
              <p style={{fontSize:12,color:'var(--text-2)',marginBottom:8,fontWeight:500}}>Format</p>
              <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',overflow:'hidden',background:'var(--surface)'}}>
                <button onClick={()=>setFormat('jpeg')} style={segStyle(format==='jpeg',true)}>
                  JPEG &nbsp;<span style={{fontWeight:400,fontSize:11,opacity:0.75}}>smaller, lossy</span>
                </button>
                <button onClick={()=>setFormat('png')} style={segStyle(format==='png',false)}>
                  PNG &nbsp;<span style={{fontWeight:400,fontSize:11,opacity:0.75}}>lossless, larger</span>
                </button>
              </div>
            </div>

            <div>
              <p style={{fontSize:12,color:'var(--text-2)',marginBottom:8,fontWeight:500}}>Resolution</p>
              <div className="grid-4col">
                {scales.map(s=>(
                  <button key={s.value} onClick={()=>setScale(s.value)} style={scaleBtnStyle(scale===s.value)}>
                    <p className="mono" style={{fontSize:12,fontWeight:600,color:scale===s.value?'var(--accent)':'var(--text)',marginBottom:2}}>{s.label}</p>
                    <p className="mono" style={{fontSize:10,color:'var(--text-3)'}}>{s.note}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {status==='processing' && <ProgressBar current={progress.current} total={progress.total} label="Rendering pages" />}
        {status==='error'      && <Err msg={error} />}
        {status==='done'       && <Ok msg={`${progress.total} image${progress.total>1?'s':''} saved as .${format}`} onReset={reset} />}

        <ActionBtn onClick={handleConvert} disabled={!canConvert} loading={status==='processing'} hint="⌘ Enter">
          Convert to {format.toUpperCase()} →
        </ActionBtn>
      </div>
    </ToolLayout>
  )
}
