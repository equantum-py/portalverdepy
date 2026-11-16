'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { applyAnalyticsGuard, isAdminPath } from '@/lib/analytics/admin-guard';
import { captureAttribution } from '@/lib/analytics/attribution';
import { trackSelectItem } from '@/lib/analytics/events';
import { getPageType } from '@/lib/analytics/page-type';
import { isItemListName, type ItemListName } from '@/lib/analytics/taxonomy';
import { handleWhatsAppAnchorClick, isWhatsAppUrl } from '@/lib/analytics/whatsapp';

/** Lista por defecto cuando una tarjeta no declara `data-item-list`. */
function fallbackListName(): ItemListName {
  const pageType = getPageType(window.location.pathname, window.location.search);
  if (pageType === 'home') return 'home_featured';
  if (pageType === 'product') return 'related_products';
  return 'shop';
}

/**
 * Montado UNA sola vez en el layout raíz.
 *  1. Mantiene el interruptor de bloqueo de /admin en cada cambio de ruta.
 *  2. Un único listener de clics delegado (fase de captura) para:
 *     - enlaces de WhatsApp  → `whatsapp_click` (clasificados por `data-wa-cta`)
 *     - tarjetas de producto → `select_item`   (marcadas con `data-select-item`)
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    applyAnalyticsGuard(pathname);
  }, [pathname]);

  useEffect(() => {
    captureAttribution();

    const handleClick = (event: MouseEvent) => {
      if (isAdminPath(window.location.pathname)) return;
      const target = event.target as Element | null;
      if (!target) return;

      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (anchor && isWhatsAppUrl(anchor.href)) {
        handleWhatsAppAnchorClick(anchor);
        return;
      }

      const card = target.closest('[data-select-item]') as HTMLElement | null;
      if (!card) return;
      const { itemId, itemName, itemCategory, itemPrice, itemList } = card.dataset;
      if (!itemName) return;
      const price = itemPrice !== undefined && itemPrice !== '' ? Number(itemPrice) : undefined;
      trackSelectItem(
        { id: itemId, name: itemName, category: itemCategory, price: Number.isFinite(price) ? price : undefined },
        isItemListName(itemList) ? itemList : fallbackListName()
      );
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
