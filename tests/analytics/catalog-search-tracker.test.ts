import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CATALOG_SEARCH_SETTLE_MS, createCatalogSearchTracker } from '@/lib/analytics/catalog-search-tracker';

const timers = {
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
  clearTimeout: (id: unknown) => clearTimeout(id as ReturnType<typeof setTimeout>)
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function make(initialTerm = '', initialKey = 'all') {
  const emit = vi.fn();
  const tracker = createCatalogSearchTracker(initialTerm, initialKey, emit, timers);
  return { tracker, emit };
}

describe('buscador del catálogo', () => {
  it('NO emite mientras el usuario escribe (cada tecla reinicia la espera)', () => {
    const { tracker, emit } = make();
    for (const [term, key] of [['cé', 'k1'], ['cés', 'k2'], ['césp', 'k3'], ['céspe', 'k4']] as const) {
      tracker.update(term, key, 3);
      vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS - 100);
    }
    expect(emit).not.toHaveBeenCalled();
  });

  it('emite UNA vez cuando el término queda estable y modifica resultados', () => {
    const { tracker, emit } = make();
    tracker.update('césped', 'k-cesped', 4);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('césped', 4);
  });

  it('no emite con campo vacío ni con menos de 2 caracteres', () => {
    const { tracker, emit } = make();
    tracker.update('', 'all', 10);
    tracker.update('c', 'k1', 5);
    vi.advanceTimersByTime(5000);
    expect(emit).not.toHaveBeenCalled();
  });

  it('no emite si los resultados no cambiaron respecto de la línea base', () => {
    const { tracker, emit } = make('', 'all');
    tracker.update('xx', 'all', 10);
    vi.advanceTimersByTime(5000);
    expect(emit).not.toHaveBeenCalled();
  });

  it('el término inicial (?search= del header) es línea base y no se vuelve a medir', () => {
    const { tracker, emit } = make('césped', 'k-cesped');
    tracker.update('césped', 'k-cesped', 4);
    vi.advanceTimersByTime(5000);
    expect(emit).not.toHaveBeenCalled();
  });

  it('deduplica el mismo término tras re-renders', () => {
    const { tracker, emit } = make();
    tracker.update('césped', 'k1', 4);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    tracker.update('césped', 'k1', 4);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('emite una búsqueda nueva después de limpiar y buscar otra cosa', () => {
    const { tracker, emit } = make();
    tracker.update('césped', 'k1', 4);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    tracker.update('', 'all', 20);
    tracker.update('riego', 'k2', 2);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenLastCalledWith('riego', 2);
  });

  it('mide búsquedas sin resultados (conjunto vacío cambia la línea base)', () => {
    const { tracker, emit } = make();
    tracker.update('zzzz', '', 0);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    expect(emit).toHaveBeenCalledWith('zzzz', 0);
  });

  it('cancel() evita emisiones pendientes (desmontaje)', () => {
    const { tracker, emit } = make();
    tracker.update('césped', 'k1', 4);
    tracker.cancel();
    vi.advanceTimersByTime(5000);
    expect(emit).not.toHaveBeenCalled();
  });

  it('rebase(): una búsqueda llegada por navegación (header) no se vuelve a emitir desde el catálogo', () => {
    const { tracker, emit } = make('', 'all');
    tracker.rebase('piedra');
    tracker.update('piedra', 'k-piedra', 2);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    expect(emit).not.toHaveBeenCalled();
    tracker.update('césped', 'k-cesped', 1);
    vi.advanceTimersByTime(CATALOG_SEARCH_SETTLE_MS + 10);
    expect(emit).toHaveBeenCalledTimes(1);
  });
});
