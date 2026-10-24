'use client'

import { useActionState } from 'react'

import Link from 'next/link'

import { commentAction, subscribeAction, unsubscribeAction, verifyAction } from '@/app/actions'
import type { Locale } from '@/lib/i18n'
import { tr } from '@/lib/i18n'

const hp = <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />

export function SubscribeForm({ locale }: { locale: Locale }) {
  const t = tr(locale)
  const [s, act, pending] = useActionState(subscribeAction, null)
  if (s === 'ok') return <p className="msg">{t.subscribePending}</p>
  return (
    <form action={act} className="sub-row">
      <input type="hidden" name="locale" value={locale} />
      {hp}
      <input type="hidden" name="consentText" value={t.consentLabel} />
      <input type="hidden" name="subject" value={t.confirmSubject} />
      <input type="hidden" name="mail" value={t.confirmBody} />
      <input type="email" name="email" required placeholder={t.emailPlaceholder} aria-label={t.emailPlaceholder} />
      <button className="btn" disabled={pending}>
        {t.subscribeBtn}
      </button>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t.consentLabel} (<Link href={`/${locale}/privacy`}>{t.privacy}</Link>)
        </span>
      </label>
      {s && <p className="msg">{s === 'limit' ? t.tooMany : s === 'consent' ? t.consentNeeded : t.errorGeneric}</p>}
    </form>
  )
}

export function CommentForm({ post, locale }: { post: string; locale: Locale }) {
  const t = tr(locale)
  const [s, act, pending] = useActionState(commentAction, null)
  if (s === 'ok') return <p className="msg">{t.commentSent}</p>
  return (
    <form action={act} className="form">
      <input type="hidden" name="post" value={post} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="subject" value={t.commentSubject} />
      <input type="hidden" name="mail" value={t.commentBody} />
      {hp}
      <input name="name" required maxLength={80} placeholder={t.yourName} aria-label={t.yourName} />
      <input type="email" name="email" required placeholder={t.yourEmail} aria-label={t.yourEmail} />
      <textarea name="body" required maxLength={1000} placeholder={t.yourComment} aria-label={t.yourComment} />
      <p className="note-s">
        {t.commentNotice}
        <Link href={`/${locale}/privacy`}>{t.privacy}</Link>
      </p>
      <button className="btn" disabled={pending}>
        {t.send}
      </button>
      {s && <p className="msg">{s === 'limit' ? t.tooMany : t.errorGeneric}</p>}
    </form>
  )
}

export function UnsubscribeForm({ token, locale }: { token: string; locale: Locale }) {
  const t = tr(locale)
  const [s, act, pending] = useActionState(unsubscribeAction, null)
  if (s === 'ok') return <p className="msg">{t.unsubDone}</p>
  return (
    <form action={act} className="form">
      <input type="hidden" name="token" value={token} />
      <button className="btn" disabled={pending}>
        {t.unsubBtn}
      </button>
      {s && <p className="msg">{s === 'limit' ? t.tooMany : t.errorGeneric}</p>}
    </form>
  )
}

export function VerifyForm({ kind, token, locale }: { kind: string; token: string; locale: Locale }) {
  const t = tr(locale)
  const [s, act, pending] = useActionState(verifyAction, null)
  if (s === 'ok') return <p className="msg">{t.verifyOk}</p>
  return (
    <form action={act} className="form">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="token" value={token} />
      <button className="btn" disabled={pending}>
        {t.verifyBtn}
      </button>
      {s && <p className="msg">{s === 'limit' ? t.tooMany : t.verifyBad}</p>}
    </form>
  )
}
