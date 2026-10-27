import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badges } from '@/components/Blocks'
import { SITE, getAbout, getSettings, getTeam, media } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  const a = await getAbout(locale)
  const desc = ((a.intro as string) || t.aboutLead).slice(0, 200)
  return {
    title: t.aboutUs,
    description: desc,
    alternates: alts('/about', locale),
    ...share(`${SITE}/${locale}/about`, t.aboutUs, desc),
  }
}

export default async function About({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const [a, s, team] = await Promise.all([getAbout(locale), getSettings(locale), getTeam(locale)])
  const pills = s.aboutPills?.length ? (s.aboutPills as { text: string }[]).map((p) => p.text) : t.pills
  const objectives = (a.objectives ?? []) as { id: string; title?: string; text: string }[]
  const demands = (a.demands ?? []) as { id: string; title: string; text: string }[]
  return (
    <>
      <section className="band paper">
        <div className="w about-grid">
          <img className="badge" src="/logo.png" alt="South Asia Collective" />
          <div>
            <h1 style={{ fontSize: 'clamp(2.6rem,6.4vw,5rem)' }}>{t.aboutUs}</h1>
            <p className="lead-text" style={{ marginTop: 22 }}>
              {a.intro || s.aboutLead || t.aboutLead}
            </p>
            <ul className="pills">
              {pills.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {objectives.length > 0 && (
        <section className="band">
          <div className="w">
            <div className="sec-head">
              <h2>{t.objectives}</h2>
            </div>
            <div className="goals">
              {objectives.map((o) => (
                <article className="goal" key={o.id}>
                  {o.title && <h3>{o.title}</h3>}
                  <p>{o.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {demands.length > 0 && (
        <section className="band saffron">
          <div className="w">
            <div className="sec-head">
              <h2>{t.demands}</h2>
              {a.demandsIntro && <p style={{ color: '#000' }}>{a.demandsIntro}</p>}
            </div>
            <div className="charges">
              {demands.map((d) => (
                <article className="charge" key={d.id}>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="band">
          <div className="w">
            <div className="sec-head">
              <h2>{t.team}</h2>
            </div>
            <div className="team">
              {team.map((m) => {
                const photo = media(m.photo)
                return (
                  <Link className="tm" key={m.id} href={`/${locale}/about/team/${m.id}`}>
                    {photo && <img src={photo} alt={m.name} loading="lazy" />}
                    <h3>{m.name}</h3>
                    {m.role && <div className="r">{m.role}</div>}
                    <Badges list={m.badges} />
                    {(m.summary || m.bio) && <p className="clamp">{m.summary || m.bio}</p>}
                    <span className="more">{t.readMore} →</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
