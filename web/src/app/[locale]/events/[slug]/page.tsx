import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd, eventJsonLd } from '@/components/Blocks'
import ShareBar from '@/components/ShareBar'
import { type Doc, SITE, eventSlug, getEvent, media, today } from '@/lib/cms'
import { dayParts, eventCaption, eventUrl, longDate, t12 } from '@/lib/format'
import { isLocale, tr } from '@/lib/i18n'
import { alts, seoOf } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const e = await getEvent(locale, slug)
  if (!e) return { robots: { index: false } }
  const s = eventSlug(e)
  const o = seoOf(e)
  const desc = (o.description ||
    e.shareCaption ||
    e.description ||
    `${longDate(e.date, locale)}, ${t12(e.time)}, ${e.place}`) as string
  const title = (o.title || e.title) as string
  const image = o.image
    ? { url: o.image, alt: title }
    : { url: `${SITE}/${locale}/events/${s}/og.jpg`, width: 1200, height: 630, alt: title }
  return {
    title,
    description: desc,
    robots: o.noindex ? { index: false, follow: true } : undefined,
    alternates: alts(`/events/${s}`, locale),
    openGraph: { type: 'website', url: eventUrl(locale, s), title, description: desc, images: [image] },
    twitter: { card: 'summary_large_image', title, description: desc, images: [image.url] },
  }
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
)

export default async function EventPage({ params }: P) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const e = await getEvent(locale, slug)
  if (!e) notFound()
  const t = tr(locale)
  const s = eventSlug(e)
  const url = eventUrl(locale, s)
  const d = dayParts(e.date, locale)
  const cover = media(e.cover)
  const photos = ((e.photos as Doc[] | undefined) ?? []).flatMap((m) => {
    const src = media(m)
    return src ? [{ src, alt: (m.alt as string) || '' }] : []
  })
  const over = String(e.date).slice(0, 10) < today()

  return (
    <article className="page">
      <JsonLd data={eventJsonLd(e, locale, SITE, url)} />
      <div className="w">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{t.home}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/events`}>{t.events}</Link>
        </nav>
        <div className="event-hero">
          <div>
            {e.important && <span className="sticker saffron">{t.important}</span>}
            <h1>{e.title}</h1>
            <div className="facts">
              <div className="fact">
                <Icon d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" />
                <div>
                  <strong>{longDate(e.date, locale)}</strong>
                  <span>{t12(e.time)}</span>
                </div>
              </div>
              <div className="fact">
                <Icon d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 10.5m-2.5 0a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0" />
                <div>
                  <strong>{e.place}</strong>
                  <a
                    className="chip"
                    style={{ marginTop: 8 }}
                    target="_blank"
                    rel="noopener"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.place)}`}
                  >
                    {t.directions}
                  </a>
                </div>
              </div>
            </div>
            {e.description && (
              <p className="lead-text" style={{ color: '#ecebe4' }}>
                {e.description}
              </p>
            )}
            {photos.length > 0 && (
              <div className="event-photos">
                {photos.map((p) => (
                  <a href={p.src} target="_blank" rel="noopener" key={p.src}>
                    <img src={p.src} alt={p.alt} loading="lazy" />
                  </a>
                ))}
              </div>
            )}
            <div className="cta" style={{ marginTop: 22 }}>
              <a className="btn" href={`/${locale}/events/${s}/calendar.ics`}>
                {t.addToCalendar}
              </a>
            </div>
            {over && (
              <p className="msg" style={{ marginTop: 18, display: 'inline-block' }}>
                {t.past}
              </p>
            )}
          </div>
          <div className="poster">
            {cover && <img src={cover} alt={e.cover?.alt ?? ''} />}
            <div className="big">
              {d.day} {d.month}
              <br />
              {t12(e.time)}
            </div>
          </div>
        </div>
        {!over && (
          <ShareBar
            url={url}
            text={eventCaption(e, locale)}
            title={e.title}
            image={`/${locale}/events/${s}/story.jpg`}
            imageName={`${s}-story.jpg`}
            labels={t}
          />
        )}
      </div>
    </article>
  )
}
