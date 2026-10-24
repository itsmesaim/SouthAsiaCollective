import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Clippings, JsonLd } from '@/components/Blocks'
import RichText from '@/components/RichText'
import { type Doc, SITE, getKit, media } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, fmtDate, seoOf } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const k = await getKit(locale, slug)
  if (!k) return { robots: { index: false } }
  const url = `${SITE}/${locale}/press-kit/${slug}`
  const o = seoOf(k)
  const img = o.image || media(k.cover)
  const images = img ? [{ url: img, alt: k.title as string }] : [{ url: '/og.jpg', width: 1200, height: 630 }]
  const title = o.title || `${k.title} · ${tr(locale).pressKitTitle}`
  const description = o.description || k.summary || undefined
  return {
    title: { absolute: title },
    description,
    robots: o.noindex ? { index: false, follow: true } : undefined,
    alternates: alts(`/press-kit/${slug}`, locale),
    openGraph: { type: 'article', url, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  }
}

export default async function KitPage({ params }: P) {
  const { locale: l, slug } = await params
  if (!isLocale(l)) notFound()
  const locale = l as 'en'
  const t = tr(locale)
  const k = await getKit(locale, slug)
  if (!k) notFound()
  const photos = ((k.photos ?? []) as Doc[]).filter((p) => media(p.file))
  const coverage = ((k.coverage ?? []) as Doc[]).filter((c) => typeof c === 'object')
  const url = `${SITE}/${locale}/press-kit/${slug}`

  return (
    <article className="page">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: k.title,
          url,
          inLanguage: locale,
          datePublished: k.date,
          about: { '@id': `${SITE}/#org` },
        }}
      />
      <div className="w">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{t.home}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/press-kit`}>{t.kitBack}</Link>
        </nav>
        <time className="kit-date" dateTime={k.date}>
          {fmtDate(k.date, locale)}
        </time>
        <h1>{k.title}</h1>
        {k.summary && (
          <p className="lead-text" style={{ color: '#ecebe4', maxWidth: '36em' }}>
            {k.summary}
          </p>
        )}

        {k.packet && (
          <section className="sheet packet" style={{ marginTop: 32 }}>
            <RichText data={k.packet} locale={locale} />
          </section>
        )}

        {photos.length > 0 && (
          <section className="sheet" style={{ marginTop: 36 }}>
            <h2>{t.kitPhotos}</h2>
            <div className="assets">
              {photos.map((p, i) => (
                <figure className="asset" key={i} style={{ margin: 0 }}>
                  <div className="th">
                    <img src={media(p.file)!} alt={p.caption ?? ''} loading="lazy" />
                  </div>
                  {(p.caption || p.credit) && (
                    <figcaption style={{ fontWeight: 600 }}>
                      {p.caption}
                      {p.credit ? ` (${p.credit})` : ''}
                    </figcaption>
                  )}
                  <a className="btn small" href={`/press-kit/file/${(p.file as Doc).id}`}>
                    {t.download}
                  </a>
                </figure>
              ))}
            </div>
          </section>
        )}

        {coverage.length > 0 && (
          <div className="related">
            <h2>{t.kitCoverage}</h2>
            <Clippings items={coverage} />
          </div>
        )}
      </div>
    </article>
  )
}
