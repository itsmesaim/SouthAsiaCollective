import { getEvent } from '@/lib/cms'
import { dayParts, longDate, t12 } from '@/lib/format'
import { tr } from '@/lib/i18n'
import { poster } from '@/lib/poster'

export const revalidate = 300

// 1080x1920 poster for Instagram/WhatsApp stories
export async function GET(_: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params
  const e = await getEvent('en', slug)
  if (!e) return new Response('Not found', { status: 404 })
  const d = dayParts(e.date, 'en')
  return poster({
    kind: 'story',
    title: e.title,
    cover: e.cover,
    tag: tr('en').kinds[e.kind] ?? 'Event',
    big: { day: d.day, month: d.month },
    line1: `${longDate(e.date, 'en')} · ${t12(e.time)}`,
    line2: e.place,
  })
}
