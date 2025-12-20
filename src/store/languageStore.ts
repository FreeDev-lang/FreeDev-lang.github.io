import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'fr' | 'ar'

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
}

// Platform currency will override language-based currency
let platformCurrency: CurrencyConfig | null = null

export const setPlatformCurrency = (currency: CurrencyConfig) => {
  platformCurrency = currency
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
      currency: platformCurrency || currencyMap.en,
      setLanguage: (lang: Language) => {
        // Use platform currency if set, otherwise use language-based currency
        set({ language: lang, currency: platformCurrency || currencyMap[lang] })
      },
      formatCurrency: (amount: number) => {
        const { currency } = get()
        // Use platform currency if available
        const activeCurrency = platformCurrency || currency
        // For now, we'll just format with the symbol
        // In production, you might want to use Intl.NumberFormat for proper formatting
        return `${activeCurrency.symbol}${amount.toFixed(2)}`
      },
    }),
    {
      name: 'language-storage',
    }
  )
)

export const getLanguageName = (lang: Language): string => languageNames[lang]

