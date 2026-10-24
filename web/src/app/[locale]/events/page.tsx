import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EventList, JsonLd, eventsJsonLd } from '@/components/Blocks'
import { SITE, getEvents } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  return {
    title: t.upcoming,
    description: t.noEvents.length > 0 ? t.siteDesc : undefined,
    alternates: alts('/events', locale),
    ...share(`${SITE}/${locale}/events`, t.upcoming, t.siteDesc),
  }
}

export default async function Events({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const events = await getEvents(locale)
  return (
    <section className="band">
      {events.length > 0 && <JsonLd data={eventsJsonLd(events, locale, SITE)} />}
      <div className="w">
        <div className="sec-head">
          <h1 style={{ fontSize: 'clamp(2.5rem,6.4vw,5rem)' }}>{t.upcoming}</h1>
        </div>
        <EventList events={events} locale={locale} />
      </div>
    </section>
  )
}
