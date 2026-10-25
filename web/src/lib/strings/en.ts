export type Policy = [heading: string, body: string[]][]

// Source of truth for every word on the site. Other languages override keys; anything missing falls back to this file.
const en = {
  // navigation + chrome
  events: 'Events',
  blog: 'Blog',
  news: 'News',
  press: 'Press',
  statements: 'Statements',
  speeches: 'Speeches',
  about: 'About',
  pressKit: 'Press kit',
  join: 'Join us',
  donate: 'Donate',
  menu: 'Menu',
  skip: 'Skip to content',
  language: 'Language',
  home: 'Home',
  rss: 'RSS feed',
  privacy: 'Privacy policy',
  cookieSettings: 'Cookie settings',

  // home hero
  eyebrow: 'Based in Dublin, Ireland',
  title1: 'Fighting for democracy.',
  title2: 'Standing in solidarity.',
  heroText:
    'We are South Asians and allies living in Ireland. We stand up for democratic rights, human dignity and justice back home, and we do it on the streets of Dublin.',
  seeEvents: 'See upcoming events',
  joinMovement: 'Join the movement',
  ticker: ['Democracy', 'Solidarity', 'Justice', 'Dignity', 'Equality'],

  // events
  upcoming: 'Upcoming events',
  noEvents: 'No events planned right now. Join our WhatsApp to hear first.',
  directions: 'Directions',
  addToCalendar: 'Add to calendar',
  important: 'Important',
  allEvents: 'All events',
  past: 'This event has already happened.',
  shareTitle: 'Spread the word',
  shareText: 'More people means more pressure. Send this to a friend, a group chat, or put it on your story.',
  shareNative: 'Share…',
  shareWhatsapp: 'WhatsApp',
  shareFacebook: 'Facebook',
  shareX: 'X',
  shareTelegram: 'Telegram',
  shareEmail: 'Email',
  copyLink: 'Copy link',
  copied: 'Copied',
  shareStory: 'Share to Instagram story',
  downloadPoster: 'Download story poster',
  captionLabel: 'Caption',
  copyCaption: 'Copy caption',
  eventCaption: '{title}. {date} at {time}, {place}. Come along.',

  // posts
  latest: 'Latest',
  viewAll: 'See all',
  readMore: 'Read more',
  featured: 'Featured',
  by: 'By',
  readingTime: '{n} min read',
  related: 'Keep reading',
  shareArticle: 'Share this',
  empty: 'Nothing published here yet.',

  // about
  aboutUs: 'About us',
  aboutLead:
    'A group of progressive diaspora members and allies based in Ireland. We stand firmly against fascism, casteism, and human rights violations, and care deeply about supporting youth-led and grassroots movements across the region.',
  pills: ['Against fascism', 'Against casteism', 'Human rights for all', 'Youth-led movements'],
  objectives: 'What we want to achieve',
  demands: 'Our demands',
  team: 'Our people',
  moreAbout: 'Meet the team',
  done: "What we've done",
  doneSub: "We organise in Dublin to amplify the youth movements back home. Here is what we've done so far.",
  ground: 'On the ground',
  groundSub: 'Moments from our protests and actions in Dublin.',
  quote: 'Democracy is not a gift from those in power. It is a right we defend together.',

  // news coverage + press kit
  inTheNews: 'In the news',
  inTheNewsSub: 'What the press has written about our protests.',
  pressKitTitle: 'Press kit',
  newsDesc: 'Short updates from South Asia Collective: what is happening, where, and what is next.',
  kitsTitle: 'Press kits by protest',
  kitLatest: 'Latest protest',
  kitEarlier: 'Earlier protests',
  kitOpen: 'Open this press kit',
  kitPhotos: 'Photos and videos for the press',
  kitCoverage: 'News that covered this protest',
  kitBack: 'All press kits',
  generalInfo: 'Logos, facts and contacts',
  allTags: 'All topics',
  sourcesTitle: 'In the news about this',
  topics: 'Topics',
  pressKitIntro: 'Everything you need to report on us accurately. Questions? Write to us and we will reply quickly.',
  copyText: 'Copy text',
  facts: 'Key facts',
  contacts: 'Media contact',
  assets: 'Logos and photos',
  download: 'Download',
  downloadAll: 'Download everything (.zip)',
  guidelines: 'Using our name and logo',

  // support + join + subscribe
  supportTitle: 'Support our work',
  donateText:
    'We are volunteers and have no funding. Your donation pays for posters, banners, sound equipment and the costs of organising protests in Dublin.',
  donateSoon: 'Donations open soon. Follow us to hear first.',
  joinTitle: 'Join the movement',
  joinText: "Protest updates go out on WhatsApp. We're on Instagram too, and you can email us anytime.",
  whatsapp: 'Join our WhatsApp',
  instagram: 'Follow on Instagram',
  emailUs: 'Email us',
  subscribeTitle: 'Get our updates',
  subscribeText: 'New statements, events and articles by email. News outlets can also follow our RSS feed.',
  emailPlaceholder: 'Your email',
  subscribeBtn: 'Subscribe',
  subscribePending: 'Almost done. We sent you an email: click the link in it to confirm.',
  consentLabel:
    'Yes, send me updates from South Asia Collective by email (event announcements, statements and news).',
  unsubNote: 'You can unsubscribe at any time with the link in every email.',
  consentNeeded: 'Tick the box to subscribe.',
  confirmSubject: 'Confirm your email',
  confirmBody:
    'Thanks for subscribing to South Asia Collective. Confirm your email by opening this link:\n\n{link}\n\nIf this was not you, ignore this email and nothing will happen.',
  errorGeneric: 'Something went wrong. Try again in a moment.',
  tooMany: 'Too many attempts. Wait a minute and try again.',

  // verify + unsubscribe
  verifyTitle: 'Confirm your email',
  verifyText: 'Press the button to finish.',
  verifyBtn: 'Confirm',
  verifyOk: 'Confirmed. Thank you.',
  verifyBad: 'This link is not valid or was already used.',
  unsubTitle: 'Unsubscribe',
  unsubText: 'Press the button to stop receiving emails from us.',
  unsubBtn: 'Unsubscribe me',
  unsubDone: 'You are unsubscribed.',

  // comments + reactions
  comments: 'Comments',
  noComments: 'No comments yet. Start the conversation.',
  yourName: 'Your name',
  yourEmail: 'Email (we send one link to confirm it, it is never shown)',
  yourComment: 'Write a comment',
  send: 'Post comment',
  commentSent:
    'Check your inbox and click the link to confirm your email. A moderator then reviews your comment before it appears.',
  commentNotice: 'Your name and comment are shown publicly once approved. ',
  commentSubject: 'Confirm your comment',
  commentBody:
    'Someone (hopefully you) left a comment on South Asia Collective. Confirm your email by opening this link:\n\n{link}\n\nIf this was not you, ignore this email and the comment will be deleted.',
  reactions: ['Like', 'Love', 'Solidarity', 'Sad', 'Angry'],

  // cookies + misc
  cookieTitle: 'Cookies',
  cookieText:
    'We only use what the site needs to work: a small cookie that remembers your reaction to a post, and your choice here. We do not run analytics or advertising. If you accept, we also load third-party embeds such as Instagram, which may set their own cookies.',
  decline: 'Decline',
  accept: 'Accept',
  viewOnInstagram: 'View this post on Instagram',
  viewOnX: 'View this post on X',
  viewVideo: 'Watch this video',
  viewOnTikTok: 'View this video on TikTok',
  embedHint:
    'This embed loads from another company. Accept cookies in the banner to show it here, or open it directly.',
  shareStatement: 'Share this statement',
  doneCount: 'events and actions so far',
  historyTitle: 'What we have done',
  historyBtn: 'See everything we have done',
  galleryTitle: 'Photo gallery',
  galleryBtn: 'See all photos',
  newsBtn: 'See all coverage',
  newsPageTitle: 'In the news',
  blogDesc:
    'Blog posts from South Asia Collective: reports, explainers and stories from the movement for democracy in South Asia.',
  statementsDesc: 'Official statements from South Asia Collective on democracy, rights and justice in South Asia.',
  notFound: 'Page not found',
  siteDesc:
    'South Asia Collective is a Dublin-based group of progressive diaspora members and allies standing against fascism, casteism and human rights violations.',

  policy: [
    [
      'Who we are',
      [
        'South Asia Collective is a community group based in Dublin, Ireland. We are the controller of the personal data described here. Contact us at {email}.',
      ],
    ],
    [
      'What we collect and why',
      [
        'Newsletter: your email address, language and the time you agreed. We use it to send you our updates. We email you once to confirm the address before we send anything else. Legal basis: your consent (GDPR Art. 6(1)(a)).',
        'Comments: the name and comment text you submit, and your email address, which we use once to confirm you own it and never show. Comments appear publicly only after a moderator approves them. Legal basis: your consent.',
        'Reactions: a random identifier stored in a cookie so one person can react once per post. It is not linked to your name, email or IP address. Legal basis: legitimate interest in running the feature.',
        "Security: your IP address is used briefly in the server's memory to limit spam and is not stored in our database.",
      ],
    ],
    [
      'Cookies and similar technologies',
      [
        'We use no analytics and no advertising cookies.',
        'Essential: a cookie called "vid" (up to 1 year) that remembers your reactions, and a "ck" entry in your browser storage that remembers your cookie choice.',
        'Optional, only if you press Accept: embedded posts and videos from Instagram, X, TikTok, YouTube and Vimeo. These companies may set their own cookies and receive your IP address. If you decline, we show a plain link instead.',
        'You can change or withdraw your choice at any time with "Cookie settings" in the footer.',
      ],
    ],
    [
      'Who receives your data',
      [
        'Our hosting server holds the database.',
        'Images on this site are delivered by Cloudinary, which therefore sees your IP address when your browser loads them.',
        'Email is sent through our email provider, only for the confirmation links above.',
        'Donations are made on a separate SumUp store with its own privacy policy. We do not sell your data.',
      ],
    ],
    [
      'How long we keep it',
      [
        'Newsletter details until you unsubscribe. Comments until you ask us to remove them or we delete them. Unconfirmed comments and subscriptions can be deleted by us at any time. Reactions are anonymous and kept while the post exists.',
      ],
    ],
    [
      'Your rights',
      [
        'You can ask us to access, correct, delete, restrict or export your data, to object to processing, and to withdraw consent at any time. Email {email}. You can unsubscribe using the link in any email we send.',
        'You also have the right to complain to the Data Protection Commission of Ireland (dataprotection.ie).',
      ],
    ],
  ] as Policy,
}

export type Strings = typeof en
export default en
