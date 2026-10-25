import type { Doc } from './cms'
import { SITE } from './cms'
import { type Locale, fill, localeInfo, tr } from './i18n'

// "16:30", "4pm", "4.30 pm" -> "4:30 PM"; anything we cannot read is shown as typed
export const t12 = (t?: string) => {
  const m = /^\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*$/i.exec(t ?? '')
  if (!m) return t ?? ''
  let h = Number(m[1])
  const ap = m[3]?.toLowerCase()
  if (ap) h = (h % 12) + (ap === 'pm' ? 12 : 0)
  if (h > 23) return t ?? ''
  return `${h % 12 || 12}:${m[2] ?? '00'} ${h < 12 ? 'AM' : 'PM'}`
}

const noon = (iso: string) => new Date(String(iso).slice(0, 10) + 'T12:00:00Z')

export const dayParts = (iso: string, l: Locale) => {
  const d = noon(iso)
  const intl = localeInfo(l).intl
  return {
    day: new Intl.NumberFormat(intl).format(d.getUTCDate()),
    month: d.toLocaleDateString(intl, { month: 'short', timeZone: 'UTC' }),
    weekday: d.toLocaleDateString(intl, { weekday: 'long', timeZone: 'UTC' }),
  }
}

export const longDate = (iso: string, l: Locale) =>
  noon(iso).toLocaleDateString(localeInfo(l).intl, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const eventUrl = (l: Locale, slug: string) => `${SITE}/${l}/events/${slug}`

// What fills in when someone shares. The editor's own caption wins.
export function eventCaption(e: Doc, l: Locale) {
  if (e.shareCaption) return String(e.shareCaption)
  return fill(tr(l).eventCaption, { title: e.title, date: longDate(e.date, l), time: t12(e.time), place: e.place })
}

const esc = (s: string) =>
  String(s)
    .replace(/([,;\\])/g, '\\$1')
    .replace(/\n/g, '\\n')

// Floating local time (no timezone), so the calendar shows the same clock time wherever it is opened.
export function eventIcs(e: Doc, url: string) {
  const d = String(e.date).slice(0, 10).replace(/-/g, '')
  const [h, m] = String(e.time).split(':').map(Number)
  const start = `${d}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
  const end = `${d}T${String((h + 2) % 24).padStart(2, '0')}${String(m).padStart(2, '0')}00`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//South Asia Collective//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}@southasiacollective.ie`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.place)}`,
    `DESCRIPTION:${esc((e.description ? e.description + '\n' : '') + url)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
