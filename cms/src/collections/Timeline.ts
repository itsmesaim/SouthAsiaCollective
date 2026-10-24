import type { CollectionConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'

// "What we've done" section
export const Timeline: CollectionConfig = {
  slug: 'timeline',
  orderable: true,
  admin: { group: 'Write', description: 'The "What we\'ve done" section on the home page.', useAsTitle: 'title' },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Optional photo for this card' } },
    { name: 'dateLabel', type: 'text', required: true, admin: { description: 'e.g. 26 Jul' } },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', required: true, localized: true },
  ],
}
