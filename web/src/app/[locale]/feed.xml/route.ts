import { SITE, getPosts } from '@/lib/cms'
import { isLocale, sectionOfType, tr } from '@/lib/i18n'

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`)

export const revalidate = 300

export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return new Response('Not found', { status: 404 })
  const { docs } = await getPosts(locale, { limit: 30 })
  const items = docs
    .map((p) => {
      const url = `${SITE}/${locale}/${sectionOfType(p.type)}/${p.slug}`
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate><category>${esc(p.type)}</category><description>${esc(p.excerpt ?? '')}</description></item>`
    })
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/feed.xsl"?><rss version="2.0"><channel><title>South Asia Collective</title><link>${SITE}/${locale}</link><description>${esc(tr(locale).siteDesc)}</description><language>${locale}</language>${items}</channel></rss>`
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } })
}
