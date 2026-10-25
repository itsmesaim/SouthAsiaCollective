// npx payload run src/translate-all.ts
// Translates everything that already exists into the empty languages (needs TRANSLATE_API_KEY or ANTHROPIC_API_KEY in cms/.env). Safe to re-run.
import config from '@payload-config'
import { getPayload } from 'payload'

import { translateDoc } from './translate'

const payload = await getPayload({ config })
for (const g of payload.globals.config)
  await translateDoc(payload, { global: g.slug }).then(() => console.log('global', g.slug))
for (const c of Object.values(payload.collections)) {
  const slug = c.config.slug
  if (['users', 'media', 'comments', 'reactions', 'subscribers'].includes(slug) || slug.startsWith('payload-')) continue
  const { docs } = (await (payload.find as any)({
    collection: slug,
    limit: 1000,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
  })) as { docs: { id: string }[] }
  for (const d of docs)
    await translateDoc(payload, { collection: slug, id: String(d.id) }).then(() => console.log(slug, d.id))
}
process.exit(0)
