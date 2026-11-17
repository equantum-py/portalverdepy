import { describe, expect, it } from 'vitest';

import { defaultHomeContent } from '@/lib/home-content/public';
import {
  emeraldInstallationBadge,
  emeraldMaintenancePromo,
  isEmeraldProduct
} from '@/lib/product-installation-note';

describe('OT-004 · condiciones comerciales del Césped Esmeralda', () => {
  it('la promoción de mantenimiento indica mínimo de 100 m², visita gratis y plazo de 30 días', () => {
    expect(emeraldMaintenancePromo).toContain('100 m²');
    expect(emeraldMaintenancePromo).toContain('GRATIS');
    expect(emeraldMaintenancePromo).toContain('30 días');
    expect(emeraldMaintenancePromo).not.toMatch(/ilimitad/i);
  });

  it('la instalación se comunica como incluida en el precio', () => {
    expect(emeraldInstallationBadge).toBe('Instalación incluida en el precio');
  });

  it('el texto del banner aclara que el precio aplica desde 40 m²', () => {
    expect(defaultHomeContent.promoText).toContain('Gs. 32.000/m²');
    expect(defaultHomeContent.promoText).toContain('desde 40 m²');
    expect(defaultHomeContent.promoText).toContain('Instalación incluida');
  });

  it('solo la ficha del Césped Esmeralda recibe el contenido nuevo', () => {
    expect(isEmeraldProduct({ slug: 'cesped-esmeralda-m2' })).toBe(true);
    expect(isEmeraldProduct({ slug: 'cesped-mani-forrajero-m2' })).toBe(false);
  });
});
