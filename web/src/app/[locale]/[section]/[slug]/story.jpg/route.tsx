import { getPost } from '@/lib/cms'
import { SECTIONS, type Section } from '@/lib/i18n'
import { fmtDate } from '@/lib/seo'
import { poster } from '@/lib/poster'

export const revalidate = 300

const TAG: Record<string, string> = { blog: 'Blog', news: 'News', statement: 'Statement' }

// Share card: English + Latin only (see lib/poster.tsx). Uses the cover photo when there is one.
export async function GET(_: Request, { params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params
  const p = await getPost('en', slug)
  if (!p || !(section in SECTIONS) || p.type !== SECTIONS[section as Section])
    return new Response('Not found', { status: 404 })
  return poster({
    kind: 'story' as 'og' | 'story',
    title: p.title,
    cover: p.cover,
    tag: TAG[p.type],
    line1: p.publishedAt ? fmtDate(p.publishedAt, 'en') : undefined,
    line2: p.authorName ? `By ${p.authorName}` : undefined,
  })
}
