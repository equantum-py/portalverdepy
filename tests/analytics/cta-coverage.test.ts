import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { CTA_LOCATIONS } from '@/lib/analytics/taxonomy';

const root = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

/**
 * Inventario de CTA de WhatsApp instrumentados con `data-wa-cta` (sin depender de heurísticas).
 * Si se agrega un CTA nuevo, debe registrarse aquí y en docs/analytics/ga4-events.md.
 */
const INSTRUMENTED: Record<string, Record<string, number>> = {
  'components/whatsapp-floating.tsx': { floating: 1 },
  'components/header.tsx': { header: 2 },
  'sections/hero.tsx': { hero: 1 },
  'sections/home-hero-slide.tsx': { hero: 1 },
  'sections/services-section.tsx': { services: 2 },
  'components/product-card.tsx': { product_card: 1 },
  'app/product/[slug]/page.tsx': { product_page: 1, product_page_sticky: 1 },
  'components/products/tiered-price-calculator.tsx': { product_page: 1 },
  'components/services-catalog.tsx': { services: 1 },
  'components/digital-nursery-card.tsx': { product_card: 1 },
  'components/digital-nursery-catalog.tsx': { shop: 1 },
  'app/trabajos/page.tsx': { projects: 3 },
  'components/footer.tsx': { footer: 3 },
  'components/cart-client.tsx': { cart: 1 },
  'components/green-advisor.tsx': { advisor: 1 }
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

describe('cobertura de CTA de WhatsApp', () => {
  for (const [file, expected] of Object.entries(INSTRUMENTED)) {
    it(`${file} declara data-wa-cta con la taxonomía esperada`, () => {
      const source = read(file);
      for (const [cta, count] of Object.entries(expected)) {
        expect(CTA_LOCATIONS as readonly string[]).toContain(cta);
        expect(source.split(`data-wa-cta="${cta}"`).length - 1, `${file} → ${cta}`).toBe(count);
      }
    });
  }

  it('ningún archivo público que cree enlaces de WhatsApp queda fuera del inventario', () => {
    const files = [...walk('app'), ...walk('components'), ...walk('sections')].filter(
      (file) => !file.startsWith('app/admin') && !file.startsWith('components/admin') && !file.startsWith('components/analytics') && !file.includes('/actions')
    );
    const withWhatsApp = files.filter((file) => /wa\.me\/|createWhatsAppUrl\(|api\.whatsapp\.com/.test(read(file)));
    const missing = withWhatsApp.filter((file) => !(file in INSTRUMENTED));
    expect(missing).toEqual([]);
  });

  it('no quedan atributos heredados ni heurísticas de origen', () => {
    const all = [...walk('app'), ...walk('components'), ...walk('sections'), ...walk('lib')];
    const legacy = all.filter((file) => /data-whatsapp-source|data-contact-type|data-product-name=/.test(read(file)));
    expect(legacy).toEqual([]);
    const tracking = read('lib/analytics/whatsapp.ts');
    expect(tracking).not.toMatch(/className\.includes|closest\('footer'\)|pathname\.startsWith/);
  });

  it('las tarjetas de producto declaran data-select-item en el enlace de imagen y de título', () => {
    expect(read('components/product-card.tsx').split('{...selectItemAttrs}').length - 1).toBe(2);
  });

  it('el layout carga el guard de /admin antes de configurar gtag y usa AnalyticsProvider', () => {
    const layout = read('app/layout.tsx');
    expect(layout.indexOf('analytics-admin-guard')).toBeGreaterThan(-1);
    expect(layout).toContain('<AnalyticsProvider />');
    expect(layout).not.toContain('WhatsAppTracking');
  });

  it('form_submit solo se emite tras respuesta exitosa del servidor en el Asesor Verde', () => {
    const src = read('components/green-advisor.tsx');
    const submitIdx = src.indexOf("trackFormSubmit('green_advisor'");
    const successIdx = src.indexOf('if (result.success) {');
    expect(src.split('trackFormSubmit(').length - 1).toBe(1);
    expect(successIdx).toBeGreaterThan(-1);
    expect(submitIdx).toBeGreaterThan(successIdx);
    expect(src).not.toMatch(/trackFormSubmit\([^)]*(question|input|content|answer)/);
  });
});
