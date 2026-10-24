import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Clippings } from '@/components/Blocks'
import { SITE, getCoverage } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  return {
    title: t.newsPageTitle,
    description: t.inTheNewsSub,
    alternates: alts('/in-the-news', locale),
    ...share(`${SITE}/${locale}/in-the-news`, t.newsPageTitle, t.inTheNewsSub),
  }
}

export default async function News({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const items = await getCoverage()
  return (
    <section className="band">
      <div className="w">
        <div className="sec-head">
          <h1 style={{ fontSize: 'clamp(2.5rem,6.4vw,5rem)' }}>{t.newsPageTitle}</h1>
          <p>{t.inTheNewsSub}</p>
        </div>
        <Clippings items={items} />
      </div>
    </section>
  )
}
