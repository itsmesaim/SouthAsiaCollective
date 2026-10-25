import type { NextConfig } from 'next'

// security headers on every page (HSTS is ignored over plain http, so this is safe in development)
const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: security }],
  distDir: process.env.NEXT_DIST_DIR || '.next', // a second dev/test instance can use its own folder
  redirects: async () => [
    { source: '/', destination: '/en', permanent: false },
    // Blog, News updates and Statements share one list (post pages keep their own URLs)
    { source: '/:locale/news', destination: '/:locale/blog?type=news', permanent: true },
    { source: '/:locale/statements', destination: '/:locale/blog?type=statements', permanent: true },
    // the old Press and Speeches sections became News
    { source: '/:locale/press', destination: '/:locale/blog?type=news', permanent: true },
    { source: '/:locale/speeches', destination: '/:locale/blog?type=news', permanent: true },
  ],
}

export default nextConfig
