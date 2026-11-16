import { trackSearch } from './events';
import { sanitizeSearchTerm } from './sanitize';

export const CATALOG_SEARCH_SETTLE_MS = 1200;

type Timers = {
  setTimeout: (fn: () => void, ms: number) => unknown;
  clearTimeout: (id: unknown) => void;
};

/**
 * Seguimiento del buscador/filtro del catálogo (/shop).
 * Solo emite `search` cuando el término QUEDÓ ESTABLE (sin teclear durante
 * CATALOG_SEARCH_SETTLE_MS), tiene ≥2 caracteres, es distinto del último medido y
 * realmente modificó el conjunto de resultados respecto de la línea base.
 * El término inicial (viene de ?search= tras buscar en el header) es línea base
 * y no se vuelve a medir.
 */
export function createCatalogSearchTracker(
  initialTerm: string,
  initialResultsKey: string,
  emit: (term: string, resultsCount: number) => void = (term, count) => {
    trackSearch(term, { source: 'catalog', resultsCount: count });
  },
  timers: Timers = {
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => window.clearTimeout(id as number)
  }
) {
  let lastTerm = sanitizeSearchTerm(initialTerm) ?? '';
  let baselineKey = initialResultsKey;
  let pending: unknown = null;

  function clearPending() {
    if (pending !== null) {
      timers.clearTimeout(pending);
      pending = null;
    }
  }

  return {
    /** Llamar en cada cambio de término/resultados. `resultsKey` identifica el conjunto mostrado. */
    update(term: string, resultsKey: string, resultsCount: number) {
      clearPending();
      const clean = sanitizeSearchTerm(term);

      if (!clean) {
        // Campo vacío/corto: reinicia la línea base, no emite.
        lastTerm = '';
        baselineKey = resultsKey;
        return;
      }

      pending = timers.setTimeout(() => {
        pending = null;
        if (clean === lastTerm) return;
        if (resultsKey === baselineKey) {
          lastTerm = clean;
          return;
        }
        lastTerm = clean;
        baselineKey = resultsKey;
        emit(clean, resultsCount);
      }, CATALOG_SEARCH_SETTLE_MS);
    },
    cancel: clearPending
  };
}
