'use client'

import type { PDFDocumentProxy } from 'pdfjs-dist'

let pdfjs: typeof import('pdfjs-dist') | null = null

async function getPdfJs() {
  if (pdfjs) return pdfjs
  pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  return pdfjs
}

export async function protectPdf(
  file: File,
  userPassword: string,
  ownerPassword: string,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const [lib, { jsPDF }] = await Promise.all([
    getPdfJs(),
    import('jspdf'),
  ])

  const buf = await file.arrayBuffer()
  const pdf: PDFDocumentProxy = await lib.getDocument({ data: buf }).promise
  const total = pdf.numPages

  let doc: InstanceType<typeof jsPDF> | null = null

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 }) // render at 1.5× for quality

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    // PDF points = pixels / scale (pdfjs scale=1 → point dimensions)
    const ptWidth  = viewport.width  / 1.5
    const ptHeight = viewport.height / 1.5

    if (i === 1) {
      doc = new jsPDF({
        unit: 'pt',
        format: [ptWidth, ptHeight],
        orientation: ptWidth > ptHeight ? 'l' : 'p',
        compress: true,
        encryption: {
          userPassword,
          ownerPassword: ownerPassword || userPassword,
          userPermissions: ['print'],
        },
      })
    } else {
      doc!.addPage([ptWidth, ptHeight], ptWidth > ptHeight ? 'l' : 'p')
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    doc!.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight)

    onProgress?.(i, total)
  }

  const ab = doc!.output('arraybuffer')
  return new Uint8Array(ab)
}
