'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function isWhatsAppUrl(href: string) {
  return href.includes('wa.me/') || href.includes('api.whatsapp.com/') || href.includes('web.whatsapp.com/');
}

function getPlacement(anchor: HTMLAnchorElement) {
  const explicit = anchor.dataset.whatsappSource;
  if (explicit) return explicit;

  if (anchor.closest('footer')) return 'footer';
  if (anchor.className.includes('fixed')) return 'floating_button';
  if (window.location.pathname.startsWith('/product/')) return 'product_pdp';
  if (window.location.pathname.startsWith('/shop')) return 'catalog';
  return 'page_cta';
}

export function WhatsAppTracking() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || !isWhatsAppUrl(anchor.href)) return;

      const params = new URLSearchParams(window.location.search);
      const itemName = anchor.dataset.itemName || '';
      const itemCategory = anchor.dataset.itemCategory || '';

      window.gtag?.('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: getPlacement(anchor),
        whatsapp_source: getPlacement(anchor),
        link_url: anchor.href.split('?')[0],
        link_text: (anchor.innerText || anchor.getAttribute('aria-label') || 'WhatsApp').trim().slice(0, 100),
        page_path: `${window.location.pathname}${window.location.search}`,
        page_title: document.title,
        item_name: itemName,
        item_category: itemCategory,
        campaign_source: params.get('utm_source') || '',
        campaign_medium: params.get('utm_medium') || '',
        campaign_name: params.get('utm_campaign') || '',
        gclid_present: Boolean(params.get('gclid')),
        transport_type: 'beacon'
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
