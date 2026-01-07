'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { SupportedLanguage } from './languages'
import { DEFAULT_LANGUAGE, detectBrowserLanguage } from './languages'
import { translations, t as translate } from './translations'

interface I18nContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // Initialize from localStorage or browser language on first render
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    
    const saved = localStorage.getItem('billbook-language') as SupportedLanguage
    if (saved && translations[saved]) {
      return saved
    }
    return detectBrowserLanguage()
  })

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    localStorage.setItem('billbook-language', lang)
  }

  const t = (key: string) => translate(language, key)

  const dir = language === 'en' ? 'ltr' : 'ltr' // All Indian languages use LTR

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
