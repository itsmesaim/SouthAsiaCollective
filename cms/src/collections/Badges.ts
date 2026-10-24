import type { CollectionConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'

export const Badges: CollectionConfig = {
  slug: 'badges',
  admin: {
    group: 'Community',
    description: 'Small labels you can give people on the About page.',
    useAsTitle: 'label',
  },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'label', type: 'text', required: true, localized: true },
    { name: 'color', type: 'text', defaultValue: '#f55600', admin: { description: 'Hex colour' } },
  ],
}
