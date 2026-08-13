import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DigitalNurseryImageUploader } from '@/components/admin/digital-nursery/digital-nursery-image-uploader';
import { NurseryGeminiAssistant } from '@/components/admin/digital-nursery/nursery-gemini-assistant';
import { createClient } from '@/lib/supabase/server';
import { updateDigitalNurseryItemAction } from '../actions';

type Props = { params: Promise<{ id: string }> };

export default async function EditDigitalNurseryItemPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('digital_nursery_items').select('*').eq('id', id).single();
  if (!item) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link href="/admin/vivero-digital" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"><ArrowLeft className="h-4 w-4" />Volver al Vivero Digital</Link>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Vivero Digital</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Editar planta</h1>
        <p className="mt-2 text-sm text-slate-500">Configurá la ficha que verá el cliente. El precio interno no se mostrará en la tienda.</p>
      </div>

      <form action={updateDigitalNurseryItemAction} className="mt-7 grid gap-6 lg:grid-cols-[340px_1fr]">
        <input type="hidden" name="id" value={item.id} />
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-950">Fotografía</h2>
          <DigitalNurseryImageUploader itemId={item.id} itemName={item.name} initialUrl={item.image_url} initialPath={item.storage_path} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <NurseryGeminiAssistant />
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Nombre</span><input name="name" defaultValue={item.name} required className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-green-600" /></label>
            <label><span className="mb-1.5 block text-sm font-medium">Tamaño / variante</span><input name="variant" defaultValue={item.variant ?? ''} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-green-600" /></label>
            <label><span className="mb-1.5 block text-sm font-medium">Tipo</span><select name="category" defaultValue={item.category} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="Planta">Planta</option><option value="Jardinería / accesorio">Jardinería / accesorio</option></select></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Descripción</span><textarea name="description" defaultValue={item.description ?? ''} rows={5} className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-green-600" /></label>

            <div className="sm:col-span-2 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Precio interno</p>
              <p className="mt-1 text-xs text-amber-800">Podés guardar un precio para administración, pero no aparecerá en el catálogo público del Vivero Digital.</p>
              <input name="portal_price" type="number" min="0" step="1" defaultValue={item.portal_price ?? ''} placeholder="Ej. 150000" className="mt-3 h-11 w-full rounded-xl border border-amber-200 bg-white px-3 sm:max-w-xs" />
            </div>

            <label className="sm:col-span-2"><span className="mb-1.5 flex items-center gap-2 text-sm font-medium"><MessageCircle className="h-4 w-4 text-green-700" />Mensaje de WhatsApp</span><textarea name="whatsapp_message" defaultValue={item.whatsapp_message ?? ''} rows={3} placeholder={`Hola, quiero consultar por ${item.name}.`} className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-green-600" /></label>

            <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input type="checkbox" name="is_active" defaultChecked={Boolean(item.is_active)} className="mt-1 h-4 w-4 accent-green-700" />
              <span><strong className="block text-sm">Activar en la tienda</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Desactivado: no aparece en la categoría Plantas. Activado: queda visible y el cliente puede consultar únicamente por WhatsApp.</span></span>
            </label>
          </div>

          <div className="mt-6 flex justify-end"><button type="submit" className="h-11 rounded-xl bg-green-700 px-6 text-sm font-semibold text-white hover:bg-green-800">Guardar cambios</button></div>
        </section>
      </form>
    </div>
  );
}
