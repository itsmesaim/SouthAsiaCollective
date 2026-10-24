import {
  BlocksFeature,
  lexicalEditor,
  LinkFeature,
  TextStateFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

// X (twitter.com), YouTube, Vimeo, TikTok, Instagram
const EMBED_URL =
  /^https:\/\/((www\.|mobile\.)?(x|twitter)\.com\/[^/]+\/status\/\d+|(www\.|m\.)?youtube\.com\/(watch\?v=|shorts\/|embed\/)[\w-]+|youtu\.be\/[\w-]+|(www\.)?vimeo\.com\/\d+|(www\.)?tiktok\.com\/@[^/]+\/video\/\d+|(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+)/i

// Bold/italic/headings/lists come with the defaults. Added: image captions,
// links to external URLs or other posts, and an Instagram embed block.
export const postBody = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    // text colours and highlighter pens in the brand palette (stored as a short key; the site maps it to CSS)
    TextStateFeature({
      state: {
        color: {
          orange: { label: 'Orange text', css: { color: '#ff5a00', 'font-weight': '700' } },
          green: { label: 'Green text', css: { color: '#1f9d55', 'font-weight': '700' } },
          grey: { label: 'Soft grey text', css: { color: '#8a8982' } },
          'hl-gold': { label: 'Gold highlight', css: { background: '#ffc21a', color: '#000' } },
          'hl-orange': { label: 'Orange highlight', css: { background: '#ff5a00', color: '#000' } },
          'hl-green': { label: 'Green highlight', css: { background: '#006b2e', color: '#fff' } },
          'hl-black': { label: 'Black highlight', css: { background: '#000', color: '#fff' } },
        },
      },
    }),
    LinkFeature({ enabledCollections: ['posts'] }),
    UploadFeature({
      collections: {
        media: { fields: [{ name: 'caption', type: 'text' }] },
      },
    }),
    BlocksFeature({
      blocks: [
        {
          slug: 'embed',
          labels: { singular: 'Embed (X, YouTube, Vimeo, TikTok, Instagram)', plural: 'Embeds' },
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: { description: 'Paste the link of the post or video' },
              validate: (v: unknown) =>
                typeof v === 'string' && EMBED_URL.test(v)
                  ? true
                  : 'Use a link from X, YouTube, Vimeo, TikTok or Instagram',
            },
          ],
        },
        {
          slug: 'instagram',
          labels: { singular: 'Instagram post', plural: 'Instagram posts' },
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: { description: 'e.g. https://www.instagram.com/p/XXXX/' },
              validate: (v: unknown) =>
                typeof v === 'string' && /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//.test(v)
                  ? true
                  : 'Paste a public Instagram post/reel URL',
            },
          ],
        },
      ],
    }),
  ],
})
