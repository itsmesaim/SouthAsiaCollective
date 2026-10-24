import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. passes the path on as a header (the TOTP plugin needs it to avoid redirect loops)
// 2. rate limits the public API per IP. Only requests that arrive through nginx (they carry x-forwarded-for) are limited,
//    so the Next.js site calling us from this machine and local development are never throttled.
// ponytail: in-memory counters, fine for one server process; use nginx limit_req or redis if scaled out
const hits = new Map<string, { n: number; reset: number }>()
const over = (key: string, max: number, windowMs = 60_000) => {
  const now = Date.now()
  const h = hits.get(key)
  if (!h || h.reset < now) {
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
    hits.set(key, { n: 1, reset: now + windowMs })
    return false
  }
  return ++h.n > max
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (ip && pathname.startsWith('/api/')) {
    const auth = /\/(login|forgot-password|reset-password|first-register|verify-totp)$/.test(pathname)
    if (over(`${ip}:${auth ? 'auth' : 'api'}`, auth ? 10 : 240))
      return new NextResponse(
        JSON.stringify({ errors: [{ message: 'Too many requests. Wait a minute and try again.' }] }),
        {
          status: 429,
          headers: { 'content-type': 'application/json', 'retry-after': '60' },
        },
      )
  }
  const response = NextResponse.next()
  response.headers.append('x-pathname', pathname)
  return response
}
