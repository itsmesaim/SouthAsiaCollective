import PinFun from '@/components/PinFun'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'

// Fonts are bundled and served from our own domain (nothing is requested from Google), which keeps us GDPR-clean.
import '@fontsource-variable/bricolage-grotesque/wdth.css'
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource-variable/source-serif-4'
import '@fontsource/permanent-marker/latin-400.css'
import '@fontsource/noto-sans-devanagari/devanagari-400.css'
import '@fontsource/noto-sans-devanagari/devanagari-700.css'
import '@fontsource/noto-sans-devanagari/devanagari-800.css'
import '@fontsource/noto-sans-bengali/bengali-400.css'
import '@fontsource/noto-sans-bengali/bengali-700.css'
import '@fontsource/noto-sans-bengali/bengali-800.css'
import '@fontsource/noto-sans-tamil/tamil-400.css'
import '@fontsource/noto-sans-tamil/tamil-700.css'
import '@fontsource/noto-sans-tamil/tamil-800.css'
import '@fontsource/noto-sans-telugu/telugu-400.css'
import '@fontsource/noto-sans-telugu/telugu-700.css'
import '@fontsource/noto-sans-telugu/telugu-800.css'
import '@fontsource/noto-sans-malayalam/malayalam-400.css'
import '@fontsource/noto-sans-malayalam/malayalam-700.css'
import '@fontsource/noto-sans-malayalam/malayalam-800.css'
import '@fontsource/noto-sans-kannada/kannada-400.css'
import '@fontsource/noto-sans-kannada/kannada-700.css'
import '@fontsource/noto-sans-kannada/kannada-800.css'
import '@fontsource/noto-sans-gujarati/gujarati-400.css'
import '@fontsource/noto-sans-gujarati/gujarati-700.css'
import '@fontsource/noto-sans-gujarati/gujarati-800.css'
import '@fontsource/noto-sans-gurmukhi/gurmukhi-400.css'
import '@fontsource/noto-sans-gurmukhi/gurmukhi-700.css'
import '@fontsource/noto-sans-gurmukhi/gurmukhi-800.css'
import '@fontsource/noto-sans-sinhala/sinhala-400.css'
import '@fontsource/noto-sans-sinhala/sinhala-700.css'
import '@fontsource/noto-sans-sinhala/sinhala-800.css'
import '@fontsource/noto-nastaliq-urdu/arabic-400.css'
import '@fontsource/noto-nastaliq-urdu/arabic-700.css'
import '../globals.css'

import { JsonLd } from '@/components/Blocks'
import { Footer, Header } from '@/components/Chrome'
import { SITE, getSettings, media } from '@/lib/cms'
import { isLocale, isRtl, localeInfo, locales, tr } from '@/lib/i18n'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))
export const dynamicParams = false
export const viewport: Viewport = { themeColor: '#000000' }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = tr(locale)
  const s = await getSettings(locale)
  const img = media(s.seoImage)
  const desc = (s.seoDescription as string) || t.siteDesc
  const handle =
    typeof s.twitterHandle === 'string' && /^@?\w{1,15}$/.test(s.twitterHandle.trim())
      ? `@${s.twitterHandle.trim().replace(/^@/, '')}`
      : undefined
  return {
    metadataBase: new URL(SITE),
    title: { default: 'South Asia Collective · Dublin, Ireland', template: '%s · South Asia Collective' },
    description: desc,
    applicationName: 'South Asia Collective',
    icons: { icon: '/favicon.png', apple: '/favicon.png' },
    openGraph: {
      type: 'website',
      siteName: 'South Asia Collective',
      locale: localeInfo(locale).og,
      images: [{ url: img ?? '/og.jpg', width: 1200, height: 630, alt: 'South Asia Collective' }],
    },
    twitter: { card: 'summary_large_image', site: handle },
    alternates: { types: { 'application/rss+xml': `${SITE}/${locale}/feed.xml` } },
    robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = tr(locale)
  const s = await getSettings(locale)
  const sameAs = [s.instagram || 'https://www.instagram.com/southasiacollective.ie/']
  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'try{if(localStorage.getItem("ck"))document.documentElement.classList.add("ck-done")}catch(e){}',
          }}
        />
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${SITE}/#org`,
              name: 'South Asia Collective',
              url: SITE,
              logo: `${SITE}/logo.png`,
              email: s.contactEmail || 'contact@southasiacollective.ie',
              areaServed: 'Dublin, Ireland',
              sameAs,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${SITE}/#site`,
              url: SITE,
              name: 'South Asia Collective',
              inLanguage: locale,
              publisher: { '@id': `${SITE}/#org` },
            },
          ]}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          {t.skip}
        </a>
        <Header locale={locale} donateOpen={Boolean(s.donate?.open)} />
        <main id="main">{children}</main>
        <Footer locale={locale} settings={s} />
        <PinFun />
      </body>
    </html>
  )
}
