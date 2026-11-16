import { vi, type Mock } from 'vitest';

import { resetDedupe } from '@/lib/analytics/dedupe';

export function installGtag(): Mock {
  const gtag = vi.fn();
  (window as unknown as { gtag: Mock }).gtag = gtag;
  return gtag;
}

export function setLocation(url: string) {
  window.history.replaceState({}, '', url);
}

export function resetAnalyticsEnv() {
  resetDedupe();
  setLocation('/');
  for (const key of Object.keys(window)) {
    if (key.startsWith('ga-disable-')) delete (window as unknown as Record<string, unknown>)[key];
  }
  sessionStorage.clear();
}

/** Llamadas `gtag('event', name, params)` registradas. */
export function eventCalls(gtag: Mock, name?: string) {
  return gtag.mock.calls
    .filter((call) => call[0] === 'event' && (name ? call[1] === name : true))
    .map((call) => ({ name: call[1] as string, params: call[2] as Record<string, unknown> }));
}

export function makeAnchor(attrs: Record<string, string>, href = 'https://wa.me/595984053683?text=Hola') {
  const a = document.createElement('a');
  a.href = href;
  for (const [key, value] of Object.entries(attrs)) a.setAttribute(key, value);
  a.textContent = 'Consultar';
  document.body.appendChild(a);
  return a;
}
