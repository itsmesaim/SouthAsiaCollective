import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badges } from '@/components/Blocks'
import { SITE, getMember, media, memberLinks } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const m = await getMember(locale, id)
  if (!m) return { robots: { index: false } }
  const desc = ((m.summary || m.bio || m.role || '') as string).slice(0, 200)
  return {
    title: m.name,
    description: desc,
    alternates: alts(`/about/team/${id}`, locale),
    ...share(`${SITE}/${locale}/about/team/${id}`, m.name, desc),
  }
}

export default async function Member({ params }: P) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()
  const m = await getMember(locale, id)
  if (!m) notFound()
  const t = tr(locale)
  const photo = media(m.photo)
  const links = memberLinks(m)
  return (
    <article className="page">
      <div className="w">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{t.home}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/about`}>{t.aboutUs}</Link>
        </nav>
        <div className="member">
          {photo && <img src={photo} alt={m.name} />}
          <div>
            <h1>{m.name}</h1>
            {m.role && <div className="r">{m.role}</div>}
            <Badges list={m.badges} />
            {m.bio && <p className="lead-text">{m.bio}</p>}
            {links.length > 0 && (
              <div className="member-links">
                {links.map((l) => (
                  <a className="btn" key={l.href} href={l.href} target="_blank" rel="noopener noreferrer me">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
