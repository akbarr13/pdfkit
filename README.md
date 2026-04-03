# pdfkit

**🔗 Live: [pdf.arwebs.my.id](https://pdf.arwebs.my.id)**

A fast, privacy-first PDF toolkit that runs entirely in your browser. No uploads. No accounts. No server.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

| Tool | Description |
|------|-------------|
| **Compress PDF** | Reduce file size with quality presets (Screen / Web / Print / Custom) |
| **Merge PDF** | Combine multiple PDFs into one. Drag rows to set order |
| **Split PDF** | Extract pages or define custom ranges into separate files |
| **PDF → Image** | Render each page as JPEG or PNG at 72–216 dpi |
| **Image → PDF** | Pack JPG/PNG files into a single PDF. Drag to set page order |
| **Protect PDF** | Lock a PDF with a password. Encrypted output works in any PDF reader |
| **Rotate Pages** | Rotate all pages clockwise by 90°, 180°, or 270° |
| **Watermark PDF** | Stamp a text watermark on every page with custom opacity and angle |
| **Edit Metadata** | Read and update title, author, subject, keywords, and creator fields |

## Privacy

All processing happens locally in the browser using WebAssembly and Canvas APIs. Files are never sent to any server.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, React 19 (requires Node.js 20+)
- **[pdf-lib](https://pdf-lib.js.org/)** — PDF creation, merging, splitting, rotation, watermarking, metadata editing
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** — PDF rendering to canvas
- **[browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)** — JPEG compression for compress tool
- **[jsPDF](https://github.com/parallax/jsPDF)** — PDF creation with password encryption for protect tool
- **[file-saver](https://github.com/eligrey/FileSaver.js/)** — Client-side file downloads

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Node.js (cPanel / VPS)

Requires **Node.js 20+** on the server.

```bash
# Build, zip, and upload to FTP in one command
npm run deploy
```

Credentials are read from `.env.ftp`:

```
FTP_HOST=...
FTP_USER=...
FTP_PASS=...
FTP_REMOTE_PATH=...
```

The script builds a standalone bundle, assembles `standalone/ + public/ + .next/static/` into one folder, zips it, uploads `deploy.zip` to the FTP root, then cleans up locally.

## CI/CD

GitHub Actions runs on every push: **lint → test → build**. See `.github/workflows/ci.yml`.

## Project Structure

```
app/
├── page.tsx              # Landing page with tool search
├── compress/page.tsx
├── merge/page.tsx
├── split/page.tsx
├── pdf-to-image/page.tsx
├── image-to-pdf/page.tsx
├── protect/page.tsx
├── rotate/page.tsx
├── watermark/page.tsx
└── metadata/page.tsx
components/
├── Navbar/               # Responsive navbar with mobile hamburger menu
├── AppLoader/            # Preloads all PDF libraries before site renders
├── DropZone/             # Drag-and-drop file input (supports page-wide drop)
├── FileList/             # File list with drag-to-reorder
├── ProgressBar/          # Animated shimmer progress bar
├── ToolLayout/           # Shared page wrapper, records recently used tools
├── ToolUI/               # Err, Ok, ActionBtn, PasswordStrength components
├── TopLoader/            # Page transition progress bar
└── PwaInit/              # Registers service worker for PWA support
lib/
├── compressPdf.ts
├── mergePdf.ts
├── splitPdf.ts
├── pdfToImage.ts
├── imageToPdf.ts
├── protectPdf.ts
├── rotatePdf.ts
├── watermarkPdf.ts
├── editMetadata.ts
├── validate.ts           # File size / format / password strength validation
├── usePreference.ts      # localStorage preference hook
├── useRecentTools.ts     # Recently used tools tracking
└── useHotkey.ts          # Cmd/Ctrl+Enter shortcut
tests/
└── lib/
    ├── validate.test.ts
    └── usePreference.test.ts
```

## License

MIT
