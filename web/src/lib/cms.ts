import type { Locale } from './i18n'

const CMS = process.env.CMS_URL ?? 'http://127.0.0.1:3000'
const PUB = process.env.CMS_PUBLIC_URL ?? 'http://localhost:3000'
export const CMS_PUBLIC = PUB
export const SITE = process.env.SITE_URL ?? 'http://localhost:3001'
// pages declare their own literal `revalidate = 60` (Next needs a literal)
const REVALIDATE = 60

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Doc = Record<string, any>

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${CMS}/api${path}`, { next: { revalidate: REVALIDATE } })
    return r.ok ? ((await r.json()) as T) : fallback
  } catch {
    return fallback // CMS down: render an empty page instead of a 500
  }
}

const q = (o: Record<string, string | number>) => new URLSearchParams(o as Record<string, string>).toString()

// local-disk uploads come back as "/api/media/file/x.jpg"; Cloudinary ones are already absolute
export const media = (m: unknown): string | null => {
  const url = m && typeof m === 'object' ? ((m as Doc).url as string | undefined) : undefined
  return url ? (url.startsWith('http') ? url : PUB + url) : null
}

// Editors may type "instagram.com/x"; make it absolute and refuse anything but http(s) (no javascript: links)
export const safeUrl = (v: unknown): string | null => {
  const raw = typeof v === 'string' ? v.trim() : ''
  if (!raw) return null
  const url = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Dublin' })

export const getSettings = (l: Locale) => get<Doc>(`/globals/site-settings?${q({ locale: l, depth: 1 })}`, {})
export const getAbout = (l: Locale) => get<Doc>(`/globals/about-page?${q({ locale: l, depth: 0 })}`, {})
export const getPressKit = (l: Locale) => get<Doc>(`/globals/press-kit?${q({ locale: l, depth: 1 })}`, {})
export const getCoverage = async () =>
  (await get<{ docs: Doc[] }>(`/coverage?${q({ limit: 200, sort: '_order', depth: 1 })}`, { docs: [] })).docs

export async function getEvents(l: Locale, upcomingOnly = true) {
  const p = `/events?${q({ locale: l, limit: 100, sort: 'date', depth: 1 })}&where[status][equals]=published${
    upcomingOnly ? `&where[date][greater_than_equal]=${today()}` : ''
  }`
  return (await get<{ docs: Doc[] }>(p, { docs: [] })).docs
}

const HEX_ID = /^[a-f0-9]{24}$/i
// events made before slugs existed are reachable by id
export async function getEvent(l: Locale, slug: string) {
  const bySlug = (
    await get<{ docs: Doc[] }>(
      `/events?${q({ locale: l, limit: 1, depth: 1 })}&where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published`,
      { docs: [] },
    )
  ).docs[0]
  if (bySlug || !HEX_ID.test(slug)) return bySlug as Doc | undefined
  const byId = await get<Doc | null>(`/events/${slug}?${q({ locale: l, depth: 1 })}`, null)
  return byId?.status === 'published' ? byId : undefined
}
export const eventSlug = (e: Doc) => (e.slug as string) || (e.id as string)

// same type first, then anything else newest-first, never the post itself
export async function getRelated(l: Locale, post: Doc, n = 3) {
  const same = (await getPosts(l, { type: post.type, limit: n + 1 })).docs.filter((p) => p.id !== post.id)
  if (same.length >= n) return same.slice(0, n)
  const rest = (await getPosts(l, { limit: n * 3 })).docs.filter(
    (p) => p.id !== post.id && !same.some((x) => x.id === p.id),
  )
  return [...same, ...rest].slice(0, n)
}

export async function getPosts(l: Locale, opts: { type?: string; limit?: number; page?: number; tag?: string } = {}) {
  const p = `/posts?${q({ locale: l, limit: opts.limit ?? 12, page: opts.page ?? 1, sort: '-featured,-_order', depth: 1 })}&where[status][equals]=published${
    opts.type ? `&where[type][equals]=${opts.type}` : ''
  }${opts.tag ? `&where[tags.slug][equals]=${encodeURIComponent(opts.tag)}` : ''}`
  return get<{ docs: Doc[]; totalPages: number }>(p, { docs: [], totalPages: 0 })
}

export const getTags = async (l: Locale) =>
  (await get<{ docs: Doc[] }>(`/tags?${q({ locale: l, limit: 100, sort: 'name', depth: 0 })}`, { docs: [] })).docs

export const getKits = async (l: Locale) =>
  (
    await get<{ docs: Doc[] }>(
      `/kits?${q({ locale: l, limit: 100, sort: '-date', depth: 1 })}&where[status][equals]=published`,
      { docs: [] },
    )
  ).docs

export async function getKit(l: Locale, slug: string) {
  const p = `/kits?${q({ locale: l, limit: 1, depth: 2 })}&where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published`
  return (await get<{ docs: Doc[] }>(p, { docs: [] })).docs[0] as Doc | undefined
}

export async function getPost(l: Locale, slug: string) {
  const p = `/posts?${q({ locale: l, limit: 1, depth: 2 })}&where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published`
  return (await get<{ docs: Doc[] }>(p, { docs: [] })).docs[0] as Doc | undefined
}

const FALLBACK_PHOTOS = [
  { src: '/photo1.jpg', alt: 'Protest in Dublin' },
  { src: '/photo2.jpg', alt: 'Group at protest' },
  { src: '/photo3.jpg', alt: 'Group of members at a protest in Dublin' },
  { src: '/photo4.jpg', alt: 'Protester holding a DEMOCRACY sign' },
]
export const galleryPhotos = (s: Doc): { src: string; alt: string; caption?: string }[] => {
  const g = ((s.gallery as Doc[] | undefined) ?? []).flatMap((x) =>
    media(x.image) ? [{ src: media(x.image)!, alt: x.alt as string, caption: (x.caption as string) || undefined }] : [],
  )
  return g.length ? g : FALLBACK_PHOTOS
}

// the three photos stacked beside the home page headline: set in Site settings, else the first gallery photos
export const heroPhotos = (s: Doc): { src: string; alt: string }[] => {
  const h = ((s.heroPhotos as Doc[] | undefined) ?? []).flatMap((x) =>
    media(x.image) ? [{ src: media(x.image)!, alt: (x.alt as string) || '' }] : [],
  )
  if (h.length) return h
  const g = galleryPhotos(s)
  return [g[2] ?? g[0], g[0], g[1] ?? g[0]]
}

export const getTimeline = async (l: Locale) =>
  (await get<{ docs: Doc[] }>(`/timeline?${q({ locale: l, limit: 200, sort: '_order', depth: 1 })}`, { docs: [] })).docs

export const getTeam = async (l: Locale) =>
  (await get<{ docs: Doc[] }>(`/team?${q({ locale: l, limit: 100, sort: '_order', depth: 2 })}`, { docs: [] })).docs

export const getSupporters = async (l: Locale) =>
  (await get<{ docs: Doc[] }>(`/supporters?${q({ locale: l, limit: 100, sort: '_order', depth: 1 })}`, { docs: [] }))
    .docs

export async function getMember(l: Locale, id: string) {
  if (!HEX_ID.test(id)) return undefined
  return (await get<Doc | null>(`/team/${id}?${q({ locale: l, depth: 2 })}`, null)) ?? undefined
}

const PLATFORMS: Record<string, string> = {
  website: 'Website',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  fiverr: 'Fiverr',
  other: 'Link',
}
// the legacy single "link" field first, then the Social links list; bad urls are dropped
export const memberLinks = (m: Doc) =>
  [{ kind: 'website', url: m.link }, ...((m.links as { kind: string; url: string }[] | undefined) ?? [])].flatMap(
    (l) => {
      const href = safeUrl(l.url)
      return href ? [{ href, label: PLATFORMS[l.kind] ?? 'Link' }] : []
    },
  )

export const getReactions = (post: string) => get<Record<string, number>>(`/public/reactions?post=${post}`, {})

export const getComments = (post: string) => get<Doc[]>(`/public/comments?post=${post}`, [])

// server -> CMS writes (shared key)
export async function cmsPost(path: string, body: unknown) {
  const r = await fetch(`${CMS}/api${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-internal-key': process.env.INTERNAL_KEY ?? '' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return { ok: r.ok, data: (await r.json().catch(() => ({}))) as Doc }
}

// ~200 words a minute; counts words in Lexical text nodes (scripts without spaces fall back to characters / 6)
export function readingMinutes(body: Doc | undefined) {
  let words = 0
  const walk = (n: Doc) => {
    if (typeof n.text === 'string') words += n.text.trim().split(/\s+/).filter(Boolean).length || 0
    ;(n.children ?? []).forEach(walk)
  }
  if (body?.root) walk(body.root)
  return Math.max(1, Math.round(words / 200))
}
