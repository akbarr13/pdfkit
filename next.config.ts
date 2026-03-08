import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdnjs.cloudflare.com blob:",
              "worker-src 'self' blob: cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com",
              "font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' cdnjs.cloudflare.com blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
