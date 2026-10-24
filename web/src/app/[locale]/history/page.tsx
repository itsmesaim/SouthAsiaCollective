import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TimelineCard } from '@/components/Blocks'
import { SITE, getTimeline } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  return {
    title: t.historyTitle,
    description: t.doneSub,
    alternates: alts('/history', locale),
    ...share(`${SITE}/${locale}/history`, t.historyTitle, t.doneSub),
  }
}

export default async function History({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const items = await getTimeline(locale)
  return (
    <section className="band">
      <div className="w">
        <div className="sec-head">
          <h1 style={{ fontSize: 'clamp(2.5rem,6.4vw,5rem)' }}>{t.historyTitle}</h1>
          <p>{t.doneSub}</p>
          <span className="tally">
            <b>{items.length}</b> {t.doneCount}
          </span>
        </div>
        <div className="cards">
          {items.map((i) => (
            <TimelineCard key={i.id} item={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
