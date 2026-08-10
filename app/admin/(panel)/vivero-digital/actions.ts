'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function updateDigitalNurseryItemAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Registro inválido.');

  const supabase = await createClient();
  const portalPriceRaw = String(formData.get('portal_price') ?? '').trim();

  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    variant: String(formData.get('variant') ?? '').trim(),
    category: String(formData.get('category') ?? 'Planta').trim(),
    description: String(formData.get('description') ?? '').trim(),
    image_url: String(formData.get('image_url') ?? '').trim() || null,
    storage_path: String(formData.get('storage_path') ?? '').trim() || null,
    portal_price: portalPriceRaw ? Number(portalPriceRaw) : null,
    whatsapp_message: String(formData.get('whatsapp_message') ?? '').trim(),
    is_active: formData.get('is_active') === 'on',
    is_published: formData.get('is_active') === 'on',
    updated_at: new Date().toISOString()
  };

  if (!payload.name) throw new Error('El nombre es obligatorio.');

  const { error } = await supabase
    .from('digital_nursery_items')
    .update(payload)
    .eq('id', id);

  if (error) throw new Error(`No se pudo guardar: ${error.message}`);

  revalidatePath('/admin/vivero-digital');
  revalidatePath('/shop');
  redirect('/admin/vivero-digital?updated=1');
}

export async function toggleDigitalNurseryItemAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const nextActive = String(formData.get('next_active')) === 'true';
  if (!id) throw new Error('Registro inválido.');

  const supabase = await createClient();
  const { error } = await supabase
    .from('digital_nursery_items')
    .update({
      is_active: nextActive,
      is_published: nextActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);

  revalidatePath('/admin/vivero-digital');
  revalidatePath('/shop');
}
