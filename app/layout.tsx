import type { Metadata, Viewport } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import TopLoader from '@/components/TopLoader'
import AppLoader from '@/components/AppLoader'
import PwaInit from '@/components/PwaInit'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'pdfkit — free browser-side PDF tools',
  description: 'Merge, split, compress, rotate, watermark, and convert PDFs. No uploads. No accounts. Runs entirely in your browser.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'pdfkit',
  },
  openGraph: {
    title: 'pdfkit — free browser-side PDF tools',
    description: 'No uploads. No accounts. Everything runs locally in your browser.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#ff4400',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        <PwaInit />
        <TopLoader />
        <AppLoader>
          {children}
        </AppLoader>
      </body>
    </html>
  )
}
