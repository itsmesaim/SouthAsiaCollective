import type { GlobalConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'

export const PressKit: GlobalConfig = {
  slug: 'press-kit',
  label: 'Press kit',
  admin: {
    group: 'Site',
    description:
      'What never changes between protests: short blurb, facts, media contacts, logos and credit rules. Each protest gets its own press kit under Write > Press kits.',
  },
  custom: publicRead,
  access: { read: anyone, update: staff },
  fields: [
    {
      name: 'boilerplate',
      type: 'textarea',
      localized: true,
      admin: { description: 'A short paragraph about the group that can be copied as is.' },
    },
    {
      name: 'facts',
      type: 'array',
      labels: { singular: 'Fact', plural: 'Facts' },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, admin: { description: 'e.g. Founded' } },
        { name: 'value', type: 'text', required: true, localized: true, admin: { description: 'e.g. 2025, Dublin' } },
      ],
    },
    {
      name: 'contacts',
      type: 'array',
      labels: { singular: 'Contact', plural: 'Contacts' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', localized: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'assets',
      type: 'array',
      labels: { singular: 'Image', plural: 'Logos and photos' },
      admin: { description: 'Logos and high-resolution photos that can be downloaded.' },
      fields: [
        { name: 'file', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text', required: true, localized: true },
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'photo',
          options: [
            { label: 'Logo', value: 'logo' },
            { label: 'Photo', value: 'photo' },
          ],
        },
      ],
    },
    {
      name: 'guidelines',
      type: 'textarea',
      localized: true,
      admin: { description: 'How to credit us, what not to do with the logo.' },
    },
  ],
}
