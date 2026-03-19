'use client'

import { PDFDocument } from 'pdf-lib'

async function normalizeOrientation(file: File): Promise<ArrayBuffer> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

  let canvas: OffscreenCanvas | HTMLCanvasElement
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  } else {
    canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
  }

  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null
  if (!ctx) throw new Error('Could not get 2D canvas context')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  let blob: Blob
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' })
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        b => b ? resolve(b) : reject(new Error('toBlob failed')),
        'image/png'
      )
    })
  }

  return blob.arrayBuffer()
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  for (const file of files) {
    const mime = file.type
    const isJpeg = mime === 'image/jpeg' || mime === 'image/jpg'

    let buf: ArrayBuffer
    if (isJpeg) {
      buf = await normalizeOrientation(file)
    } else {
      // PNG does not have EXIF orientation — pass through directly
      buf = await file.arrayBuffer()
    }

    const image = await doc.embedPng(buf)
    const page = doc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }

  return doc.save()
}
