'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getNurseryPricing, isNurseryPrice } from '@/lib/digital-nursery-pricing';
import { createClient } from '@/lib/supabase/server';

function readPublicPrice(formData: FormData, field: string) {
  const raw = String(formData.get(field) ?? '').trim();
  if (raw === '') return null;

  const value = Number(raw);
  if (!isNurseryPrice(value)) throw new Error('Ingresá un precio público válido en guaraníes enteros.');
  return value;
}

export async function updateDigitalNurseryItemAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Registro inválido.');

  const supabase = await createClient();
  const portalPriceRaw = String(formData.get('portal_price') ?? '').trim();

  const publicPrice = readPublicPrice(formData, 'public_price');
  const promotionalPrice = readPublicPrice(formData, 'promotional_price');
  const promotionEnabled = formData.get('promotion_enabled') === 'on';
  if (promotionEnabled && getNurseryPricing(publicPrice, promotionalPrice, true)?.previous == null) {
    throw new Error('El precio promocional debe ser menor que el precio normal.');
  }

  const payload = {
    public_price: publicPrice,
    promotional_price: promotionalPrice,
    promotion_enabled: promotionEnabled,
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
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/plantas');
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
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/plantas');
}
