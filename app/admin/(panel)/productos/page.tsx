import {
  Boxes,
  CheckCircle2,
  CircleOff,
  Filter,
  Pencil,
  Plus,
  Search,
  Tag,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { ProductDeleteButton } from '@/components/admin/products/product-delete-button';
import { ProductDuplicateButton } from '@/components/admin/products/product-duplicate-button';
import { ProductStockToggle } from '@/components/admin/products/product-stock-toggle';
import { createClient } from '@/lib/supabase/server';

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    stock?: string;
    category?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams
}: AdminProductsPageProps) {
  const filters = await searchParams;
  const query = filters.q?.trim().toLowerCase() ?? '';
  const status = filters.status ?? 'all';
  const stock = filters.stock ?? 'all';
  const categoryFilter = filters.category ?? 'all';

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      previous_price,
      image_url,
      is_active,
      in_stock,
      is_offer,
      includes_installation,
      created_at,
      categories (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        No se pudieron cargar los productos: {error.message}
      </div>
    );
  }

  const allProducts = products ?? [];

  const categoryNames = Array.from(
    new Set(
      allProducts
        .map((product) => getCategoryName(product.categories))
        .filter((name): name is string => Boolean(name))
    )
  ).sort((first, second) => first.localeCompare(second, 'es'));

  const productList = allProducts.filter((product) => {
    const category = getCategoryName(product.categories) ?? '';
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query);

    const matchesStatus =
      status === 'all' ||
      (status === 'active' && product.is_active) ||
      (status === 'inactive' && !product.is_active);

    const matchesStock =
      stock === 'all' ||
      (stock === 'available' && product.in_stock) ||
      (stock === 'out' && !product.in_stock);

    const matchesCategory =
      categoryFilter === 'all' || category === categoryFilter;

    return (
      matchesQuery &&
      matchesStatus &&
      matchesStock &&
      matchesCategory
    );
  });

  const hasFilters =
    Boolean(query) ||
    status !== 'all' ||
    stock !== 'all' ||
    categoryFilter !== 'all';

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Productos
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Administrá precios, disponibilidad, imágenes y publicación.
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form
          method="get"
          className="border-b border-slate-100 p-4"
        >
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_190px_190px_220px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q ?? ''}
                placeholder="Buscar por nombre, slug o categoría..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />
            </label>

            <select
              name="status"
              defaultValue={status}
              aria-label="Filtrar por estado"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            <select
              name="stock"
              defaultValue={stock}
              aria-label="Filtrar por disponibilidad"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
            >
              <option value="all">Todo el stock</option>
              <option value="available">Disponibles</option>
              <option value="out">Agotados</option>
            </select>

            <select
              name="category"
              defaultValue={categoryFilter}
              aria-label="Filtrar por categoría"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
            >
              <option value="all">Todas las categorías</option>
              {categoryNames.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {productList.length} de {allProducts.length} productos
            </p>

            {hasFilters ? (
              <Link
                href="/admin/productos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-red-600"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Link>
            ) : null}
          </div>
        </form>

        {productList.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Disponibilidad</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productList.map((product) => {
                  const category = getCategoryName(product.categories);

                  return (
                    <tr key={product.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex min-w-[260px] items-center gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-slate-400">
                                <Boxes className="h-5 w-5" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              /product/{product.slug}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {product.is_offer ? (
                                <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                                  Oferta
                                </span>
                              ) : null}
                              {product.includes_installation ? (
                                <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                                  Instalación
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <Tag className="h-4 w-4 text-slate-400" />
                          {category || 'Sin categoría'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Gs. {Number(product.price).toLocaleString('es-PY')}
                        </p>
                        {product.previous_price ? (
                          <p className="mt-1 text-xs text-slate-400 line-through">
                            Gs. {Number(product.previous_price).toLocaleString('es-PY')}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.is_active
                              ? 'inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700'
                              : 'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500'
                          }
                        >
                          {product.is_active ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <CircleOff className="h-3.5 w-3.5" />
                          )}
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <ProductStockToggle
                          productId={product.id}
                          productName={product.name}
                          inStock={product.in_stock}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/productos/${product.id}/editar`}
                            aria-label={`Editar ${product.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ProductDuplicateButton
                            productId={product.id}
                            productName={product.name}
                          />
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700">
              <Boxes className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              {hasFilters
                ? 'No encontramos productos'
                : 'Todavía no hay productos'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {hasFilters
                ? 'Probá con otros términos o limpiá los filtros aplicados.'
                : 'Creá el primer producto para comenzar a administrar el catálogo.'}
            </p>
            {hasFilters ? (
              <Link
                href="/admin/productos"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Link>
            ) : (
              <Link
                href="/admin/productos/nuevo"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Crear primer producto
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function getCategoryName(
  relation:
    | { name: string }
    | { name: string }[]
    | null
): string | null {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation?.name ?? null;
}
