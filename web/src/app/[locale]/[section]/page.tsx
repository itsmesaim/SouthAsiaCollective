import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Flyers, JsonLd } from '@/components/Blocks'
import { SITE, getPosts, getTags } from '@/lib/cms'
import { SECTIONS, type Section, isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = {
  params: Promise<{ locale: string; section: string }>
  searchParams: Promise<{ page?: string; tag?: string }>
}
const keys = Object.keys(SECTIONS) as Section[]

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, section } = await params
  if (!isLocale(locale) || !(section in SECTIONS)) return {}
  const t = tr(locale)
  return {
    title: t[section as Section],
    description: t[`${section}Desc` as 'blogDesc'] ?? t.siteDesc,
    alternates: { ...alts(`/${section}`, locale), types: { 'application/rss+xml': `${SITE}/${locale}/feed.xml` } },
    ...share(`${SITE}/${locale}/${section}`, t[section as Section], t[`${section}Desc` as 'blogDesc'] ?? t.siteDesc),
  }
}

export default async function List({ params, searchParams }: P) {
  const { locale, section } = await params
  if (!isLocale(locale) || !(section in SECTIONS)) notFound()
  const t = tr(locale)
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const tag = sp.tag && /^[\w-]+$/.test(sp.tag) ? sp.tag : undefined
  const [{ docs, totalPages }, tags] = await Promise.all([
    getPosts(locale, { type: SECTIONS[section as Section], page, limit: 12, tag }),
    getTags(locale),
  ])
  return (
    <section className="band">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t[section as Section],
          url: `${SITE}/${locale}/${section}`,
          inLanguage: locale,
        }}
      />
      <div className="w">
        <div className="sec-head">
          <h1 style={{ fontSize: 'clamp(2.5rem,6.4vw,5rem)' }}>{t[section as Section]}</h1>
        </div>
        <nav className="tabs" aria-label="Sections">
          {keys.map((k) => (
            <Link key={k} href={`/${locale}/${k}`} aria-current={k === section ? 'page' : undefined}>
              {t[k]}
            </Link>
          ))}
          <Link href={`/${locale}/press-kit`}>{t.pressKit}</Link>
        </nav>
        {tags.length > 0 && (
          <ul className="taglist" aria-label={t.topics}>
            <li>
              <Link href={`/${locale}/${section}`} aria-current={!tag ? 'page' : undefined}>
                {t.allTags}
              </Link>
            </li>
            {tags.map((g) => (
              <li key={g.id}>
                <Link href={`/${locale}/${section}?tag=${g.slug}`} aria-current={tag === g.slug ? 'page' : undefined}>
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {docs.length ? <Flyers posts={docs} locale={locale} lead={page === 1} /> : <p className="none">{t.empty}</p>}
        {totalPages > 1 && (
          <div className="pager">
            {page > 1 && (
              <Link
                className="btn paper"
                href={`/${locale}/${section}?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}
                rel="prev"
              >
                ←
              </Link>
            )}
            {page < totalPages && (
              <Link
                className="btn paper"
                href={`/${locale}/${section}?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}
                rel="next"
              >
                →
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
