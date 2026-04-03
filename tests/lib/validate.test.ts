import { describe, it, expect } from 'vitest'
import {
  validatePdf,
  validatePdfs,
  validateImage,
  validateImages,
  passwordStrength,
  MAX_PDF_SIZE,
  MAX_IMAGE_SIZE,
} from '@/lib/validate'

// ─── validatePdf ────────────────────────────────────────────────────────────

describe('validatePdf', () => {
  it('accepts a valid PDF by extension', () => {
    const f = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    expect(validatePdf(f)).toBeNull()
  })

  it('accepts a PDF with application/pdf MIME even if extension is missing', () => {
    const f = new File(['%PDF'], 'doc', { type: 'application/pdf' })
    expect(validatePdf(f)).toBeNull()
  })

  it('rejects a .docx file', () => {
    const f = new File(['data'], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    expect(validatePdf(f)).not.toBeNull()
  })

  it('rejects a .jpg file', () => {
    const f = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    expect(validatePdf(f)).not.toBeNull()
  })

  it('rejects an empty file', () => {
    const f = new File([], 'empty.pdf', { type: 'application/pdf' })
    expect(validatePdf(f)).not.toBeNull()
  })

  it('rejects a file exceeding MAX_PDF_SIZE', () => {
    // Build a File that reports a large size without allocating full memory
    const f = Object.defineProperty(
      new File(['x'], 'big.pdf', { type: 'application/pdf' }),
      'size',
      { value: MAX_PDF_SIZE + 1 }
    )
    expect(validatePdf(f)).not.toBeNull()
  })

  it('returns a descriptive string on rejection', () => {
    const f = new File(['data'], 'doc.txt', { type: 'text/plain' })
    const msg = validatePdf(f)
    expect(typeof msg).toBe('string')
    expect(msg!.length).toBeGreaterThan(0)
  })
})

// ─── validatePdfs ───────────────────────────────────────────────────────────

describe('validatePdfs', () => {
  it('returns null when all files are valid PDFs', () => {
    const files = [
      new File(['%PDF'], 'a.pdf', { type: 'application/pdf' }),
      new File(['%PDF'], 'b.pdf', { type: 'application/pdf' }),
    ]
    expect(validatePdfs(files)).toBeNull()
  })

  it('returns an error when any file is invalid', () => {
    const files = [
      new File(['%PDF'], 'a.pdf', { type: 'application/pdf' }),
      new File(['data'], 'b.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ]
    expect(validatePdfs(files)).not.toBeNull()
  })
})

// ─── validateImage ──────────────────────────────────────────────────────────

describe('validateImage', () => {
  it('accepts JPEG files', () => {
    const f = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    expect(validateImage(f)).toBeNull()
  })

  it('accepts PNG files', () => {
    const f = new File(['data'], 'photo.png', { type: 'image/png' })
    expect(validateImage(f)).toBeNull()
  })

  it('accepts JPEG by extension when MIME is empty', () => {
    const f = new File(['data'], 'photo.jpeg', { type: '' })
    expect(validateImage(f)).toBeNull()
  })

  it('rejects GIF files', () => {
    const f = new File(['data'], 'anim.gif', { type: 'image/gif' })
    expect(validateImage(f)).not.toBeNull()
  })

  it('rejects WebP files', () => {
    const f = new File(['data'], 'img.webp', { type: 'image/webp' })
    expect(validateImage(f)).not.toBeNull()
  })

  it('rejects empty files', () => {
    const f = new File([], 'empty.jpg', { type: 'image/jpeg' })
    expect(validateImage(f)).not.toBeNull()
  })

  it('rejects files exceeding MAX_IMAGE_SIZE', () => {
    const f = Object.defineProperty(
      new File(['x'], 'large.jpg', { type: 'image/jpeg' }),
      'size',
      { value: MAX_IMAGE_SIZE + 1 }
    )
    expect(validateImage(f)).not.toBeNull()
  })
})

// ─── validateImages ─────────────────────────────────────────────────────────

describe('validateImages', () => {
  it('returns null when all images are valid', () => {
    const files = [
      new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['x'], 'b.png', { type: 'image/png' }),
    ]
    expect(validateImages(files)).toBeNull()
  })

  it('returns an error when any image is invalid', () => {
    const files = [
      new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['x'], 'b.gif', { type: 'image/gif' }),
    ]
    expect(validateImages(files)).not.toBeNull()
  })
})

// ─── passwordStrength ────────────────────────────────────────────────────────

describe('passwordStrength', () => {
  it('rates empty string as weak', () => {
    expect(passwordStrength('')).toBe('weak')
  })

  it('rates very short passwords as weak', () => {
    expect(passwordStrength('abc')).toBe('weak')
    expect(passwordStrength('1234567')).toBe('weak')
  })

  it('rates 8-char passwords with letters+number as medium', () => {
    expect(passwordStrength('Password1')).toBe('medium')
  })

  it('rates long complex passwords as strong', () => {
    expect(passwordStrength('P@ssw0rd!Strong')).toBe('strong')
    expect(passwordStrength('Correct-Horse-Battery-9')).toBe('strong')
  })

  it('rates long lowercase-only as medium (length ok, variety low)', () => {
    // 12+ chars but only lowercase = 1 variety → weak
    expect(passwordStrength('abcdefghijkl')).toBe('weak')
  })

  it('rates single-char repeated as weak', () => {
    expect(passwordStrength('aaaaaaaa')).toBe('weak')
  })
})
