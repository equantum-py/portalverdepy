import { ImageOff, Pencil, Search, Sprout } from 'lucide-react';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { toggleDigitalNurseryItemAction } from './actions';

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string; status?: string; updated?: string }>;
};

export default async function DigitalNurseryPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const q = filters.q?.trim().toLowerCase() ?? '';
  const category = filters.category ?? 'all';
  const status = filters.status ?? 'all';
  const supabase = await createClient();

  const { data, error } = await supabase.from('digital_nursery_items').select('*').order('sort_order', { ascending: true });

  if (error) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><p className="font-semibold">No se pudo cargar Vivero Digital.</p><p className="mt-1">{error.message}</p></div>;

  const allItems = data ?? [];
  const items = allItems.filter((item) => {
    const matchesText = !q || item.name.toLowerCase().includes(q) || (item.variant ?? '').toLowerCase().includes(q);
    const matchesCategory = category === 'all' || item.category === category;
    const matchesStatus = status === 'all' || (status === 'active' && item.is_active) || (status === 'inactive' && !item.is_active);
    return matchesText && matchesCategory && matchesStatus;
  });

  const plants = allItems.filter((item) => item.category === 'Planta').length;
  const active = allItems.filter((item) => item.is_active).length;

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Catálogo vegetal</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-slate-950"><Sprout className="h-8 w-8 text-green-700" /> Vivero Digital</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Administrá plantas, fotografías y visibilidad. Los precios no se muestran al cliente: la consulta se realiza por WhatsApp.</p></div>
        <div className="flex gap-3 text-sm"><div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3"><strong>{plants}</strong> plantas</div><div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><strong>{active}</strong> activos</div></div>
      </section>

      {filters.updated ? <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">Cambios guardados correctamente.</div> : null}

      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form method="get" className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_230px_200px_auto]">
          <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input name="q" defaultValue={filters.q ?? ''} placeholder="Buscar planta..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-green-600" /></label>
          <select name="category" defaultValue={category} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Todo el vivero</option><option value="Planta">Plantas</option><option value="Jardinería / accesorio">Jardinería / accesorios</option></select>
          <select name="status" defaultValue={status} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Todos los estados</option><option value="active">Activos</option><option value="inactive">Desactivados</option></select>
          <button className="h-11 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800">Filtrar</button>
        </form>
        <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">Mostrando {items.length} de {allItems.length} registros</div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex aspect-[4/3] items-center justify-center bg-slate-50">{item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-slate-400"><ImageOff className="h-8 w-8" /><span className="text-xs">Foto pendiente</span></div>}</div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-green-700">{item.category}</p><h2 className="mt-1 font-semibold text-slate-950">{item.name}</h2>{item.variant ? <p className="mt-1 text-xs text-slate-500">Tamaño: {item.variant}</p> : null}</div><Link href={`/admin/vivero-digital/${item.id}`} title="Editar" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-green-200 hover:text-green-700"><Pencil className="h-4 w-4" /></Link></div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Precio oculto en la tienda · Consulta por WhatsApp</div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${item.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{item.is_active ? 'Activo' : 'Desactivado'}</span>
                  <form action={toggleDigitalNurseryItemAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="next_active" value={String(!item.is_active)} /><button className={`rounded-lg px-3 py-2 text-xs font-semibold ${item.is_active ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-green-700 text-white hover:bg-green-800'}`}>{item.is_active ? 'Desactivar' : 'Activar'}</button></form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
