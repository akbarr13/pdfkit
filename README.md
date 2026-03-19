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

## Privacy

All processing happens locally in the browser using WebAssembly and Canvas APIs. Files are never sent to any server.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, React 19 (requires Node.js 20+)
- **[pdf-lib](https://pdf-lib.js.org/)** — PDF creation, merging, splitting
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

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Static Hosting (Recommended)

Change `output` in `next.config.ts` to `'export'`, then:

```bash
npm run build
# Upload contents of out/ to your web server
```

### Node.js (cPanel / VPS)

Requires **Node.js 20+** on the server.

```bash
npm run build
# Copy .next/standalone/ + .next/static/ + public/ to your server
# On the server, run npm install then: node server.js
```

## Project Structure

```
app/
├── page.tsx              # Landing page
├── compress/page.tsx
├── merge/page.tsx
├── split/page.tsx
├── pdf-to-image/page.tsx
├── image-to-pdf/page.tsx
└── protect/page.tsx
components/
├── Navbar/               # Responsive navbar with mobile hamburger menu
├── AppLoader/            # Preloads all PDF libraries before site renders
├── DropZone/             # Drag-and-drop file input
├── FileList/             # File list with drag-to-reorder
├── ProgressBar/
├── ToolLayout/           # Shared page wrapper
├── ToolUI/               # Err, Ok, ActionBtn components
└── TopLoader/            # Page transition progress bar
lib/
├── mergePdf.ts
├── splitPdf.ts
├── compressPdf.ts
├── pdfToImage.ts
├── imageToPdf.ts
├── protectPdf.ts
└── useHotkey.ts          # Cmd/Ctrl+Enter shortcut
```

## License

MIT
