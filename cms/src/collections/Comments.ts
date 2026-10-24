import type { CollectionConfig } from 'payload'

import { staff, staffOrOwn } from '../access'

// Held for moderation. Admins/sub-admins moderate everything; a writer moderates comments on their own posts.
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    group: 'Community',
    description:
      'Comments appear here after the visitor confirms their email. Set a comment to Approved to publish it.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'post', 'status', 'createdAt'],
  },
  access: {
    read: staffOrOwn('post.author'),
    create: staff,
    update: staffOrOwn('post.author'),
    delete: staffOrOwn('post.author'),
  },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, index: true },
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: { description: 'Confirmed by the visitor. Never shown publicly.' },
    },
    { name: 'token', type: 'text', index: true, admin: { hidden: true } },
    { name: 'locale', type: 'text', admin: { hidden: true } },
    { name: 'body', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'unverified',
      options: [
        { label: 'Waiting for email confirmation', value: 'unverified' },
        { label: 'Needs review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
