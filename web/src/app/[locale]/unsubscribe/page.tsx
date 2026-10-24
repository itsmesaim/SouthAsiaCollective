import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { UnsubscribeForm } from '@/components/Forms'
import { isLocale, tr } from '@/lib/i18n'

export const metadata: Metadata = { robots: { index: false, follow: false } }
type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ t?: string }> }

// a button (POST) rather than unsubscribing on page load, so email-scanner link previews can't unsubscribe people
export default async function Unsubscribe({ params, searchParams }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const token = (await searchParams).t
  return (
    <section className="band">
      <div className="w narrow">
        <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>{t.unsubTitle}</h1>
        {token ? (
          <>
            <p style={{ margin: '16px 0' }}>{t.unsubText}</p>
            <div className="sheet">
              <UnsubscribeForm token={token} locale={locale} />
            </div>
          </>
        ) : (
          <p className="msg" style={{ marginTop: 16, display: 'inline-block' }}>
            {t.errorGeneric}
          </p>
        )}
      </div>
    </section>
  )
}
