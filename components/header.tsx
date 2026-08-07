'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Menu,
  Search,
  X,
} from 'lucide-react';

import {
  LawnMowerIcon,
  WhatsAppIcon,
} from '@/components/icons';
import { QuoteCounter } from '@/components/quote-counter';
import { Logo } from '@/components/logo';
import { MegaMenu } from '@/components/navigation/mega-menu';
import { formatPricePYG } from '@/lib/format-price';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { createWhatsAppUrl } from '@/lib/site-config';
import type { HomeContentValues } from '@/lib/home-content/schema';

export function Header({
  categories,
  products,
  homeContent,
}: {
  categories: Category[];
  products: Product[];
  homeContent: HomeContentValues;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const router = useRouter();

  const suggestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return [];

    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term);

        const matchesCategory = selectedCategory
          ? product.category.toLowerCase() ===
            selectedCategory.toLowerCase()
          : true;

        return matchesSearch && matchesCategory;
      })
      .slice(0, 6);
  }, [products, search, selectedCategory]);

  const handleSearch = () => {
    const query = search.trim();
    const category = selectedCategory.trim();

    if (!query && !category) {
      router.push('/shop');
      setIsFocused(false);
      return;
    }

    const params = new URLSearchParams();

    if (query) params.set('search', query);
    if (category) params.set('category', category);

    router.push(`/shop?${params.toString()}`);
    setIsFocused(false);
  };

  const handleSuggestionClick = (slug: string) => {
    setSearch('');
    setIsFocused(false);
    router.push(`/product/${slug}`);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationHref = (
    item: HomeContentValues['navigation'][number],
  ) => {
    if (item.linkType === 'category') {
      const category = categories.find(
        (currentCategory) =>
          currentCategory.id === item.targetId,
      );

      return `/shop?category=${encodeURIComponent(
        category?.name || '',
      )}`;
    }

    if (item.linkType === 'product') {
      const product = products.find(
        (currentProduct) =>
          currentProduct.id === item.targetId,
      );

      return `/product/${product?.slug || ''}`;
    }

    return item.url;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 shadow-sm backdrop-blur-xl">
      {/* Barra promocional */}
      {homeContent.promoEnabled && (
        <div className="border-b border-brand-100 bg-brand-50">
          <div className="container-shell flex h-9 items-center gap-3 overflow-hidden text-xs">
            <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
              <div
                className={`${
                  homeContent.promoScroll
                    ? 'animate-marquee'
                    : ''
                } inline-flex items-center font-medium text-brand-800`}
                style={{
                  animationDuration: `${homeContent.promoSpeed}s`,
                }}
              >
                <span>
                  {homeContent.promoIcon}{' '}
                  {homeContent.promoText}
                </span>
              </div>
            </div>

            <a
              href={
                homeContent.promoUrl ||
                createWhatsAppUrl(
                  'Hola, quiero recibir asesoramiento de Portal Verde.',
                )
              }
              target={
                homeContent.promoNewTab
                  ? '_blank'
                  : undefined
              }
              rel={
                homeContent.promoNewTab
                  ? 'noopener noreferrer'
                  : undefined
              }
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-brand-800 transition hover:text-brand-600"
            >
              <WhatsAppIcon className="h-4 w-4" />

              <span className="hidden sm:inline">
                {homeContent.promoButtonText}
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Cabecera desktop */}
      <div className="container-shell">
        <div className="flex min-h-[72px] items-center gap-4 py-3 lg:min-h-[82px] lg:gap-7">
          {homeContent.logoEnabled && (
            <Link
              href="/"
              aria-label="Ir al inicio de Portal Verde"
              className="shrink-0"
            >
              <Logo
                desktopUrl={homeContent.logoDesktopUrl}
                mobileUrl={homeContent.logoMobileUrl}
                alt={homeContent.logoAlt}
              />
            </Link>
          )}

          {/* Buscador desktop */}
          <div className="relative hidden min-w-0 flex-1 md:block">
            <div
              className={cn(
                'flex h-12 items-stretch overflow-hidden rounded-2xl border bg-white transition-all duration-200',
                isFocused
                  ? 'border-brand-400 ring-4 ring-brand-100'
                  : 'border-border hover:border-brand-300',
              )}
            >
              <div className="relative hidden sm:block">
                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value,
                    )
                  }
                  aria-label="Seleccionar categoría"
                  className="h-full w-36 cursor-pointer appearance-none border-r border-border bg-brand-50 pl-4 pr-9 text-sm font-medium text-brand-900 outline-none"
                >
                  <option value="">Todas</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700"
                />
              </div>

              <div className="flex min-w-0 flex-1 items-center">
                <Search
                  aria-hidden="true"
                  className="ml-4 h-5 w-5 shrink-0 text-text-soft"
                />

                <input
                  type="search"
                  placeholder="Buscar césped, granza, pisos y servicios..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  onFocus={() => setIsFocused(true)}
                  onBlur={() =>
                    setTimeout(
                      () => setIsFocused(false),
                      150,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-text-strong outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                aria-label="Buscar productos"
                className="inline-flex w-14 shrink-0 items-center justify-center bg-brand-700 text-white transition hover:bg-brand-800 active:scale-95"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Resultados predictivos */}
            {isFocused && search.trim() && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-border bg-white shadow-elevated">
                {suggestions.length > 0 ? (
                  <>
                    <div className="border-b border-border bg-brand-50 px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                        Productos encontrados
                      </p>
                    </div>

                    <ul className="max-h-[420px] overflow-y-auto">
                      {suggestions.map((product) => (
                        <li
                          key={product.id}
                          className="border-b border-border last:border-0"
                        >
                          <button
                            type="button"
                            onMouseDown={() =>
                              handleSuggestionClick(
                                product.slug,
                              )
                            }
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-50"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-slate-100">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-text-strong">
                                {product.name}
                              </p>

                              <p className="mt-0.5 text-xs text-text-soft">
                                {product.category}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-bold text-brand-700">
                              {formatPricePYG(
                                product.price,
                              )}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onMouseDown={handleSearch}
                      className="flex w-full items-center justify-center gap-2 border-t border-border bg-white px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Ver todos los resultados
                    </button>
                  </>
                ) : (
                  <div className="px-5 py-6 text-center">
                    <Search className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-sm font-medium text-text-strong">
                      No encontramos productos
                    </p>

                    <p className="mt-1 text-xs text-text-soft">
                      Probá con otro nombre o categoría.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acciones desktop */}
          <nav
            aria-label="Navegación principal"
            className="ml-auto hidden shrink-0 items-center gap-2 lg:flex"
          >
            <MegaMenu
              categories={categories}
              products={products}
              homeContent={homeContent}
            />

            {homeContent.navigation
              .filter((item) => item.isActive)
              .sort(
                (a, b) =>
                  a.sortOrder - b.sortOrder,
              )
              .map((item) => (
                <Link
                  key={item.name}
                  href={navigationHref(item)}
                  target={
                    item.newTab
                      ? '_blank'
                      : undefined
                  }
                  rel={
                    item.newTab
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  className="inline-flex h-11 items-center rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-soft"
                >
                  {item.name}
                </Link>
              ))}

            <Link
              href="/cart"
              aria-label="Ver carrito"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-text-strong transition hover:border-brand-300 hover:bg-brand-50"
            >
              <LawnMowerIcon className="h-5 w-5" />

              <QuoteCounter />
            </Link>
          </nav>

          {/* Acciones mobile */}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Link
              href="/cart"
              aria-label="Ver carrito"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white"
            >
              <LawnMowerIcon className="h-5 w-5" />

              <QuoteCounter />
            </Link>

            <button
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? 'Cerrar menú'
                  : 'Abrir menú'
              }
              aria-expanded={isMobileMenuOpen}
              onClick={() =>
                setIsMobileMenuOpen(
                  (current) => !current,
                )
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Buscador mobile */}
        <div className="pb-3 md:hidden">
          <div className="flex h-12 items-stretch overflow-hidden rounded-2xl border border-border bg-white shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
            <Search
              aria-hidden="true"
              className="ml-4 h-5 w-5 self-center text-text-soft"
            />

            <input
              type="search"
              placeholder="¿Qué estás buscando?"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            />

            <button
              type="button"
              onClick={handleSearch}
              aria-label="Buscar"
              className="inline-flex w-14 items-center justify-center bg-brand-700 text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      <div
        className={cn(
          'overflow-hidden border-t border-border bg-white transition-all duration-300 lg:hidden',
          isMobileMenuOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 border-t-transparent opacity-0',
        )}
      >
        <nav
          aria-label="Navegación móvil"
          className="container-shell grid gap-2 py-4"
        >
          <div className="rounded-2xl border border-border bg-brand-50/60 p-2">
            <Link
              href="/shop"
              onClick={closeMobileMenu}
              className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-text-strong transition hover:bg-white"
            >
              Todos los productos
              <span aria-hidden="true">→</span>
            </Link>

            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <Link
                href="/shop?category=Césped"
                onClick={closeMobileMenu}
                className="rounded-xl bg-white px-3 py-3 text-xs font-semibold text-brand-800 shadow-sm"
              >
                🌱 Césped
              </Link>

              <Link
                href="/shop?category=Paisajismo"
                onClick={closeMobileMenu}
                className="rounded-xl bg-white px-3 py-3 text-xs font-semibold text-brand-800 shadow-sm"
              >
                🌿 Paisajismo
              </Link>

              <Link
                href="/shop?category=Plantas"
                onClick={closeMobileMenu}
                className="rounded-xl bg-white px-3 py-3 text-xs font-semibold text-brand-800 shadow-sm"
              >
                🪴 Plantas
              </Link>

              <Link
                href="/shop?category=Mantenimiento%20de%20jardines"
                onClick={closeMobileMenu}
                className="rounded-xl bg-white px-3 py-3 text-xs font-semibold text-brand-800 shadow-sm"
              >
                🛠 Mantenimiento
              </Link>
            </div>
          </div>

          {homeContent.navigation
            .filter((item) => item.isActive)
            .sort(
              (a, b) =>
                a.sortOrder - b.sortOrder,
            )
            .map((item) => (
              <Link
                key={`mobile-${item.name}`}
                href={navigationHref(item)}
                target={
                  item.newTab
                    ? '_blank'
                    : undefined
                }
                rel={
                  item.newTab
                    ? 'noopener noreferrer'
                    : undefined
                }
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-text-strong transition hover:bg-brand-50"
              >
                {item.name}
              </Link>
            ))}

          {homeContent.whatsappEnabled && (
            <a
              href={
                homeContent.whatsappUrl ||
                createWhatsAppUrl(
                  'Hola, quiero recibir asesoramiento de Portal Verde.',
                )
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
            >
              <WhatsAppIcon className="h-5 w-5" />

              {homeContent.whatsappText}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}