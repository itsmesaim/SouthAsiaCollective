import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SITE, getSettings } from '@/lib/cms'
import { isLocale, tr } from '@/lib/i18n'
import { alts, share } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    title: tr(locale).privacy,
    alternates: alts('/privacy', locale),
    ...share(`${SITE}/${locale}/privacy`, tr(locale).privacy),
  }
}

export default async function Privacy({ params }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const email = (await getSettings(locale)).contactEmail || 'contact@southasiacollective.ie'
  return (
    <article className="page">
      <div className="w narrow">
        <h1>{t.privacy}</h1>
        <div className="prose">
          {[...t.policy, ...t.policyExtra].map(([h, ps]) => (
            <section key={h}>
              <h2>{h}</h2>
              {ps.map((p, i) => (
                <p key={i}>{p.replace(/\{email\}/g, email)}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
