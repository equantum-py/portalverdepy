'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const bannerSchema = z.object({
  key: z.enum(['service-banner-irrigation', 'service-banner-maintenance']),
  title: z.string().trim().min(3, 'Escribí un título.'),
  isActive: z.boolean(),
  link: z.string().trim().min(1, 'Agregá el enlace de WhatsApp.'),
  desktopUrl: z.string(),
  desktopPath: z.string(),
  mobileUrl: z.string(),
  mobilePath: z.string()
});

export type ServiceBannerInput = z.infer<typeof bannerSchema>;

export async function saveServiceBannerAction(input: ServiceBannerInput) {
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? 'Revisá los campos.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Tu sesión venció. Volvé a iniciar sesión.' };

  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', user.id).single();
  if (profile?.role !== 'admin' || !profile.is_active) return { success: false, message: 'No tenés permisos para guardar.' };

  const value = parsed.data;
  const { error } = await supabase.from('home_sections_config').upsert({
    section_key: value.key,
    title: value.title,
    sort_order: 3,
    is_active: value.isActive,
    section_type: 'standard',
    category_slug: value.link,
    banner_desktop_url: value.desktopUrl || null,
    banner_desktop_path: value.desktopPath || null,
    banner_mobile_url: value.mobileUrl || null,
    banner_mobile_path: value.mobilePath || null,
    product_limit: 4,
    show_view_all: false,
    mobile_columns: 2,
    mobile_swipe: false,
    mobile_show_progress: false
  }, { onConflict: 'section_key' });

  if (error) return { success: false, message: `No se pudo guardar: ${error.message}` };
  revalidatePath('/');
  revalidatePath('/admin/banners-servicios');
  revalidatePath('/admin/pagina-inicio');
  return { success: true, message: 'Banner guardado correctamente.' };
}
