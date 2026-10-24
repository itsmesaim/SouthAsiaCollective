import { type Doc, getPressKit, media } from '@/lib/cms'

// The CDN URL carries a 1600px display transform; press people need the original.
export const original = (url: string) => url.replace(/\/upload\/[^/]*,[^/]*\//, '/upload/')

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kit = await getPressKit('en')
  const file = ((kit.assets ?? []) as Doc[]).map((a) => a.file as Doc).find((f) => f?.id === id)
  const url = file && media(file)
  if (!file || !url) return new Response('Not found', { status: 404 }) // only files listed in the press kit can be fetched here
  const r = await fetch(original(url))
  if (!r.ok) return new Response('Not found', { status: 404 })
  return new Response(r.body, {
    headers: {
      'content-type': r.headers.get('content-type') ?? 'application/octet-stream',
      'content-disposition': `attachment; filename="${String(file.filename ?? 'file').replace(/"/g, '')}"`,
    },
  })
}
