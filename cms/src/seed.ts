// npx payload run src/seed.ts
// Safe to re-run: every block checks first and only fills what is empty. Never overwrites edits.
import path from 'path'

import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const count = async (collection: 'timeline' | 'badges' | 'coverage' | 'posts' | 'media') =>
  (await payload.count({ collection })).totalDocs

/* ---------- site settings ---------- */
const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    whatsapp: settings.whatsapp || 'https://chat.whatsapp.com/JcihPxUk1NwHf5fvkB1aqI',
    instagram: settings.instagram || 'https://www.instagram.com/southasiacollective.ie/',
    contactEmail: settings.contactEmail || 'contact@southasiacollective.ie',
    donate: {
      open: settings.donate?.open ?? false,
      url: settings.donate?.url || 'https://southasiacollective-ie.sumupstore.com/',
    },
  },
})

/* ---------- gallery photos (from the original static site) ---------- */
let photos: string[] = []
const upload = async (file: string, alt: string) =>
  (
    await payload.create({
      collection: 'media',
      data: { alt },
      filePath: path.resolve(process.cwd(), '../web/public', file),
    })
  ).id
if (!settings.gallery?.length) {
  const alts = [
    'Protest in Dublin',
    'Group at protest',
    'Group of members at a protest in Dublin',
    'Protester holding a DEMOCRACY sign',
  ]
  const ids: { image: string; alt: string }[] = []
  for (const [i, a] of alts.entries()) ids.push({ image: await upload(`photo${i + 1}.jpg`, a), alt: a })
  await payload.updateGlobal({ slug: 'site-settings', data: { gallery: ids as never } })
  photos = ids.map((x) => x.image)
}

/* ---------- timeline + badges ---------- */
if (!(await count('timeline'))) {
  const rows = [
    [
      '26 Jul',
      'A vigil for the students we lost',
      "We gathered in Dublin to remember students who died because of systemic corruption in India's education system. Our video from the vigil was reposted by CJP socials, so it reached well beyond Ireland.",
    ],
    [
      '10 Oct',
      'Standing with Jantar Mantar from Dublin',
      'When the call went out for protests at Jantar Mantar, we answered with a solidarity protest in Dublin that Saturday. We also released a solidarity video and a Statement of Solidarity. Share them on your socials and show people back home they are not alone.',
    ],
    [
      '17 Oct',
      'Jantar Mantar is Everywhere',
      'More than 70 people came to the Spire, part of a global day of solidarity under the banner "Jantar Mantar is Everywhere." Turnout more than tripled in a week. We read a collective statement and held poetry, songs and speeches, and unfurled the Indian tricolour for the detained protesters. Our demands: the resignation of Chief Election Commissioner Gyanesh Kumar, a reversal of SIR, restoration of deleted names to the electoral rolls, and an end to the delays in Umar Khalid\'s case.',
    ],
    [
      '23 Oct',
      'Embassy Chalo, outside the Indian Embassy',
      'Our third protest in three weeks took our voices to the embassy door in Ballsbridge, in step with protests in Brussels, Barcelona, Toronto and Vancouver. We read a collective statement, unfurled the Tiranga for those in detention and opened the floor to poetry, songs, speeches and stand-up.',
    ],
  ]
  for (const [dateLabel, title, body] of rows)
    await payload.create({ collection: 'timeline', data: { dateLabel, title, body } })
}
// databases seeded before the Oct 23 protest happened still need that card
if (!(await payload.count({ collection: 'timeline', where: { dateLabel: { equals: '23 Oct' } } })).totalDocs)
  await payload.create({
    collection: 'timeline',
    data: {
      dateLabel: '23 Oct',
      title: 'Embassy Chalo, outside the Indian Embassy',
      body: 'Our third protest in three weeks took our voices to the embassy door in Ballsbridge, in step with protests in Brussels, Barcelona, Toronto and Vancouver. We read a collective statement, unfurled the Tiranga for those in detention and opened the floor to poetry, songs, speeches and stand-up.',
    },
  })
if (!(await count('badges')))
  for (const [label, color] of [
    ['Founder', '#f55600'],
    ['Organiser', '#006b2e'],
    ['Contributor', '#3a3729'],
    ['Ally', '#7a3e9d'],
  ])
    await payload.create({ collection: 'badges', data: { label, color } })

/* ---------- news coverage ---------- */
if (!(await count('coverage'))) {
  const rows = [
    [
      'Dublin Inquirer',
      'A youth-led uprising in India stirs hopes of greater solidarity among Indian Dubliners',
      'https://www.dublininquirer.com/a-youth-led-uprising-in-india-stirs-hopes-of-greater-solidarity-among-indian-dubliners/',
    ],
    [
      'Maktoob Media',
      'Indian diaspora in Ireland stages solidarity protest against SIR, demands CEC’s resignation',
      'https://maktoobmedia.com/post?id=116736&slug=indian-diaspora-in-ireland-stages-solidarity-protest-against-sir-demands-cecs-resignation',
    ],
    [
      'The News Minute',
      '‘Jantar Mantar is everywhere’: Indian diaspora holds global solidarity protests',
      'https://www.thenewsminute.com/news/jantar-mantar-is-everywhere-indian-diaspora-holds-global-solidarity-protests',
    ],
    [
      'Hindustan Times',
      '‘Jantar Mantar is Everywhere’: Indian diaspora across the world stage anti-CEC protests after massive Delhi demonstrations',
      'https://www.hindustantimes.com/india-news/jantar-mantar-is-everywhere-indian-diaspora-across-the-world-stage-anti-cec-protests-after-massive-delhi-demonstrations-101792302491917.html',
    ],
    [
      'Millat Times',
      'Indian diaspora across Europe, US and Australia protests against CEC Gyanesh Kumar',
      'https://millattimes.com/indian-diaspora-across-europe-us-and-australia-protests-against-cec-gyanesh-kumar/',
    ],
    [
      'NewsBytes',
      'Indian students rally in London, Dublin, Toronto against Gyanesh Kumar',
      'https://www.newsbytesapp.com/news/india/indian-students-rally-in-london-dublin-toronto-against-gyanesh-kumar/tldr',
    ],
    [
      'The Wire',
      'South Asian groups call for protests in 20 countries against crackdown on anti-SIR demonstrators',
      'https://thewire.in/world/south-asian-groups-call-for-protests-in-20-countries-against-crackdown-on-anti-sir-demonstrators',
    ],
    [
      'The Quint',
      '‘Jantar Mantar is Everywhere’: Global protests in solidarity with India’s anti-SIR movement',
      'https://www.thequint.com/news/politics/jantar-mantar-protests-outside-india-anti-sir-gyanesh-kumar',
    ],
  ]
  for (const [outlet, title, url] of rows)
    await payload.create({ collection: 'coverage', data: { outlet, title, url } })
}

/* ---------- about page ---------- */
const about = await payload.findGlobal({ slug: 'about-page', depth: 0 })
const intro =
  'South Asia Collective Ireland is an independent, grassroots coalition of progressive South Asian diaspora members and allies. Originally formed in July 2026 in solidarity with the nationwide education protests in India, the Collective has since grown into an enduring platform for cross-border activism. United against authoritarianism, caste oppression, and human rights violations, we mobilize to defend civil liberties, protect democratic norms, and keep South Asian state institutions accountable to their citizens. Through direct public action, community education, and civic engagement, the Collective creates an inclusive, intersectional space in Ireland to amplify marginalized voices, demand justice for political prisoners, and safeguard constitutional freedoms across South Asia.'
if (!about.intro)
  await payload.updateGlobal({
    slug: 'about-page',
    data: {
      intro,
      objectives: [
        {
          text: 'Educate diaspora members and the wider international community about human rights violations and the threat to democracy in India.',
        },
        {
          text: 'Agitate to build international pressure on the Indian government and institutions to meet the demands of protesters.',
        },
        {
          text: 'Organise cross-border solidarity to build a community of progressive citizens and allies that can keep South Asian governments accountable on the current and aligned causes.',
        },
      ],
      demandsIntro: 'What we are asking for',
      demands: [
        {
          title: 'Mass voter disenfranchisement',
          text: 'The arbitrary Special Intensive Revision (SIR) exercise has resulted in the deletion of more than 130 million citizens from the electoral rolls, disproportionately erasing vulnerable communities, minorities, and critical voices from the democratic process.',
        },
        {
          title: 'Militarized crackdown on peaceful dissent',
          text: 'In response to nationwide student and youth-led demonstrations, authorities have imposed sweeping transit shutdowns, cancelled passenger trains, executed preemptive detentions, and deployed tens of thousands of armed central security forces (including the RAF and CRPF) to blockade New Delhi and dismantle lawful public assembly.',
        },
        {
          title: 'Criminalization of the right to protest',
          text: 'Indian youth leaders, activists, and journalists face targeted harassment, dawn raids, draconian anti-terror charges (such as the UAPA), and arrests simply for exercising their constitutional right to dissent or unfurling the national flag.',
        },
      ],
    },
  })

/* ---------- press kit ---------- */
const kit = await payload.findGlobal({ slug: 'press-kit', depth: 0 })
if (!kit.boilerplate)
  await payload.updateGlobal({
    slug: 'press-kit',
    data: {
      boilerplate: intro,
      facts: [
        { label: 'Based in', value: 'Dublin, Ireland' },
        { label: 'Formed', value: 'July 2026' },
        { label: 'Instagram', value: '@SouthAsiaCollective.ie' },
        { label: 'Web', value: 'www.SouthAsiaCollective.ie' },
      ],
      contacts: [
        { name: 'Media enquiries', role: 'South Asia Collective Ireland', email: 'contact@southasiacollective.ie' },
      ],
    },
  })

/* ---------- draft post: the Oct 23 protest (left as a DRAFT for review) ---------- */
type N = Record<string, unknown>
const text = (t: string): N => ({ type: 'text', text: t, format: 0, version: 1, detail: 0, mode: 'normal', style: '' })
const para = (t: string): N => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [text(t)],
})
const h = (t: string): N => ({
  type: 'heading',
  tag: 'h2',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [text(t)],
})
const list = (items: string[]): N => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: items.map((t, i) => ({
    type: 'listitem',
    value: i + 1,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [text(t)],
  })),
})
const slug = 'embassy-chalo-oct-23-dublin'
if (!(await payload.count({ collection: 'posts', where: { slug: { equals: slug } } })).totalDocs) {
  const cover = photos[2] ?? (await payload.find({ collection: 'media', limit: 1, depth: 0 })).docs[0]?.id
  await payload.create({
    collection: 'posts',
    data: {
      title: 'Embassy Chalo: our Oct 23 protest outside the Indian Embassy in Dublin',
      slug,
      type: 'blog',
      status: 'draft', // review, add photos, then publish
      excerpt:
        'For the third week in a row, the Indian diaspora in Ireland protested, this time at the doorstep of the Indian Embassy, alongside Brussels, Barcelona, Toronto and Vancouver.',
      cover: cover as never,
      body: {
        root: {
          type: 'root',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [
            para(
              'On Friday, Oct 23, 2026, the Indian diaspora in Ireland protested for the third week in a row, this time outside the Indian Embassy in Dublin, in conjunction with protests in Brussels, Barcelona, Toronto and Vancouver as part of an “Embassy Chalo” (Let’s go to the embassy) campaign. While it is harder to get people to join us on a workday, we felt it was important to take our agitation to the doorstep of the state institution, so that the silence of the state representative is heard loud and clear against our slogans and statements of solidarity.',
            ),
            para(
              'Over the course of the hour, speakers took the mic to read their collective statement, unite with slogans of resistance, and unfurl the Tiranga in solidarity with Indian protesters who were or are under detention. They opened the floor to poetry, songs, speeches, stand-up comedy, and calls of “Aazadi”, from vote theft to dictatorship. There was repeated resonance that living in an open democracy affords them both the safety and the moral responsibility to dissent without fear of institutional retaliation.',
            ),
            h('How the day went'),
            list([
              'We set up our posters and artwork outside the embassy, visible but not disruptive.',
              'Organiser Shreya read the welcome statement, setting the context of the “Embassy Chalo” campaign and the solidarity with protests in Barcelona, Brussels, Toronto and Vancouver.',
              'Co-organiser Suriya gave safety instructions, so everyone knew this is an inclusive space where we record and stand up for each other.',
              'Protester Josh read the statement written collectively on our WhatsApp group.',
              'Slogans were chanted and a makeshift drum made from a celebration box was played.',
              'We unfurled our tricolour and spoke about the detention of Neha Bora, Abhijit Dipke, Saurav Das, Ashutosh Ranka and thousands of youth across the country.',
              'Guest speaker Amit Wasnik, founder of Ambedkarite Meitheal, spoke about institutional casteism and the ongoing hunger strike of the grieving parents of Sahil Wakode.',
              'The floor was opened to all for art, poetry, music and a stand-up comedy set. Organiser Shreya closed with a poem in support of Umar Khalid and political prisoners in India.',
            ]),
            h('Slogans on the day'),
            list([
              '“Vote chor, gaddi chhor”',
              '“Har haath mein Tiranga, har embassy Jantar Mantar”',
              '“Jantar Mantar everywhere”',
              '“Save the Constitution, save democracy”',
              '“Aazadi”: from vote chori, Delhi Police, barricades and Modi-Shah, to Aazadi',
            ]),
            para(
              'We got mixed reactions from Indian citizens going in and out of the embassy. Some stopped to support us and others kept their distance. Several passers-by admired our posters, nodded in solidarity, and cars honked in support.',
            ),
            h('How we got here'),
            para(
              'The group first responded to the nationwide call for protests at Jantar Mantar on Oct 10 with a solidarity gathering at the GPO, where about 20 people showed up. Over the following week our reach on WhatsApp and Instagram grew quickly, and we needed a much more intentional structure to organise the community and build cross-border solidarity. South Asia Collective Ireland was born as a community of progressive diaspora members and allies in Ireland, standing against fascism, casteism and human rights violations.',
            ),
            para(
              'On Oct 17 we joined the Indian diaspora from Australia to Canada and the US for a Global Day of Solidarity and Action. In Europe we worked with cities in the UK, the Netherlands, Sweden, Finland, Germany, Spain and Czechia under the banner “Jantar Mantar is Everywhere”.',
            ),
          ],
        },
      } as never,
    },
  })
}

console.log('seeded')
process.exit(0)
