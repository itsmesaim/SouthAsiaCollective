'use client'

import { useEffect, useState, useTransition } from 'react'

import { reactAction } from '@/app/actions'
import type { Locale } from '@/lib/i18n'
import { tr } from '@/lib/i18n'

const KEYS = ['like', 'love', 'solidarity', 'sad', 'angry']
const EMOJI = ['👍', '❤️', '✊', '😢', '😡']

export default function Reactions({
  post,
  initial,
  locale,
  only,
}: {
  post: string
  initial: Record<string, number>
  locale: Locale
  only?: string[] // show just these reactions (e.g. statements: like and solidarity)
}) {
  const t = tr(locale)
  const [counts, setCounts] = useState(initial)
  const [mine, setMine] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const storeKey = `rx-${post}`

  useEffect(() => {
    try {
      setMine(localStorage.getItem(storeKey))
    } catch {}
  }, [storeKey])

  const click = (type: string) =>
    start(async () => {
      const next = await reactAction(post, type)
      if (!next) return
      setCounts(next)
      const v = mine === type ? null : type // same click again = undo
      setMine(v)
      try {
        v ? localStorage.setItem(storeKey, v) : localStorage.removeItem(storeKey)
      } catch {}
    })

  return (
    <div className="react">
      {KEYS.map((k, i) =>
        only && !only.includes(k) ? null : (
          <button
            key={k}
            className={mine === k ? 'on' : ''}
            disabled={pending}
            onClick={() => click(k)}
            aria-pressed={mine === k}
          >
            <span aria-hidden>{EMOJI[i]}</span>
            {t.reactions[i]} <b>{counts[k] ?? 0}</b>
          </button>
        ),
      )}
    </div>
  )
}
