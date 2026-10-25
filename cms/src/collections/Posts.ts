import type { CollectionConfig } from 'payload'

import { seoField } from '../seo'
import { isStaffU, loggedIn, publicRead, staffField, staffOrOwn } from '../access'
import { totpAccess } from 'payload-totp'
import { postBody } from '../editor'

// Only enforced for the default language, so a Hindi translation can be saved later or left empty.
const requiredWhenPublished =
  (msg: string) =>
  (v: unknown, { siblingData, req }: { siblingData: Record<string, unknown>; req: { locale?: string | null } }) =>
    siblingData.status === 'published' && req.locale === 'en' && !v ? msg : true

// true if the editor holds any visible text, an image or an embed
const hasText = (v: unknown): boolean => {
  type N = { type?: string; text?: string; children?: N[] }
  const walk = (n?: N): boolean =>
    !!n && (n.type === 'upload' || n.type === 'block' || !!n.text?.trim() || !!n.children?.some(walk))
  return walk((v as { root?: N } | null)?.root)
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  orderable: true, // drag-to-reorder in the admin list
  admin: {
    group: 'Write',
    description: 'Blog write-ups, news updates and statements.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'author', 'status', 'publishedAt'],
  },
  custom: publicRead,
  access: {
    create: loggedIn,
    // visitors see published posts; signed-in people also pass the two-factor check to see drafts
    read: (args) => {
      const { user } = args.req
      const published = { status: { equals: 'published' } }
      if (!user) return published
      return totpAccess(() => (isStaffU(user) ? true : { or: [published, { author: { equals: user.id } }] }))(args)
    },
    update: staffOrOwn('author'),
    delete: staffOrOwn('author'),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        // who really made it: set once on creation from the signed-in account, never editable
        if (operation === 'create') data.createdBy = req.user?.id
        if (operation === 'create' && !isStaffU(req.user)) data.author = req.user?.id
        if (operation === 'create' && !data.author) data.author = req.user?.id
        // public visitors can't read users, so keep the display name on the post.
        // "byline": auto = statements are signed by the collective, everything else by the writer
        const author = data.author ?? originalDoc?.author
        const type = data.type ?? originalDoc?.type
        const byline = data.byline ?? originalDoc?.byline ?? 'auto'
        if (byline === 'collective' || (byline === 'auto' && type === 'statement')) data.authorName = 'South Asia Collective'
        else if (author) {
          const u = await req.payload.findByID({ collection: 'users', id: author, depth: 0, overrideAccess: true })
          data.authorName = u.displayName || u.name
        }
        if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
        if (!data.slug && data.title) {
          // titles in other scripts slugify to nothing, so fall back to a short unique id
          data.slug =
            String(data.title)
              .toLowerCase()
              .normalize('NFKD')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `post-${Date.now().toString(36)}`
        }
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
      admin: { description: 'Required. The headline people see. Write it in English: other languages are filled in automatically after you save.' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Auto-filled from the title' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'blog',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Blog: a full write-up of what we did and why', value: 'blog' },
        { label: 'News: a short update', value: 'news' },
        { label: 'Statement: our official position', value: 'statement' },
      ],
    },
    {
      name: 'status',
      label: 'Status (Draft = only you see it)',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
      access: { update: staffField },
    },
    {
      name: 'byline',
      type: 'select',
      defaultValue: 'auto',
      label: 'Who is named as the author?',
      options: [
        { label: 'Automatic: statements say South Asia Collective, other posts name the writer', value: 'auto' },
        { label: "The writer's public name", value: 'writer' },
        { label: 'South Asia Collective (hide the writer)', value: 'collective' },
      ],
      admin: { position: 'sidebar', description: 'The real writer is still recorded privately for the team.' },
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Public byline',
      admin: { position: 'sidebar', readOnly: true, description: "Shown to readers (the writer's public name)" },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Created by (real account)',
      admin: { position: 'sidebar', readOnly: true, description: 'Who actually made this post. Cannot be changed.' },
      access: { read: staffField, create: () => false, update: () => false },
    },
    {
      name: 'featured',
      label: 'Important (pin to top)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick for important posts: pinned first on the home page and lists. Admins only.',
      },
      access: { create: staffField, update: staffField },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Topics, e.g. Embassy Chalo. Add new ones under Write > Tags.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      admin: { description: 'Required to publish. Short summary, used on cards, search results and social previews.' },
      validate: requiredWhenPublished('A short summary is required before publishing'),
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Required to publish. Landscape photo.' },
      validate: requiredWhenPublished('A cover image is required before publishing'),
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      editor: postBody,
      admin: { description: 'One Enter starts a new paragraph, so no need to press it twice (extra blank lines are removed on the site). To add a link: select the words, click the chain icon in the toolbar, paste the address. A web address pasted on its own also becomes a link. A Google Doc link on its own line becomes an Open the document button.' },
      validate: (
        v: unknown,
        { siblingData, req }: { siblingData: Record<string, unknown>; req: { locale?: string | null } },
      ) =>
        siblingData.status === 'published' && req.locale === 'en' && !hasText(v)
          ? 'Write something before publishing'
          : true,
    },
    {
      name: 'sources',
      type: 'relationship',
      relationTo: 'coverage',
      hasMany: true,
      label: 'News articles about this',
      admin: { description: 'Pick from News coverage (add the article there first). Shown under the post as clippings.' },
    },
    seoField,
  ],
}
