import Link from 'next/link';
import {
  Flower2,
  Grid2X2,
  Scissors,
  Sprout
} from 'lucide-react';

import { getPublicCategories } from '@/lib/categories/public-categories';

const mobileCategories = [
  {
    name: 'Césped',
    label: 'Césped',
    description: 'Venta e instalación',
    icon: Sprout
  },
  {
    name: 'Paisajismo',
    label: 'Paisajismo',
    description: 'Pisos y decoración',
    icon: Grid2X2
  },
  {
    name: 'Plantas',
    label: 'Plantas',
    description: 'Para tu jardín',
    icon: Flower2
  },
  {
    name: 'Mantenimiento de jardines',
    label: 'Servicios',
    description: 'Cuidado profesional',
    icon: Scissors
  }
];

function categoryHref(category: string) {
  return `/shop?category=${encodeURIComponent(category)}`;
}

export async function CategorySidebar() {
  const categories = await getPublicCategories();
  const principales = categories.filter(
    (category) =>
      category.name === 'Césped' || category.name === 'Paisajismo'
  );

  const secundarios = categories.filter(
    (category) =>
      category.name !== 'Césped' && category.name !== 'Paisajismo'
  );

  return (
    <>
      {/* Navegación rápida mobile */}
      <section
        aria-labelledby="mobile-categories-title"
        className="lg:hidden"
      >
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Explorá Portal Verde
            </p>

            <h2
              id="mobile-categories-title"
              className="mt-1 text-lg font-semibold tracking-tight text-text-strong"
            >
              ¿Qué necesitás?
            </h2>
          </div>

          <Link
            href="/shop"
            className="shrink-0 text-sm font-semibold text-brand-700"
          >
            Ver todo
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {mobileCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={categoryHref(category.name)}
                className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight text-text-strong">
                    {category.label}
                  </span>

                  <span className="mt-1 block text-[11px] leading-4 text-text-soft">
                    {category.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sidebar desktop */}
      <aside className="hidden rounded-2xl border border-border bg-white p-5 shadow-sm lg:block">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Navegación
          </p>

          <h2 className="mt-1 text-lg font-semibold text-text-strong">
            Categorías
          </h2>
        </div>

        <ul className="space-y-2">
          {principales.map((category) => (
            <li key={category.id}>
              <Link
                href={categoryHref(category.name)}
                className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
              >
                {category.name}

                <span aria-hidden="true" className="text-brand-500">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {secundarios.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-soft">
              Más opciones
            </p>

            <ul className="space-y-1">
              {secundarios.map((category) => (
                <li key={category.id}>
                  <Link
                    href={categoryHref(category.name)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-text-strong transition hover:bg-brand-50 hover:text-brand-800"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/shop"
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
        >
          Ver catálogo completo
        </Link>
      </aside>
    </>
  );
}
