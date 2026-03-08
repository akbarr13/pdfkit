'use client'

import type { PDFDocumentProxy } from 'pdfjs-dist'

let pdfjs: typeof import('pdfjs-dist') | null = null

async function getPdfJs() {
  if (pdfjs) return pdfjs
  pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  return pdfjs
}

export async function pdfToImages(
  file: File,
  format: 'jpeg' | 'png' = 'jpeg',
  scale: number = 2,
  onProgress?: (current: number, total: number) => void
): Promise<Blob[]> {
  const lib = await getPdfJs()
  const buf = await file.arrayBuffer()
  const pdf: PDFDocumentProxy = await lib.getDocument({ data: buf }).promise
  const total = pdf.numPages
  const blobs: Blob[] = []

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error('canvas.toBlob failed')),
        `image/${format}`,
        format === 'jpeg' ? 0.92 : undefined
      )
    })
    blobs.push(blob)
    onProgress?.(i, total)
  }

  return blobs
}
