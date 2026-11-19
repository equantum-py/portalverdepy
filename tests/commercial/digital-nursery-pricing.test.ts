import { describe, expect, it } from 'vitest';

import { buildNurseryWhatsAppMessage, getNurseryPricing } from '@/lib/digital-nursery-pricing';
import { createWhatsAppUrl } from '@/lib/site-config';

describe('precios públicos del Vivero Digital', () => {
  it('muestra el precio normal cuando la promoción está desactivada', () => {
    expect(getNurseryPricing(150000, 120000, false)).toEqual({
      current: 150000, previous: null, discount: null
    });
  });

  it('calcula el descuento a partir del precio normal público', () => {
    expect(getNurseryPricing(150000, 120000, true)).toEqual({
      current: 120000, previous: 150000, discount: '20'
    });
  });

  it.each([null, 0, -1, 150000, 150001, 120000.5, Infinity])(
    'ignora una promoción inválida de %s', (price) => {
      expect(getNurseryPricing(150000, price, true)?.current).toBe(150000);
      expect(getNurseryPricing(150000, price, true)?.discount).toBeNull();
    }
  );

  it('omite el precio si falta el normal y evita etiquetas engañosas en los extremos', () => {
    expect(getNurseryPricing(null, 120000, true)).toBeNull();
    expect(getNurseryPricing(1000, 999, true)?.discount).toBe('<1');
    expect(getNurseryPricing(1000, 1, true)?.discount).toBe('99');
  });

  it('conserva el contacto e incluye la planta, el tamaño y el precio vigente', () => {
    const item = {
      name: 'Potus Nacional Grande',
      variant: 'Grande',
      whatsappMessage: 'Hola, quisiera saber si hay stock.',
      portalPrice: 98000,
      referencePrice: 450000
    };
    const url = new URL(createWhatsAppUrl(buildNurseryWhatsAppMessage(item, 120000)));
    expect(url.origin + url.pathname).toBe('https://wa.me/595984053683');
    expect(url.searchParams.get('text')).toBe(
      'Hola, quisiera saber si hay stock.\n\nPlanta: Potus Nacional Grande\nTamaño: Grande\nPrecio vigente: Gs. 120.000'
    );
    expect(buildNurseryWhatsAppMessage(item, null)).not.toContain('Precio vigente');
  });
});
