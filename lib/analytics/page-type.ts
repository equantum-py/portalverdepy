import type { PageType } from './taxonomy';

/**
 * Clasifica una ruta pública en un `page_type`. No usa heurísticas de CSS.
 * `search` es el query string (con o sin '?'), necesario porque /shop renderiza
 * catálogos distintos según `?category=`.
 */
export function getPageType(pathname: string, search = ''): PageType {
  const path = (pathname || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  if (path === '/') return 'home';
  if (path === '/plantas') return 'plants';
  if (path === '/trabajos') return 'projects';
  if (path === '/cart') return 'cart';
  if (path === '/product' || path.startsWith('/product/')) return 'product';

  if (path === '/shop') {
    const category = (new URLSearchParams(search.replace(/^\?/, '')).get('category') ?? '')
      .trim()
      .toLowerCase();
    if (category === 'plantas' || category === 'planta') return 'plants';
    if (
      category === 'mantenimiento de jardines' ||
      category === 'mantenimiento de jardín' ||
      category === 'servicios'
    ) {
      return 'services';
    }
    return 'shop';
  }

  return 'other';
}

/** Ruta sin query string ni hash: evita enviar a GA4 texto escrito por el usuario. */
export function stripQuery(path: string): string {
  return (path || '/').split('?')[0].split('#')[0] || '/';
}
