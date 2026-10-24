'use client'

import { useEffect, useRef, useState } from 'react'

import type { Strings } from '@/lib/strings/en'

type Labels = Pick<Strings, 'viewOnInstagram' | 'viewOnX' | 'viewVideo' | 'viewOnTikTok' | 'embedHint'>

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
    twttr?: { widgets: { load: (el?: Element) => void } }
  }
}

type Provider =
  | { kind: 'x'; url: string }
  | { kind: 'instagram'; url: string }
  | { kind: 'tiktok'; url: string; id: string }
  | { kind: 'video'; url: string; src: string }
  | null

function parse(url: string): Provider {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return null
  }
  const h = u.hostname.replace(/^(www\.|m\.|mobile\.)/, '')
  if (h === 'x.com' || h === 'twitter.com') return { kind: 'x', url: `https://twitter.com${u.pathname}` }
  if (h === 'instagram.com') return { kind: 'instagram', url: `https://www.instagram.com${u.pathname}` }
  if (h === 'tiktok.com') return { kind: 'tiktok', url, id: u.pathname.split('/video/')[1]?.split('/')[0] ?? '' }
  if (h === 'youtu.be')
    return { kind: 'video', url, src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}` }
  if (h === 'youtube.com') {
    const id = u.searchParams.get('v') ?? u.pathname.split('/').filter(Boolean).pop()
    return id ? { kind: 'video', url, src: `https://www.youtube-nocookie.com/embed/${id}` } : null
  }
  if (h === 'vimeo.com')
    return {
      kind: 'video',
      url,
      src: `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean)[0]}?dnt=1`,
    }
  return null
}

function loadOnce(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return
  const s = document.createElement('script')
  s.src = src
  s.async = true
  document.body.appendChild(s)
}

// Third-party embeds set their own cookies, so nothing loads until the visitor accepts (GDPR). Before that, a plain link.
export default function Embed({ url, labels }: { url: string; labels: Labels }) {
  const [ok, setOk] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const p = parse(url)

  useEffect(() => {
    const check = () => {
      try {
        setOk(localStorage.getItem('ck') === '1')
      } catch {}
    }
    check()
    window.addEventListener('ck', check)
    return () => window.removeEventListener('ck', check)
  }, [])

  useEffect(() => {
    if (!ok || !p) return
    if (p.kind === 'instagram')
      window.instgrm ? window.instgrm.Embeds.process() : loadOnce('https://www.instagram.com/embed.js')
    if (p.kind === 'x')
      window.twttr
        ? window.twttr.widgets.load(box.current ?? undefined)
        : loadOnce('https://platform.twitter.com/widgets.js')
    if (p.kind === 'tiktok') loadOnce('https://www.tiktok.com/embed.js')
  }, [ok, p?.kind, url]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null
  const text =
    p.kind === 'x'
      ? labels.viewOnX
      : p.kind === 'instagram'
        ? labels.viewOnInstagram
        : p.kind === 'tiktok'
          ? labels.viewOnTikTok
          : labels.viewVideo

  if (!ok)
    return (
      <div className="ig">
        <div style={{ textAlign: 'center', width: '100%' }}>
          <a className="btn" href={url} target="_blank" rel="noopener">
            {text}
          </a>
          <p className="hint" style={{ marginTop: 10 }}>
            {labels.embedHint}
          </p>
        </div>
      </div>
    )

  return (
    <div className="ig" ref={box}>
      {p.kind === 'video' && (
        <iframe
          src={p.src}
          title={text}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
        />
      )}
      {p.kind === 'x' && (
        <blockquote className="twitter-tweet" data-theme="dark">
          <a href={p.url}>{text}</a>
        </blockquote>
      )}
      {p.kind === 'instagram' && (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={p.url}
          data-instgrm-version="14"
          style={{ background: '#fff', maxWidth: 540, width: '100%', margin: 0 }}
        />
      )}
      {p.kind === 'tiktok' && (
        <blockquote className="tiktok-embed" cite={p.url} data-video-id={p.id} style={{ maxWidth: 605, minWidth: 325 }}>
          <section>
            <a href={p.url}>{text}</a>
          </section>
        </blockquote>
      )}
    </div>
  )
}
