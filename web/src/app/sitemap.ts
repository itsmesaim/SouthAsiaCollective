import type { MetadataRoute } from 'next'

import { SITE, eventSlug, getEvents, getKits, getPosts } from '@/lib/cms'
import { locales, sectionOfType } from '@/lib/i18n'

export const revalidate = 3600

// One entry per page (English URL) with hreflang alternates for every language. Each language page also self-canonicals.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ docs }, events, kits] = await Promise.all([getPosts('en', { limit: 1000 }), getEvents('en'), getKits('en')])
  const entry = (path: string, lastModified?: string, priority?: number) => ({
    url: `${SITE}/en${path}`,
    lastModified,
    priority,
    alternates: {
      languages: { ...Object.fromEntries(locales.map((l) => [l, `${SITE}/${l}${path}`])), 'x-default': `${SITE}/en${path}` },
    },
  })
  return [
    entry('', undefined, 1),
    ...[
      '/about',
      '/events',
      '/blog',
      '/press-kit',
      '/history',
      '/gallery',
      '/in-the-news',
      '/privacy',
    ].map((p) => entry(p, undefined, 0.7)),
    ...events.filter((e) => !e.seo?.noIndex).map((e) => entry(`/events/${eventSlug(e)}`, e.updatedAt, 0.8)),
    ...kits.filter((k) => !k.seo?.noIndex).map((k) => entry(`/press-kit/${k.slug}`, k.updatedAt, 0.7)),
    ...docs.filter((p) => !p.seo?.noIndex).map((p) => entry(`/${sectionOfType(p.type)}/${p.slug}`, p.updatedAt, 0.8)),
  ]
}
