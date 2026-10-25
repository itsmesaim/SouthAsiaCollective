import type { Doc } from './cms'
import { SITE } from './cms'
import { type Locale, fill, localeInfo, tr } from './i18n'

// "16:30", "4pm", "4.30 pm" -> [16, 30]; null when we cannot read it
const parseTime = (t?: string): [number, number] | null => {
  const m = /^\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*$/i.exec(t ?? '')
  if (!m) return null
  let h = Number(m[1])
  const ap = m[3]?.toLowerCase()
  if (ap) h = (h % 12) + (ap === 'pm' ? 12 : 0)
  return h > 23 ? null : [h, Number(m[2] ?? 0)]
}

// -> "4:30 PM"; anything we cannot read is shown as typed
export const t12 = (t?: string) => {
  const hm = parseTime(t)
  if (!hm) return t ?? ''
  const [h, m] = hm
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
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

// Local Dublin clock times, 2 hours long (an unreadable time falls back to noon)
const eventTimes = (e: Doc) => {
  const d = String(e.date).slice(0, 10).replace(/-/g, '')
  const [h, m] = parseTime(e.time) ?? [12, 0]
  const hh = (n: number) => String(n % 24).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return { day: d, start: `${d}T${hh(h)}${mm}00`, end: `${d}T${hh(h + 2)}${mm}00`, h, m }
}

// Floating local time (no timezone), so the calendar shows the same clock time wherever it is opened.
export function eventIcs(e: Doc, url: string) {
  const { start, end } = eventTimes(e)
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

// editors press Enter many times: drop trailing spaces and keep at most one blank line in a row
export const tidy = (s: string) =>
  s
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

// Dublin clock time -> UTC "YYYYMMDDTHHMMSSZ" (Outlook wants an absolute time; this follows summer time)
const dublinToUtc = (day: string, h: number, m: number) => {
  const guess = Date.UTC(+day.slice(0, 4), +day.slice(4, 6) - 1, +day.slice(6, 8), h, m)
  const off = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Dublin', timeZoneName: 'longOffset' })
    .formatToParts(guess)
    .find((p) => p.type === 'timeZoneName')
    ?.value.match(/([+-])(\d+)(?::(\d+))?/)
  const mins = off ? (off[1] === '-' ? -1 : 1) * (Number(off[2]) * 60 + Number(off[3] ?? 0)) : 0
  return new Date(guess - mins * 60000).toISOString().replace(/[-:]|\.\d{3}/g, '')
}

// "Add to calendar" links that open a pre-filled event instead of downloading a file
export function calendarLinks(e: Doc, url: string) {
  const { day, start, end, h, m } = eventTimes(e)
  const details = ((e.description ? tidy(String(e.description)).slice(0, 500) + '\n\n' : '') + url).trim()
  const q = (o: Record<string, string>) =>
    Object.entries(o)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
  return {
    google: `https://calendar.google.com/calendar/render?${q({ action: 'TEMPLATE', text: e.title, dates: `${start}/${end}`, ctz: 'Europe/Dublin', location: e.place, details })}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${q({ path: '/calendar/action/compose', rru: 'addevent', subject: e.title, startdt: dublinToUtc(day, h, m), enddt: dublinToUtc(day, h + 2, m), location: e.place, body: details })}`,
  }
}
