/**
 * Multi-Language Support for Indian Businesses
 * Supports: English, Hindi, Telugu, Tamil
 */

export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta'

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    direction: 'ltr'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    direction: 'ltr'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr'
  }
]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

/**
 * Get language by code
 */
export function getLanguage(code: string): LanguageOption | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

/**
 * Detect browser language
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('hi')) return 'hi'
  if (browserLang.startsWith('te')) return 'te'
  if (browserLang.startsWith('ta')) return 'ta'
  
  return DEFAULT_LANGUAGE
}

/**
 * Format number according to Indian numbering system
 */
export function formatIndianNumber(num: number, locale: SupportedLanguage = 'en'): string {
  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN'
  }
  
  return new Intl.NumberFormat(localeMap[locale], {
    maximumFractionDigits: 2
  }).format(num)
}

/**
 * Format currency according to language
 */
export function formatCurrency(amount: number, locale: SupportedLanguage = 'en'): string {
  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN'
  }
  
  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

/**
 * Format date according to language
 */
export function formatLocalizedDate(date: Date | string, locale: SupportedLanguage = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN'
  }
  
  return new Intl.DateTimeFormat(localeMap[locale], {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(dateObj)
}

/**
 * Get direction for language
 */
export function getTextDirection(locale: SupportedLanguage): 'ltr' | 'rtl' {
  const lang = getLanguage(locale)
  return lang?.direction || 'ltr'
}
