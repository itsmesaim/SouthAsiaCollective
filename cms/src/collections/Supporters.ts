import type { CollectionConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'
import { isHttpUrl, normalizeUrl } from '../url'

// About page: organisations that have backed us. Shown after "Our people", not part of the team.
export const Supporters: CollectionConfig = {
  slug: 'supporters',
  orderable: true,
  admin: {
    group: 'Community',
    description: 'Organisations that have supported us. Shown on the About page under their own heading.',
    useAsTitle: 'name',
  },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Optional. A square or wide logo.' } },
    {
      name: 'about',
      type: 'textarea',
      localized: true,
      maxLength: 200,
      admin: { description: 'Optional. One line on who they are or how they helped.' },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Website or social page',
      admin: { description: 'Optional, e.g. rosa.ie (https:// is added for you). Makes the card clickable.' },
      hooks: { beforeValidate: [({ value }) => normalizeUrl(value)] },
      validate: (v: unknown) => (!v || isHttpUrl(String(v)) ? true : 'Enter a valid web address'),
    },
  ],
}
