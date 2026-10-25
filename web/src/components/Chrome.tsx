import Link from 'next/link'

import { type Doc } from '@/lib/cms'
import { type Locale, tr } from '@/lib/i18n'
import CookieBanner, { CookieSettings } from './CookieBanner'
import Nav from './Nav'

export function Header({ locale, donateOpen }: { locale: Locale; donateOpen: boolean }) {
  const t = tr(locale)
  return (
    <header className="top">
      <div className="w">
        <Link className="brand" href={`/${locale}`} aria-label="South Asia Collective">
          <img className="logo" src="/logo.png" alt="" width={52} height={52} />
          <span>SouthAsiaCollective.ie</span>
        </Link>
        <Nav
          locale={locale}
          menu={t.menu}
          language={t.language}
          items={[
            { href: `/${locale}`, label: t.home },
            { href: `/${locale}/about`, label: t.about },
            { href: `/${locale}/events`, label: t.events },
            { href: `/${locale}/in-the-news`, label: t.news },
            // blogs, statements and our short updates all live under Blog
            { href: `/${locale}/blog`, label: t.blog, match: [`/${locale}/blog`, `/${locale}/statements`, `/${locale}/news`] },
            { href: `/${locale}/gallery`, label: t.gallery },
          ]}
          join={{ href: `/${locale}#join`, label: t.join }}
          donate={donateOpen ? { href: `/${locale}#support`, label: t.donate } : undefined}
        />
      </div>
    </header>
  )
}

export function Footer({ locale, settings }: { locale: Locale; settings: Doc }) {
  const t = tr(locale)
  const email = settings.contactEmail || 'contact@southasiacollective.ie'
  const ig = settings.instagram || 'https://www.instagram.com/southasiacollective.ie/'
  return (
    <>
      <footer className="bottom">
        <div className="w">
          <div>
            <img src="/logo.png" alt="" width={64} height={64} />
            <p>© South Asia Collective, Dublin, Ireland</p>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </div>
          <nav aria-label="Footer">
            <Link href={`/${locale}/events`}>{t.events}</Link>
            <Link href={`/${locale}/blog`}>{t.blog}</Link>
            <Link href={`/${locale}/about`}>{t.about}</Link>
            <Link href={`/${locale}/history`}>{t.historyTitle}</Link>
            <Link href={`/${locale}/gallery`}>{t.galleryTitle}</Link>
            <Link href={`/${locale}/in-the-news`}>{t.inTheNews}</Link>
            <Link href={`/${locale}/press-kit`}>{t.pressKit}</Link>
            <a href={`/${locale}/feed.xml`}>{t.rss}</a>
            <a href={ig} target="_blank" rel="noopener">
              Instagram
            </a>
            <Link href={`/${locale}/privacy`}>{t.privacy}</Link>
            <CookieSettings locale={locale} />
          </nav>
          <div />
        </div>
      </footer>
      <CookieBanner locale={locale} />
    </>
  )
}
