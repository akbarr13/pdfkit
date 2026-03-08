import type { Metadata } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import TopLoader from '@/components/TopLoader'
import AppLoader from '@/components/AppLoader'

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
  description: 'Merge, split, compress, and convert PDFs. No uploads. No accounts. Runs in your browser.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        <TopLoader />
        <AppLoader>
          {children}
        </AppLoader>
      </body>
    </html>
  )
}
