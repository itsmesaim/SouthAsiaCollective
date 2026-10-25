import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Clippings, Flyers, JsonLd, readTime } from '@/components/Blocks'
import { CommentForm, SubscribeForm } from '@/components/Forms'
import Reactions from '@/components/Reactions'
import RichText from '@/components/RichText'
import ShareBar from '@/components/ShareBar'
import { type Doc, SITE, getComments, getPost, getReactions, getRelated, media, readingMinutes } from '@/lib/cms'
import { SECTIONS, type Section, isLocale, localeInfo, locales, tr } from '@/lib/i18n'
import { alts, fmtDate, seoOf } from '@/lib/seo'

export const revalidate = 60
type P = { params: Promise<{ locale: string; section: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, section, slug } = await params
  if (!isLocale(locale) || !(section in SECTIONS)) return {}
  const p = await getPost(locale, slug)
  if (!p) return { robots: { index: false } }
  const url = `${SITE}/${locale}/${section}/${slug}`
  const o = seoOf(p)
  const image = o.image
    ? { url: o.image, alt: p.title as string }
    : { url: `${url}/og.jpg`, width: 1200, height: 630, alt: p.title as string }
  const title = o.title || p.title
  const description = o.description || p.excerpt || undefined
  return {
    title,
    description,
    robots: o.noindex ? { index: false, follow: true } : undefined,
    authors: p.authorName ? [{ name: p.authorName }] : undefined,
    alternates: alts(`/${section}/${slug}`, locale),
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      locale: localeInfo(locale).og,
      publishedTime: p.publishedAt,
      modifiedTime: p.updatedAt,
      section: section,
      authors: p.authorName ? [p.authorName] : undefined,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeInfo(l).og),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  }
}

export default async function PostPage({ params }: P) {
  const { locale, section, slug } = await params
  if (!isLocale(locale) || !(section in SECTIONS)) notFound()
  const p = await getPost(locale, slug)
  if (!p || p.type !== SECTIONS[section as Section]) notFound()
  const t = tr(locale)
  const [reactions, comments, related] = await Promise.all([
    getReactions(p.id),
    getComments(p.id),
    getRelated(locale, p),
  ])
  const img = media(p.cover)
  const url = `${SITE}/${locale}/${section}/${slug}`
  const tags = ((p.tags ?? []) as Doc[]).filter((g) => typeof g === 'object')
  const sources = ((p.sources ?? []) as Doc[]).filter((x) => x.url)
  const news = p.type === 'news' || p.type === 'statement'

  return (
    <article className="page">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': news ? 'NewsArticle' : 'BlogPosting',
            headline: p.title,
            description: p.excerpt,
            inLanguage: locale,
            datePublished: p.publishedAt,
            dateModified: p.updatedAt,
            image: [img ?? `${url}/og.jpg`],
            author: {
              '@type': p.authorName && p.authorName !== 'South Asia Collective' ? 'Person' : 'Organization',
              name: p.authorName || 'South Asia Collective',
            },
            publisher: { '@id': `${SITE}/#org` },
            mainEntityOfPage: url,
            articleSection: section,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t.home, item: `${SITE}/${locale}` },
              { '@type': 'ListItem', position: 2, name: t[section as Section], item: `${SITE}/${locale}/${section}` },
              { '@type': 'ListItem', position: 3, name: p.title, item: url },
            ],
          },
        ]}
      />
      <div className="w">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{t.home}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/${section}`}>{t[section as Section]}</Link>
        </nav>
        <div className="narrow" style={{ maxWidth: 940 }}>
          {p.featured && <span className="sticker">{t.featured}</span>}
          <h1>{p.title}</h1>
          <div className="meta-row">
            {p.publishedAt && <time dateTime={p.publishedAt}>{fmtDate(p.publishedAt, locale)}</time>}
            {p.authorName && (
              <span>
                {t.by} {p.authorName}
              </span>
            )}
            <span>{readTime(readingMinutes(p.body), locale)}</span>
          </div>
        </div>
        {img && <img className="cover" src={img} alt={p.cover?.alt ?? ''} />}
        <div className="narrow">
          {tags.length > 0 && (
            <ul className="taglist" aria-label={t.topics}>
              {tags.map((g) => (
                <li key={g.id}>
                  <Link href={`/${locale}/${section}?tag=${g.slug}`}>{g.name}</Link>
                </li>
              ))}
            </ul>
          )}
          <RichText data={p.body} locale={locale} />
          {sources.length > 0 && (
            <section className="sources">
              <h2>{t.sourcesTitle}</h2>
              <Clippings items={sources} />
            </section>
          )}
          <ShareBar
            url={url}
            text={[p.title, p.excerpt, p.authorName && `${t.by} ${p.authorName}`].filter(Boolean).join('\n\n')}
            title={p.title}
            image={`/${locale}/${section}/${slug}/story.jpg`}
            imageName={`${slug}.jpg`}
            labels={{ ...t, shareTitle: news ? t.shareStatement : t.shareArticle }}
          />
          <Reactions post={p.id} initial={reactions} locale={locale} />
          <div className="cm">
            <h2>{t.comments}</h2>
            {comments.length ? (
              comments.map((c) => (
                <div className="c" key={c.id}>
                  <b>{c.name}</b>
                  <small>{fmtDate(c.createdAt, locale)}</small>
                  <p>{c.body}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--mute)' }}>{t.noComments}</p>
            )}
            <div className="sheet">
              <CommentForm post={p.id} locale={locale} />
            </div>
          </div>
        </div>
        <div className="narrow" style={{ marginTop: 56 }}>
          <div className="sheet t2">
            <h2>{t.subscribeTitle}</h2>
            <p>{t.subscribeText}</p>
            <SubscribeForm locale={locale} />
          </div>
        </div>
        {related.length > 0 && (
          <div className="related">
            <h2>{t.related}</h2>
            <Flyers posts={related} locale={locale} />
          </div>
        )}
      </div>
    </article>
  )
}
