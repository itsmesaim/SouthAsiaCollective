import type { ReactNode } from 'react'

import { type Doc, media } from '@/lib/cms'
import { type Locale, sectionOfType, tr } from '@/lib/i18n'
import Embed from './Embed'

// Minimal renderer for the Lexical JSON the CMS editor produces.
const FORMATS: [number, (c: ReactNode) => ReactNode][] = [
  [1, (c) => <strong>{c}</strong>],
  [2, (c) => <em>{c}</em>],
  [4, (c) => <s>{c}</s>],
  [8, (c) => <u>{c}</u>],
  [16, (c) => <code>{c}</code>],
]

// "justify" is ignored on purpose: it leaves big gaps between words on phones
const align = (n: Doc) => (['center', 'right'].includes(n.format) ? { textAlign: n.format as 'center' } : undefined)

function linkHref(n: Doc, l: Locale) {
  const f = n.fields ?? {}
  if (f.linkType === 'internal' && f.doc?.value && typeof f.doc.value === 'object')
    return `/${l}/${sectionOfType(f.doc.value.type)}/${f.doc.value.slug}`
  return f.url ?? '#'
}

// bare web addresses typed into the editor become real links (not inside a link that already exists)
const URL_RE = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/g
export const linkify = (text: string): ReactNode =>
  text.split(URL_RE).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      part
    ),
  )

// a paragraph that is only "some words: https://docs.google.com/..." becomes a button card
const DOC_HOST = /^https?:\/\/(docs|drive)\.google\.com\//
const docLink = (n: Doc): { label: string; url: string } | null => {
  const kids = (n.children ?? []) as Doc[]
  if (!kids.length || !kids.every((c) => c.type === 'text' || c.type === 'linebreak')) return null
  const text = kids
    .map((c) => (c.type === 'text' ? c.text : ' '))
    .join('')
    .trim()
  const m = /^(.*?)\s*(https?:\/\/\S+)$/s.exec(text)
  return m && DOC_HOST.test(m[2]) ? { label: m[1].replace(/[:\s]+$/, ''), url: m[2] } : null
}

function Node({ n, l, nolink }: { n: Doc; l: Locale; nolink?: boolean }): ReactNode {
  const kids = (n.children ?? []).map((c: Doc, i: number) => <Node key={i} n={c} l={l} nolink={nolink} />)
  switch (n.type) {
    case 'text': {
      const inner = FORMATS.reduce<ReactNode>(
        (acc, [bit, wrap]) => (n.format & bit ? wrap(acc) : acc),
        nolink ? n.text : linkify(n.text),
      )
      const c = n.$?.color
      return typeof c === 'string' && /^[a-z-]+$/.test(c) ? <span className={`tc-${c}`}>{inner}</span> : inner
    }
    case 'linebreak':
      return <br />
    case 'paragraph': {
      // stacked Enters leave empty paragraphs: they would only add blank space
      if (
        !(n.children ?? []).some((c: Doc) => c.type !== 'linebreak' && !(c.type === 'text' && !String(c.text).trim()))
      )
        return null
      const doc = docLink(n)
      if (doc)
        return (
          <div className="doclink">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h8M9 17h8" />
            </svg>
            <div>
              {doc.label && <strong>{doc.label}</strong>}
              <a className="btn small" href={doc.url} target="_blank" rel="noopener noreferrer">
                {tr(l).openDoc}
              </a>
            </div>
          </div>
        )
      return <p style={align(n)}>{kids}</p>
    }
    case 'heading': {
      const H = (n.tag === 'h3' || n.tag === 'h4' ? 'h3' : 'h2') as 'h2' | 'h3'
      return <H style={align(n)}>{kids}</H>
    }
    case 'quote':
      return <blockquote>{kids}</blockquote>
    case 'list':
      return n.listType === 'number' ? <ol>{kids}</ol> : <ul>{kids}</ul>
    case 'listitem':
      return <li>{kids}</li>
    case 'link': {
      const f = n.fields ?? {}
      const ext = f.linkType !== 'internal'
      return (
        <a href={linkHref(n, l)} {...(f.newTab || ext ? { target: '_blank', rel: 'noopener' } : {})}>
          {(n.children ?? []).map((c: Doc, i: number) => (
            <Node key={i} n={c} l={l} nolink />
          ))}
        </a>
      )
    }
    case 'upload': {
      const src = media(n.value)
      if (!src) return null
      const cap = n.fields?.caption || n.value?.caption
      return (
        <figure>
          <img src={src} alt={n.value?.alt ?? ''} loading="lazy" />
          {cap && <figcaption>{cap}</figcaption>}
        </figure>
      )
    }
    case 'block':
      return n.fields?.blockType === 'embed' || n.fields?.blockType === 'instagram' ? (
        <Embed url={n.fields.url} labels={tr(l)} />
      ) : null
    default:
      return kids.length ? <>{kids}</> : null
  }
}

export default function RichText({ data, locale }: { data?: Doc; locale: Locale }) {
  const kids = data?.root?.children as Doc[] | undefined
  if (!kids) return null
  return (
    <div className="prose">
      {kids.map((c, i) => (
        <Node key={i} n={c} l={locale} />
      ))}
    </div>
  )
}
