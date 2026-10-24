import { readFile } from 'fs/promises'
import path from 'path'

import { ImageResponse } from 'next/og'

import { type Doc, media } from './cms'

// Share images are always English + Latin script. The renderer cannot shape Indic/Arabic text reliably,
// and a Latin card works on every platform. The real page stays fully translated.
const font = (file: string) =>
  readFile(path.join(process.cwd(), 'node_modules/@fontsource/bricolage-grotesque/files', file))

// The renderer refuses to fetch localhost/private URLs and cannot decode WebP/AVIF, so we load images ourselves
// (as JPEG when the CDN can convert) and pass them in as data URIs. A failed image just means a poster without a photo.
async function dataUri(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const r = await fetch(url.replace('/f_auto,', '/f_jpg,'), { signal: AbortSignal.timeout(8000) })
    if (!r.ok) return null
    const type = r.headers.get('content-type') ?? 'image/jpeg'
    if (!/image\/(jpeg|png)/.test(type)) return null
    return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`
  } catch {
    return null
  }
}
const logoUri = async () =>
  `data:image/png;base64,${(await readFile(path.join(process.cwd(), 'public/logo.png'))).toString('base64')}`

const INK = '#000',
  PAPER = '#f6f5f0',
  SAFFRON = '#ff5a00',
  MARIGOLD = '#ffc21a',
  GREEN = '#006b2e'

type Props = {
  kind: 'og' | 'story'
  title: string
  cover?: Doc | null
  tag?: string // e.g. "Statement" or "Protest"
  line1?: string // date line
  line2?: string // place / author line
  big?: { day: string; month: string } // calendar stamp for events
}

export async function poster({ kind, title, cover, tag, line1, line2, big }: Props) {
  const story = kind === 'story'
  const [w, h] = story ? [1080, 1920] : [1200, 630]
  const [img, logo, f800, f500] = await Promise.all([
    dataUri(media(cover)),
    logoUri(),
    font('bricolage-grotesque-latin-800-normal.woff'),
    font('bricolage-grotesque-latin-500-normal.woff'),
  ])
  const size = story ? (title.length > 60 ? 92 : 112) : title.length > 70 ? 54 : 70
  const pad = story ? 72 : 48

  const res = new ImageResponse(
    <div style={{ width: w, height: h, display: 'flex', position: 'relative', background: SAFFRON, fontFamily: 'B' }}>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt=""
          width={w}
          height={h}
          style={{ position: 'absolute', inset: 0, width: w, height: h, objectFit: 'cover' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          background: img ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.88) 100%)' : 'transparent',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: w,
          height: h,
          padding: pad,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              background: img ? INK : 'transparent',
              padding: img ? (story ? '10px 28px 10px 12px' : '6px 18px 6px 8px') : 0,
              borderRadius: 999,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={story ? 96 : 64} height={story ? 96 : 64} style={{ borderRadius: 999 }} />
            <div style={{ display: 'flex', fontSize: story ? 40 : 28, fontWeight: 800, color: img ? PAPER : INK }}>
              South Asia Collective
            </div>
          </div>
          {tag && (
            <div
              style={{
                display: 'flex',
                background: MARIGOLD,
                color: INK,
                border: `4px solid ${INK}`,
                padding: story ? '10px 24px' : '6px 16px',
                fontSize: story ? 38 : 26,
                fontWeight: 800,
                transform: 'rotate(-3deg)',
              }}
            >
              {tag}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: story ? 36 : 20 }}>
          {big && (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                flexDirection: 'column',
                alignItems: 'center',
                background: MARIGOLD,
                color: INK,
                border: `5px solid ${INK}`,
                padding: story ? '20px 40px' : '8px 22px',
                transform: 'rotate(-4deg)',
              }}
            >
              <div style={{ display: 'flex', fontSize: story ? 150 : 72, fontWeight: 800, lineHeight: 1 }}>
                {big.day}
              </div>
              <div style={{ display: 'flex', fontSize: story ? 56 : 30, fontWeight: 800 }}>
                {big.month.toUpperCase()}
              </div>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              background: PAPER,
              color: INK,
              padding: story ? '28px 36px' : '16px 24px',
              fontSize: size,
              fontWeight: 800,
              lineHeight: 1.04,
              boxShadow: `12px 14px 0 ${INK}`,
              transform: 'rotate(-1.2deg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: story ? -22 : -14,
                left: story ? 60 : 36,
                width: story ? 190 : 110,
                height: story ? 44 : 28,
                background: MARIGOLD,
                opacity: 0.92,
                transform: 'rotate(-4deg)',
              }}
            />
            {title}
          </div>
          {(line1 || line2) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                alignSelf: 'flex-start',
                background: INK,
                color: PAPER,
                padding: story ? '18px 30px' : '10px 20px',
                fontSize: story ? 46 : 28,
                fontWeight: 500,
              }}
            >
              {line1 && <div style={{ display: 'flex' }}>{line1}</div>}
              {line2 && <div style={{ display: 'flex' }}>{line2}</div>}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: img ? PAPER : INK,
            fontSize: story ? 40 : 26,
            fontWeight: 800,
          }}
        >
          <div style={{ display: 'flex' }}>southasiacollective.ie</div>
          <div style={{ display: 'flex', background: GREEN, color: PAPER, padding: story ? '8px 22px' : '4px 14px' }}>
            Dublin
          </div>
        </div>
      </div>
    </div>,
    {
      width: w,
      height: h,
      fonts: [
        { name: 'B', data: f800, weight: 800, style: 'normal' },
        { name: 'B', data: f500, weight: 500, style: 'normal' },
      ],
    },
  )

  // PNG of a photo is several MB; WhatsApp and others skip big preview images. JPEG keeps it to a few hundred KB.
  const sharp = (await import('sharp')).default
  const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
    .flatten({ background: INK })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
  return new Response(new Uint8Array(jpeg), {
    headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=3600, s-maxage=3600' },
  })
}
