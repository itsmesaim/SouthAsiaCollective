import type { GlobalConfig } from 'payload'

import { anyone, staff, publicRead } from '../access'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About page',
  admin: { group: 'Site', description: 'The words on the About page. People and badges are managed under Team.' },
  custom: publicRead,
  access: { read: anyone, update: staff },
  fields: [
    { name: 'intro', type: 'textarea', localized: true, admin: { description: 'Who we are, a paragraph or two' } },
    {
      name: 'objectives',
      type: 'array',
      labels: { singular: 'Objective', plural: 'Objectives' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: { description: 'One short word, shown big, e.g. Educate. Optional.' },
        },
        { name: 'text', type: 'textarea', required: true, localized: true },
      ],
    },
    {
      name: 'demandsIntro',
      type: 'text',
      localized: true,
      admin: { description: 'One line above the demands, optional' },
    },
    {
      name: 'demands',
      type: 'array',
      labels: { singular: 'Demand', plural: 'Demands' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'text', type: 'textarea', required: true, localized: true },
      ],
    },
  ],
}
