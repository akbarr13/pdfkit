import { PDFDocument } from 'pdf-lib'

export interface PdfMetadata {
  title?:    string
  author?:   string
  subject?:  string
  keywords?: string
  creator?:  string
}

export async function getPdfMetadata(file: File): Promise<PdfMetadata> {
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf)
  return {
    title:    doc.getTitle()    ?? '',
    author:   doc.getAuthor()   ?? '',
    subject:  doc.getSubject()  ?? '',
    keywords: doc.getKeywords() ?? '',
    creator:  doc.getCreator()  ?? '',
  }
}

export async function editMetadata(file: File, meta: PdfMetadata): Promise<Uint8Array> {
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf)
  if (meta.title    !== undefined) doc.setTitle(meta.title)
  if (meta.author   !== undefined) doc.setAuthor(meta.author)
  if (meta.subject  !== undefined) doc.setSubject(meta.subject)
  if (meta.keywords !== undefined) doc.setKeywords(meta.keywords ? [meta.keywords] : [])
  if (meta.creator  !== undefined) doc.setCreator(meta.creator)
  doc.setModificationDate(new Date())
  return doc.save()
}
