import type { Endpoint, PayloadRequest } from 'payload'

import { REACTIONS } from './collections/Reactions'
import { LOCALE_CODES } from './locales'

// Called only by the website's server (shared key), so the browser never hits these directly.
const authed = (req: PayloadRequest) =>
  Boolean(process.env.INTERNAL_KEY) && req.headers.get('x-internal-key') === process.env.INTERNAL_KEY

const bad = (error: string, status = 400) => Response.json({ error }, { status })
const body = async <T>(req: PayloadRequest) => (await req.json!()) as T
const loc = (l?: string) => (LOCALE_CODES.includes(l as never) ? (l as string) : 'en')

// The website passes the (already translated) subject and text. "{link}" in the text becomes the confirmation URL.
async function sendConfirm(
  req: PayloadRequest,
  a: { to: string; subject?: string; text?: string; locale: string; kind: 'comment' | 'subscriber'; token: string },
) {
  const link = `${process.env.SITE_URL ?? 'http://localhost:3001'}/${a.locale}/verify?k=${a.kind}&t=${a.token}`
  const text = (a.text?.includes('{link}') ? a.text : `Please confirm: {link}`).replace('{link}', link).slice(0, 2000)
  // dev convenience: without SMTP the email goes nowhere, so print the link in the server log
  if (!process.env.SMTP_HOST) req.payload.logger.info(`[no SMTP] confirmation link for ${a.to}: ${link}`)
  await req.payload.sendEmail({ to: a.to, subject: (a.subject || 'Please confirm').slice(0, 150), text })
}

async function counts(req: PayloadRequest, post: string) {
  const out: Record<string, number> = {}
  for (const type of REACTIONS) {
    const { totalDocs } = await req.payload.count({
      collection: 'reactions',
      where: { post: { equals: post }, type: { equals: type } },
      overrideAccess: true,
    })
    out[type] = totalDocs
  }
  return out
}

const MAX_COMMENT = 1000

export const endpoints: Endpoint[] = [
  {
    path: '/public/subscribe',
    method: 'post',
    handler: async (req) => {
      if (!authed(req)) return bad('forbidden', 403)
      const { email, locale, consent, consentText, subject, text } =
        await body<Record<string, string | boolean | undefined>>(req)
      if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) return bad('Invalid email')
      if (consent !== true) return bad('Consent is required') // GDPR: explicit opt-in only
      const l = loc(locale as string)
      const { docs } = await req.payload.find({
        collection: 'subscribers',
        where: { email: { equals: email.toLowerCase() } },
        limit: 1,
        overrideAccess: true,
      })
      let sub = docs[0]
      if (!sub)
        sub = await req.payload.create({
          collection: 'subscribers',
          data: {
            email: email.toLowerCase(),
            locale: l as never,
            consentedAt: new Date().toISOString(),
            consentText: String(consentText ?? '').slice(0, 300),
          },
          overrideAccess: true,
        })
      // double opt-in: nobody is mailed until they click the link. Same reply whether or not they already existed.
      if (!sub.confirmed && sub.token)
        await sendConfirm(req, {
          to: sub.email,
          subject: subject as string,
          text: text as string,
          locale: l,
          kind: 'subscriber',
          token: sub.token,
        }).catch((e) => req.payload.logger.error(e))
      return Response.json({ ok: true })
    },
  },
  {
    path: '/public/unsubscribe',
    method: 'post',
    handler: async (req) => {
      if (!authed(req)) return bad('forbidden', 403)
      const { token } = await body<{ token?: string }>(req)
      if (!token) return bad('Invalid link')
      await req.payload.delete({ collection: 'subscribers', where: { token: { equals: token } }, overrideAccess: true })
      return Response.json({ ok: true }) // same reply whether or not it existed
    },
  },
  {
    path: '/public/verify',
    method: 'post',
    handler: async (req) => {
      if (!authed(req)) return bad('forbidden', 403)
      const { kind, token } = await body<{ kind?: string; token?: string }>(req)
      if (!token) return bad('Invalid link')
      if (kind === 'subscriber') {
        const r = await req.payload.update({
          collection: 'subscribers',
          where: { token: { equals: token } },
          data: { confirmed: true },
          overrideAccess: true,
        })
        return Response.json({ ok: r.docs.length > 0 })
      }
      if (kind === 'comment') {
        const r = await req.payload.update({
          collection: 'comments',
          where: { token: { equals: token }, status: { equals: 'unverified' } },
          data: { status: 'pending' },
          overrideAccess: true,
        })
        return Response.json({ ok: r.docs.length > 0 })
      }
      return bad('Invalid link')
    },
  },
  {
    path: '/public/reactions',
    method: 'get',
    handler: async (req) => {
      const post = req.searchParams.get('post')
      return post ? Response.json(await counts(req, post)) : bad('post required')
    },
  },
  {
    path: '/public/react',
    method: 'post',
    handler: async (req) => {
      if (!authed(req)) return bad('forbidden', 403)
      const { post, type, visitor } = await body<{ post?: string; type?: string; visitor?: string }>(req)
      if (!post || !visitor || !REACTIONS.includes(type as never)) return bad('Invalid reaction')
      const where = { post: { equals: post }, visitor: { equals: visitor } }
      const { docs } = await req.payload.find({ collection: 'reactions', where, limit: 1, overrideAccess: true })
      if (docs[0] && docs[0].type === type)
        await req.payload.delete({ collection: 'reactions', id: docs[0].id, overrideAccess: true }) // same click = undo
      else if (docs[0])
        await req.payload.update({
          collection: 'reactions',
          id: docs[0].id,
          data: { type: type as never },
          overrideAccess: true,
        })
      else
        await req.payload.create({
          collection: 'reactions',
          data: { post, type: type as never, visitor },
          overrideAccess: true,
        })
      return Response.json(await counts(req, post))
    },
  },
  {
    path: '/public/comments',
    method: 'get',
    handler: async (req) => {
      const post = req.searchParams.get('post')
      if (!post) return bad('post required')
      const { docs } = await req.payload.find({
        collection: 'comments',
        where: { post: { equals: post }, status: { equals: 'approved' } },
        sort: 'createdAt',
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      return Response.json(docs.map((c) => ({ id: c.id, name: c.name, body: c.body, createdAt: c.createdAt })))
    },
  },
  {
    path: '/public/comment',
    method: 'post',
    handler: async (req) => {
      if (!authed(req)) return bad('forbidden', 403)
      const {
        post,
        name,
        email,
        body: text,
        locale,
        subject,
        mail,
      } = await body<Record<string, string | undefined>>(req)
      if (!post || !name?.trim() || !text?.trim()) return bad('Name and comment are required')
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) return bad('A valid email is required to comment')
      if (text.trim().length > MAX_COMMENT) return bad(`Comments can be at most ${MAX_COMMENT} characters`)
      // keep one person (or a bot) from filling a post or the moderation queue
      const mine = email.toLowerCase()
      const day = new Date(Date.now() - 86_400_000).toISOString()
      const [today, onPost, queue] = await Promise.all([
        req.payload.count({ collection: 'comments', where: { email: { equals: mine }, createdAt: { greater_than: day } }, overrideAccess: true }),
        req.payload.count({ collection: 'comments', where: { email: { equals: mine }, post: { equals: post } }, overrideAccess: true }),
        req.payload.count({ collection: 'comments', where: { post: { equals: post }, status: { in: ['unverified', 'pending'] } }, overrideAccess: true }),
      ])
      if (today.totalDocs >= 3 || onPost.totalDocs >= 5 || queue.totalDocs >= 100) return bad('Too many comments. Try again later.', 429)
      const l = loc(locale)
      const token = crypto.randomUUID()
      await req.payload.create({
        collection: 'comments',
        data: {
          post,
          name: name.trim().slice(0, 80),
          email: email.toLowerCase(),
          body: text.trim(),
          status: 'unverified',
          token,
          locale: l,
        },
        overrideAccess: true,
      })
      await sendConfirm(req, { to: email, subject, text: mail, locale: l, kind: 'comment', token }).catch((e) =>
        req.payload.logger.error(e),
      )
      return Response.json({ ok: true })
    },
  },
]
