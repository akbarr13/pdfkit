import { PDFDocument, degrees } from 'pdf-lib'

export type RotateAngle = 90 | 180 | 270

/** Rotate all pages in a PDF clockwise by the given angle. */
export async function rotatePdf(file: File, angle: RotateAngle): Promise<Uint8Array> {
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf)
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle
    page.setRotation(degrees((current + angle) % 360))
  }
  return doc.save()
}
