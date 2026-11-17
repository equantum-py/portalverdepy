import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteShell } from '@/components/route-shell';
import { WhatsAppFloating } from '@/components/whatsapp-floating';
import { siteConfig } from '@/lib/site-config';
import type { HomeContentValues } from '@/lib/home-content/schema';

let mockPathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname }));
vi.mock('@/components/header', () => ({ Header: () => null }));
vi.mock('@/components/footer', () => ({ Footer: () => null }));
vi.mock('@/components/green-advisor', () => ({ GreenAdvisor: () => null }));
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.matchMedia = window.matchMedia ?? ((() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia);
  mockPathname = '/';
  document.body.innerHTML = '';
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));

const BASE = `https://wa.me/${siteConfig.contact.whatsapp}`;
const bubbles = () => Array.from(document.querySelectorAll<HTMLAnchorElement>("a[data-wa-cta='floating']"));
const render = (ui: React.ReactNode) => act(() => root.render(ui));

function shell(cfg: { whatsappEnabled?: boolean; whatsappUrl?: string; whatsappText?: string }, withPageInstance = false) {
  const content = { whatsappEnabled: true, whatsappUrl: BASE, whatsappText: 'Consultar por WhatsApp', ...cfg } as HomeContentValues;
  return (
    <RouteShell categories={[]} products={[]} homeContent={content}>
      {withPageInstance && content.whatsappEnabled ? <WhatsAppFloating url={content.whatsappUrl} text={content.whatsappText} /> : null}
    </RouteShell>
  );
}

describe('burbuja flotante de WhatsApp y configuración del panel', () => {
  it('E1 activada: una única burbuja (Home con instancia de página + layout)', () => {
    render(shell({}, true));
    expect(bubbles()).toHaveLength(1);
  });

  it('E2 desactivada desde el panel: ninguna burbuja alternativa', () => {
    render(shell({ whatsappEnabled: false }, true));
    expect(bubbles()).toHaveLength(0);
    render(shell({ whatsappEnabled: false }, false));
    expect(bubbles()).toHaveLength(0);
  });

  it('E3 número personalizado: se usa el número del negocio', () => {
    render(shell({ whatsappUrl: 'https://wa.me/595000000001', whatsappText: 'Hablanos' }, true));
    expect(bubbles()).toHaveLength(1);
    expect(bubbles()[0].getAttribute('href')).toBe('https://wa.me/595000000001');
    expect(bubbles()[0].getAttribute('aria-label')).toBe('Hablanos');
  });

  it('E4 mensaje personalizado con el mismo número: se usa el mensaje configurado', () => {
    const url = `${BASE}?text=${encodeURIComponent('Hola, quiero cotizar')}`;
    render(shell({ whatsappUrl: url }, true));
    expect(bubbles()).toHaveLength(1);
    expect(bubbles()[0].getAttribute('href')).toBe(url);
  });

  it('E5 sin configuración guardada / valor base: comportamiento predeterminado (mensaje precargado)', () => {
    render(shell({ whatsappUrl: BASE }, true));
    expect(bubbles()).toHaveLength(1);
    expect(bubbles()[0].getAttribute('href')).toContain(`${BASE}?text=`);
    expect(bubbles()[0].getAttribute('aria-label')).toBe('Escribinos por WhatsApp');
  });

  it('E6 navegación Home → /shop → Home: siempre una burbuja con la configuración correcta', () => {
    const custom = { whatsappUrl: 'https://wa.me/595000000001?text=Hola' };
    render(shell(custom, true));
    expect(bubbles()).toHaveLength(1);
    mockPathname = '/shop';
    render(shell(custom, false));
    expect(bubbles()).toHaveLength(1);
    expect(bubbles()[0].getAttribute('href')).toBe('https://wa.me/595000000001?text=Hola');
    mockPathname = '/product/x';
    render(shell(custom, false));
    expect(bubbles()).toHaveLength(1);
    mockPathname = '/';
    render(shell(custom, true));
    expect(bubbles()).toHaveLength(1);
    expect(bubbles()[0].getAttribute('href')).toBe('https://wa.me/595000000001?text=Hola');
  });

  it('el tracking sigue colgando del atributo data-wa-cta="floating"', () => {
    render(shell({}, false));
    expect(bubbles()[0].getAttribute('data-wa-cta')).toBe('floating');
  });
});
