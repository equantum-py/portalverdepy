import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trackFormSubmit, trackSearch, trackSelectItem, trackViewItem } from '@/lib/analytics/events';
import { eventCalls, installGtag, resetAnalyticsEnv, setLocation } from './helpers';

const product = { id: 'p-1', slug: 'cesped-esmeralda', name: 'Césped Esmeralda', category: 'Césped', price: 45000 };

beforeEach(() => resetAnalyticsEnv());
afterEach(() => vi.useRealTimers());

describe('view_item', () => {
  it('abrir producto → view_item con estructura ecommerce', () => {
    const gtag = installGtag();
    setLocation('/product/cesped-esmeralda');
    expect(trackViewItem(product)).toBe(true);
    const [call] = eventCalls(gtag, 'view_item');
    expect(call.params).toMatchObject({
      currency: 'PYG',
      value: 45000,
      page_type: 'product',
      items: [{ item_id: 'p-1', item_name: 'Césped Esmeralda', item_category: 'Césped', price: 45000, quantity: 1 }]
    });
  });

  it('una visualización produce un solo evento lógico (llamadas repetidas)', () => {
    const gtag = installGtag();
    trackViewItem(product);
    trackViewItem(product);
    trackViewItem(product);
    expect(eventCalls(gtag, 'view_item')).toHaveLength(1);
  });

  it('productos sin precio (plantas) no envían price ni value', () => {
    const gtag = installGtag();
    trackViewItem({ ...product, id: 'x', price: 0 });
    const [call] = eventCalls(gtag, 'view_item');
    expect(call.params.value).toBeUndefined();
    expect((call.params.items as Array<Record<string, unknown>>)[0].price).toBeUndefined();
  });
});

describe('select_item', () => {
  it('seleccionar producto → select_item con item_list_name', () => {
    const gtag = installGtag();
    setLocation('/shop');
    trackSelectItem(product, 'shop');
    const [call] = eventCalls(gtag, 'select_item');
    expect(call.params).toMatchObject({
      item_list_name: 'shop',
      page_type: 'shop',
      items: [{ item_id: 'p-1', item_name: 'Césped Esmeralda', item_category: 'Césped', price: 45000, item_list_name: 'shop' }]
    });
  });

  it.each(['shop', 'search_results', 'related_products', 'category', 'home_featured'] as const)('acepta item_list_name %s', (list) => {
    const gtag = installGtag();
    trackSelectItem(product, list);
    expect(eventCalls(gtag, 'select_item')[0].params.item_list_name).toBe(list);
  });

  it('el mismo producto en listas distintas es un evento distinto', () => {
    const gtag = installGtag();
    trackSelectItem(product, 'shop');
    trackSelectItem(product, 'search_results');
    expect(eventCalls(gtag, 'select_item')).toHaveLength(2);
  });
});

describe('search', () => {
  it('buscar "césped" → search con search_term = césped', () => {
    const gtag = installGtag();
    trackSearch('césped', { source: 'header', resultsCount: 4 });
    const [call] = eventCalls(gtag, 'search');
    expect(call.params).toMatchObject({ search_term: 'césped', search_source: 'header', results_count: 4 });
  });

  it.each(['', '   ', 'a'])('no dispara con campo vacío/corto (%p)', (term) => {
    const gtag = installGtag();
    expect(trackSearch(term, { source: 'header' })).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('no dispara con apariencia de PII', () => {
    const gtag = installGtag();
    expect(trackSearch('maria@correo.com', { source: 'catalog' })).toBe(false);
    expect(trackSearch('0981 123 456', { source: 'catalog' })).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('deduplica el mismo término (Enter + sugerencia) dentro de la ventana', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const gtag = installGtag();
    trackSearch('césped', { source: 'header' });
    trackSearch('Césped ', { source: 'header_suggestion' });
    expect(eventCalls(gtag, 'search')).toHaveLength(1);
    vi.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    trackSearch('césped', { source: 'header' });
    expect(eventCalls(gtag, 'search')).toHaveLength(2);
  });
});

describe('form_submit', () => {
  it('envía solo form_name y form_location, sin contenido', () => {
    const gtag = installGtag();
    trackFormSubmit('green_advisor', 'advisor_widget');
    const [call] = eventCalls(gtag, 'form_submit');
    expect(call.params).toMatchObject({ form_name: 'green_advisor', form_location: 'advisor_widget' });
    expect(Object.keys(call.params).sort()).toEqual(['form_location', 'form_name', 'page_type', 'send_to']);
  });
});
