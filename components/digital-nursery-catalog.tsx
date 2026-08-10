'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DigitalNurseryCard, type DigitalNurseryPublicItem } from '@/components/digital-nursery-card';

export function DigitalNurseryCatalog({ items }: { items: DigitalNurseryPublicItem[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.name} ${item.variant} ${item.description}`.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div>
      <section className="rounded-3xl bg-brand-950 px-5 py-7 text-white sm:px-8 sm:py-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">Vivero Digital</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Plantas para tu espacio</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Explorá nuestro vivero y consultanos disponibilidad, tamaños y recomendaciones directamente por WhatsApp.</p>
        <div className="relative mt-6 max-w-2xl"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar plantas..." className="h-12 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none" /></div>
      </section>

      <div className="mt-6 flex items-center justify-between"><p className="text-sm text-text-soft">{filtered.length} plantas disponibles</p><span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">Consulta por WhatsApp</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{filtered.map((item) => <DigitalNurseryCard key={item.id} item={item} />)}</div>
      {!filtered.length ? <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center text-sm text-text-soft">No encontramos plantas con esa búsqueda.</div> : null}
    </div>
  );
}
