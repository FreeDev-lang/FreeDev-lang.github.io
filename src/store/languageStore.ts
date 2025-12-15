import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'fr' | 'ar'

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
}

const currencyMap: Record<Language, CurrencyConfig> = {
  en: { code: 'USD', symbol: '$', name: 'US Dollar' },
  fr: { code: 'EUR', symbol: '€', name: 'Euro' },
  ar: { code: 'DZA', symbol: 'د.ج', name: 'Algerian Dinar' },
}

const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

interface LanguageStore {
  language: Language
  currency: CurrencyConfig
  setLanguage: (lang: Language) => void
  formatCurrency: (amount: number) => string
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en',
      currency: currencyMap.en,
      setLanguage: (lang: Language) => {
        set({ language: lang, currency: currencyMap[lang] })
      },
      formatCurrency: (amount: number) => {
        const { currency } = get()
        // For now, we'll just format with the symbol
        // In production, you might want to use Intl.NumberFormat for proper formatting
        return `${currency.symbol}${amount.toFixed(2)}`
      },
    }),
    {
      name: 'language-storage',
    }
  )
)

export const getLanguageName = (lang: Language): string => languageNames[lang]

