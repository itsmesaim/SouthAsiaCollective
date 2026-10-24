import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { VerifyForm } from '@/components/Forms'
import { isLocale, tr } from '@/lib/i18n'

export const metadata: Metadata = { robots: { index: false, follow: false } }
type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ k?: string; t?: string }> }

// confirm by pressing a button (POST) so email-scanner link previews cannot confirm on the reader's behalf
export default async function Verify({ params, searchParams }: P) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const { k, t: token } = await searchParams
  return (
    <section className="band">
      <div className="w narrow">
        <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>{t.verifyTitle}</h1>
        {k && token ? (
          <>
            <p style={{ margin: '16px 0' }}>{t.verifyText}</p>
            <div className="sheet">
              <VerifyForm kind={k} token={token} locale={locale} />
            </div>
          </>
        ) : (
          <p className="msg" style={{ marginTop: 16, display: 'inline-block' }}>
            {t.verifyBad}
          </p>
        )}
      </div>
    </section>
  )
}
