import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

export interface WatermarkOptions {
  text:      string
  opacity?:  number  // 0–1, default 0.3
  angle?:    number  // degrees counter-clockwise, default 45
  fontSize?: number  // default 48
}

export async function watermarkPdf(file: File, opts: WatermarkOptions): Promise<Uint8Array> {
  const { text, opacity = 0.3, angle = 45, fontSize = 48 } = opts

  const buf  = await file.arrayBuffer()
  const doc  = await PDFDocument.load(buf)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    page.drawText(text, {
      x: (width  - textWidth) / 2,
      y: (height - fontSize)  / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(angle),
    })
  }

  return doc.save()
}
