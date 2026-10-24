import type { CollectionConfig } from 'payload'

import { staff, staffOrOwn } from '../access'

export const REACTIONS = ['like', 'love', 'solidarity', 'sad', 'angry'] as const

// created by the site's server action; visitor = hash(ip + ua) so one person gets one reaction per post
export const Reactions: CollectionConfig = {
  slug: 'reactions',
  admin: {
    group: 'Community',
    description: 'Anonymous reactions on posts. Read only.',
    defaultColumns: ['post', 'type', 'createdAt'],
  },
  access: { read: staffOrOwn('post.author'), create: staff, update: staff, delete: staff },
  indexes: [{ fields: ['post', 'visitor'], unique: true }],
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, index: true },
    { name: 'type', type: 'select', required: true, options: [...REACTIONS] },
    { name: 'visitor', type: 'text', required: true, admin: { hidden: true } },
  ],
}
