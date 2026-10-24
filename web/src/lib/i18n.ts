import en, { type Strings } from './strings/en'
import ga from './strings/ga'
import hi from './strings/hi'
import bn from './strings/bn'
import ta from './strings/ta'
import te from './strings/te'
import ml from './strings/ml'
import kn from './strings/kn'
import mr from './strings/mr'
import gu from './strings/gu'
import pa from './strings/pa'
import ur from './strings/ur'
import ne from './strings/ne'
import si from './strings/si'

// Keep the codes in sync with cms/src/locales.ts
export const LOCALES = [
  { code: 'en', label: 'English', intl: 'en-IE', og: 'en_IE' },
  { code: 'ga', label: 'Gaeilge', intl: 'ga-IE', og: 'ga_IE' },
  { code: 'hi', label: 'हिन्दी', intl: 'hi-IN', og: 'hi_IN' },
  { code: 'bn', label: 'বাংলা', intl: 'bn-IN', og: 'bn_IN' },
  { code: 'ta', label: 'தமிழ்', intl: 'ta-IN', og: 'ta_IN' },
  { code: 'te', label: 'తెలుగు', intl: 'te-IN', og: 'te_IN' },
  { code: 'ml', label: 'മലയാളം', intl: 'ml-IN', og: 'ml_IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', intl: 'kn-IN', og: 'kn_IN' },
  { code: 'mr', label: 'मराठी', intl: 'mr-IN', og: 'mr_IN' },
  { code: 'gu', label: 'ગુજરાતી', intl: 'gu-IN', og: 'gu_IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', intl: 'pa-IN', og: 'pa_IN' },
  { code: 'ur', label: 'اردو', intl: 'ur-PK', og: 'ur_PK', rtl: true },
  { code: 'ne', label: 'नेपाली', intl: 'ne-NP', og: 'ne_NP' },
  { code: 'si', label: 'සිංහල', intl: 'si-LK', og: 'si_LK' },
] as const

export type Locale = (typeof LOCALES)[number]['code']
export const locales = LOCALES.map((l) => l.code) as Locale[]
export const isLocale = (l: string): l is Locale => (locales as string[]).includes(l)
export const localeInfo = (l: Locale) => LOCALES.find((x) => x.code === l)!
export const isRtl = (l: Locale) => Boolean((localeInfo(l) as { rtl?: boolean }).rtl)

// every language falls back to English for keys it has not translated yet
const overrides: Record<Locale, Partial<Strings>> = { en: {}, ga, hi, bn, ta, te, ml, kn, mr, gu, pa, ur, ne, si }
export const tr = (l: Locale): Strings => ({ ...en, ...overrides[l] })
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

// URL section -> post type stored in the CMS
export const SECTIONS = { blog: 'blog', news: 'news', statements: 'statement' } as const
export type Section = keyof typeof SECTIONS
export const sectionOfType = (type: string) =>
  (Object.keys(SECTIONS) as Section[]).find((s) => SECTIONS[s] === type) ?? 'blog'
