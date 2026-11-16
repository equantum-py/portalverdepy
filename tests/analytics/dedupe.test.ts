import { beforeEach, describe, expect, it } from 'vitest';

import { resetDedupe, shouldEmit } from '@/lib/analytics/dedupe';

beforeEach(() => resetDedupe());

describe('shouldEmit', () => {
  it('bloquea la repetición dentro de la ventana y la permite después', () => {
    expect(shouldEmit('k', 1000, 0)).toBe(true);
    expect(shouldEmit('k', 1000, 500)).toBe(false);
    expect(shouldEmit('k', 1000, 1000)).toBe(true);
  });
  it('claves distintas no se afectan', () => {
    expect(shouldEmit('a', 1000, 0)).toBe(true);
    expect(shouldEmit('b', 1000, 1)).toBe(true);
  });
});
