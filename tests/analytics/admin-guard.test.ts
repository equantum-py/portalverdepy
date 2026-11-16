import { beforeEach, describe, expect, it } from 'vitest';

import { ANALYTICS_DESTINATION_IDS } from '@/lib/analytics/config';
import { applyAnalyticsGuard, getAnalyticsGuardScript, isAdminPath } from '@/lib/analytics/admin-guard';
import { resetAnalyticsEnv } from './helpers';

const flags = () =>
  ANALYTICS_DESTINATION_IDS.map((id) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`]);

beforeEach(() => resetAnalyticsEnv());

describe('isAdminPath', () => {
  it.each(['/admin', '/admin/', '/admin/productos', '/ADMIN/login'])('%s es admin', (p) => expect(isAdminPath(p)).toBe(true));
  it.each(['/', '/shop', '/administracion', '/product/admin', '/adminx'])('%s es público', (p) => expect(isAdminPath(p)).toBe(false));
});

describe('applyAnalyticsGuard', () => {
  it('activa el bloqueo en /admin para GT, GA4 y Ads', () => {
    expect(applyAnalyticsGuard('/admin/productos')).toBe(true);
    expect(flags()).toEqual([true, true, true]);
  });

  it('lo desactiva al volver a una ruta pública (la medición pública no queda dañada)', () => {
    applyAnalyticsGuard('/admin');
    applyAnalyticsGuard('/shop');
    expect(flags()).toEqual([false, false, false]);
  });
});

describe('script inline del layout (carga directa y navegación SPA)', () => {
  it('bloquea antes del primer hit en carga directa de /admin y reacciona a pushState/popstate', async () => {
    window.history.replaceState({}, '', '/admin/login');
    new Function(getAnalyticsGuardScript())();
    expect(flags()).toEqual([true, true, true]); // carga directa

    window.history.pushState({}, '', '/shop'); // navegación SPA admin → público
    expect(flags()).toEqual([false, false, false]);

    window.history.pushState({}, '', '/admin/productos'); // público → admin
    expect(flags()).toEqual([true, true, true]);

    window.history.replaceState({}, '', '/cart');
    expect(flags()).toEqual([false, false, false]);

    window.history.pushState({}, '', '/admin');
    expect(flags()).toEqual([true, true, true]);
    window.history.back(); // botón "atrás": jsdom dispara popstate de forma asíncrona
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(window.location.pathname).toBe('/cart');
    expect(flags()).toEqual([false, false, false]);
  });

  it('es idempotente: ejecutarlo dos veces no anida wrappers', () => {
    new Function(getAnalyticsGuardScript())();
    const first = window.history.pushState;
    new Function(getAnalyticsGuardScript())();
    expect(window.history.pushState).toBe(first);
  });
});
