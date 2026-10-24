import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Clippings, JsonLd } from '@/components/Blocks'
import { type Doc, SITE, getCoverage, getKits, getPressKit, media } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, fmtDate, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  const kit = await getPressKit(locale)
  const desc = ((kit.boilerplate as string) || t.pressKitIntro).slice(0, 200)
  return {
    title: t.pressKitTitle,
    description: desc,
    alternates: alts('/press-kit', locale),
    ...share(`${SITE}/${locale}/press-kit`, t.pressKitTitle, desc),
  }
}

// one card per protest, newest first
function KitCard({ k, locale, big }: { k: Doc; locale: 'en'; big?: boolean }) {
  const img = media(k.cover)
  return (
    <article className={big ? 'kitcard big' : 'kitcard'}>
      {img && (
        <div className="pic">
          <img src={img} alt="" loading="lazy" />
        </div>
      )}
      <div className="txt">
        <time dateTime={k.date}>{fmtDate(k.date, locale)}</time>
        <h3>
          <Link href={`/${locale}/press-kit/${k.slug}`}>{k.title}</Link>
        </h3>
        {k.summary && <p>{k.summary}</p>}
      </div>
    </article>
  )
}

export default async function PressKit({ params }: P) {
  const { locale: l } = await params
  if (!isLocale(l)) notFound()
  const locale = l as 'en'
  const t = tr(locale)
  const [kit, coverage, kits] = await Promise.all([getPressKit(locale), getCoverage(), getKits(locale)])
  const facts = (kit.facts ?? []) as { id: string; label: string; value: string }[]
  const contacts = (kit.contacts ?? []) as { id: string; name: string; role?: string; email?: string; phone?: string }[]
  const assets = (kit.assets ?? []) as Doc[]
  const url = `${SITE}/${locale}/press-kit`

  return (
    <article className="page">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t.pressKitTitle,
          url,
          inLanguage: locale,
          about: { '@id': `${SITE}/#org` },
        }}
      />
      <div className="w">
        <h1>{t.pressKitTitle}</h1>
        <p className="lead-text" style={{ color: '#ecebe4', maxWidth: '36em' }}>
          {t.pressKitIntro}
        </p>

        {kits.length > 0 && (
          <section className="kits">
            <h2>{t.kitLatest}</h2>
            <KitCard k={kits[0]} locale={locale} big />
            {kits.length > 1 && (
              <>
                <h2 style={{ marginTop: 48 }}>{t.kitEarlier}</h2>
                <div className="kitgrid">
                  {kits.slice(1).map((k) => (
                    <KitCard key={k.id} k={k} locale={locale} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <div className="kit" style={{ marginTop: 48 }}>
          <h2>{t.generalInfo}</h2>
          <div className="give">
            {facts.length > 0 && (
              <section className="sheet">
                <h2>{t.facts}</h2>
                <dl>
                  {facts.map((f) => (
                    <div key={f.id} style={{ display: 'contents' }}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {contacts.length > 0 && (
              <section className="sheet t2">
                <h2>{t.contacts}</h2>
                {contacts.map((c) => (
                  <p key={c.id}>
                    <strong>{c.name}</strong>
                    {c.role ? `, ${c.role}` : ''}
                    <br />
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ textDecoration: 'underline' }}>
                        {c.email}
                      </a>
                    )}
                    {c.phone && (
                      <>
                        <br />
                        {c.phone}
                      </>
                    )}
                  </p>
                ))}
              </section>
            )}
          </div>

          {assets.length > 0 && (
            <section className="sheet">
              <h2>{t.assets}</h2>
              <div className="assets">
                {assets.map((a) => (
                  <figure className="asset" key={a.id} style={{ margin: 0 }}>
                    <div className="th">
                      {media(a.file) && <img src={media(a.file)!} alt={a.title} loading="lazy" />}
                    </div>
                    <figcaption style={{ fontWeight: 600 }}>{a.title}</figcaption>
                    <a className="btn small" href={`/press-kit/file/${(a.file as Doc).id}`}>
                      {t.download}
                    </a>
                  </figure>
                ))}
              </div>
              <a className="btn gold" href="/press-kit/all.zip">
                {t.downloadAll}
              </a>
            </section>
          )}

          {kit.guidelines && (
            <section className="sheet t2">
              <h2>{t.guidelines}</h2>
              <p>{kit.guidelines}</p>
            </section>
          )}
        </div>

        {coverage.length > 0 && (
          <div className="related" id="news">
            <h2>{t.inTheNews}</h2>
            <Clippings items={coverage} />
          </div>
        )}
      </div>
    </article>
  )
}
