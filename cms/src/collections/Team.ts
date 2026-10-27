import type { CollectionConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'
import { isHttpUrl, normalizeUrl } from '../url'

export const LINK_KINDS = [
  { label: 'Website', value: 'website' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'X / Twitter', value: 'x' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'GitHub', value: 'github' },
  { label: 'Fiverr', value: 'fiverr' },
  { label: 'Other', value: 'other' },
] as const

// About page: members and contributors
export const Team: CollectionConfig = {
  slug: 'team',
  orderable: true,
  admin: { group: 'Community', description: 'People shown on the About page.', useAsTitle: 'name' },
  custom: publicRead,
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'guide', type: 'ui', admin: { components: { Field: '/admin/WritingGuide#TeamGuide' } } },
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'One or two lines shown on the About page card. Leave empty to use the start of the full bio.',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      admin: { description: "Full details, shown on the person's own page." },
    },
    { name: 'badges', type: 'relationship', relationTo: 'badges', hasMany: true },
    {
      name: 'link',
      type: 'text',
      label: 'Website',
      admin: {
        description: 'Optional website, e.g. saimjs.com (https:// is added for you). More accounts go in Social links.',
      },
      hooks: { beforeValidate: [({ value }) => normalizeUrl(value)] },
      validate: (v: unknown) => (!v || isHttpUrl(String(v)) ? true : 'Enter a valid web address'),
    },
    {
      name: 'links',
      label: 'Social links',
      type: 'array',
      admin: { description: "LinkedIn, Instagram, Facebook, Fiverr and so on. Shown as buttons on the person's page." },
      fields: [
        { name: 'kind', type: 'select', required: true, defaultValue: 'website', options: [...LINK_KINDS] },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { description: 'e.g. linkedin.com/in/name (https:// is added for you)' },
          hooks: { beforeValidate: [({ value }) => normalizeUrl(value)] },
          validate: (v: unknown) => (isHttpUrl(String(v ?? '')) ? true : 'Enter a valid web address'),
        },
      ],
    },
  ],
}
