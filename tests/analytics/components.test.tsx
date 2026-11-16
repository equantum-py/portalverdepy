import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { ViewItemTracker } from '@/components/analytics/view-item-tracker';
import { ANALYTICS_DESTINATION_IDS } from '@/lib/analytics/config';
import { eventCalls, installGtag, resetAnalyticsEnv, setLocation } from './helpers';

let mockPathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname }));

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  resetAnalyticsEnv();
  mockPathname = '/';
  container = document.createElement('div');
  document.body.innerHTML = '';
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));

const product = { id: 'p-1', slug: 'cesped-esmeralda', name: 'Césped Esmeralda', category: 'Césped', price: 45000 };

describe('<ViewItemTracker/>', () => {
  it('React Strict Mode (doble montaje) produce un solo view_item', async () => {
    const gtag = installGtag();
    setLocation('/product/cesped-esmeralda');
    await act(async () => root.render(<StrictMode><ViewItemTracker product={product} /></StrictMode>));
    expect(eventCalls(gtag, 'view_item')).toHaveLength(1);
  });

  it('re-renders con el mismo producto no repiten el evento', async () => {
    const gtag = installGtag();
    await act(async () => root.render(<ViewItemTracker product={product} />));
    await act(async () => root.render(<ViewItemTracker product={{ ...product }} />));
    await act(async () => root.render(<ViewItemTracker product={{ ...product, price: 46000 }} />));
    expect(eventCalls(gtag, 'view_item')).toHaveLength(1);
  });

  it('navegar a OTRO producto emite un nuevo view_item', async () => {
    const gtag = installGtag();
    await act(async () => root.render(<ViewItemTracker product={product} />));
    await act(async () => root.render(<ViewItemTracker product={{ ...product, id: 'p-2', name: 'Pasto Kavaju' }} />));
    expect(eventCalls(gtag, 'view_item')).toHaveLength(2);
  });

  it('no renderiza nada (sin impacto visual)', async () => {
    installGtag();
    await act(async () => root.render(<ViewItemTracker product={product} />));
    expect(container.innerHTML).toBe('');
  });

  it('no emite bajo /admin', async () => {
    const gtag = installGtag();
    setLocation('/admin/productos');
    await act(async () => root.render(<ViewItemTracker product={product} />));
    expect(gtag).not.toHaveBeenCalled();
  });
});

function click(el: Element) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

describe('<AnalyticsProvider/>', () => {
  it('Strict Mode no duplica el listener: un clic de WhatsApp = un whatsapp_click', async () => {
    const gtag = installGtag();
    await act(async () => root.render(<StrictMode><AnalyticsProvider /></StrictMode>));
    const a = document.createElement('a');
    a.href = 'https://wa.me/595984053683';
    a.dataset.waCta = 'header';
    document.body.appendChild(a);
    click(a);
    expect(eventCalls(gtag, 'whatsapp_click')).toHaveLength(1);
    expect(eventCalls(gtag, 'whatsapp_click')[0].params.cta_location).toBe('header');
  });

  it('el clic en un hijo del <a> (icono/span) también se clasifica por data-wa-cta', async () => {
    const gtag = installGtag();
    await act(async () => root.render(<AnalyticsProvider />));
    const a = document.createElement('a');
    a.href = 'https://wa.me/595984053683';
    a.dataset.waCta = 'floating';
    a.innerHTML = '<span><svg></svg></span>';
    document.body.appendChild(a);
    click(a.querySelector('svg')!);
    expect(eventCalls(gtag, 'whatsapp_click')[0].params.cta_location).toBe('floating');
  });

  it('un clic en tarjeta de producto emite select_item con la lista declarada', async () => {
    const gtag = installGtag();
    setLocation('/shop');
    await act(async () => root.render(<AnalyticsProvider />));
    const card = document.createElement('a');
    card.href = '/product/cesped-esmeralda';
    Object.assign(card.dataset, { selectItem: 'true', itemId: 'p-1', itemName: 'Césped Esmeralda', itemCategory: 'Césped', itemPrice: '45000', itemList: 'search_results' });
    card.innerHTML = '<h3>Césped</h3>';
    document.body.appendChild(card);
    click(card.querySelector('h3')!);
    const calls = eventCalls(gtag, 'select_item');
    expect(calls).toHaveLength(1);
    expect(calls[0].params).toMatchObject({ item_list_name: 'search_results', items: [{ item_id: 'p-1', price: 45000 }] });
  });

  it.each([['/', 'home_featured'], ['/product/x', 'related_products'], ['/shop', 'shop']])(
    'tarjeta sin lista declarada en %s → %s',
    async (path, expected) => {
      const gtag = installGtag();
      setLocation(path);
      await act(async () => root.render(<AnalyticsProvider />));
      const card = document.createElement('a');
      card.href = '/product/x';
      Object.assign(card.dataset, { selectItem: 'true', itemId: 'p-9', itemName: 'X' });
      document.body.appendChild(card);
      click(card);
      expect(eventCalls(gtag, 'select_item')[0].params.item_list_name).toBe(expected);
    }
  );

  it('/admin no genera whatsapp_click ni select_item', async () => {
    const gtag = installGtag();
    setLocation('/admin/productos');
    mockPathname = '/admin/productos';
    await act(async () => root.render(<AnalyticsProvider />));
    const wa = document.createElement('a');
    wa.href = 'https://wa.me/1';
    wa.dataset.waCta = 'header';
    const card = document.createElement('a');
    card.href = '/product/x';
    Object.assign(card.dataset, { selectItem: 'true', itemId: '1', itemName: 'X' });
    document.body.append(wa, card);
    click(wa);
    click(card);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('el bloqueo de /admin se levanta al navegar de vuelta a una ruta pública', async () => {
    const flag = () => ANALYTICS_DESTINATION_IDS.map((id) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`]);
    installGtag();
    mockPathname = '/admin/productos';
    await act(async () => root.render(<AnalyticsProvider />));
    expect(flag()).toEqual([true, true, true]);

    mockPathname = '/shop';
    setLocation('/shop');
    await act(async () => root.render(<AnalyticsProvider />));
    expect(flag()).toEqual([false, false, false]);
  });

  it('ignora enlaces que no son de WhatsApp ni tarjetas', async () => {
    const gtag = installGtag();
    await act(async () => root.render(<AnalyticsProvider />));
    const a = document.createElement('a');
    a.href = 'https://example.com';
    document.body.appendChild(a);
    click(a);
    expect(gtag).not.toHaveBeenCalled();
  });
});
