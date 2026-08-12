import type { Product } from '@/lib/types';

export type QuoteItem = Product & {
  quantity: number;
};

const STORAGE_KEY = 'portal-verde-quote';

export function getQuoteItems(): QuoteItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    return JSON.parse(saved) as QuoteItem[];
  } catch {
    return [];
  }
}

export function saveQuoteItems(items: QuoteItem[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('portal-verde-quote-updated'));
}

export function addQuoteItem(product: Product, quantity = 1) {
  const currentItems = getQuoteItems();
  const existingItem = currentItems.find((item) => item.id === product.id);

  const nextItems = existingItem
    ? currentItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    : [...currentItems, { ...product, quantity }];

  saveQuoteItems(nextItems);

  return nextItems;
}

export function addPricedQuoteItem(product: Product, quantity: number, unitPrice: number, tierLabel = '') {
  addQuoteItem({ ...product, price: unitPrice, appliedUnitPrice: unitPrice, estimatedTotal: quantity * unitPrice, appliedTierLabel: tierLabel }, quantity);
}
