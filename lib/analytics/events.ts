import { DEFAULT_CURRENCY } from './config';
import { DEDUPE_WINDOWS, shouldEmit } from './dedupe';
import { getPageType } from './page-type';
import { sanitizeSearchTerm } from './sanitize';
import type { ItemListName, SearchSource } from './taxonomy';
import { trackEvent } from './track';

export type AnalyticsProduct = {
  id?: string | number | null;
  slug?: string | null;
  name: string;
  category?: string | null;
  price?: number | null;
};

function currentPageType() {
  return getPageType(window.location.pathname, window.location.search);
}

function toItem(product: AnalyticsProduct, listName?: ItemListName) {
  const price = typeof product.price === 'number' && product.price > 0 ? product.price : undefined;
  const id = product.id !== undefined && product.id !== null && product.id !== '' ? product.id : product.slug;
  return {
    item_id: id === undefined || id === null ? undefined : String(id),
    item_name: product.name,
    item_category: product.category ?? undefined,
    item_list_name: listName,
    price,
    quantity: 1
  };
}

/** `view_item`: una visualización real de ficha = un evento lógico. */
export function trackViewItem(product: AnalyticsProduct): boolean {
  if (typeof window === 'undefined') return false;
  const item = toItem(product);
  const dedupeKey = `view_item|${item.item_id ?? item.item_name}`;
  if (!shouldEmit(dedupeKey, DEDUPE_WINDOWS.viewItem)) return false;
  return trackEvent('view_item', {
    currency: DEFAULT_CURRENCY,
    value: item.price,
    items: [item],
    page_type: currentPageType()
  });
}

/** `select_item`: selección de un producto desde un listado público. */
export function trackSelectItem(product: AnalyticsProduct, listName: ItemListName): boolean {
  if (typeof window === 'undefined') return false;
  const item = toItem(product, listName);
  const dedupeKey = `select_item|${listName}|${item.item_id ?? item.item_name}`;
  if (!shouldEmit(dedupeKey, DEDUPE_WINDOWS.selectItem)) return false;
  return trackEvent('select_item', {
    item_list_name: listName,
    items: [item],
    page_type: currentPageType()
  });
}

/**
 * `search`: solo búsquedas reales. Rechaza términos vacíos, de <2 caracteres o
 * con apariencia de PII, y repetidos del mismo término dentro de la ventana.
 */
export function trackSearch(
  rawTerm: unknown,
  options: { source: SearchSource; resultsCount?: number }
): boolean {
  if (typeof window === 'undefined') return false;
  const term = sanitizeSearchTerm(rawTerm);
  if (!term) return false;
  if (!shouldEmit(`search|${term}`, DEDUPE_WINDOWS.search)) return false;
  return trackEvent('search', {
    search_term: term,
    search_source: options.source,
    results_count: options.resultsCount,
    page_type: currentPageType()
  });
}

/** `form_submit`: llamar SOLO tras una respuesta exitosa del servidor. Sin contenido del usuario. */
export function trackFormSubmit(formName: string, formLocation?: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!shouldEmit(`form_submit|${formName}`, DEDUPE_WINDOWS.formSubmit)) return false;
  return trackEvent('form_submit', {
    form_name: formName,
    form_location: formLocation,
    page_type: currentPageType()
  });
}
