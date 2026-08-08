'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

type LogoSettingsInput = {
  enabled: boolean;
  desktopUrl: string;
  desktopPath: string;
  mobileUrl: string;
  mobilePath: string;
  alt: string;
};

export async function saveLogoSettingsAction(input: LogoSettingsInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Tu sesión venció.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role,is_active')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin' || !profile.is_active) {
    return { success: false, message: 'No tenés permisos.' };
  }

  if (!input.desktopUrl.trim()) {
    return {
      success: false,
      message: 'Adjuntá el logo para escritorio.',
    };
  }

  if (!input.mobileUrl.trim()) {
    return {
      success: false,
      message: 'Adjuntá el logo para móvil.',
    };
  }

  if (!input.alt.trim()) {
    return {
      success: false,
      message: 'Ingresá el texto alternativo del logo.',
    };
  }

  const { error } = await supabase
    .from('home_page_settings')
    .update({
      logo_enabled: input.enabled,
      logo_desktop_url: input.desktopUrl,
      logo_desktop_path: input.desktopPath || null,
      logo_mobile_url: input.mobileUrl,
      logo_mobile_path: input.mobilePath || null,
      logo_alt: input.alt.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', true);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/pagina-inicio');

  return {
    success: true,
    message: 'Logo actualizado correctamente.',
  };
}
