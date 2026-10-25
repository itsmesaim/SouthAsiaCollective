import { getEvent } from '@/lib/cms'
import { eventIcs, eventUrl } from '@/lib/format'
import { isLocale } from '@/lib/i18n'

export async function GET(_: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) return new Response('Not found', { status: 404 })
  const e = await getEvent(locale, slug)
  if (!e) return new Response('Not found', { status: 404 })
  return new Response(eventIcs(e, eventUrl(locale, (e.slug as string) || slug)), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="${slug}.ics"`,
    },
  })
}
