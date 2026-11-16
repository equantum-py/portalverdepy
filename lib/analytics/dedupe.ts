/**
 * Deduplicación en memoria (por pestaña). Sobrevive a la navegación SPA porque
 * vive en el módulo, no en un componente: un re-render o un doble montaje de
 * React Strict Mode no puede producir un segundo evento lógico.
 */
const lastSeen = new Map<string, number>();

/** true = emitir; false = es un duplicado dentro de la ventana. */
export function shouldEmit(key: string, windowMs: number, now: number = Date.now()): boolean {
  const previous = lastSeen.get(key);
  if (previous !== undefined && now - previous < windowMs) return false;
  lastSeen.set(key, now);
  return true;
}

export function resetDedupe(): void {
  lastSeen.clear();
}

export const DEDUPE_WINDOWS = {
  whatsappClick: 1500,
  selectItem: 1000,
  search: 3000,
  viewItem: 2000,
  formSubmit: 1000
} as const;
