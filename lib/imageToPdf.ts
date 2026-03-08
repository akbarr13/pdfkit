import { PDFDocument } from 'pdf-lib'

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  for (const file of files) {
    const buf = await file.arrayBuffer()
    const mime = file.type

    let image
    if (mime === 'image/jpeg' || mime === 'image/jpg') {
      image = await doc.embedJpg(buf)
    } else if (mime === 'image/png') {
      image = await doc.embedPng(buf)
    } else {
      // Try to load as PNG fallback
      image = await doc.embedPng(buf)
    }

    const page = doc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }

  return doc.save()
}
