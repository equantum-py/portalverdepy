import { beforeEach, describe, expect, it } from 'vitest';

import { GA4_MEASUREMENT_ID } from '@/lib/analytics/config';
import { EVENT_PARAM_ALLOWLIST, sanitizeParams, trackEvent } from '@/lib/analytics/track';
import { eventCalls, installGtag, resetAnalyticsEnv, setLocation } from './helpers';

beforeEach(() => resetAnalyticsEnv());

describe('trackEvent', () => {
  it('envía el evento con destino explícito G-X4SL2XNW02', () => {
    const gtag = installGtag();
    expect(trackEvent('search', { search_term: 'césped' })).toBe(true);
    const [call] = eventCalls(gtag);
    expect(call.name).toBe('search');
    expect(call.params.send_to).toBe(GA4_MEASUREMENT_ID);
    expect(GA4_MEASUREMENT_ID).toBe('G-X4SL2XNW02');
  });

  it('no hace nada sin gtag', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    expect(trackEvent('search', { search_term: 'césped' })).toBe(false);
  });

  it.each(['/admin', '/admin/productos', '/admin/login'])('bloquea eventos bajo %s', (path) => {
    const gtag = installGtag();
    setLocation(path);
    expect(trackEvent('whatsapp_click', { cta_location: 'header' })).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('no bloquea rutas públicas parecidas a /admin', () => {
    const gtag = installGtag();
    setLocation('/administracion-de-jardines');
    expect(trackEvent('search', { search_term: 'césped' })).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});

describe('sanitizeParams (lista blanca + PII)', () => {
  it('descarta claves fuera de la lista blanca', () => {
    const out = sanitizeParams('search', { search_term: 'césped', phone: '0984123456', email: 'a@b.com', message: 'hola', nombre: 'Juan' });
    expect(Object.keys(out)).toEqual(['search_term']);
  });

  it('descarta valores con apariencia de email o teléfono en parámetros de texto', () => {
    const out = sanitizeParams('whatsapp_click', { product_name: 'juan@correo.com', service_name: '0984 053 683', cta_location: 'header' });
    expect(out).toEqual({ cta_location: 'header' });
  });

  it('page_url, mensaje y texto del usuario nunca están permitidos', () => {
    for (const allowed of Object.values(EVENT_PARAM_ALLOWLIST)) {
      for (const forbidden of ['page_url', 'message', 'mensaje', 'phone', 'email', 'name', 'address', 'notes', 'question', 'answer', 'zone']) {
        expect(allowed).not.toContain(forbidden);
      }
    }
  });

  it('elimina vacíos, undefined y no finitos', () => {
    const out = sanitizeParams('whatsapp_click', { product_id: '', product_name: undefined, value: Number.NaN, item_count: 2 });
    expect(out).toEqual({ item_count: 2 });
  });

  it('los identificadores largos (uuid, numéricos) no se tratan como teléfono', () => {
    const out = sanitizeParams('whatsapp_click', { product_id: '123456789012', product_slug: 'cesped-2024-12345678' });
    expect(out).toEqual({ product_id: '123456789012', product_slug: 'cesped-2024-12345678' });
  });

  it('sanea los ítems de ecommerce y descarta campos no permitidos', () => {
    const out = sanitizeParams('view_item', {
      currency: 'PYG',
      items: [{ item_id: '1', item_name: 'Césped', price: 1000, quantity: 1, email: 'x@y.com', description: 'texto' }]
    });
    expect(out.items).toEqual([{ item_id: '1', item_name: 'Césped', price: 1000, quantity: 1 }]);
  });
});
