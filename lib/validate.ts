function fmtSize(b: number) {
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

export const MAX_PDF_SIZE   = 300 * 1024 * 1024 // 300 MB
export const MAX_IMAGE_SIZE =  50 * 1024 * 1024  //  50 MB per image

export function validatePdf(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'pdf' && file.type !== 'application/pdf') {
    return `"${file.name}" is not a PDF file`
  }
  if (file.size === 0) return 'File is empty'
  if (file.size > MAX_PDF_SIZE) return `File too large (${fmtSize(file.size)}) — max 300 MB`
  return null
}

export function validatePdfs(files: File[]): string | null {
  for (const f of files) {
    const err = validatePdf(f)
    if (err) return err
  }
  return null
}

export function validateImage(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!validTypes.includes(file.type) && !['jpg', 'jpeg', 'png'].includes(ext ?? '')) {
    return `"${file.name}" must be JPG or PNG`
  }
  if (file.size === 0) return `"${file.name}" is empty`
  if (file.size > MAX_IMAGE_SIZE) {
    return `"${file.name}" too large (${fmtSize(file.size)}) — max 50 MB`
  }
  return null
}

export function validateImages(files: File[]): string | null {
  for (const f of files) {
    const err = validateImage(f)
    if (err) return err
  }
  return null
}

export type PasswordStrength = 'weak' | 'medium' | 'strong'

export function passwordStrength(pwd: string): PasswordStrength {
  if (pwd.length === 0) return 'weak'
  const hasUpper   = /[A-Z]/.test(pwd)
  const hasLower   = /[a-z]/.test(pwd)
  const hasNumber  = /[0-9]/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  const variety    = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
  if (pwd.length >= 12 && variety >= 3) return 'strong'
  if (pwd.length >= 8  && variety >= 2) return 'medium'
  return 'weak'
}
