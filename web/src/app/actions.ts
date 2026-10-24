'use server'

import { cookies, headers } from 'next/headers'

import { cmsPost } from '@/lib/cms'

// ponytail: in-memory limiter, fine for one VPS process; use nginx limit_req / redis if scaled out
const hits = new Map<string, { n: number; t: number }>()
async function limited(max = 8, windowMs = 60_000) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > windowMs) {
    hits.set(ip, { n: 1, t: now })
    if (hits.size > 5000) hits.clear()
    return false
  }
  return ++h.n > max
}

async function visitorId() {
  const c = await cookies()
  let v = c.get('vid')?.value
  if (!v) {
    v = crypto.randomUUID()
    c.set('vid', v, { httpOnly: true, sameSite: 'lax', maxAge: 31_536_000, path: '/' })
  }
  return v
}

export type FormState = 'ok' | 'error' | 'limit' | 'consent' | null

export async function subscribeAction(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get('website')) return 'ok' // honeypot: pretend success
  if (fd.get('consent') !== 'on') return 'consent' // GDPR: unticked box, no subscription
  if (await limited(5)) return 'limit'
  const { ok } = await cmsPost('/public/subscribe', {
    email: fd.get('email'),
    locale: fd.get('locale'),
    consent: true,
    consentText: fd.get('consentText'),
    subject: fd.get('subject'),
    text: fd.get('mail'),
  })
  return ok ? 'ok' : 'error'
}

export async function commentAction(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get('website')) return 'ok'
  if (await limited(4)) return 'limit'
  const { ok } = await cmsPost('/public/comment', {
    post: fd.get('post'),
    name: fd.get('name'),
    email: fd.get('email'),
    body: fd.get('body'),
    locale: fd.get('locale'),
    subject: fd.get('subject'),
    mail: fd.get('mail'),
  })
  return ok ? 'ok' : 'error'
}

export async function reactAction(post: string, type: string): Promise<Record<string, number> | null> {
  if (await limited(30)) return null
  const { ok, data } = await cmsPost('/public/react', { post, type, visitor: await visitorId() })
  return ok ? (data as Record<string, number>) : null
}

export async function unsubscribeAction(_: FormState, fd: FormData): Promise<FormState> {
  if (await limited(10)) return 'limit'
  const { ok } = await cmsPost('/public/unsubscribe', { token: fd.get('token') })
  return ok ? 'ok' : 'error'
}

export async function verifyAction(_: FormState, fd: FormData): Promise<FormState> {
  if (await limited(10)) return 'limit'
  const { ok, data } = await cmsPost('/public/verify', { kind: fd.get('kind'), token: fd.get('token') })
  return ok && data.ok ? 'ok' : 'error'
}
