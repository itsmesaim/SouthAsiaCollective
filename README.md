# South Asia Collective

Website for South Asia Collective Ireland (Dublin): protests and events, blog write-ups, news, statements,
a press kit for every protest, a photo gallery, news coverage, reactions and comments, a newsletter.
Everything on the public site is edited from an admin panel, no code needed.

| Folder | What it is | Port |
| --- | --- | --- |
| `cms/` | Payload CMS 3 on Next.js: MongoDB, REST API, admin panel at `/admin` | 3000 |
| `web/` | Public site, Next.js 16 (App Router, server rendered, 14 languages). Reads the CMS over HTTP | 3001 |

The two apps are separate. The site never touches the database; it asks the CMS API and refreshes its pages every 60 seconds.

## Requirements

- Node 22.23.4 or newer
- MongoDB running locally (`sudo systemctl start mongod`) or a hosted one

## First run

```bash
# 1. CMS
cd cms
cp .env.example .env        # fill DATABASE_URL, PAYLOAD_SECRET, INTERNAL_KEY (see below)
npm install
npm run dev                 # http://localhost:3000, redirects to /admin
npx payload run src/seed.ts # once: starter content (safe to re-run, only fills empty things)

# 2. Site (second terminal)
cd web
cp .env.example .env        # INTERNAL_KEY must be identical to the CMS one
npm install
npm run dev                 # http://localhost:3001
```

Open `http://localhost:3000/admin` and create the first account. The first account becomes **admin**.
Everyone is then asked to set up an authenticator app (Microsoft Authenticator, Google Authenticator, Authy) on their next sign in.

## Environment variables

`cms/.env`

| Name | Meaning |
| --- | --- |
| `DATABASE_URL` | e.g. `mongodb://127.0.0.1/southasiacollective` |
| `PAYLOAD_SECRET` | long random string, keep it secret and never change it casually |
| `INTERNAL_KEY` | shared secret between site and CMS for the form endpoints (subscribe, comment, react). Same value in both apps |
| `SITE_URL` | public site URL, used for links in emails, CORS and the "View the main site" button |
| `CMS_PUBLIC_URL` | public CMS URL (CORS and CSRF allow list) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | optional. Empty = images stay on local disk in `cms/media` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | optional. Empty = confirmation emails are printed in the CMS log |
| `TRANSLATE_API_KEY`, `TRANSLATE_API_URL`, `TRANSLATE_MODEL` | optional. Any OpenAI-compatible API (DeepSeek default; Mistral: `https://api.mistral.ai/v1`, `mistral-large-latest`). `ANTHROPIC_API_KEY` also works. Turns on automatic translation of CMS content (see below). Empty = off |
| `TOTP_DISABLED=1` | emergency switch that turns off two-factor sign in (see "Locked out") |

`web/.env`: `CMS_URL` (server to server, e.g. `http://127.0.0.1:3000`), `CMS_PUBLIC_URL` (browser, for image URLs), `SITE_URL`, `INTERNAL_KEY`.

## What an editor can do (admin panel)

| Where | What |
| --- | --- |
| Write > Posts | **Blog** (full write-up of what we did and why, photos, embeds, news articles), **News** (short update), **Statement**. Tags, cover, summary, "Important" pin, draft/published |
| Write > Press kits | one per protest, written after the day: blurb, statements, photos, linked news coverage |
| Write > Events | upcoming protests: date, time, place, poster image for sharing, "Important" highlight |
| Write > Timeline | the "What we have done" cards (optional photo each) |
| Write > News coverage | articles by outlets that covered us: link, screenshot, archive link |
| Write > Tags | topics for posts |
| Site > Site settings | home page words, gallery photos and layout, donations on/off and SumUp link, WhatsApp/Instagram, default SEO |
| Site > About page, Press kit | About text, objectives, demands; logos, facts and contacts that never change |
| Site > Team, Badges | people on the About page |
| Community | comments waiting for review, newsletter subscribers |

Roles: **admin** (everything), **sub-admin** (content and writers), **writer** (own posts only; the real author is always recorded for the team while readers see a public name chosen in the profile).
Every edit page has a red Delete button. Drafts are only visible to the team.

## Languages and automatic translation

Write everything in **English** in the admin. When you save, the CMS translates the text into the other 13 languages in the
background (needs `ANTHROPIC_API_KEY`). It only fills languages that are still empty or still the same as English, so a translation a person
typed is never overwritten. To redo one, clear that language's field (switch language at the top of the edit page) and save the English again.
Editing English later does not change existing translations; clear them if you want them redone.

- Translate everything that already exists: `cd cms && npx payload run src/translate-all.ts` (safe to re-run).
- Machine translation of political text should be read by a native speaker before you rely on it. Editors can fix any language by hand.
- Fixed site text (menus, buttons) lives in `web/src/lib/strings/<lang>.ts`; a missing key falls back to English. New keys are added to `en.ts` first.
- Code: `cms/src/translate.ts`, hooks are added to every collection and global in `cms/src/payload.config.ts`.

## Content rules built in

- Publishing a post needs a summary, a cover image and some text.
- Comments: email confirmation, then moderator approval; max 1000 characters; 3 per person per day, 5 per person per post, 100 waiting per post.
- Reactions: one per person per post (anonymous cookie).
- Newsletter: explicit consent, double opt-in, unsubscribe link, consent text stored.
- Embeds (X, Instagram, TikTok, YouTube, Vimeo) only load after the visitor accepts cookies.
- No analytics, no ad cookies, fonts are self-hosted.

## Security and performance already in place

- Two-factor sign in for every account, lock for 10 minutes after 5 wrong passwords or codes, only admins unlock.
- Admin and API are `noindex` and disallowed in `robots.txt`; unknown CMS paths redirect to `/admin`.
- GraphQL is off; depth is capped; CORS and CSRF are limited to the two site URLs; uploads are images only (no SVG), 8 MB max.
- Security headers on both apps (nosniff, frame, referrer, permissions, HSTS over https). `X-Powered-By` removed.
- Per-IP rate limit on the CMS API (`cms/src/proxy.ts`), and per-visitor limits on the site forms (`web/src/app/actions.ts`).
  They are in memory, fine for one server. The CMS limiter only counts requests that arrive through nginx (they carry `x-forwarded-for`).
- Public pages are cached (`revalidate = 60`).

## Deploying

1. Build both: `npm run build` in `cms/` and in `web/`; run with `npm start` (pm2 or systemd).
2. nginx in front: `southasiacollective.ie` -> port 3001, `admin.southasiacollective.ie` -> port 3000. Pass `X-Forwarded-For` and `X-Forwarded-Proto`. HTTPS with certbot.
3. Production `.env`: real `SITE_URL` / `CMS_PUBLIC_URL`, strong `PAYLOAD_SECRET` and `INTERNAL_KEY`, Cloudinary and SMTP set. MongoDB must not be reachable from the internet; back it up (`mongodump`).
4. Run the seed once on the empty database, create the admin, set up two-factor.
5. Turn donations on in Site settings once the SumUp store is verified.

## Common tasks

- **Add a language**: add a line in `cms/src/locales.ts` and `web/src/lib/i18n.ts`, and a file in `web/src/lib/strings/` (copy `en.ts`; missing keys fall back to English).
- **New protest**: add an Event (before) and a Timeline card + Press kit + Blog post (after).
- **Change colours or fonts**: `web/src/app/globals.css` (variables at the top); admin look: `cms/src/app/(payload)/custom.css`.
- **After changing a CMS field**: `cd cms && npx payload generate:types`; if you add an admin component: `npx payload generate:importmap`.
- **Format code**: from the project root `npx prettier@3 --write "cms/src/**/*.{ts,tsx}" "web/src/**/*.{ts,tsx}"` (CSS is excluded on purpose, rules are kept one per line).
- **Type check**: `npx tsc --noEmit` in each app.

## Things that will surprise you

- A new collection that visitors must read needs `custom: publicRead` (see `cms/src/access.ts`), otherwise the two-factor plugin makes the site get 403 errors.
- Page edits show on the site after up to 60 seconds.
- Share images (`og.jpg`, `story.jpg`) are always English and Latin script; the renderer cannot shape Indic scripts.
- Two-factor and rate limits are only meaningful behind HTTPS and nginx; in development the CMS limiter is off.
- Do not run `db.dropDatabase()` on a database somebody has been working in. The seed only fills empty things, use it instead.
- Page, post and kit text for languages other than English is optional; the site falls back to English.

## Locked out

Someone lost their phone: an admin resets their authenticator (the `payload-totp` plugin docs describe the user-page reset). If no admin can sign in, set
`TOTP_DISABLED=1` in `cms/.env`, restart the CMS, sign in, fix the user, remove the variable, restart again.
