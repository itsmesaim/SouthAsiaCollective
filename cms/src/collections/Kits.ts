import type { CollectionConfig } from 'payload'

import { seoField } from '../seo'
import { publicRead, staff } from '../access'
import { postBody } from '../editor'
import { totpAccess } from 'payload-totp'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// One press kit per protest, written after the day. Logos, facts and contacts that never change live in Site > Press kit.
export const Kits: CollectionConfig = {
  slug: 'kits',
  labels: { singular: 'Press kit (one protest)', plural: 'Press kits (one per protest)' },
  admin: {
    group: 'Write',
    description:
      'After each protest, write its press kit here: blurb, what happened, statements, photos and the news that covered it. Journalists get it on its own page.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'status'],
  },
  custom: publicRead,
  defaultSort: '-date',
  access: {
    read: (args) => (args.req.user ? totpAccess(() => true)(args) : { status: { equals: 'published' } }),
    create: staff,
    update: staff,
    delete: staff,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title)
          data.slug = [slugify(String(data.title)) || 'kit', String(data.date ?? '').slice(0, 10)]
            .filter(Boolean)
            .join('-')
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'e.g. Embassy Chalo, Dublin' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' }, description: 'The day of the protest' },
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      admin: { description: 'Two lines for the list and for link previews.' },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Photo for the list and for link previews' },
    },
    {
      name: 'packet',
      type: 'richText',
      localized: true,
      editor: postBody,
      label: 'The press kit (write it here)',
      admin: {
        description:
          'Blurb, how the day went, individual statements, demands. Headings, bold, colours, images and links all work. Only quote people who agreed.',
      },
    },
    {
      name: 'photos',
      type: 'array',
      labels: { singular: 'Photo or video', plural: 'Photos and videos for the press' },
      fields: [
        { name: 'file', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', localized: true },
        { name: 'credit', type: 'text', admin: { description: 'Who took it' } },
      ],
    },
    {
      name: 'coverage',
      type: 'relationship',
      relationTo: 'coverage',
      hasMany: true,
      label: 'News that covered this protest',
      admin: { description: 'Pick from News coverage. Add the article there first (with a screenshot and link).' },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      admin: { position: 'sidebar', description: 'Optional: the event page this belongs to' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Filled in automatically' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft (only the team sees it)', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    seoField,
  ],
}
