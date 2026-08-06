'use client';
import { Loader2, Star, Trash2 } from 'lucide-react'; import { useRouter } from 'next/navigation'; import { useState } from 'react';
import { deleteCategoryAction, setCategoryFlagAction } from '@/app/admin/(panel)/categorias/actions/category-actions';
export function CategoryActions({ id, name, active, featured }: { id: string; name: string; active: boolean; featured: boolean }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [message, setMessage] = useState('');
  async function run(action: () => Promise<{ success: boolean; message: string }>) { setPending(true); const result = await action(); setPending(false); setMessage(result.message); if (result.success) router.refresh(); }
  return <div className="flex flex-col items-end gap-2"><div className="flex gap-2">
    <button disabled={pending} onClick={() => run(() => setCategoryFlagAction(id, 'is_active', !active))} title={active ? 'Inactivar' : 'Activar'} className="rounded-lg border px-3 py-2 text-xs font-semibold">{active ? 'Inactivar' : 'Activar'}</button>
    <button disabled={pending} onClick={() => run(() => setCategoryFlagAction(id, 'is_featured', !featured))} aria-label={featured ? 'Quitar destacado' : 'Destacar'} className={`rounded-lg border p-2 ${featured ? 'text-amber-500' : 'text-slate-500'}`}><Star className={`h-4 w-4 ${featured ? 'fill-current' : ''}`} /></button>
    <button disabled={pending} onClick={() => { if (confirm(`¿Eliminar la categoría “${name}”?`)) void run(() => deleteCategoryAction(id)); }} aria-label={`Eliminar ${name}`} className="rounded-lg border border-red-200 p-2 text-red-600">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
  </div>{message && <span role="status" className="max-w-64 text-right text-xs text-slate-500">{message}</span>}</div>;
}
