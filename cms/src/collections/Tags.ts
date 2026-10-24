import type { CollectionConfig } from 'payload'

import { anyone, publicRead, staff } from '../access'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// Topics a post can carry, e.g. "Embassy Chalo", "Voting rights". Add as many as you like.
export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    group: 'Write',
    description: 'Topics to label posts with. Readers can filter by them.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) data.slug = slugify(String(data.name)) || `tag-${Date.now().toString(36)}`
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', unique: true, index: true, admin: { description: 'Filled in automatically' } },
  ],
}
