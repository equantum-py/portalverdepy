import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WhatsAppFloating } from '@/components/whatsapp-floating';
import { siteConfig } from '@/lib/site-config';

let mockPathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname }));
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

const bubbles = () => Array.from(document.querySelectorAll<HTMLAnchorElement>("a[data-wa-cta='floating']"));
const render = (ui: React.ReactNode) => act(() => root.render(ui));

describe('burbuja flotante de WhatsApp', () => {
  it('Home con configuración personalizada del panel: una sola burbuja, la configurada', () => {
    render(<><WhatsAppFloating url="https://wa.me/595000000001?text=Hola" text="Texto admin" /><WhatsAppFloating /></>);
    const all = bubbles();
    expect(all).toHaveLength(1);
    expect(all[0].getAttribute('href')).toBe('https://wa.me/595000000001?text=Hola');
    expect(all[0].getAttribute('aria-label')).toBe('Texto admin');
  });

  it('Home con el valor base del panel (sin personalizar): se conserva la del layout, con mensaje', () => {
    render(<><WhatsAppFloating url={`https://wa.me/${siteConfig.contact.whatsapp}`} text="Consultar por WhatsApp" /><WhatsAppFloating /></>);
    const all = bubbles();
    expect(all).toHaveLength(1);
    expect(all[0].getAttribute('href')).toContain('text=');
  });

  it('otras páginas: la instancia del layout vuelve a mostrarse al desaparecer la de la página', () => {
    render(<><WhatsAppFloating url="https://wa.me/595000000001" /><WhatsAppFloating /></>);
    expect(bubbles()).toHaveLength(1);
    mockPathname = '/shop';
    render(<><WhatsAppFloating /></>);
    expect(bubbles()).toHaveLength(1);
    expect(bubbles()[0].getAttribute('href')).toContain('text=');
  });
});
