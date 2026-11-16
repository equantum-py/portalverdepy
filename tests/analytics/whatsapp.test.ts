import { beforeEach, describe, expect, it } from 'vitest';

import { CTA_LOCATIONS } from '@/lib/analytics/taxonomy';
import { buildWhatsAppPayload, handleWhatsAppAnchorClick, isWhatsAppUrl } from '@/lib/analytics/whatsapp';
import { eventCalls, installGtag, makeAnchor, resetAnalyticsEnv, setLocation } from './helpers';

beforeEach(() => {
  document.body.innerHTML = '';
  resetAnalyticsEnv();
});

describe('isWhatsAppUrl', () => {
  it('reconoce los dominios de WhatsApp', () => {
    expect(isWhatsAppUrl('https://wa.me/595984053683')).toBe(true);
    expect(isWhatsAppUrl('https://api.whatsapp.com/send?phone=1')).toBe(true);
    expect(isWhatsAppUrl('https://example.com/?u=wa.me/123')).toBe(false);
  });
});

describe('whatsapp_click: diferenciación de CTA', () => {
  it.each([...CTA_LOCATIONS])('data-wa-cta=%s → cta_location=%s', (cta) => {
    const gtag = installGtag();
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': cta }));
    const [call] = eventCalls(gtag, 'whatsapp_click');
    expect(call.params.cta_location).toBe(cta);
    expect(call.params.source).toBe(cta);
  });

  it('el CTA del header en /shop NUNCA se interpreta como product_card', () => {
    const gtag = installGtag();
    setLocation('/shop?search=cesped');
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'header' }));
    const [call] = eventCalls(gtag, 'whatsapp_click');
    expect(call.params.cta_location).toBe('header');
    expect(call.params.page_type).toBe('shop');
  });

  it('el flotante no depende de clases CSS (className "fixed" no cambia el resultado)', () => {
    const gtag = installGtag();
    const a = makeAnchor({ 'data-wa-cta': 'header', class: 'whatsapp-floating fixed' });
    handleWhatsAppAnchorClick(a);
    expect(eventCalls(gtag, 'whatsapp_click')[0].params.cta_location).toBe('header');
  });

  it('un enlace sin data-wa-cta se reporta como unclassified (no se adivina)', () => {
    const gtag = installGtag();
    setLocation('/shop');
    handleWhatsAppAnchorClick(makeAnchor({}));
    expect(eventCalls(gtag, 'whatsapp_click')[0].params.cta_location).toBe('unclassified');
  });

  it('WhatsApp en ficha → cta_location=product_page con contexto de producto', () => {
    const gtag = installGtag();
    setLocation('/product/cesped-esmeralda');
    handleWhatsAppAnchorClick(
      makeAnchor({
        'data-wa-cta': 'product_page',
        'data-wa-product-id': 'p-1',
        'data-wa-product-name': 'Césped Esmeralda',
        'data-wa-product-slug': 'cesped-esmeralda',
        'data-wa-product-category': 'Césped'
      })
    );
    expect(eventCalls(gtag, 'whatsapp_click')[0].params).toMatchObject({
      page_type: 'product',
      page_path: '/product/cesped-esmeralda',
      cta_location: 'product_page',
      product_id: 'p-1',
      product_name: 'Césped Esmeralda'
    });
  });

  it('WhatsApp flotante → cta_location=floating', () => {
    const gtag = installGtag();
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'floating' }));
    expect(eventCalls(gtag, 'whatsapp_click')[0].params.cta_location).toBe('floating');
  });

  it('/cart → page_type=cart, cta_location=cart, item_count, value y currency', () => {
    const gtag = installGtag();
    setLocation('/cart');
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'cart', 'data-wa-item-count': '3', 'data-wa-value': '150000', 'data-wa-currency': 'PYG' }));
    expect(eventCalls(gtag, 'whatsapp_click')[0].params).toMatchObject({
      page_type: 'cart',
      cta_location: 'cart',
      item_count: 3,
      value: 150000,
      currency: 'PYG'
    });
  });

  it('/cart sin valor estimado no envía value ni currency', () => {
    const gtag = installGtag();
    setLocation('/cart');
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'cart', 'data-wa-item-count': '1' }));
    const { params } = eventCalls(gtag, 'whatsapp_click')[0];
    expect(params.value).toBeUndefined();
    expect(params.currency).toBeUndefined();
  });

  it('whatsapp_click mantiene su nombre y NO emite quote_request', () => {
    const gtag = installGtag();
    setLocation('/cart');
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'cart' }));
    expect(eventCalls(gtag).map((c) => c.name)).toEqual(['whatsapp_click']);
  });

  it('el destino explícito es G-X4SL2XNW02', () => {
    const gtag = installGtag();
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'hero' }));
    expect(eventCalls(gtag, 'whatsapp_click')[0].params.send_to).toBe('G-X4SL2XNW02');
  });
});

describe('whatsapp_click: sin PII', () => {
  it('no incluye URL de WhatsApp, mensaje, page_url ni query de la página', () => {
    const gtag = installGtag();
    setLocation('/shop?search=maria%40correo.com&utm_source=google');
    const anchor = makeAnchor(
      { 'data-wa-cta': 'cart' },
      'https://wa.me/595984053683?text=' + encodeURIComponent('Hola, soy Juan Pérez, mi teléfono es 0981 123 456, vivo en Luque')
    );
    handleWhatsAppAnchorClick(anchor);
    const { params } = eventCalls(gtag, 'whatsapp_click')[0];
    const serialized = JSON.stringify(params);
    expect(serialized).not.toContain('Juan');
    expect(serialized).not.toContain('0981');
    expect(serialized).not.toContain('Luque');
    expect(serialized).not.toContain('maria');
    expect(serialized).not.toContain('wa.me');
    expect(params.page_url).toBeUndefined();
    expect(params.page_path).toBe('/shop');
    expect(params.utm_source).toBe('google');
  });

  it('el payload construido solo contiene claves permitidas', () => {
    const payload = buildWhatsAppPayload(makeAnchor({ 'data-wa-cta': 'footer' }));
    for (const forbidden of ['page_url', 'message', 'phone', 'email', 'text']) {
      expect(Object.keys(payload)).not.toContain(forbidden);
    }
  });
});

describe('whatsapp_click: deduplicación', () => {
  it('un clic duplicado (mismo CTA y producto) emite un solo evento', () => {
    const gtag = installGtag();
    const a = makeAnchor({ 'data-wa-cta': 'product_card', 'data-wa-product-id': 'p-1' });
    handleWhatsAppAnchorClick(a);
    handleWhatsAppAnchorClick(a);
    expect(eventCalls(gtag, 'whatsapp_click')).toHaveLength(1);
  });

  it('productos distintos con el mismo CTA no se colapsan', () => {
    const gtag = installGtag();
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'product_card', 'data-wa-product-id': 'p-1' }));
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'product_card', 'data-wa-product-id': 'p-2' }));
    expect(eventCalls(gtag, 'whatsapp_click')).toHaveLength(2);
  });

  it('CTA distintos en la misma página (header vs floating) no se colapsan', () => {
    const gtag = installGtag();
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'header' }));
    handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'floating' }));
    expect(eventCalls(gtag, 'whatsapp_click')).toHaveLength(2);
  });
});

describe('whatsapp_click: /admin', () => {
  it('no genera medición bajo /admin', () => {
    const gtag = installGtag();
    setLocation('/admin/productos');
    expect(handleWhatsAppAnchorClick(makeAnchor({ 'data-wa-cta': 'header' }))).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });
});
