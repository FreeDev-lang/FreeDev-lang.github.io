/**
 * Right-sized image URLs for api/files/* images.
 *
 * The API serves server-cached resized variants via `?w=` (target width, px)
 * and `?q=` (JPEG quality). The catalog was loading multi-MB ORIGINALS —
 * ~20 MB for one products grid — which is why the site felt slow on mobile.
 * Every display surface should request a variant sized for its slot; only
 * downloads/AR models keep using raw URLs (the API ignores the params for
 * models anyway).
 */

/** Standard slot widths — keep the set small so the server cache stays hot. */
export const IMG = {
  thumb: 300, // admin tables, AR picker, gallery thumbnails
  card: 600, // product cards in grids
  hero: 1200, // product-detail main image, banners
} as const

/**
 * Append `?w=&q=` to an api/files image URL. Non-file URLs (empty, data:,
 * blob:, external) pass through untouched, as do URLs that already carry
 * a query string.
 */
export function sizedImage(url: string | undefined | null, width: number, quality = 75): string {
  if (!url) return ''
  if (!url.includes('/api/files/') || url.includes('?')) return url
  return `${url}?w=${width}&q=${quality}`
}
