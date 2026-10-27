import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CutHeadline, TimelineCard, Gallery, EventList, Flyers, JsonLd, Tapes, eventsJsonLd } from '@/components/Blocks'
import { SubscribeForm } from '@/components/Forms'
import { SITE, galleryPhotos, getEvents, heroPhotos, getPosts, getSettings, getTimeline, safeUrl } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  return {
    title: { absolute: 'South Asia Collective · Dublin, Ireland' },
    description: t.siteDesc,
    alternates: alts('', locale),
    ...share(`${SITE}/${locale}`, 'South Asia Collective · Dublin, Ireland', t.heroText),
  }
}

export default async function Home({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const [s, events, latest, timeline] = await Promise.all([
    getSettings(locale),
    getEvents(locale),
    getPosts(locale, { limit: 4 }),
    getTimeline(locale),
  ])

  const allPhotos = galleryPhotos(s)
  const photos = allPhotos.slice(0, 4)
  const hero = heroPhotos(s)
  const ticker = s.tickerWords?.length ? (s.tickerWords as { word: string }[]).map((w) => w.word) : t.ticker
  const pills = s.aboutPills?.length ? (s.aboutPills as { text: string }[]).map((p) => p.text) : t.pills
  // the CMS stores the English defaults too: show our translated text unless an editor changed it
  const edited = (v: string | undefined, en: string) => (v && v !== en ? v : undefined)
  const email = s.contactEmail || 'contact@southasiacollective.ie'
  const wa = safeUrl(s.whatsapp) || 'https://chat.whatsapp.com/JcihPxUk1NwHf5fvkB1aqI'
  const ig = safeUrl(s.instagram) || 'https://www.instagram.com/southasiacollective.ie/'
  const donate = s.donate as { open?: boolean; url?: string; text?: string } | undefined

  return (
    <>
      {events.length > 0 && <JsonLd data={eventsJsonLd(events, locale, SITE)} />}

      <section className="hero">
        <div className="w">
          <div>
            <p className="note">{edited(s.heroEyebrow, 'Based in Dublin, Ireland') ?? t.eyebrow}</p>
            <CutHeadline
              line1={edited(s.heroTitle1, 'Fighting for democracy.') ?? t.title1}
              line2={edited(s.heroTitle2, 'Standing in solidarity.') ?? t.title2}
            />
            <p className="lead">{s.heroText || t.heroText}</p>
            <div className="cta">
              <a className="btn" href="#events">
                {t.seeEvents}
              </a>
              <a className="btn paper" href="#join">
                {t.joinMovement}
              </a>
            </div>
          </div>
          <div className="collage" aria-hidden={photos.length < 1}>
            {hero.map((p, i) => (
              <figure key={i} className={`ph p${i + 1}`} tabIndex={0}>
                <img src={p.src} alt={i === 0 ? p.alt : ''} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Tapes words={ticker} />

      <section className="band" id="events">
        <div className="w">
          <div className="sec-head">
            <h2>{t.upcoming}</h2>
          </div>
          <EventList events={events} locale={locale} />
          {events.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <Link className="btn paper" href={`/${locale}/events`}>
                {t.allEvents}
              </Link>
            </div>
          )}
        </div>
      </section>

      {latest.docs.length > 0 && (
        <section className="band" style={{ paddingTop: 0 }}>
          <div className="w">
            <div className="sec-head">
              <h2>{t.latest}</h2>
            </div>
            <Flyers posts={latest.docs} locale={locale} lead />
            <div className="cta" style={{ marginTop: 34 }}>
              {(['blog', 'news', 'statements'] as const).map((k) => (
                <Link key={k} className="btn paper small" href={`/${locale}/${k}`}>
                  {t[k]}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="band saffron quote">
        <div className="w">
          <blockquote>
            {edited(s.quote, 'Democracy is not a gift from those in power. It is a right we defend together.') ??
              t.quote}
          </blockquote>
          <cite>South Asia Collective</cite>
        </div>
      </section>

      <section className="band paper">
        <div className="w about-grid">
          <img className="badge" src="/logo.png" alt="South Asia Collective" />
          <div>
            <h2>{t.aboutUs}</h2>
            <p className="lead-text" style={{ marginTop: 22 }}>
              {s.aboutLead || t.aboutLead}
            </p>
            <ul className="pills">
              {pills.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className="cta" style={{ marginTop: 30 }}>
              <Link className="btn" href={`/${locale}/about`}>
                {t.moreAbout}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="band">
          <div className="w">
            <div className="sec-head">
              <h2>{s.doneTitle || t.done}</h2>
              <p>{s.doneSub || t.doneSub}</p>
              <span className="tally">
                <b>{timeline.length}</b> {t.doneCount}
              </span>
            </div>
            <div className="cards">
              {timeline.slice(0, 4).map((i) => (
                <TimelineCard key={i.id} item={i} />
              ))}
            </div>
            {timeline.length > 4 && (
              <div style={{ marginTop: 34 }}>
                <Link className="btn paper" href={`/${locale}/history`}>
                  {t.historyBtn}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="band green">
        <div className="w">
          <div className="sec-head">
            <h2>{t.ground}</h2>
            <p style={{ color: 'rgba(246,245,240,.85)' }}>{t.groundSub}</p>
          </div>
          <Gallery photos={photos} layout={s.galleryLayout as string} />
          {allPhotos.length > 4 && (
            <div style={{ marginTop: 34 }}>
              <Link className="btn paper" href={`/${locale}/gallery`}>
                {t.galleryBtn}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="band" id="support" style={{ paddingTop: 0 }}>
        <div className="w give">
          <div className="sheet t1">
            <h2>{t.supportTitle}</h2>
            <p>{donate?.text || t.donateText}</p>
            {donate?.open && safeUrl(donate.url) ? (
              <a className="btn gold" href={safeUrl(donate.url)!} target="_blank" rel="noopener">
                {t.donate}
              </a>
            ) : (
              <p className="msg">{t.donateSoon}</p>
            )}
          </div>
          <div className="sheet t2" id="subscribe">
            <h2>{t.subscribeTitle}</h2>
            <p>{t.subscribeText}</p>
            <SubscribeForm locale={locale} />
          </div>
        </div>
      </section>

      <section className="band saffron" id="join">
        <div className="w">
          <div className="sec-head">
            <h2>{t.joinTitle}</h2>
            <p style={{ color: '#000' }}>{t.joinText}</p>
          </div>
          <div className="join-btns">
            <a className="btn paper" href={wa} target="_blank" rel="noopener">
              {t.whatsapp}
            </a>
            <a className="btn paper" href={ig} target="_blank" rel="noopener">
              {t.instagram}
            </a>
            <a className="btn paper" href={`mailto:${email}`}>
              {t.emailUs}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
