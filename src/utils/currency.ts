import { useLanguageStore } from '../store/languageStore'

export const useCurrency = () => {
  const { currency, formatCurrency } = useLanguageStore()
  return { currency, formatCurrency }
}

// Helper function for formatting currency outside of components
export const formatCurrencyAmount = (amount: number, currencyCode?: string, symbol?: string): string => {
  if (currencyCode && symbol) {
    return `${symbol}${amount.toFixed(2)}`
  }
  // Default fallback
  return `$${amount.toFixed(2)}`
}

