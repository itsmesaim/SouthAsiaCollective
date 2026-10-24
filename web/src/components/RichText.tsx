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

const align = (n: Doc) =>
  ['center', 'right', 'justify'].includes(n.format) ? { textAlign: n.format as 'center' } : undefined

function linkHref(n: Doc, l: Locale) {
  const f = n.fields ?? {}
  if (f.linkType === 'internal' && f.doc?.value && typeof f.doc.value === 'object')
    return `/${l}/${sectionOfType(f.doc.value.type)}/${f.doc.value.slug}`
  return f.url ?? '#'
}

function Node({ n, l }: { n: Doc; l: Locale }): ReactNode {
  const kids = (n.children ?? []).map((c: Doc, i: number) => <Node key={i} n={c} l={l} />)
  switch (n.type) {
    case 'text': {
      const inner = FORMATS.reduce<ReactNode>((acc, [bit, wrap]) => (n.format & bit ? wrap(acc) : acc), n.text)
      const c = n.$?.color
      return typeof c === 'string' && /^[a-z-]+$/.test(c) ? <span className={`tc-${c}`}>{inner}</span> : inner
    }
    case 'linebreak':
      return <br />
    case 'paragraph':
      return <p style={align(n)}>{kids}</p>
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
          {kids}
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
