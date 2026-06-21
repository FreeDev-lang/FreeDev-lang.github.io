import type { Language } from '../store/languageStore'

/**
 * Resolve a product's display name for the active language.
 * Falls back to the base `model` (English) when a localized name is missing.
 */
export function resolveProductName(
  product: { model?: string | null; nameFr?: string | null; nameAr?: string | null } | null | undefined,
  lang: Language
): string {
  if (!product) return ''
  if (lang === 'fr' && product.nameFr) return product.nameFr
  if (lang === 'ar' && product.nameAr) return product.nameAr
  return product.model || product.nameFr || product.nameAr || ''
}

/**
 * Resolve a category's display name for the active language.
 * Falls back to displayName, then name.
 */
export function resolveCategoryName(
  category:
    | {
        name?: string | null
        displayName?: string | null
        displayNameFr?: string | null
        displayNameAr?: string | null
      }
    | null
    | undefined,
  lang: Language
): string {
  if (!category) return ''
  if (lang === 'fr' && category.displayNameFr) return category.displayNameFr
  if (lang === 'ar' && category.displayNameAr) return category.displayNameAr
  return category.displayName || category.name || ''
}
