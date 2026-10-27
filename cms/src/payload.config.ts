import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadTotp } from 'payload-totp'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Badges } from './collections/Badges'
import { AboutPage } from './globals/AboutPage'
import { Comments } from './collections/Comments'
import { Coverage } from './collections/Coverage'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Reactions } from './collections/Reactions'
import { Subscribers } from './collections/Subscribers'
import { Supporters } from './collections/Supporters'
import { Team } from './collections/Team'
import { Kits } from './collections/Kits'
import { Tags } from './collections/Tags'
import { autoTranslateDoc, autoTranslateGlobal, translateStatus } from './translate'
import { Timeline } from './collections/Timeline'
import { Users } from './collections/Users'
import { cloudinaryAdapter, cloudinaryEnabled, cloudinaryURL } from './cloudinary'
import { endpoints } from './endpoints'
import { LOCALES } from './locales'
import { PressKit } from './globals/PressKit'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const origins = [process.env.CMS_PUBLIC_URL ?? 'http://localhost:3000', process.env.SITE_URL ?? 'http://localhost:3001']

export default buildConfig({
  graphQL: { disable: true }, // the site uses the REST API only; no schema browser for strangers
  maxDepth: 3, // deep populate requests are a cheap way to slow a server down
  cors: origins,
  csrf: origins,
  upload: { limits: { fileSize: 25_000_000 } },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · South Asia Collective', icons: [{ url: '/favicon.png' }] },
    components: {
      graphics: { Logo: '/admin/Logo#Logo', Icon: '/admin/Logo#Icon' },
      beforeDashboard: ['/admin/Welcome#Welcome'],
      beforeLogin: ['/admin/LoginHero#LoginHero'],
      actions: ['/admin/HeaderActions#HeaderActions'],
    },
  },
  // SMTP_* set -> real email (confirmation links). Not set -> emails are printed in this server's log.
  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM || 'contact@southasiacollective.ie',
          defaultFromName: 'South Asia Collective',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          },
        }),
      }
    : {}),
  // every collection gets a visible Delete button on its edit page
  collections: [
    Users,
    Posts,
    Tags,
    Kits,
    Events,
    Timeline,
    Coverage,
    Team,
    Supporters,
    Badges,
    Media,
    Comments,
    Reactions,
    Subscribers,
  ].map((c) => ({
    ...c,
    hooks: { ...c.hooks, afterChange: [...(c.hooks?.afterChange ?? []), autoTranslateDoc] },
    admin: {
      ...c.admin,
      components: {
        ...c.admin?.components,
        edit: { ...c.admin?.components?.edit, beforeDocumentControls: ['/admin/DeleteButton#DeleteButton'] },
      },
    },
  })),
  globals: [SiteSettings, AboutPage, PressKit].map((g) => ({
    ...g,
    hooks: { ...g.hooks, afterChange: [...(g.hooks?.afterChange ?? []), autoTranslateGlobal] },
  })),
  endpoints,
  plugins: [
    // without CLOUDINARY_* env vars the plugin is off and uploads stay on local disk
    cloudStoragePlugin({
      enabled: cloudinaryEnabled,
      collections: {
        media: {
          adapter: cloudinaryAdapter,
          prefix: 'sac',
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
          generateFileURL: cloudinaryURL,
        },
      },
    }),
    // two-factor sign-in with any authenticator app (Microsoft Authenticator, Google Authenticator, Authy...). Must stay last.
    // Escape hatch if someone loses their phone: set TOTP_DISABLED=1, sign in, then remove their authenticator on the user page.
    payloadTotp({
      collection: 'users',
      forceSetup: true,
      forceWhiteBackgroundOnQrCode: true,
      disabled: process.env.TOTP_DISABLED === '1',
      totp: { issuer: 'South Asia Collective' },
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  onInit: async (payload) => {
    payload.logger.info(translateStatus())
  },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
  localization: {
    locales: [...LOCALES],
    defaultLocale: 'en',
    fallback: true,
  },
})
