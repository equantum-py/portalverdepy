import { describe, expect, it } from 'vitest';

import { containsPii, sanitizeSearchTerm } from '@/lib/analytics/sanitize';

describe('sanitizeSearchTerm', () => {
  it('normaliza y conserva acentos', () => {
    expect(sanitizeSearchTerm('  Césped   ')).toBe('césped');
  });
  it.each(['', ' ', 'a', null, undefined, 42])('descarta %p', (value) => {
    expect(sanitizeSearchTerm(value)).toBeNull();
  });
  it('descarta emails y teléfonos', () => {
    expect(sanitizeSearchTerm('juan@correo.com')).toBeNull();
    expect(sanitizeSearchTerm('0984 053 683')).toBeNull();
    expect(sanitizeSearchTerm('+595 984-053-683')).toBeNull();
  });
  it('limita la longitud a 100 caracteres', () => {
    expect(sanitizeSearchTerm('a'.repeat(300))?.length).toBe(100);
  });
  it('no confunde cantidades y medidas con teléfonos', () => {
    expect(sanitizeSearchTerm('césped 2x1 100 m2')).toBe('césped 2x1 100 m2');
    expect(containsPii('piedra 20 kg')).toBe(false);
  });
});
