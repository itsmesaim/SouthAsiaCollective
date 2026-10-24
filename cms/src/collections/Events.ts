import type { CollectionConfig } from 'payload'

import { seoField } from '../seo'
import { publicRead, staff } from '../access'
import { totpAccess } from 'payload-totp'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    group: 'Write',
    description: 'Protests, vigils and meetups. Each event gets its own shareable page with a poster image.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'time', 'place', 'status'],
  },
  custom: publicRead,
  access: {
    read: (args) => (args.req.user ? totpAccess(() => true)(args) : { status: { equals: 'published' } }),
    create: staff,
    update: staff,
    delete: staff,
  },
  defaultSort: 'date',
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          const day = String(data.date ?? '').slice(0, 10)
          // titles in other scripts slugify to nothing, so fall back to the date
          data.slug = [slugify(String(data.title)) || 'event', day].filter(Boolean).join('-')
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, admin: { description: 'Required.' } },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' }, width: '50%' } },
        { name: 'time', type: 'text', required: true, admin: { description: '24h, e.g. 16:30', width: '50%' } },
      ],
    },
    { name: 'place', type: 'text', required: true, admin: { description: 'Address people can paste into a map' } },
    {
      type: 'row',
      fields: [
        { name: 'lat', type: 'number', admin: { width: '50%', description: 'Optional, improves Google results' } },
        { name: 'lng', type: 'number', admin: { width: '50%' } },
      ],
    },
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'shareCaption',
      type: 'textarea',
      localized: true,
      maxLength: 280,
      admin: {
        description: 'The text that fills in when someone shares this event (WhatsApp, stories). Keep it punchy.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Photo for the poster and link previews. Landscape works best. If empty, the poster uses brand colours.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Filled in automatically' },
    },
    {
      name: 'important',
      label: 'Important (highlight)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick to give this event a gold outline and an "Important" tag on the site',
      },
    },
    {
      name: 'status',
      label: 'Status (Draft = hidden from the site)',
      type: 'select',
      defaultValue: 'published',
      options: ['draft', 'published'],
      admin: { position: 'sidebar' },
    },
    seoField,
  ],
}
