import type { Metadata } from 'next'
import './globals.css'
import TopLoader from '@/components/TopLoader'
import AppLoader from '@/components/AppLoader'

export const metadata: Metadata = {
  title: 'pdfkit — free browser-side PDF tools',
  description: 'Merge, split, compress, and convert PDFs. No uploads. No accounts. Runs in your browser.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TopLoader />
        <AppLoader>
          {children}
        </AppLoader>
      </body>
    </html>
  )
}
