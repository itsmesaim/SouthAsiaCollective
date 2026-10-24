import { zipSync } from 'fflate'

import { type Doc, getPressKit, media } from '@/lib/cms'

export const revalidate = 600
const original = (url: string) => url.replace(/\/upload\/[^/]*,[^/]*\//, '/upload/')

export async function GET() {
  const kit = await getPressKit('en')
  const files: Record<string, Uint8Array> = {}
  for (const a of ((kit.assets ?? []) as Doc[]).slice(0, 30)) {
    const f = a.file as Doc
    const url = f && media(f)
    if (!url) continue
    const r = await fetch(original(url))
    if (!r.ok) continue
    const buf = new Uint8Array(await r.arrayBuffer())
    if (buf.length > 25_000_000) continue
    files[`${a.kind ?? 'file'}/${f.filename ?? a.id}`] = buf
  }
  if (kit.boilerplate) files['about.txt'] = new TextEncoder().encode(String(kit.boilerplate))
  return new Response(zipSync(files, { level: 0 }) as BodyInit, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': 'attachment; filename="south-asia-collective-press-kit.zip"',
    },
  })
}
