'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { LOCALES, type Locale } from '@/lib/i18n'

type Item = { href: string; label: string }

export default function Nav({
  locale,
  items,
  join,
  donate,
  menu,
  language,
}: {
  locale: Locale
  items: Item[]
  join: Item
  donate?: Item
  menu: string
  language: string
}) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const current = LOCALES.find((l) => l.code === locale)!

  return (
    <>
      <button className="chip burger" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
        {menu}
      </button>
      <nav id="site-nav" className="nav" data-open={open} aria-label="Main">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            onClick={() => setOpen(false)}
            aria-current={path === i.href || path.startsWith(i.href + '/') ? 'page' : undefined}
          >
            {i.label}
          </Link>
        ))}
        <details className="lang">
          <summary aria-label={language}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
            </svg>
            {current.label}
          </summary>
          <ul>
            {LOCALES.map((l) => (
              <li key={l.code}>
                <a
                  href={path.replace(/^\/[a-z]{2}(?=\/|$)/, `/${l.code}`)}
                  hrefLang={l.code}
                  lang={l.code}
                  aria-current={l.code === locale ? 'true' : undefined}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
        {donate && (
          <Link className="btn gold small" href={donate.href} onClick={() => setOpen(false)}>
            {donate.label}
          </Link>
        )}
        <Link className="btn small" href={join.href} onClick={() => setOpen(false)}>
          {join.label}
        </Link>
      </nav>
    </>
  )
}
