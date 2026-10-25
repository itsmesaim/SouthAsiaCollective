import type { Policy, Strings } from './en'

// DRAFT translation: needs proofreading by a native speaker before launch
const ga: Partial<Strings> = {
  events: 'Imeachtaí',
  blog: 'Blag',
  news: 'Nuacht',
  press: 'Preas',
  statements: 'Ráitis',
  speeches: 'Óráidí',
  about: 'Fúinn',
  pressKit: 'Cluaisín preasa',
  join: 'Bí linn',
  donate: 'Tabhair síntiús',
  menu: 'Roghchlár',
  skip: 'Léim go dtí an t-ábhar',
  language: 'Teanga',
  home: 'Baile',
  rss: 'Fotha RSS',
  privacy: 'Polasaí príobháideachais',
  cookieSettings: 'Socruithe fianán',

  eyebrow: 'Lonnaithe i mBaile Átha Cliath, Éire',
  title1: 'Ag troid ar son an daonlathais.',
  title2: 'Inár seasamh le chéile.',
  heroText:
    'Is Deisceart na hÁise agus comhghuaillithe muid atá ag cur fúinn in Éirinn. Seasaimid ar son cearta daonlathacha, dínit an duine agus ceartais sa bhaile, agus déanaimid é ar shráideanna Bhaile Átha Cliath.',
  seeEvents: 'Féach ar na himeachtaí atá le teacht',
  joinMovement: 'Bí sa ghluaiseacht',
  ticker: ['Daonlathas', 'Dlúthpháirtíocht', 'Ceartas', 'Dínit', 'Comhionannas'],

  upcoming: 'Imeachtaí atá le teacht',
  noEvents: 'Níl aon imeacht beartaithe faoi láthair. Bí inár WhatsApp chun a bheith ar an eolas ar dtús.',
  directions: 'Treoracha',
  addToCalendar: 'Cuir leis an bhféilire',
  important: 'Tábhachtach',
  allEvents: 'Gach imeacht',
  past: 'Tharla an t-imeacht seo cheana.',
  shareTitle: 'Scaip an scéal',
  shareText: 'Is mó daoine, is mó brú. Seol é seo chuig cara, chuig comhrá grúpa, nó cuir ar do scéal é.',
  shareNative: 'Roinn…',
  shareWhatsapp: 'WhatsApp',
  shareFacebook: 'Facebook',
  shareX: 'X',
  shareTelegram: 'Telegram',
  shareEmail: 'Ríomhphost',
  copyLink: 'Cóipeáil an nasc',
  copied: 'Cóipeáilte',
  shareStory: 'Roinn ar scéal Instagram',
  downloadPoster: 'Íoslódáil an póstaer scéil',
  captionLabel: 'Fotheideal',
  copyCaption: 'Cóipeáil an fotheideal',
  eventCaption: '{title}. {date} ag {time}, {place}. Tar linn.',

  latest: 'Is déanaí',
  viewAll: 'Féach ar gach ceann',
  readMore: 'Léigh tuilleadh',
  featured: 'Faoi thrácht',
  by: 'Le',
  readingTime: '{n} nóim léitheoireachta',
  related: 'Lean ort ag léamh',
  shareArticle: 'Roinn é seo',
  empty: 'Níl aon rud foilsithe anseo go fóill.',

  aboutUs: 'Fúinn',
  aboutLead:
    'Grúpa de bhaill dhul chun cinn den diaspóra agus de chomhghuaillithe atá lonnaithe in Éirinn. Táimid go láidir in aghaidh an fhaisisteachais, an chaitheachais agus sáruithe ar chearta daonna, agus tá cúram mór orainn faoi ghluaiseachtaí faoi stiúir an aosa óig agus gluaiseachtaí pobail ar fud na réigiúin a thacú.',
  pills: [
    'In aghaidh an fhaisisteachais',
    'In aghaidh an chaitheachais',
    'Cearta daonna do chách',
    'Gluaiseachtaí faoi stiúir na hóige',
  ],
  objectives: 'An rud atá uainn a bhaint amach',
  demands: 'Ár n-éilimh',
  team: 'Ár ndaoine',
  moreAbout: 'Buail leis an bhfoireann',
  done: 'An méid atá déanta againn',
  doneSub:
    'Eagraímid i mBaile Átha Cliath chun guth a thabhairt do ghluaiseachtaí na hóige sa bhaile. Seo a bhfuil déanta againn go dtí seo.',
  ground: 'Ar an talamh',
  groundSub: 'Amanna ónár agóidí agus ónár ngníomhartha i mBaile Átha Cliath.',
  quote: 'Ní bronntanas é an daonlathas ó lucht cumhachta. Is ceart é a chosnaímid le chéile.',

  inTheNews: 'Sna nuachtáin',
  inTheNewsSub: 'An méid atá scríofa ag an bpreas faoinár n-agóidí.',
  pressKitTitle: 'Cluaisín preasa',
  pressKitIntro:
    'Gach rud atá uait chun tuairisciú cruinn a dhéanamh orainn. Ceisteanna? Scríobh chugainn agus freagróimid go tapa.',
  copyText: 'Cóipeáil an téacs',
  facts: 'Príomhfhíricí',
  contacts: 'Teagmháil na meán',
  assets: 'Lógónna agus grianghraif',
  download: 'Íoslódáil',
  downloadAll: 'Íoslódáil gach rud (.zip)',
  guidelines: 'Ár n-ainm agus ár lógó a úsáid',

  supportTitle: 'Tacaigh lenár gcuid oibre',
  donateText: 'Íocann síntiúis as póstaeir, meirgí, fuaim agus costais eagraithe i mBaile Átha Cliath.',
  donateSoon: 'Osclóidh síntiúis go luath. Lean muid chun a bheith ar an eolas ar dtús.',
  joinTitle: 'Bí sa ghluaiseacht',
  joinText:
    'Seoltar nuashonruithe agóide ar WhatsApp. Táimid ar Instagram freisin, agus is féidir leat ríomhphost a sheoladh chugainn am ar bith.',
  whatsapp: 'Bí inár WhatsApp',
  instagram: 'Lean muid ar Instagram',
  emailUs: 'Seol ríomhphost chugainn',
  subscribeTitle: 'Faigh ár nuashonruithe',
  subscribeText:
    'Ráitis, imeachtaí agus ailt nua trí ríomhphost. Is féidir le hirisí nuachta ár bhfotha RSS a leanúint freisin.',
  emailPlaceholder: 'Do ríomhphost',
  subscribeBtn: 'Liostáil',
  subscribePending: 'Beagnach déanta. Sheolamar ríomhphost chugat: cliceáil an nasc ann chun deimhniú.',
  consentLabel:
    'Tá, seol nuashonruithe chugam ó South Asia Collective trí ríomhphost (fógraí imeachtaí, ráitis agus nuacht).',
  unsubNote: 'Is féidir leat díchlárú am ar bith leis an nasc i ngach ríomhphost.',
  consentNeeded: 'Cuir tic sa bhosca chun liostáil.',
  confirmSubject: 'Deimhnigh do ríomhphost',
  confirmBody:
    'Go raibh maith agat as liostáil le South Asia Collective. Deimhnigh do ríomhphost tríd an nasc seo a oscailt:\n\n{link}\n\nMura tusa a rinne é, déan neamhaird den ríomhphost seo agus ní tharlóidh tada.',
  errorGeneric: 'Chuaigh rud éigin ar strae. Bain triail eile as i gceann nóiméid.',
  tooMany: 'An iomarca iarrachtaí. Fan nóiméad agus bain triail eile as.',

  verifyTitle: 'Deimhnigh do ríomhphost',
  verifyText: 'Brúigh an cnaipe chun críochnú.',
  verifyBtn: 'Deimhnigh',
  verifyOk: 'Deimhnithe. Go raibh maith agat.',
  verifyBad: 'Níl an nasc seo bailí nó úsáideadh cheana é.',
  unsubTitle: 'Díliostáil',
  unsubText: 'Brúigh an cnaipe chun gan ríomhphoist uainn a fháil a thuilleadh.',
  unsubBtn: 'Díliostáil mé',
  unsubDone: 'Tá tú díliostáilte.',

  comments: 'Tuairimí',
  noComments: 'Gan tuairim ar bith go fóill. Cuir tús leis an gcomhrá.',
  yourName: "D'ainm",
  yourEmail: 'Ríomhphost (seolaimid nasc amháin chun é a dheimhniú, ní thaispeántar riamh é)',
  yourComment: 'Scríobh tuairim',
  send: 'Post an tuairim',
  commentSent:
    'Seiceáil do bhosca isteach agus cliceáil an nasc chun do ríomhphost a dheimhniú. Ansin athbhreithníonn modhnóir do thuairim sula dtaispeántar í.',
  commentNotice: "Taispeántar d'ainm agus do thuairim go poiblí nuair a cheadaítear iad. ",
  commentSubject: 'Deimhnigh do thuairim',
  commentBody:
    "D'fhág duine éigin (tusa, tá súil againn) tuairim ar South Asia Collective. Deimhnigh do ríomhphost tríd an nasc seo a oscailt:\n\n{link}\n\nMura tusa a rinne é, déan neamhaird den ríomhphost seo agus scriosfar an tuairim.",
  reactions: ['Is maith liom', 'Grá', 'Dlúthpháirtíocht', 'Brónach', 'Feargach'],

  cookieTitle: 'Fianáin',
  cookieText:
    "Ní úsáidimid ach an méid a theastaíonn chun an suíomh a oibriú: fianán beag a chuimhníonn ar do fhreagairt ar phost, agus do rogha anseo. Ní reáchtálaimid anailísíocht ná fógraíocht. Má ghlacann tú leo, luchtaímid ionchuir tríú páirtí freisin, mar Instagram, a d'fhéadfadh a bhfianáin féin a shocrú.",
  decline: 'Diúltaigh',
  accept: 'Glac leo',
  viewOnInstagram: 'Féach ar an bpost seo ar Instagram',
  viewOnX: 'Féach ar an bpost seo ar X',
  viewVideo: 'Féach ar an bhfíseán seo',
  viewOnTikTok: 'Féach ar an bhfíseán seo ar TikTok',
  embedHint:
    'Luchtaítear an t-ionchur seo ó chuideachta eile. Glac le fianáin sa bhrat fógra chun é a thaispeáint anseo, nó oscail go díreach é.',
  shareStatement: 'Roinn an ráiteas seo',
  notFound: 'Níor aimsíodh an leathanach',
  siteDesc:
    'Is grúpa é South Asia Collective atá lonnaithe i mBaile Átha Cliath, de bhaill dhul chun cinn den diaspóra agus de chomhghuaillithe atá in aghaidh an fhaisisteachais, an chaitheachais agus sáruithe ar chearta daonna.',

  policy: [
    [
      'Cé muid',
      [
        'Is grúpa pobail é South Asia Collective atá lonnaithe i mBaile Átha Cliath, Éire. Is muidne rialaitheoir na sonraí pearsanta a bhfuil cur síos orthu anseo. Déan teagmháil linn ag {email}.',
      ],
    ],
    [
      'An méid a bhailímid agus cén fáth',
      [
        'Nuachtlitir: do sheoladh ríomhphoist, do theanga agus an t-am ar aontaigh tú. Úsáidimid é chun ár nuashonruithe a sheoladh chugat. Seolaimid ríomhphost amháin chun an seoladh a dheimhniú sula seolaimid aon rud eile. Bunús dlí: do thoiliú (GDPR Airteagal 6(1)(a)).',
        'Tuairimí: an t-ainm agus téacs na tuairime a chuireann tú isteach, agus do sheoladh ríomhphoist, a úsáidimid uair amháin chun a dheimhniú gur leatsa é agus nach dtaispeánaimid riamh. Ní thaispeántar tuairimí go poiblí ach amháin tar éis do mhodhnóir iad a cheadú. Bunús dlí: do thoiliú.',
        "Frithghníomhartha: aitheantóir randamach a stóráiltear i bhfianán ionas gur féidir le duine amháin freagairt uair amháin ar gach post. Níl sé nasctha le d'ainm, le do ríomhphost ná le do sheoladh IP. Bunús dlí: leas dlisteanach sa ghné a reáchtáil.",
        'Slándáil: úsáidtear do sheoladh IP go hachomair i gcuimhne an fhreastalaí chun turscar a theorannú agus ní stóráiltear inár mbunachar sonraí é.',
      ],
    ],
    [
      'Fianáin agus teicneolaíochtaí comhchosúla',
      [
        'Ní úsáidimid aon anailísíocht ná fianáin fógraíochta.',
        'Riachtanach: fianán darb ainm "vid" (suas le bliain amháin) a chuimhníonn ar do fhreagairtí, agus iontráil "ck" i stóras do bhrabhsálaí a chuimhníonn ar do rogha fianán.',
        "Roghnach, ach amháin má bhrúnn tú Glac leo: ionchuir Instagram. D'fhéadfadh Instagram (Meta) a bhfianáin féin a shocrú agus do sheoladh IP a fháil. Má dhiúltaíonn tú, taispeánaimid nasc simplí ina áit.",
        'Is féidir leat do rogha a athrú nó a tharraingt siar am ar bith le "Socruithe fianán" i mbun an leathanaigh.',
      ],
    ],
    [
      'Cé a fhaigheann do shonraí',
      [
        'Coinníonn ár bhfreastalaí óstála an bunachar sonraí.',
        'Seachadann Cloudinary íomhánna ar an suíomh seo, agus mar sin feiceann sé do sheoladh IP nuair a luchtaíonn do bhrabhsálaí iad.',
        'Seoltar ríomhphost trínár soláthraí ríomhphoist, do na naisc dheimhnithe thuas amháin.',
        'Déantar síntiúis ar stór SumUp ar leith a bhfuil a pholasaí príobháideachais féin aige. Ní dhíolaimid do shonraí.',
      ],
    ],
    [
      'Cá fhad a choinnímid iad',
      [
        'Sonraí na nuachtlitreach go dtí go ndíliostálann tú. Tuairimí go dtí go n-iarrann tú orainn iad a bhaint nó go scriosaimid iad. Is féidir linn tuairimí agus liostálacha nach bhfuil deimhnithe a scriosadh am ar bith. Tá frithghníomhartha gan ainm agus coinnítear iad fad a bhíonn an post ann.',
      ],
    ],
    [
      'Do chearta',
      [
        'Is féidir leat iarraidh orainn rochtain a thabhairt ar do shonraí, iad a cheartú, a scriosadh, a theorannú nó a onnmhairiú, agus agóid a dhéanamh i gcoinne próiseála, agus do thoiliú a tharraingt siar am ar bith. Seol ríomhphost chuig {email}. Is féidir leat díliostáil leis an nasc in aon ríomhphost a sheolaimid.',
        'Tá sé de cheart agat freisin gearán a dhéanamh leis an Data Protection Commission of Ireland (dataprotection.ie).',
      ],
    ],
  ] as Policy,
}
export default ga
