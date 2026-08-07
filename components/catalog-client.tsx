'use client';

import {
  BadgePercent,
  Check,
  ChevronDown,
  Filter,
  PackageCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ProductCard } from '@/components/product-card';
import { formatPricePYG } from '@/lib/format-price';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

type CatalogClientProps = {
  initialProducts: Product[];
  initialSearch?: string;
  initialCategory?: string;
};



export function CatalogClient({
  initialProducts,
  initialSearch = '',
  initialCategory = ''
}: CatalogClientProps) {
  const categoryLabels = useMemo(
    () => [
      'Todos',
      ...Array.from(
        new Set(
          initialProducts
            .map((product) => product.category)
            .filter(Boolean)
        )
      ).sort((first, second) =>
        first.localeCompare(second)
      )
    ],
    [initialProducts]
  );

  const highestProductPrice = useMemo(
    () =>
      Math.max(
        ...initialProducts.map((product) => product.price),
        0
      ),
    [initialProducts]
  );

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || 'Todos'
  );
  const [sort, setSort] = useState<SortOption>('featured');

  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(
    highestProductPrice
  );

  const [onlyOffers, setOnlyOffers] = useState(false);
  const [installationIncluded, setInstallationIncluded] =
    useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = initialProducts.filter((product) => {
      const matchesSearch = normalizedSearch
        ? product.name.toLowerCase().includes(normalizedSearch) ||
          product.description
            .toLowerCase()
            .includes(normalizedSearch) ||
          product.category.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesCategory =
        selectedCategory === 'Todos'
          ? true
          : product.category.toLowerCase() ===
            selectedCategory.toLowerCase();

      const matchesPrice =
        product.price >= minimumPrice &&
        product.price <= maximumPrice;

      const matchesOffer = onlyOffers
        ? Boolean(product.isOffer)
        : true;

      const matchesInstallation = installationIncluded
        ? Boolean(product.includesInstallation)
        : true;

      const matchesAvailability = onlyAvailable
        ? product.inStock !== false
        : true;

      const matchesNew = onlyNew
        ? Boolean(product.isNew)
        : true;

      const matchesBestSeller = onlyBestSellers
        ? Boolean(product.isBestSeller)
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesOffer &&
        matchesInstallation &&
        matchesAvailability &&
        matchesNew &&
        matchesBestSeller
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sort === 'name-desc') {
        return b.name.localeCompare(a.name);
      }

      const score = (product: Product) =>
        Number(Boolean(product.isRecommended)) * 4 +
        Number(Boolean(product.isBestSeller)) * 3 +
        Number(Boolean(product.isOffer)) * 2 +
        Number(Boolean(product.isNew));

      return score(b) - score(a);
    });
  }, [
    initialProducts,
    installationIncluded,
    maximumPrice,
    minimumPrice,
    onlyAvailable,
    onlyBestSellers,
    onlyNew,
    onlyOffers,
    search,
    selectedCategory,
    sort
  ]);

  const activeFiltersCount = [
    selectedCategory !== 'Todos',
    minimumPrice > 0,
    maximumPrice < highestProductPrice,
    onlyOffers,
    installationIncluded,
    onlyAvailable,
    onlyNew,
    onlyBestSellers
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('Todos');
    setMinimumPrice(0);
    setMaximumPrice(highestProductPrice);
    setOnlyOffers(false);
    setInstallationIncluded(false);
    setOnlyAvailable(false);
    setOnlyNew(false);
    setOnlyBestSellers(false);
    setSort('featured');
  };

  const toggleOptions = [
    {
      id: 'available',
      title: 'Disponibles',
      description: 'Productos disponibles actualmente',
      checked: onlyAvailable,
      onChange: setOnlyAvailable,
      icon: PackageCheck
    },
    {
      id: 'offers',
      title: 'Ofertas',
      description: 'Productos con precio promocional',
      checked: onlyOffers,
      onChange: setOnlyOffers,
      icon: BadgePercent
    },
    {
      id: 'installation',
      title: 'Instalación incluida',
      description: 'Productos con servicio incluido',
      checked: installationIncluded,
      onChange: setInstallationIncluded,
      icon: Check
    },
    {
      id: 'new',
      title: 'Nuevos',
      description: 'Novedades del catálogo',
      checked: onlyNew,
      onChange: setOnlyNew,
      icon: Sparkles
    },
    {
      id: 'best-sellers',
      title: 'Más vendidos',
      description: 'Productos destacados por demanda',
      checked: onlyBestSellers,
      onChange: setOnlyBestSellers,
      icon: Star
    }
  ];

  const FiltersContent = () => (
    <div className="space-y-7">
      {/* Categorías */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-strong">
            Categorías
          </h3>

          {selectedCategory !== 'Todos' ? (
            <button
              type="button"
              onClick={() => setSelectedCategory('Todos')}
              className="text-xs font-semibold text-brand-700"
            >
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="mt-3 grid gap-1.5">
          {categoryLabels.map((category) => {
            const active = selectedCategory === category;

            const resultCount =
              category === 'Todos'
                ? initialProducts.length
                : initialProducts.filter(
                    (product) =>
                      product.category.toLowerCase() ===
                      category.toLowerCase()
                  ).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition',
                  active
                    ? 'bg-brand-100 font-semibold text-brand-900'
                    : 'text-text-strong hover:bg-brand-50'
                )}
              >
                <span>{category}</span>

                <span
                  className={cn(
                    'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                    active
                      ? 'bg-brand-700 text-white'
                      : 'bg-slate-100 text-text-soft'
                  )}
                >
                  {resultCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Precio */}
      <section className="border-t border-border pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-strong">
            Rango de precio
          </h3>

          {minimumPrice > 0 ||
          maximumPrice < highestProductPrice ? (
            <button
              type="button"
              onClick={() => {
                setMinimumPrice(0);
                setMaximumPrice(highestProductPrice);
              }}
              className="text-xs font-semibold text-brand-700"
            >
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-text-soft">
              Desde
            </span>

            <input
              type="number"
              min={0}
              max={maximumPrice}
              value={minimumPrice}
              onChange={(event) => {
                const value = Number(event.target.value) || 0;
                setMinimumPrice(
                  Math.min(value, maximumPrice)
                );
              }}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-text-soft">
              Hasta
            </span>

            <input
              type="number"
              min={minimumPrice}
              value={maximumPrice}
              onChange={(event) => {
                const value =
                  Number(event.target.value) ||
                  highestProductPrice;

                setMaximumPrice(
                  Math.max(value, minimumPrice)
                );
              }}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-text-soft">
          <span>{formatPricePYG(minimumPrice)}</span>
          <span>{formatPricePYG(maximumPrice)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={highestProductPrice}
          step={5000}
          value={maximumPrice}
          onChange={(event) =>
            setMaximumPrice(Number(event.target.value))
          }
          aria-label="Precio máximo"
          className="mt-3 w-full accent-brand-700"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {[30000, 50000, 100000].map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => {
                setMinimumPrice(0);
                setMaximumPrice(price);
              }}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-text-soft transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              Hasta {formatPricePYG(price)}
            </button>
          ))}
        </div>
      </section>

      {/* Características */}
      <section className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-strong">
          Características
        </h3>

        <div className="mt-3 space-y-2">
          {toggleOptions.map((option) => {
            const Icon = option.icon;

            return (
              <label
                key={option.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition',
                  option.checked
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-transparent hover:bg-slate-50'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    option.checked
                      ? 'bg-brand-700 text-white'
                      : 'bg-slate-100 text-text-soft'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-text-strong">
                    {option.title}
                  </span>

                  <span className="mt-0.5 block text-[11px] leading-4 text-text-soft">
                    {option.description}
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={option.checked}
                  onChange={(event) =>
                    option.onChange(event.target.checked)
                  }
                  className="mt-2 h-4 w-4 accent-brand-700"
                />
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );

  return (
    <div>
      {/* Hero catálogo */}
      <section className="rounded-3xl bg-brand-950 px-5 py-7 text-white sm:px-8 sm:py-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
          Catálogo Portal Verde
        </p>

        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Encontrá la solución ideal para tu espacio
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
          Filtrá por precio, categoría, instalación, ofertas y
          disponibilidad para encontrar exactamente lo que necesitás.
        </p>

        <div className="relative mt-6 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar césped, pisos, granza..."
            aria-label="Buscar productos del catálogo"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-11 text-sm text-text-strong outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-brand-300/30"
          />

          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-soft hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </section>

      {/* Categorías mobile */}
      <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2 lg:hidden">
        {categoryLabels.slice(0, 5).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'min-h-10 shrink-0 snap-start rounded-full border px-4 text-sm font-medium transition',
              selectedCategory === category
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-border bg-white text-text-strong'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        {/* Sidebar desktop */}
        <aside className="sticky top-32 hidden max-h-[calc(100vh-150px)] overflow-y-auto rounded-3xl border border-border bg-white p-5 shadow-sm lg:block">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-brand-700" />

              <h2 className="font-semibold text-text-strong">
                Filtros
              </h2>
            </div>

            {activeFiltersCount > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-brand-700"
              >
                Limpiar todo
              </button>
            ) : null}
          </div>

          <FiltersContent />
        </aside>

        {/* Resultados */}
        <section className="min-w-0">
          <div className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  aria-live="polite"
                  className="text-sm font-semibold text-text-strong"
                >
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1
                    ? 'producto encontrado'
                    : 'productos encontrados'}
                </p>

                <p className="mt-0.5 text-xs text-text-soft">
                  {selectedCategory === 'Todos'
                    ? 'Todo el catálogo'
                    : selectedCategory}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-text-strong lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filtrar

                  {activeFiltersCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
                      {activeFiltersCount}
                    </span>
                  ) : null}
                </button>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOption)
                    }
                    aria-label="Ordenar productos"
                    className="h-11 appearance-none rounded-xl border border-border bg-white pl-3 pr-9 text-xs font-semibold text-text-strong outline-none sm:text-sm"
                  >
                    <option value="featured">
                      Recomendados
                    </option>
                    <option value="price-asc">
                      Menor precio
                    </option>
                    <option value="price-desc">
                      Mayor precio
                    </option>
                    <option value="name-asc">
                      Nombre A-Z
                    </option>
                    <option value="name-desc">
                      Nombre Z-A
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft" />
                </div>
              </div>
            </div>

            {/* Chips activos */}
            {activeFiltersCount > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {selectedCategory !== 'Todos' ? (
                  <FilterChip
                    label={selectedCategory}
                    onRemove={() =>
                      setSelectedCategory('Todos')
                    }
                  />
                ) : null}

                {minimumPrice > 0 ||
                maximumPrice < highestProductPrice ? (
                  <FilterChip
                    label={`${formatPricePYG(
                      minimumPrice
                    )} – ${formatPricePYG(maximumPrice)}`}
                    onRemove={() => {
                      setMinimumPrice(0);
                      setMaximumPrice(highestProductPrice);
                    }}
                  />
                ) : null}

                {onlyAvailable ? (
                  <FilterChip
                    label="Disponibles"
                    onRemove={() => setOnlyAvailable(false)}
                  />
                ) : null}

                {onlyOffers ? (
                  <FilterChip
                    label="Ofertas"
                    onRemove={() => setOnlyOffers(false)}
                  />
                ) : null}

                {installationIncluded ? (
                  <FilterChip
                    label="Instalación incluida"
                    onRemove={() =>
                      setInstallationIncluded(false)
                    }
                  />
                ) : null}

                {onlyNew ? (
                  <FilterChip
                    label="Nuevos"
                    onRemove={() => setOnlyNew(false)}
                  />
                ) : null}

                {onlyBestSellers ? (
                  <FilterChip
                    label="Más vendidos"
                    onRemove={() =>
                      setOnlyBestSellers(false)
                    }
                  />
                ) : null}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-9 px-2 text-xs font-semibold text-red-600"
                >
                  Limpiar todo
                </button>
              </div>
            ) : null}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-border bg-white px-5 py-14 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Search className="h-6 w-6" />
              </span>

              <h2 className="mt-5 text-xl font-semibold text-text-strong">
                No encontramos productos
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-soft">
                Probá modificando el precio, la categoría o
                eliminando algunos filtros.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white"
              >
                Ver todo el catálogo
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Drawer mobile */}
      {isMobileFiltersOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setIsMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filters-title"
            className="absolute inset-y-0 right-0 flex w-[92%] max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Catálogo
                </p>

                <h2
                  id="mobile-filters-title"
                  className="mt-1 text-xl font-semibold text-text-strong"
                >
                  Filtrar productos
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsMobileFiltersOpen(false)
                }
                aria-label="Cerrar panel de filtros"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-800"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FiltersContent />
            </div>

            <footer className="border-t border-border bg-white p-4 shadow-[0_-10px_30px_rgba(15,35,20,0.08)]">
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={activeFiltersCount === 0}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-text-strong disabled:opacity-40"
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsMobileFiltersOpen(false)
                  }
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white"
                >
                  Ver {filteredProducts.length}{' '}
                  {filteredProducts.length === 1
                    ? 'producto'
                    : 'productos'}
                </button>
              </div>
            </footer>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-100 px-3 text-xs font-semibold text-brand-900 transition hover:bg-brand-200"
    >
      {label}
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
