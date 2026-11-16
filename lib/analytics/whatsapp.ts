import { captureAttribution } from './attribution';
import { GOOGLE_ADS_ID, DEFAULT_CURRENCY } from './config';
import { DEDUPE_WINDOWS, shouldEmit } from './dedupe';
import { getPageType, stripQuery } from './page-type';
import { normalizeText } from './sanitize';
import { UNCLASSIFIED_CTA, isCtaLocation, type CtaLocation } from './taxonomy';
import { trackEvent } from './track';
import { isAdminPath } from './admin-guard';

/**
 * Contrato de instrumentación de un CTA de WhatsApp (atributos en el <a>):
 *   data-wa-cta="header|floating|product_card|…"   (OBLIGATORIO, taxonomía cerrada)
 *   data-wa-product-id / -name / -slug / -category
 *   data-wa-service-name
 *   data-wa-contact-type
 *   data-wa-item-count / data-wa-value / data-wa-currency   (solo /cart)
 * El origen NUNCA se deduce de la URL ni de clases CSS.
 */

export function isWhatsAppUrl(href: string): boolean {
  return /^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href);
}

function readNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function resolveCtaLocation(anchor: HTMLElement): CtaLocation | typeof UNCLASSIFIED_CTA {
  const declared = anchor.dataset.waCta;
  return isCtaLocation(declared) ? declared : UNCLASSIFIED_CTA;
}

/** Construye el payload de `whatsapp_click` (sin href, sin mensaje, sin texto del usuario). */
export function buildWhatsAppPayload(anchor: HTMLElement, win: Window = window): Record<string, unknown> {
  const ds = anchor.dataset;
  const cta = resolveCtaLocation(anchor);
  const attribution = captureAttribution();
  const search = win.location.search;
  const itemCount = readNumber(ds.waItemCount);
  const value = readNumber(ds.waValue);

  return {
    event_category: 'lead',
    // Compatibilidad: `source`/`whatsapp_source`/`event_label` conservan su nombre pero ahora
    // llevan el valor de la taxonomía (ver docs/analytics/ga4-events.md).
    event_label: cta,
    source: cta,
    whatsapp_source: cta,
    cta_location: cta,
    page_type: getPageType(win.location.pathname, search),
    page_path: stripQuery(win.location.pathname),
    page_title: win.document.title,
    product_id: ds.waProductId,
    product_name: ds.waProductName,
    product_slug: ds.waProductSlug,
    product_category: ds.waProductCategory,
    service_name: ds.waServiceName,
    contact_type: ds.waContactType || 'whatsapp',
    button_text: normalizeText(anchor.getAttribute('aria-label') || anchor.textContent || 'WhatsApp', 60),
    item_count: itemCount,
    value,
    currency: value !== undefined ? ds.waCurrency || DEFAULT_CURRENCY : undefined,
    timestamp: new Date().toISOString(),
    gclid_present: Boolean(attribution.gclid),
    gbraid_present: Boolean(attribution.gbraid),
    wbraid_present: Boolean(attribution.wbraid),
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
    transport_type: 'beacon'
  };
}

/**
 * Procesa un clic sobre un <a> de WhatsApp. Devuelve true si se emitió `whatsapp_click`.
 * Deduplicación: mismo CTA + misma página + mismo producto/servicio dentro de 1,5 s.
 */
export function handleWhatsAppAnchorClick(anchor: HTMLAnchorElement, win: Window = window): boolean {
  if (!isWhatsAppUrl(anchor.href)) return false;
  if (isAdminPath(win.location.pathname)) return false;

  const ds = anchor.dataset;
  const key = [
    'whatsapp_click',
    resolveCtaLocation(anchor),
    stripQuery(win.location.pathname),
    ds.waProductId || ds.waProductSlug || '',
    ds.waServiceName || '',
    ds.waContactType || ''
  ].join('|');
  if (!shouldEmit(key, DEDUPE_WINDOWS.whatsappClick)) return false;

  const emitted = trackEvent('whatsapp_click', buildWhatsAppPayload(anchor, win));

  // Conversión de Google Ads: sin cambios respecto de la implementación vigente.
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL || '';
  if (emitted && label && typeof win.gtag === 'function') {
    win.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${label}`,
      value: 1,
      currency: 'PYG',
      event_callback: () => undefined
    });
  }
  return emitted;
}
