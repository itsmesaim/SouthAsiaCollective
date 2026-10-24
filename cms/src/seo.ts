import type { Field } from 'payload'

// "How it looks in Google and when shared". Everything is optional: if left empty the site uses the title, summary and cover.
export const seoField: Field = {
  type: 'collapsible',
  label: 'Search and sharing (SEO)',
  admin: {
    initCollapsed: true,
    description:
      'Control what Google and WhatsApp show. Leave empty to use the title, summary and cover automatically.',
  },
  fields: [
    {
      name: 'seo',
      type: 'group',
      label: false,
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          maxLength: 60,
          label: 'Search title',
          admin: { description: 'Up to 60 characters. Google cuts off longer titles.' },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          label: 'Search description',
          admin: { description: 'Up to 160 characters. One clear sentence on what this page is.' },
        },
        {
          name: 'metaImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Share image',
          admin: { description: 'Shown when the link is shared. 1200x630 works best. Leave empty to use the cover.' },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hide from Google',
          admin: { description: 'Tick for pages that should stay out of search results.' },
        },
      ],
    },
  ],
}
