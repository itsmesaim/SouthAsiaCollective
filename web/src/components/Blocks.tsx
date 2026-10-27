import Link from 'next/link'

import { type Doc, eventSlug, media, safeUrl } from '@/lib/cms'
import { dayParts, longDate, t12 } from '@/lib/format'
import { type Locale, fill, sectionOfType, tr } from '@/lib/i18n'
import { fmtDate } from '@/lib/seo'

const Pin = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/* hero headline: every word is its own cut-out paper chip, pasted on one after another */
const CHIPS = ['a', 'b', 'c', 'd']
const TILT = [-2.2, 1.6, -1, 2.4, -1.8, 1.1, -2.6, 1.9]
export function CutHeadline({ line1, line2 }: { line1: string; line2: string }) {
  const words = [
    ...line1.split(/\s+/).map((w) => [w, 'a'] as const),
    ...line2.split(/\s+/).map((w, i) => [w, i % 2 ? 'c' : 'b'] as const),
  ]
  return (
    <h1>
      {words.map(([w, c], i) => (
        <span
          key={i}
          className={`cut ${c === 'a' ? CHIPS[0] : c}`}
          style={{ ['--i' as string]: i, ['--r' as string]: `${TILT[i % TILT.length]}deg` }}
        >
          {w}
        </span>
      ))}
    </h1>
  )
}

export function Tapes({ words }: { words: string[] }) {
  const row = [...words, ...words, ...words, ...words] // the strip slides by half its width, so it needs two identical halves
  return (
    <div className="tapes" aria-hidden="true">
      <div className="tape">
        {row.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="tape rev">
        {[...row].reverse().map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  )
}

/* events as ticket stubs */
export function EventList({ events, locale }: { events: Doc[]; locale: Locale }) {
  const t = tr(locale)
  if (!events.length) return <p className="none">{t.noEvents}</p>
  return (
    <div className="tickets">
      {events.map((e) => {
        const d = dayParts(e.date, locale)
        const href = `/${locale}/events/${eventSlug(e)}`
        return (
          <article className={e.important ? 'ticket imp' : 'ticket'} key={e.id}>
            {e.important && <span className="sticker saffron flag">{t.important}</span>}
            <div className="stamp">
              <em className="kind" data-kind={e.kind ?? 'event'}>
                {t.kinds[e.kind] ?? t.kinds.event}
              </em>
              <small aria-hidden="true">{d.weekday}</small>
              <b aria-hidden="true">{d.day}</b>
              <span aria-hidden="true">{d.month}</span>
            </div>
            <div className="info">
              <h3>
                <Link href={href}>{e.title}</Link>
              </h3>
              <div className="where">
                <Pin /> {t12(e.time)} · {e.place}
              </div>
              {e.description && <p>{e.description}</p>}
            </div>
            <div className="acts">
              <Link className="btn small" href={href}>
                {t.shareTitle}
              </Link>
              <a
                className="btn small paper"
                target="_blank"
                rel="noopener"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.place)}`}
              >
                {t.directions}
              </a>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export const eventJsonLd = (e: Doc, locale: Locale, site: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: e.title,
  startDate: `${String(e.date).slice(0, 10)}T${e.time}`,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  inLanguage: locale,
  url,
  location: {
    '@type': 'Place',
    name: e.place,
    address: e.place,
    ...(e.lat != null && e.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: e.lat, longitude: e.lng } }
      : {}),
  },
  image: [`${site}/${locale}/events/${eventSlug(e)}/og.jpg`],
  description: e.shareCaption || e.description,
  isAccessibleForFree: true,
  organizer: { '@type': 'Organization', name: 'South Asia Collective', url: site },
})

export const eventsJsonLd = (events: Doc[], locale: Locale, site: string) =>
  events.map((e) => eventJsonLd(e, locale, site, `${site}/${locale}/events/${eventSlug(e)}`))

/* posts as flyers */
export function Flyers({ posts, locale, lead = false }: { posts: Doc[]; locale: Locale; lead?: boolean }) {
  return (
    <div className="flyers">
      {posts.map((p, i) => (
        <Flyer key={p.id} post={p} locale={locale} lead={lead && i === 0} />
      ))}
    </div>
  )
}

export function Flyer({ post, locale, lead }: { post: Doc; locale: Locale; lead?: boolean }) {
  const t = tr(locale)
  const img = media(post.cover)
  const href = `/${locale}/${sectionOfType(post.type)}/${post.slug}`
  const body = (
    <>
      <div className="meta">
        <span className="sticker green">{t[sectionOfType(post.type) as 'blog']}</span>
        {post.publishedAt && <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt, locale)}</time>}
      </div>
      <h3>
        <Link href={href}>{post.title}</Link>
      </h3>
      {post.excerpt && <p>{post.excerpt}</p>}
    </>
  )
  return (
    <article className={lead ? 'flyer lead' : 'flyer'}>
      {post.featured && <span className="sticker flag">{t.featured}</span>}
      {img && (
        <div className="pic">
          <img src={img} alt={post.cover?.alt ?? ''} loading="lazy" />
        </div>
      )}
      {lead ? <div className="txt">{body}</div> : body}
    </article>
  )
}

/* news coverage as clippings */
export function Clippings({ items }: { items: Doc[] }) {
  return (
    <ul className="clips">
      {items.map((c) => {
        const img = media(c.image)
        return (
          <li className="clip" key={c.id}>
            <a className="main" href={c.url} target="_blank" rel="noopener noreferrer">
              {img && <img src={img} alt="" loading="lazy" />}
              <b>{c.outlet}</b>
              <span>{c.title}</span>
            </a>
            {safeUrl(c.archiveUrl) && (
              <a className="arch" href={safeUrl(c.archiveUrl)!} target="_blank" rel="noopener noreferrer">
                Archived copy
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function TimelineCard({ item }: { item: Doc }) {
  const img = media(item.image)
  return (
    <article className={img ? 'card has-img' : 'card'}>
      {img && <img className="cimg" src={img} alt="" loading="lazy" />}
      <span className="when">{item.dateLabel}</span>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </article>
  )
}

export type Photo = { src: string; alt: string; caption?: string }
// layout comes from the CMS (Site settings > Photo gallery layout)
export function Gallery({ photos, layout = 'collage' }: { photos: Photo[]; layout?: string }) {
  const known = ['collage', 'grid', 'featured', 'strip'].includes(layout) ? layout : 'collage'
  return (
    <div className={`gal ${known === 'collage' ? 'wall' : known}`}>
      {photos.map((p, i) => (
        <figure className="pin" key={i}>
          <span className="im">
            <img src={p.src} alt={p.alt} loading="lazy" />
          </span>
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}

export const readTime = (n: number, l: Locale) => fill(tr(l).readingTime, { n })
export { longDate }

export function Badges({ list }: { list?: unknown[] }) {
  const badges = (list ?? []).filter((b): b is { id: string; label: string; color?: string } => typeof b === 'object')
  return badges.length ? (
    <div className="bdg">
      {badges.map((b) => (
        <span key={b.id} style={{ background: b.color || '#f55600', color: '#fff' }}>
          {b.label}
        </span>
      ))}
    </div>
  ) : null
}
