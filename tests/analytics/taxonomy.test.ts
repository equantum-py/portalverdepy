import { describe, expect, it } from 'vitest';

import { getPageType, stripQuery } from '@/lib/analytics/page-type';
import { CTA_LOCATIONS, ITEM_LIST_NAMES, PAGE_TYPES, isCtaLocation, isPageType } from '@/lib/analytics/taxonomy';

describe('taxonomía centralizada', () => {
  it('page_type contiene exactamente los valores aprobados', () => {
    expect([...PAGE_TYPES]).toEqual(['home', 'shop', 'product', 'plants', 'services', 'projects', 'cart', 'other']);
  });

  it('cta_location contiene exactamente los valores aprobados', () => {
    expect([...CTA_LOCATIONS]).toEqual([
      'hero', 'header', 'floating', 'product_card', 'product_page', 'product_page_sticky',
      'shop', 'services', 'projects', 'footer', 'cart', 'advisor'
    ]);
  });

  it('item_list_name contiene los valores definidos en la OT', () => {
    expect([...ITEM_LIST_NAMES]).toEqual(['shop', 'search_results', 'related_products', 'category', 'home_featured']);
  });

  it('rechaza valores fuera de la taxonomía', () => {
    expect(isCtaLocation('Header ')).toBe(false);
    expect(isCtaLocation('unclassified')).toBe(false);
    expect(isPageType('catalogo')).toBe(false);
    expect(isCtaLocation('header')).toBe(true);
  });
});

describe('getPageType', () => {
  it.each([
    ['/', '', 'home'],
    ['/shop', '', 'shop'],
    ['/shop', '?search=cesped', 'shop'],
    ['/shop', '?category=Césped', 'shop'],
    ['/shop', '?category=Plantas', 'plants'],
    ['/shop', '?category=Mantenimiento de jardines', 'services'],
    ['/shop', '?category=servicios', 'services'],
    ['/plantas', '', 'plants'],
    ['/product/cesped-esmeralda', '', 'product'],
    ['/trabajos', '', 'projects'],
    ['/cart', '', 'cart'],
    ['/cart/', '', 'cart'],
    ['/privacidad', '', 'other'],
    ['/terminos', '', 'other']
  ])('%s %s → %s', (path, search, expected) => {
    expect(getPageType(path, search)).toBe(expected);
  });

  it('stripQuery elimina query y hash', () => {
    expect(stripQuery('/shop?search=juan%40mail.com#x')).toBe('/shop');
  });
});
