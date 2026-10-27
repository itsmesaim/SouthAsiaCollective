import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Clippings, CutHeadline, JsonLd } from '@/components/Blocks'
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

// a fact that is really a link (handle, web address, email) becomes clickable
function factHref(label: string, value: string): string | null {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v
  if (/^\S+@\S+\.\S+$/.test(v)) return `mailto:${v}`
  if (/^@[\w.]+$/.test(v)) {
    const h = v.slice(1)
    if (/insta/i.test(label)) return `https://www.instagram.com/${h}/`
    if (/^(x|twitter)\b/i.test(label)) return `https://x.com/${h}`
    if (/facebook/i.test(label)) return `https://www.facebook.com/${h}`
    if (/tiktok/i.test(label)) return `https://www.tiktok.com/@${h}`
    if (/youtube/i.test(label)) return `https://www.youtube.com/@${h}`
    return null
  }
  // our own website: no point linking to the page you are on
  if (/^web(site)?$/i.test(label) || /southasiacollective\.ie/i.test(v)) return null
  if (/^(www\.)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v)) return `https://${v}`
  return null
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
  const uploaded = media(kit.groupPhoto)
  const groupPhoto = uploaded ?? '/photo3.jpg'
  const groupAlt = (kit.groupPhoto as Doc | undefined)?.alt || 'South Asia Collective members at a protest in Dublin'
  const groupCaption = uploaded ? ((kit.groupPhoto as Doc).caption as string | undefined) : undefined
  const [first, ...rest] = t.pressKitTitle.split(/\s+/)
  const mail = contacts.find((c) => c.email)?.email
  const jumps = [
    kits.length > 0 && { href: '#kits', label: t.kitLatest },
    { href: '#info', label: t.generalInfo },
    assets.length > 0 && { href: '#assets', label: t.assets },
    coverage.length > 0 && { href: '#news', label: t.inTheNews },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <>
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

      <section className="hero pk-hero">
        <div className="w">
          <div>
            <p className="note">{t.press}</p>
            <CutHeadline line1={first} line2={rest.join(' ') || first} />
            <p className="lead">{t.pressKitIntro}</p>
            <div className="cta">
              {assets.length > 0 && (
                <a className="btn" href="/press-kit/all.zip">
                  {t.downloadAll}
                </a>
              )}
              {mail && (
                <a className="btn paper" href={`mailto:${mail}`}>
                  {t.emailUs}
                </a>
              )}
            </div>
          </div>
          <nav className="pk-jump" aria-label={t.pressKitTitle}>
            {jumps.map((j) => (
              <a key={j.href} href={j.href}>
                {j.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {kits.length > 0 && (
        <section className="band" id="kits" style={{ paddingTop: 0 }}>
          <div className="w">
            <div className="sec-head">
              <h2>{t.kitLatest}</h2>
            </div>
            <KitCard k={kits[0]} locale={locale} big />
            {kits.length > 1 && (
              <>
                <div className="sec-head" style={{ marginTop: 56 }}>
                  <h2>{t.kitEarlier}</h2>
                </div>
                <div className="kitgrid">
                  {kits.slice(1).map((k) => (
                    <KitCard key={k.id} k={k} locale={locale} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="band saffron" id="info">
        <div className="w kit">
          <div className="sec-head">
            <h2>{t.generalInfo}</h2>
          </div>
          {facts.length > 0 && (
            <div className="pk-facts">
              {facts.map((f) => {
                const href = factHref(f.label, f.value)
                const cls = f.value.length > 18 ? 'pk-fact long' : 'pk-fact'
                const inner = (
                  <>
                    <b>{f.value}</b>
                    <span>{f.label}</span>
                  </>
                )
                return href ? (
                  <a
                    className={cls}
                    key={f.id}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cls} key={f.id}>
                    {inner}
                  </div>
                )
              })}
            </div>
          )}
          <div className="give">
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
            <figure className="pk-photo">
              <img src={groupPhoto} alt={groupAlt} loading="lazy" />
              {groupCaption && <figcaption>{groupCaption}</figcaption>}
            </figure>
          </div>
          {kit.guidelines && (
            <section className="sheet t1">
              <h2>{t.guidelines}</h2>
              <p>{kit.guidelines}</p>
            </section>
          )}
          {assets.length > 0 && (
            <section className="sheet" id="assets">
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
        </div>
      </section>

      {coverage.length > 0 && (
        <section className="band green" id="news">
          <div className="w">
            <div className="sec-head">
              <h2>{t.inTheNews}</h2>
            </div>
            <Clippings items={coverage} />
          </div>
        </section>
      )}
    </>
  )
}
