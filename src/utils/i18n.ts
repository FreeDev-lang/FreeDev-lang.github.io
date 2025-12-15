import { useLanguageStore } from '../store/languageStore'
import en from '../locales/en'
import fr from '../locales/fr'
import ar from '../locales/ar'

const translations: Record<string, any> = {
  en,
  fr,
  ar,
}

export const useTranslation = () => {
  const { language } = useLanguageStore()
  const t = translations[language] || translations.en

  const translate = (key: string): string => {
    const keys = key.split('.')
    let value: any = t
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key}`)
        return key
      }
    }
    return value || key
  }

  return { t: translate, language }
}

