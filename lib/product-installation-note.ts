import type { Product } from '@/lib/types';

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const installationNote =
  'Se incluye la preparación básica del terreno. No incluye desmalezado intensivo, extracción de raíces o troncos, corrección de desniveles importantes ni relleno de pozos o sectores hundidos. Si el terreno requiere alguno de estos trabajos, se evaluará y cotizará por separado.';

export const installationNoteShort =
  'Incluye preparación básica del terreno. Los trabajos adicionales se evalúan y cotizan por separado.';

export function shouldShowInstallationNote(product: Product) {
  const category = normalizeText(
    `${product.categorySlug ?? ''} ${product.category}`
  );
  const name = normalizeText(product.name);

  return category.includes('cesped') && !name.includes('mani');
}

/**
 * OT-004: condiciones comerciales confirmadas del Césped Esmeralda.
 * Solo texto; los precios y reglas de cálculo viven en el sistema (escalas de precio).
 */
export const emeraldProductSlug = 'cesped-esmeralda-m2';

export const emeraldInstallationBadge = 'Instalación incluida en el precio';

export const emeraldPriceFromLabel = 'Desde 40 m²';

export const emeraldMaintenancePromo =
  'Comprá desde 100 m² de Césped Esmeralda y recibí una visita de mantenimiento GRATIS, dentro de los 30 días posteriores a tu compra.';

export function isEmeraldProduct(product: Pick<Product, 'slug'>) {
  return product.slug === emeraldProductSlug;
}
