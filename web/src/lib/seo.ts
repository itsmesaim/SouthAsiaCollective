import type { Metadata } from 'next'

import { type Doc, SITE, media } from './cms'
import { type Locale, locales } from './i18n'

// canonical + hreflang for a locale-less path like "/blog/my-post"
export const alts = (path: string, l: Locale): Metadata['alternates'] => ({
  canonical: `${SITE}/${l}${path}`,
  languages: {
    ...Object.fromEntries(locales.map((x) => [x, `${SITE}/${x}${path}`])),
    'x-default': `${SITE}/en${path}`,
  },
})

// openGraph/twitter set on a page replace the layout's wholesale, so every page needs the share image repeated
const OG_IMG = [{ url: '/og.jpg', width: 1200, height: 630, alt: 'South Asia Collective' }]
export const share = (url: string, title: string, description?: string): Pick<Metadata, 'openGraph' | 'twitter'> => ({
  openGraph: { url, title, description, siteName: 'South Asia Collective', images: OG_IMG },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
})

// per-page overrides from the CMS "Search and sharing" box; every part is optional
export const seoOf = (d: Doc) => {
  const s = (d.seo ?? {}) as Doc
  return {
    title: (s.metaTitle as string) || undefined,
    description: (s.metaDescription as string) || undefined,
    image: media(s.metaImage),
    noindex: !!s.noIndex,
  }
}

export const fmtDate = (iso: string, l: Locale) =>
  new Date(iso).toLocaleDateString(l === 'hi' ? 'hi-IN' : 'en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Dublin',
  })
