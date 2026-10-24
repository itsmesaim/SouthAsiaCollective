import type { CollectionConfig } from 'payload'

import { staff } from '../access'
import { LOCALE_CODES } from '../locales'

// created only by the site's server action (local API), never via public REST
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    group: 'Community',
    description: 'People who asked for updates. Only confirmed addresses should be emailed.',
    useAsTitle: 'email',
    defaultColumns: ['email', 'confirmed', 'locale', 'createdAt'],
  },
  access: { read: staff, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      name: 'confirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Set when they click the link in the confirmation email' },
    },
    { name: 'locale', type: 'select', defaultValue: 'en', options: LOCALE_CODES as unknown as string[] },
    // GDPR: proof of consent (what, when) and a secret for the unsubscribe link
    {
      name: 'consentedAt',
      type: 'date',
      required: true,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'consentText', type: 'text', admin: { readOnly: true } },
    {
      name: 'token',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, hidden: true },
      hooks: { beforeValidate: [({ value }) => value || crypto.randomUUID()] },
    },
  ],
}
