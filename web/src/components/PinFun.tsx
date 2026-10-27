'use client'

import { useEffect, useRef, useState } from 'react'

type Open =
  | { kind: 'photo'; src: string; alt: string; caption?: string }
  | { kind: 'news'; outlet: string; date?: string; title: string; href: string; archive?: string; img?: string }

// Press a pin twice: it pops out, the paper swings, drops off the wall and opens full size. Close it and it is pinned back.
export default function PinFun() {
  const [open, setOpen] = useState<Open | null>(null)
  const card = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const last = new WeakMap<Element, number>()
    const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const read = (el: HTMLElement): Open | null => {
      if (el.matches('.pin')) {
        const img = el.querySelector<HTMLImageElement>('.im img')
        if (!img) return null
        return {
          kind: 'photo',
          src: img.currentSrc || img.src,
          alt: img.alt,
          caption: el.querySelector('figcaption')?.textContent ?? undefined,
        }
      }
      const a = el.querySelector<HTMLAnchorElement>('a.main')
      if (!a) return null
      return {
        kind: 'news',
        outlet: a.querySelector('.mast b')?.textContent ?? '',
        date: a.querySelector('.mast time')?.textContent ?? undefined,
        title: a.querySelector(':scope > span')?.textContent ?? '',
        href: a.href,
        archive: el.querySelector<HTMLAnchorElement>('a.arch')?.href,
        img: a.querySelector('img')?.src,
      }
    }
    const onClick = (e: MouseEvent) => {
      const tack = (e.target as Element).closest?.('.tack, .tape')
      const el = tack?.closest<HTMLElement>('.pin, .clip')
      if (!tack || !el || el.classList.contains('fall') || el.classList.contains('fallen')) return
      const now = Date.now()
      if (now - (last.get(el) ?? 0) > 700) {
        last.set(el, now)
        el.classList.add('wiggle')
        setTimeout(() => el.classList.remove('wiggle'), 500)
        return
      }
      last.delete(el)
      const data = read(el)
      if (!data) return
      card.current = el
      // a little randomness so no two papers fall the same way
      el.style.setProperty('--swing', `${(Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 8)}deg`)
      el.style.setProperty('--spin', `${(Math.random() < 0.5 ? -1 : 1) * (28 + Math.random() * 30)}deg`)
      el.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`)
      el.classList.add('fall')
      setTimeout(
        () => {
          el.classList.remove('fall')
          el.classList.add('fallen')
          setOpen(data)
        },
        reduce() ? 0 : 1000,
      )
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const close = () => {
    setOpen(null)
    const el = card.current
    if (!el) return
    el.classList.remove('fallen')
    el.classList.add('back')
    setTimeout(() => el.classList.remove('back'), 800)
  }

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', key)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null
  return (
    <div className="pf-back" onClick={close} role="presentation">
      <div
        className="pf-paper"
        role="dialog"
        aria-modal="true"
        aria-label={open.kind === 'photo' ? open.alt || 'Photo' : open.outlet}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeBtn} className="pf-x" type="button" onClick={close} aria-label="Close">
          ×
        </button>
        {open.kind === 'photo' ? (
          <figure>
            <img src={open.src} alt={open.alt} />
            {open.caption && <figcaption>{open.caption}</figcaption>}
          </figure>
        ) : (
          <div className="pf-news">
            {open.img && <img src={open.img} alt="" />}
            <div className="mast">
              <b>{open.outlet}</b>
              {open.date && <time>{open.date}</time>}
            </div>
            <h3>{open.title}</h3>
            <div className="pf-links">
              <a className="btn" href={open.href} target="_blank" rel="noopener noreferrer">
                Read the article
              </a>
              {open.archive && (
                <a href={open.archive} target="_blank" rel="noopener noreferrer">
                  Archived copy
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
