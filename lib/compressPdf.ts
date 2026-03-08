'use client'

import { PDFDocument } from 'pdf-lib'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import imageCompression from 'browser-image-compression'

let pdfjs: typeof import('pdfjs-dist') | null = null

async function getPdfJs() {
  if (pdfjs) return pdfjs
  pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  return pdfjs
}

export async function compressPdf(
  file: File,
  quality: number = 0.7, // 0.1 – 1.0
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const lib = await getPdfJs()
  const buf = await file.arrayBuffer()
  const pdf: PDFDocumentProxy = await lib.getDocument({ data: buf }).promise
  const total = pdf.numPages

  const out = await PDFDocument.create()

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    // toBlob → compress → embed
    const rawBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 1)
    })

    const compressedBlob = await imageCompression(rawBlob as File, {
      maxSizeMB: 10,
      useWebWorker: false,
      initialQuality: quality,
      fileType: 'image/jpeg',
    })

    const compressedBuf = await compressedBlob.arrayBuffer()
    const jpgImage = await out.embedJpg(compressedBuf)

    const outPage = out.addPage([viewport.width, viewport.height])
    outPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height })

    onProgress?.(i, total)
  }

  return out.save()
}
