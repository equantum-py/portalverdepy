import {
  CheckCircle2,
  CircleOff,
  FolderTree,
  Pencil,
  Plus,
  Search,
  Star
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { CategoryActions } from '@/components/admin/categories/category-actions';
import { createClient } from '@/lib/supabase/server';

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    featured?: string;
    sort?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

// The category catalogue must always reflect mutations made through Server Actions.
export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();

  let query = supabase.from('categories').select(
    'id,name,slug,image_url,is_active,is_featured,sort_order,created_at,products(count)',
    { count: 'exact' }
  );

  const searchTerm = params.q
    ?.trim()
    .replace(/[,%()]/g, '');

  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`
    );
  }

  if (params.status === 'active') {
    query = query.eq('is_active', true);
  }

  if (params.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (params.featured === 'true') {
    query = query.eq('is_featured', true);
  }

  const [column, ascending] =
    params.sort === 'name'
      ? (['name', true] as const)
      : params.sort === 'order'
        ? (['sort_order', true] as const)
        : (['created_at', false] as const);

  const { data, error, count } = await query
    .order(column, { ascending })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const pages = Math.max(
    1,
    Math.ceil((count ?? 0) / PAGE_SIZE)
  );

  function paginationHref(nextPage: number) {
    const nextParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value) nextParams.set(key, value);
    }

    nextParams.set('page', String(nextPage));

    return `?${nextParams.toString()}`;
  }
  return <div className="mx-auto max-w-[1500px]"><header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-widest text-green-700">Catálogo</p><h1 className="mt-2 text-3xl font-semibold">Categorías</h1><p className="mt-2 text-sm text-slate-500">Organizá la navegación y presentación del catálogo.</p></div><Link href="/admin/categorias/nuevo" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Nueva categoría</Link></header>
    <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm"><form className="grid gap-3 border-b p-4 sm:grid-cols-[minmax(220px,1fr)_160px_160px_160px_auto]"><div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input name="q" defaultValue={params.q} placeholder="Buscar categorías..." className="h-11 w-full rounded-xl border pl-10 pr-3 text-sm" /></div><select name="status" defaultValue={params.status ?? ''} className="h-11 rounded-xl border px-3 text-sm"><option value="">Todos los estados</option><option value="active">Activas</option><option value="inactive">Inactivas</option></select><select name="featured" defaultValue={params.featured ?? ''} className="h-11 rounded-xl border px-3 text-sm"><option value="">Todas</option><option value="true">Destacadas</option></select><select name="sort" defaultValue={params.sort ?? 'recent'} className="h-11 rounded-xl border px-3 text-sm"><option value="recent">Más recientes</option><option value="name">Nombre A-Z</option><option value="order">Orden manual</option></select><button className="rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white">Filtrar</button></form>
    {error ? <div role="alert" className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">No se pudieron cargar las categorías: {error.message}</div> : data?.length ? <div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Categoría</th><th className="px-5 py-3">Productos</th><th className="px-5 py-3">Orden</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y">{data.map((category) => { const relation = category.products as unknown as { count: number }[]; return <tr key={category.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex min-w-64 items-center gap-3"><div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">{category.image_url ? <Image src={category.image_url} alt={category.name} fill sizes="56px" className="object-cover" /> : <FolderTree className="m-4 h-6 w-6 text-slate-400" />}</div><div><p className="font-semibold">{category.name}</p><p className="text-xs text-slate-500">/{category.slug}</p>{category.is_featured && <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600"><Star className="h-3 w-3 fill-current" />Destacada</span>}</div></div></td><td className="px-5 py-4 text-sm">{relation?.[0]?.count ?? 0}</td><td className="px-5 py-4 text-sm">{category.sort_order}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${category.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{category.is_active ? <CheckCircle2 className="h-3 w-3" /> : <CircleOff className="h-3 w-3" />}{category.is_active ? 'Activa' : 'Inactiva'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/admin/categorias/${category.id}/editar`} aria-label={`Editar ${category.name}`} className="rounded-lg border p-2 text-slate-600"><Pencil className="h-4 w-4" /></Link><CategoryActions id={category.id} name={category.name} active={category.is_active} featured={category.is_featured} /></div></td></tr>; })}</tbody></table></div> : <div className="p-16 text-center"><FolderTree className="mx-auto h-8 w-8 text-green-700" /><h2 className="mt-4 font-semibold">No encontramos categorías</h2><p className="mt-2 text-sm text-slate-500">Creá una categoría o ajustá los filtros.</p></div>}
    {!error && <footer className="flex items-center justify-between border-t p-4 text-sm text-slate-500"><span>{count ?? 0} categorías · Página {page} de {pages}</span><div className="flex gap-2"><Link aria-disabled={page === 1} href={paginationHref(Math.max(1, page - 1))} className={`rounded-lg border px-3 py-2 ${page === 1 ? 'pointer-events-none opacity-40' : ''}`}>Anterior</Link><Link aria-disabled={page >= pages} href={paginationHref(Math.min(pages, page + 1))} className={`rounded-lg border px-3 py-2 ${page >= pages ? 'pointer-events-none opacity-40' : ''}`}>Siguiente</Link></div></footer>}</section></div>;
}
