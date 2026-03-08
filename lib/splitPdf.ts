import { PDFDocument } from 'pdf-lib'

export interface SplitRange {
  from: number // 1-indexed
  to: number   // 1-indexed inclusive
}

export async function splitPdf(file: File, ranges: SplitRange[]): Promise<Uint8Array[]> {
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf)
  const total = doc.getPageCount()
  const results: Uint8Array[] = []

  for (const range of ranges) {
    const from = Math.max(1, range.from) - 1
    const to = Math.min(total, range.to) - 1
    if (from > to) continue

    const out = await PDFDocument.create()
    const indices = Array.from({ length: to - from + 1 }, (_, i) => from + i)
    const pages = await out.copyPages(doc, indices)
    pages.forEach(p => out.addPage(p))
    results.push(await out.save())
  }

  return results
}

export async function splitPdfByPage(file: File): Promise<Uint8Array[]> {
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf)
  const total = doc.getPageCount()
  const results: Uint8Array[] = []

  for (let i = 0; i < total; i++) {
    const out = await PDFDocument.create()
    const [page] = await out.copyPages(doc, [i])
    out.addPage(page)
    results.push(await out.save())
  }

  return results
}
