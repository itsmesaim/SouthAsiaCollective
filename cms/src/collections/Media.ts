import type { CollectionConfig } from 'payload'

import { anyone, loggedIn, staff, publicRead } from '../access'

// Storage (Cloudinary or local disk) is chosen in payload.config.ts
export const Media: CollectionConfig = {
  slug: 'media',
  custom: publicRead,
  access: { read: anyone, create: loggedIn, update: staff, delete: staff },
  admin: { group: 'Site', description: 'Images used across the site.' },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true },
    { name: 'caption', type: 'text', localized: true },
  ],
  // no SVG: it can carry scripts
  upload: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] },
}
