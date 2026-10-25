'use client'

import { useEffect, useId, useState } from 'react'

import type { Strings } from '@/lib/strings/en'

type Labels = Pick<
  Strings,
  | 'shareTitle'
  | 'shareText'
  | 'shareNative'
  | 'shareWhatsapp'
  | 'shareFacebook'
  | 'shareX'
  | 'shareTelegram'
  | 'shareEmail'
  | 'copyLink'
  | 'copied'
  | 'shareStory'
  | 'storyHint'
  | 'downloadPoster'
  | 'captionLabel'
  | 'copyCaption'
>

// Every link here is a plain share URL: nothing from these networks loads on our page.
export default function ShareBar({
  url,
  text,
  image,
  imageName,
  labels,
  title,
}: {
  url: string
  text: string // default caption
  image?: string // story-size poster URL (png)
  imageName?: string
  labels: Labels
  title?: string
}) {
  const id = useId()
  const [caption, setCaption] = useState(text)
  const [canShare, setCanShare] = useState(false)
  const [copied, setCopied] = useState<'link' | 'cap' | null>(null)
  const [hint, setHint] = useState(false)
  useEffect(() => setCanShare(typeof navigator !== 'undefined' && 'share' in navigator), [])

  const both = `${caption}\n${url}`
  const copy = async (what: 'link' | 'cap') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? url : both)
      setCopied(what)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
  }

  // On phones the poster goes along with the caption and link, so apps like WhatsApp get the picture too.
  // Where the browser cannot send files we share just the text and link.
  const nativeShare = async () => {
    try {
      if (image) {
        const blob = await (await fetch(image)).blob()
        const file = new File([blob], imageName ?? 'poster.jpg', { type: blob.type || 'image/jpeg' })
        if (navigator.canShare?.({ files: [file] }))
          return void (await navigator.share({ title, text: both, files: [file] }))
      }
      await navigator.share({ title, text: caption, url })
    } catch {}
  }

  // Instagram has no web share link. On phones the share sheet can take the poster file straight to Stories;
  // elsewhere we download it so it can be added from the app.
  // Stories cannot carry a clickable link from a website, so the page link is copied first: paste it into a Link sticker.
  const story = async () => {
    if (!image) return
    try {
      await navigator.clipboard.writeText(url)
      setHint(true)
    } catch {}
    try {
      const blob = await (await fetch(image)).blob()
      const file = new File([blob], imageName ?? 'poster.jpg', { type: 'image/jpeg' })
      if (navigator.canShare?.({ files: [file] })) return void (await navigator.share({ files: [file], text: caption }))
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.name
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {}
  }

  const q = encodeURIComponent
  return (
    <section className="share" aria-labelledby={`${id}h`}>
      <h3 id={`${id}h`}>{labels.shareTitle}</h3>
      <p>{labels.shareText}</p>
      <label className="hint" htmlFor={`${id}c`}>
        {labels.captionLabel}
      </label>
      <textarea id={`${id}c`} value={caption} onChange={(e) => setCaption(e.target.value)} />
      <div className="row main">
        <a className="chip wa" target="_blank" rel="noopener" href={`https://wa.me/?text=${q(both)}`}>
          {labels.shareWhatsapp}
        </a>
        {image && (
          <button type="button" className="chip story" onClick={story}>
            {labels.shareStory}
          </button>
        )}
        {canShare && (
          <button type="button" className="chip native" onClick={nativeShare}>
            {labels.shareNative}
          </button>
        )}
      </div>
      {hint && (
        <p className="hint" role="status">
          {labels.storyHint}
        </p>
      )}
      <div className="row">
        <a
          className="chip tg"
          target="_blank"
          rel="noopener"
          href={`https://t.me/share/url?url=${q(url)}&text=${q(caption)}`}
        >
          {labels.shareTelegram}
        </a>
        <a
          className="chip x"
          target="_blank"
          rel="noopener"
          href={`https://twitter.com/intent/tweet?text=${q(caption)}&url=${q(url)}`}
        >
          {labels.shareX}
        </a>
        <a
          className="chip fb"
          target="_blank"
          rel="noopener"
          href={`https://www.facebook.com/sharer/sharer.php?u=${q(url)}&quote=${q(caption)}`}
        >
          {labels.shareFacebook}
        </a>
        <a className="chip mail" href={`mailto:?subject=${q(title ?? caption)}&body=${q(both)}`}>
          {labels.shareEmail}
        </a>
        <button type="button" className="chip" onClick={() => copy('link')}>
          {copied === 'link' ? labels.copied : labels.copyLink}
        </button>
        <button type="button" className="chip" onClick={() => copy('cap')}>
          {copied === 'cap' ? labels.copied : labels.copyCaption}
        </button>
        {image && (
          <a className="chip" href={image} download={imageName ?? 'poster.jpg'}>
            {labels.downloadPoster}
          </a>
        )}
      </div>
    </section>
  )
}
