'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n'
import { tr } from '@/lib/i18n'

export default function CookieBanner({ locale }: { locale: Locale }) {
  const t = tr(locale)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const open = () => setGone(false)
    window.addEventListener('ck-open', open)
    return () => window.removeEventListener('ck-open', open)
  }, [])
  if (gone) return null
  const choose = (v: '1' | '0') => {
    try {
      localStorage.setItem('ck', v)
    } catch {}
    window.dispatchEvent(new Event('ck'))
    document.documentElement.classList.add('ck-done')
    setGone(true)
  }
  return (
    <div id="ck">
      <div className="w">
        <div>
          <b>{t.cookieTitle}</b>
          {t.cookieText} <Link href={`/${locale}/privacy`}>{t.privacy}</Link>
        </div>
        <div>
          <button onClick={() => choose('0')}>{t.decline}</button>
          <button onClick={() => choose('1')}>{t.accept}</button>
        </div>
      </div>
    </div>
  )
}

// footer link: lets people change or withdraw their choice any time (GDPR: withdrawing must be as easy as giving)
export function CookieSettings({ locale }: { locale: Locale }) {
  return (
    <button
      className="linklike"
      onClick={() => {
        try {
          localStorage.removeItem('ck')
        } catch {}
        document.documentElement.classList.remove('ck-done')
        window.dispatchEvent(new Event('ck'))
        window.dispatchEvent(new Event('ck-open'))
      }}
    >
      {tr(locale).cookieSettings}
    </button>
  )
}
