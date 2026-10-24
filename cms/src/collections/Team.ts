import type { CollectionConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'
import { isHttpUrl, normalizeUrl } from '../url'

// About page: members and contributors
export const Team: CollectionConfig = {
  slug: 'team',
  orderable: true,
  admin: { group: 'Community', description: 'People shown on the About page.', useAsTitle: 'name' },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea', localized: true },
    { name: 'badges', type: 'relationship', relationTo: 'badges', hasMany: true },
    {
      name: 'link',
      type: 'text',
      admin: { description: 'Optional website or social profile, e.g. instagram.com/name (https:// is added for you)' },
      hooks: { beforeValidate: [({ value }) => normalizeUrl(value)] },
      validate: (v: unknown) => (!v || isHttpUrl(String(v)) ? true : 'Enter a valid web address'),
    },
  ],
}
