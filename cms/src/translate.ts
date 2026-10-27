import type { CollectionAfterChangeHook, Field, GlobalAfterChangeHook, Payload } from 'payload'

import { LOCALE_CODES } from './locales'

// Fills EMPTY translations from the English text, in the background, after an editor saves in English.
// A translation someone typed is never overwritten. To redo one, clear that field and save the English again.
// Needs TRANSLATE_API_KEY (DeepSeek/Mistral/any OpenAI-compatible) or ANTHROPIC_API_KEY in cms/.env; without it nothing happens. TRANSLATE_MOCK=1 prefixes text with [code] for testing.

const NAMES: Record<string, string> = {
  ga: 'Irish',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi (Gurmukhi script)',
  ur: 'Urdu',
  ne: 'Nepali',
  si: 'Sinhala',
}

// per-language style notes from native-speaker feedback; add a line when a reader says a language sounds off
const HINTS: Record<string, string> = {
  hi: 'Use natural spoken-but-respectful Hindi with common Hindi/Urdu-origin words, not Sanskritised or textbook phrasing; split long English sentences into shorter ones. ',
  bn: 'Use natural modern Bangla, not a literal rendering; avoid overusing "সত্যিই/সত্যি সত্যি" for "truly/really/definitely", and leave such intensifiers out when the sentence reads fine without them. ',
  ga: 'Use current standard Irish (An Caighdeán Oifigiúil) in a plain, modern register, with correct mutations; avoid stiff literal calques of English idioms. ',
  ta: 'Use natural spoken-register Tamil (பேச்சுத் தமிழுக்கு நெருக்கமான எழுத்துத் தமிழ்), not formal textbook Tamil; avoid long Sanskritised compounds. ',
  te: 'Use natural everyday Telugu (వ్యవహారిక శైలి), not bookish grammatical Telugu; break up long English sentences. ',
  ml: 'Use natural modern Malayalam as in good journalism, not literal or Sanskrit-heavy phrasing; keep sentences short. ',
  kn: 'Use natural modern Kannada as in everyday newspapers, not literal or overly Sanskritised phrasing. ',
  mr: 'Use natural modern Marathi as spoken in Maharashtra, not a Hindi-influenced or word-for-word rendering. ',
  gu: 'Use natural modern Gujarati as in everyday speech and newspapers, not a Hindi-influenced or word-for-word rendering. ',
  pa: 'Use natural spoken Punjabi in Gurmukhi (ਆਮ ਬੋਲਚਾਲ ਦੀ ਪੰਜਾਬੀ), avoiding Hindi or English calques. ',
  ur: 'Use natural, clear Urdu with common everyday vocabulary (not heavily Persianised or Hindi-fied), and write fully in Nastaliq-appropriate script and right-to-left punctuation. ',
  ne: 'Use natural modern Nepali as in everyday speech and news, not a Hindi-influenced or literal rendering. ',
  si: 'Use natural modern Sinhala in the written-but-readable register used by newspapers, not stiff literary Sinhala or a literal rendering. ',
}

const enabled = () =>
  Boolean(process.env.TRANSLATE_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.TRANSLATE_MOCK)

// one line for the startup log, so it is never silently off
export const translateStatus = () =>
  process.env.TRANSLATE_MOCK
    ? 'auto-translation ON (mock, for testing)'
    : process.env.TRANSLATE_API_KEY
      ? `auto-translation ON (${process.env.TRANSLATE_API_URL || 'https://api.deepseek.com'}, ${process.env.TRANSLATE_MODEL || 'deepseek-flash'})`
      : process.env.ANTHROPIC_API_KEY
        ? 'auto-translation ON (Claude)'
        : 'auto-translation OFF: set TRANSLATE_API_KEY in cms/.env and restart, then run: npx payload run src/translate-all.ts'

async function translate(texts: string[], code: string): Promise<string[]> {
  if (process.env.TRANSLATE_MOCK) return texts.map((t) => `[${code}] ${t}`)
  const system =
    `You translate website text for a human rights group into ${NAMES[code]}. Keep the meaning, tone and facts exact, but write it the way ` +
    `a fluent native speaker would say it, not word for word: rephrase freely, use everyday idiom, and never mirror English sentence structure. ` +
    `If a literal rendering would sound stiff, bookish or machine-made, choose the natural phrasing instead. Do not repeat the same word ` +
    `where English uses one word in two senses (for example "truly" and "must"): pick a fitting word for each. Drop filler intensifiers that read clunky. ` +
    `${HINTS[code] ?? ''}Keep names, numbers, URLs, hashtags, social handles, and brand names such as WhatsApp in their original Latin form, add nothing. ` +
    'The user message is a JSON array of strings. Reply with ONLY a JSON array of the same length with the translations in the same order.'
  const user = JSON.stringify(texts)
  let reply: string
  if (process.env.TRANSLATE_API_KEY) {
    // any OpenAI-compatible API: DeepSeek (default), Mistral (https://api.mistral.ai/v1 + mistral-large-latest), ...
    const base = process.env.TRANSLATE_API_URL || 'https://api.deepseek.com'
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.TRANSLATE_API_KEY}` },
      body: JSON.stringify({
        model: process.env.TRANSLATE_MODEL || 'deepseek-flash',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) throw new Error(`translate ${code}: ${res.status} ${await res.text()}`)
    reply = ((await res.json()) as { choices: { message: { content: string } }[] }).choices[0].message.content
  } else {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 16000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!res.ok) throw new Error(`translate ${code}: ${res.status} ${await res.text()}`)
    reply = ((await res.json()) as { content: { text: string }[] }).content[0].text
  }
  const out = JSON.parse(reply.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '')) // some models wrap the array in a code fence
  if (!Array.isArray(out) || out.length !== texts.length) throw new Error(`translate ${code}: bad reply`)
  return out.map(String)
}

type Slot = { text: string; set: (v: string) => void }
const empty = (v: unknown) => v == null || v === '' || (typeof v === 'object' && !hasText(v))

// does a rich text value hold any text
function hasText(n: unknown): boolean {
  if (!n || typeof n !== 'object') return false
  const o = n as { text?: string; children?: unknown[]; root?: unknown }
  return Boolean(o.text?.trim()) || Boolean(o.root && hasText(o.root)) || Boolean(o.children?.some(hasText))
}

// every text node of a rich text value (as slots), working on a clone
function richSlots(node: unknown, out: Slot[]) {
  const n = node as { type?: string; text?: string; children?: unknown[]; root?: unknown }
  if (!n || typeof n !== 'object') return
  if (n.type === 'text' && n.text?.trim()) out.push({ text: n.text, set: (v) => (n.text = v) })
  if (n.root) richSlots(n.root, out)
  n.children?.forEach((c) => richSlots(c, out))
}

// Builds what to save for the target language: the English structure with every still-empty localized text translated,
// keeping translations that already exist. Collects the strings that need translating into `slots`.
function merge(fields: Field[], src: any, tgt: any, slots: Slot[]): any {
  const out: any = {}
  for (const f of fields) {
    if (f.type === 'row' || f.type === 'collapsible') {
      Object.assign(out, merge(f.fields, src, tgt, slots))
      continue
    }
    if (!('name' in f) || !f.name) continue
    const s = src?.[f.name]
    const t = tgt?.[f.name]
    const localized = 'localized' in f && f.localized
    if (f.type === 'group') out[f.name] = merge(f.fields, s ?? {}, t ?? {}, slots)
    else if (f.type === 'array')
      out[f.name] = (s ?? []).map((row: any, i: number) => {
        const m = merge(f.fields, row, t?.[i] ?? {}, slots) // not copied: the slots write into this object later
        m.id = row.id
        return m
      })
    else if (localized && (f.type === 'text' || f.type === 'textarea')) {
      // rows of a list are copied into every language as English, so "same as English" counts as not translated yet
      if (!empty(t) && t !== s) out[f.name] = t
      else if (typeof s === 'string' && s.trim()) {
        out[f.name] = s
        slots.push({ text: s, set: (v) => (out[f.name] = v) })
      } else out[f.name] = t ?? s
    } else if (localized && f.type === 'richText') {
      if (!empty(t)) out[f.name] = t
      else if (hasText(s)) {
        out[f.name] = JSON.parse(JSON.stringify(s))
        richSlots(out[f.name], slots)
      } else out[f.name] = t ?? s
    } else out[f.name] = s
  }
  return out
}

type Target = { collection: string; id: string } | { global: string }

export async function translateDoc(payload: Payload, target: Target) {
  if (!enabled()) return
  const isGlobal = 'global' in target
  const fields = (
    isGlobal
      ? payload.globals.config.find((g) => g.slug === target.global)
      : (payload.collections as Record<string, { config: { fields: Field[] } }>)[target.collection].config
  )!.fields
  const read = (locale: string) =>
    isGlobal
      ? payload.findGlobal({
          slug: target.global as never,
          locale: locale as never,
          fallbackLocale: false,
          depth: 0,
          overrideAccess: true,
        })
      : (payload.findByID as any)({
          collection: target.collection,
          id: target.id,
          locale,
          fallbackLocale: false,
          depth: 0,
          draft: true,
          overrideAccess: true,
        })
  const src: any = await read('en')
  for (const code of LOCALE_CODES.filter((c) => c !== 'en')) {
    const tgt: any = await read(code)
    const slots: Slot[] = []
    const merged = merge(fields, src, tgt, slots)
    if (!slots.length) continue
    const done = await translate(
      slots.map((s) => s.text),
      code,
    )
    slots.forEach((s, i) => s.set(done[i]))
    // only send the fields that were touched, never system fields
    const data: any = {}
    for (const f of fields)
      if ('name' in f && f.name && JSON.stringify(merged[f.name]) !== JSON.stringify(tgt?.[f.name]))
        data[f.name] = merged[f.name]
    for (const f of fields)
      if (f.type === 'row' || f.type === 'collapsible')
        for (const g of f.fields)
          if ('name' in g && g.name && JSON.stringify(merged[g.name]) !== JSON.stringify(tgt?.[g.name]))
            data[g.name] = merged[g.name]
    payload.logger.info(
      `translate: ${'global' in target ? target.global : `${target.collection} ${target.id}`} -> ${code}`,
    )
    const ctx = { skipTranslate: true }
    if (isGlobal)
      await payload.updateGlobal({
        slug: target.global as never,
        locale: code as never,
        data,
        context: ctx,
        depth: 0,
        overrideAccess: true,
      })
    else
      await (payload.update as any)({
        collection: target.collection,
        id: target.id,
        locale: code,
        data,
        context: ctx,
        depth: 0,
        overrideAccess: true,
      })
  }
}

// hooks: run after an English save, without making the editor wait
export const autoTranslateDoc: CollectionAfterChangeHook = ({ doc, req, collection, context }) => {
  if (enabled() && req.locale === 'en' && !context.skipTranslate)
    void translateDoc(req.payload, { collection: collection.slug, id: String(doc.id) }).catch((e) =>
      req.payload.logger.error(e),
    )
  return doc
}
export const autoTranslateGlobal: GlobalAfterChangeHook = ({ doc, req, global, context }) => {
  if (enabled() && req.locale === 'en' && !context.skipTranslate)
    void translateDoc(req.payload, { global: global.slug }).catch((e) => req.payload.logger.error(e))
  return doc
}
