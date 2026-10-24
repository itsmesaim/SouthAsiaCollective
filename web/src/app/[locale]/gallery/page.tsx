import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Gallery } from '@/components/Blocks'
import { SITE, galleryPhotos, getSettings } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  return {
    title: t.galleryTitle,
    description: t.groundSub,
    alternates: alts('/gallery', locale),
    ...share(`${SITE}/${locale}/gallery`, t.galleryTitle, t.groundSub),
  }
}

export default async function GalleryPage({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const s = await getSettings(locale)
  return (
    <section className="band green">
      <div className="w">
        <div className="sec-head">
          <h1 style={{ fontSize: 'clamp(2.5rem,6.4vw,5rem)' }}>{t.galleryTitle}</h1>
          <p style={{ color: 'rgba(246,245,240,.85)' }}>{t.groundSub}</p>
        </div>
        <Gallery photos={galleryPhotos(s)} layout={s.galleryLayout as string} />
      </div>
    </section>
  )
}
