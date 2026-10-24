import type { CollectionConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'
import { isHttpUrl, normalizeUrl } from '../url'

export const Coverage: CollectionConfig = {
  slug: 'coverage',
  labels: { singular: 'News coverage', plural: 'News coverage' },
  orderable: true,
  admin: {
    group: 'Write',
    description: 'Articles by news outlets that covered us. Shown in "In the news" on the home page and press kit.',
    useAsTitle: 'title',
    defaultColumns: ['outlet', 'title', 'date'],
  },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'outlet', type: 'text', required: true, admin: { description: 'e.g. The Wire' } },
    { name: 'title', type: 'text', required: true, admin: { description: 'The headline' } },
    {
      name: 'url',
      type: 'text',
      required: true,
      hooks: { beforeValidate: [({ value }) => normalizeUrl(value)] },
      validate: (v: unknown) => (isHttpUrl(String(v ?? '')) ? true : 'Enter a valid web address'),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. A screenshot of the article or the outlet logo. Shows it is real.' },
    },
    {
      name: 'archiveUrl',
      type: 'text',
      label: 'Archived copy (optional)',
      admin: { description: 'e.g. an archive.org or archive.ph link, in case the original is removed' },
      hooks: { beforeValidate: [({ value }) => normalizeUrl(value)] },
      validate: (v: unknown) => (!v || isHttpUrl(String(v)) ? true : 'Enter a valid web address'),
    },
    { name: 'date', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
  ],
}
