/**
 * Taxonomías centralizadas de analytics (aprobadas por Dirección General).
 * NO introducir variantes arbitrarias: cualquier valor nuevo se agrega aquí,
 * se documenta en docs/analytics/ga4-events.md y se cubre con tests.
 */

export const PAGE_TYPES = [
  'home',
  'shop',
  'product',
  'plants',
  'services',
  'projects',
  'cart',
  'other'
] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const CTA_LOCATIONS = [
  'hero',
  'header',
  'floating',
  'product_card',
  'product_page',
  'product_page_sticky',
  'shop',
  'services',
  'projects',
  'footer',
  'cart',
  'advisor'
] as const;
export type CtaLocation = (typeof CTA_LOCATIONS)[number];

/**
 * Valor centinela (NO pertenece a la taxonomía) para un enlace de WhatsApp que
 * no declaró `data-wa-cta`. Existe para detectar CTA sin instrumentar en lugar
 * de adivinar el origen por URL o clases CSS.
 */
export const UNCLASSIFIED_CTA = 'unclassified';

export const ITEM_LIST_NAMES = [
  'shop',
  'search_results',
  'related_products',
  'category',
  'home_featured'
] as const;
export type ItemListName = (typeof ITEM_LIST_NAMES)[number];

export const SEARCH_SOURCES = ['header', 'header_suggestion', 'catalog'] as const;
export type SearchSource = (typeof SEARCH_SOURCES)[number];

export function isPageType(value: unknown): value is PageType {
  return typeof value === 'string' && (PAGE_TYPES as readonly string[]).includes(value);
}

export function isCtaLocation(value: unknown): value is CtaLocation {
  return typeof value === 'string' && (CTA_LOCATIONS as readonly string[]).includes(value);
}

export function isItemListName(value: unknown): value is ItemListName {
  return typeof value === 'string' && (ITEM_LIST_NAMES as readonly string[]).includes(value);
}
