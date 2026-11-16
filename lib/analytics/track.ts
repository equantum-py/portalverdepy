import { isAdminPath } from './admin-guard';
import { GA4_MEASUREMENT_ID } from './config';
import {
  BLOCKED_PARAM_KEYS,
  ID_PARAM_KEYS,
  MAX_TEXT_LENGTH,
  containsPii,
  normalizeText
} from './sanitize';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Catálogo cerrado de eventos propios. `quote_request` y `calculator_use` están
 *  reservados: tienen contrato definido pero NO se emiten en esta OT. */
export type AnalyticsEventName =
  | 'view_item'
  | 'select_item'
  | 'search'
  | 'whatsapp_click'
  | 'form_submit'
  | 'quote_request'
  | 'calculator_use';

const ITEM_KEYS = ['item_id', 'item_name', 'item_category', 'item_list_name', 'price', 'quantity'] as const;

/** Lista blanca de parámetros por evento: lo que no está aquí no sale del navegador. */
export const EVENT_PARAM_ALLOWLIST: Record<AnalyticsEventName, readonly string[]> = {
  view_item: ['currency', 'value', 'items', 'page_type'],
  select_item: ['item_list_name', 'items', 'page_type'],
  search: ['search_term', 'search_source', 'results_count', 'page_type'],
  whatsapp_click: [
    'event_category',
    'event_label',
    'source',
    'whatsapp_source',
    'page_path',
    'page_title',
    'page_type',
    'cta_location',
    'product_id',
    'product_name',
    'product_slug',
    'product_category',
    'service_name',
    'contact_type',
    'button_text',
    'item_count',
    'value',
    'currency',
    'timestamp',
    'gclid_present',
    'gbraid_present',
    'wbraid_present',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'transport_type'
  ],
  form_submit: ['form_name', 'form_location', 'page_type'],
  quote_request: [
    'product_id',
    'product_name',
    'service_name',
    'quantity',
    'unit',
    'page_type'
  ],
  calculator_use: ['product_id', 'product_name', 'quantity', 'unit', 'page_type']
};

type Primitive = string | number | boolean;

function cleanValue(key: string, value: unknown): Primitive | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const text = normalizeText(value, MAX_TEXT_LENGTH);
  if (!text) return undefined;
  if (!ID_PARAM_KEYS.has(key) && containsPii(text)) return undefined;
  return text;
}

function cleanItem(raw: unknown): Record<string, Primitive> | null {
  if (!raw || typeof raw !== 'object') return null;
  const item: Record<string, Primitive> = {};
  for (const key of ITEM_KEYS) {
    const value = cleanValue(key, (raw as Record<string, unknown>)[key]);
    if (value !== undefined) item[key] = value;
  }
  return item.item_id !== undefined || item.item_name !== undefined ? item : null;
}

/** Aplica lista blanca, descarta claves bloqueadas, vacíos y valores con apariencia de PII. */
export function sanitizeParams(
  event: AnalyticsEventName,
  params: Record<string, unknown>
): Record<string, unknown> {
  const allowed = new Set(EVENT_PARAM_ALLOWLIST[event]);
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!allowed.has(key) || BLOCKED_PARAM_KEYS.has(key.toLowerCase())) continue;

    if (key === 'items') {
      if (!Array.isArray(value)) continue;
      const items = value.map(cleanItem).filter((item): item is Record<string, Primitive> => item !== null);
      if (items.length) out.items = items;
      continue;
    }

    const cleaned = cleanValue(key, value);
    if (cleaned !== undefined) out[key] = cleaned;
  }

  return out;
}

/**
 * Único punto de salida hacia GA4 para eventos propios.
 *  - No hace nada en SSR, sin gtag o bajo /admin.
 *  - Envía con destino explícito `send_to: G-X4SL2XNW02` (evita fan-out hacia
 *    GT-… y AW-…, que podría duplicar el evento).
 * Devuelve true si el evento fue entregado a gtag.
 */
export function trackEvent(event: AnalyticsEventName, params: Record<string, unknown> = {}): boolean {
  if (typeof window === 'undefined') return false;
  if (isAdminPath(window.location.pathname)) return false;
  if (typeof window.gtag !== 'function') return false;

  window.gtag('event', event, {
    ...sanitizeParams(event, params),
    send_to: GA4_MEASUREMENT_ID
  });
  return true;
}
