import type { CollectionConfig } from 'payload'

import { adminField, isAdminU, isStaffU, staff, staffField } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Site',
    description: 'Admins, sub-admins and writers.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: { maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 }, // 5 wrong passwords or codes lock the account for 10 minutes
  access: {
    unlock: ({ req: { user } }) => isAdminU(user),
    create: staff,
    // staff see everyone; writers only themselves
    read: ({ req: { user } }) => (isStaffU(user) ? true : user ? { id: { equals: user.id } } : false),
    update: ({ req: { user } }) => (isAdminU(user) ? true : user ? { id: { equals: user.id } } : false),
    delete: ({ req: { user } }) => (isAdminU(user) ? true : isStaffU(user) ? { role: { equals: 'writer' } } : false),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin' // first user bootstraps the site
        }
        // sub-admins may only create writers/sub-admins, never admins
        if (req.user?.role === 'subadmin' && data.role === 'admin') data.role = 'writer'
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Real name. Only the team sees this.' } },
    {
      name: 'displayName',
      type: 'text',
      label: 'Public name (byline)',
      admin: {
        description:
          'The name readers see on your posts. Use a pen name if you prefer. The team always sees who really wrote each post.',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'writer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Sub-admin', value: 'subadmin' },
        { label: 'Writer / Publisher', value: 'writer' },
      ],
      access: { create: staffField, update: adminField },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea', localized: true },
  ],
}
