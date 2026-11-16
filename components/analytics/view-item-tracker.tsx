'use client';

import { useEffect, useRef } from 'react';

import { trackViewItem, type AnalyticsProduct } from '@/lib/analytics/events';

/**
 * Emite UN `view_item` por visualización real de una ficha de producto.
 * El ref evita repetir por re-render o por el doble montaje de React Strict Mode;
 * la deduplicación de módulo cubre además remontajes dentro de la misma ventana.
 * No renderiza nada (sin impacto visual).
 */
export function ViewItemTracker({ product }: { product: AnalyticsProduct }) {
  const trackedKey = useRef<string | null>(null);
  const key = String(product.id ?? product.slug ?? product.name);

  useEffect(() => {
    if (trackedKey.current === key) return;
    trackedKey.current = key;
    trackViewItem(product);
    // Solo depende del producto mostrado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
