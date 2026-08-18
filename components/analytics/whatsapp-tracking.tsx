'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GOOGLE_ADS_ID = 'AW-18381728232';
const GOOGLE_ADS_CONVERSION_LABEL = '';
const CLICK_DEDUP_WINDOW_MS = 3000;
const STORAGE_KEY = 'portalverde_campaign_attribution';

type Attribution = Record<string, string>;

type TrackedAnchor = HTMLAnchorElement & {
  dataset: DOMStringMap & {
    whatsappSource?: string;
    productName?: string;
    productSlug?: string;
    productCategory?: string;
    productId?: string;
    serviceName?: string;
    contactType?: string;
    itemName?: string;
    itemCategory?: string;
  };
};

const CAMPAIGN_KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
] as const;

function isWhatsAppUrl(href: string) {
  return href.includes('wa.me/') || href.includes('api.whatsapp.com/') || href.includes('web.whatsapp.com/');
}

function getSource(anchor: TrackedAnchor) {
  const explicit = anchor.dataset.whatsappSource;
  if (explicit) return explicit;

  if (anchor.closest('footer')) return 'footer';
  if (anchor.className.includes('whatsapp-floating') || anchor.className.includes('fixed')) return 'floating';
  if (window.location.pathname.startsWith('/product/')) return 'product_pdp';
  if (window.location.pathname.startsWith('/shop')) return 'product_card';
  return 'unknown';
}

function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {};

  CAMPAIGN_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) current[key] = value;
  });

  let stored: Attribution = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Attribution;
  } catch {
    stored = {};
  }

  const merged = { ...stored, ...current };
  if (Object.keys(merged).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return merged;
}

function getText(anchor: HTMLAnchorElement) {
  return (anchor.innerText || anchor.getAttribute('aria-label') || 'WhatsApp').trim().replace(/\s+/g, ' ').slice(0, 100);
}

function getProductSlug(anchor: TrackedAnchor) {
  if (anchor.dataset.productSlug) return anchor.dataset.productSlug;
  const match = window.location.pathname.match(/^\/product\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

function getProductName(anchor: TrackedAnchor) {
  if (anchor.dataset.productName || anchor.dataset.itemName) {
    return anchor.dataset.productName || anchor.dataset.itemName || '';
  }

  if (window.location.pathname.startsWith('/product/')) {
    return document.querySelector('h1')?.textContent?.trim().slice(0, 150) || '';
  }

  return '';
}

function shouldSkipDuplicate(anchor: HTMLAnchorElement) {
  const now = Date.now();
  const source = getSource(anchor as TrackedAnchor);
  const key = `${source}|${window.location.pathname}|${anchor.href.split('?')[0]}`;
  const storageKey = 'portalverde_last_whatsapp_click';

  try {
    const previous = JSON.parse(sessionStorage.getItem(storageKey) || '{}') as { key?: string; timestamp?: number };
    if (previous.key === key && previous.timestamp && now - previous.timestamp < CLICK_DEDUP_WINDOW_MS) {
      return true;
    }
    sessionStorage.setItem(storageKey, JSON.stringify({ key, timestamp: now }));
  } catch {
    return false;
  }

  return false;
}

export function WhatsAppTracking() {
  useEffect(() => {
    captureAttribution();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest('a[href]') as TrackedAnchor | null;
      if (!anchor || !isWhatsAppUrl(anchor.href) || shouldSkipDuplicate(anchor)) return;

      const attribution = captureAttribution();
      const source = getSource(anchor);
      const productName = getProductName(anchor);
      const productCategory = anchor.dataset.productCategory || anchor.dataset.itemCategory || '';
      const buttonText = getText(anchor);

      window.gtag?.('event', 'whatsapp_click', {
        event_category: 'lead',
        event_label: source,
        source,
        whatsapp_source: source,
        page_path: `${window.location.pathname}${window.location.search}`,
        page_url: window.location.href,
        page_title: document.title,
        product_name: productName,
        product_slug: getProductSlug(anchor),
        product_category: productCategory,
        product_id: anchor.dataset.productId || '',
        service_name: anchor.dataset.serviceName || '',
        button_text: buttonText,
        contact_type: anchor.dataset.contactType || 'whatsapp',
        timestamp: new Date().toISOString(),
        gclid_present: Boolean(attribution.gclid),
        gbraid_present: Boolean(attribution.gbraid),
        wbraid_present: Boolean(attribution.wbraid),
        utm_source: attribution.utm_source || '',
        utm_medium: attribution.utm_medium || '',
        utm_campaign: attribution.utm_campaign || '',
        utm_content: attribution.utm_content || '',
        utm_term: attribution.utm_term || '',
        transport_type: 'beacon'
      });

      if (GOOGLE_ADS_CONVERSION_LABEL) {
        window.gtag?.('event', 'conversion', {
          send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`
        });
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
