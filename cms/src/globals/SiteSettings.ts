import type { GlobalConfig } from 'payload'

import { admin, anyone, publicRead } from '../access'

// Everything that was hardcoded in index.html
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Site', description: 'Home page wording, links and contact details.' },
  custom: publicRead,
  access: { read: anyone, update: admin },
  fields: [
    { name: 'heroEyebrow', type: 'text', localized: true, defaultValue: 'Based in Dublin, Ireland' },
    { name: 'heroTitle1', type: 'text', localized: true, defaultValue: 'Fighting for democracy.' },
    { name: 'heroTitle2', type: 'text', localized: true, defaultValue: 'Standing in solidarity.' },
    { name: 'heroText', type: 'textarea', localized: true },
    {
      name: 'heroPhotos',
      type: 'array',
      label: 'Home page top photos',
      maxRows: 3,
      labels: { singular: 'Photo', plural: 'Top photos' },
      admin: {
        description:
          'The stack of photos next to the main headline, up to 3. Order: 1 is top left, 2 is on the right, 3 is bottom left. Leave empty to use the first gallery photos. Visitors can hover over a photo to bring it to the front.',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'alt',
          type: 'text',
          localized: true,
          required: true,
          admin: { description: 'Describe the photo for people using screen readers' },
        },
      ],
    },
    { name: 'tickerWords', type: 'array', fields: [{ name: 'word', type: 'text', localized: true }] },
    {
      type: 'collapsible',
      label: 'Search and sharing defaults (SEO)',
      admin: {
        initCollapsed: true,
        description:
          'What Google and social apps show for the site as a whole, and for any page without its own settings.',
      },
      fields: [
        {
          name: 'seoDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          label: 'Site description',
          admin: { description: 'Up to 160 characters. Shown under the site name in Google.' },
        },
        {
          name: 'seoImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Default share image',
          admin: { description: '1200x630. Used when a page has no image of its own.' },
        },
        {
          name: 'twitterHandle',
          type: 'text',
          label: 'X (Twitter) handle',
          admin: { description: 'e.g. @southasiacoll, without a link. Leave empty if there is none.' },
        },
      ],
    },
    {
      name: 'doneTitle',
      type: 'text',
      localized: true,
      admin: {
        description: '"What we\'ve done" heading. Leave empty for the default. Items are under Write > Timeline.',
      },
    },
    { name: 'doneSub', type: 'textarea', localized: true },
    { name: 'quote', type: 'textarea', localized: true },
    { name: 'aboutLead', type: 'textarea', localized: true },
    { name: 'aboutPills', type: 'array', fields: [{ name: 'text', type: 'text', localized: true }] },
    {
      name: 'galleryLayout',
      type: 'select',
      label: 'Photo gallery layout',
      defaultValue: 'collage',
      admin: { description: 'How the photos are arranged on the home page and the Gallery page. Change it any time.' },
      options: [
        { label: 'Collage: pinned prints, mixed sizes', value: 'collage' },
        { label: 'Grid: even squares', value: 'grid' },
        { label: 'Featured: first photo large, the rest small', value: 'featured' },
        { label: 'Film strip: one row you can scroll', value: 'strip' },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Gallery photos' },
      admin: { description: 'Drag to reorder. The home page shows the first 4; the Gallery page shows all of them.' },
      fields: [
        {
          name: 'caption',
          type: 'text',
          localized: true,
          admin: { description: 'Optional. Shown under the photo on the Gallery page.' },
        },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'alt',
          type: 'text',
          localized: true,
          required: true,
          admin: { description: 'Describe the photo for people using screen readers' },
        },
      ],
    },
    {
      name: 'donate',
      type: 'group',
      label: 'Donations',
      admin: { description: 'Turn the Donate button on once the SumUp store is verified and can take payments.' },
      fields: [
        { name: 'open', type: 'checkbox', defaultValue: false, label: 'Donations are open' },
        {
          name: 'url',
          type: 'text',
          defaultValue: 'https://southasiacollective-ie.sumupstore.com/',
          admin: { description: 'Where the Donate button goes' },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          admin: { description: 'Why we ask for donations: what the money pays for. Shown next to the button.' },
        },
      ],
    },
    { name: 'whatsapp', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'contactEmail', type: 'email', defaultValue: 'contact@southasiacollective.ie' },
  ],
}
