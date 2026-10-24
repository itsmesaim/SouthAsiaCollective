import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  // the admin and API must never show up in search engines (uploaded images stay crawlable for link previews)
  // this app is only the admin: the bare domain and any unknown page go to the sign-in screen (static files and the API are left alone)
  redirects: async () => [
    { source: '/', destination: '/admin', permanent: false },
    { source: '/:path((?!admin|api|_next|login/|favicon\\.png|logo\\.png|robots\\.txt).+)', destination: '/admin', permanent: false },
  ],
  headers: async () => [
    { source: '/:path*', headers: security },
    { source: '/((?!api/media/file).*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
  ],
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
