'use server';

import { revalidatePath } from 'next/cache';

import {
  homeContentSchema,
  type HomeContentValues,
} from '@/lib/home-content/schema';
import { createClient } from '@/lib/supabase/server';

export type HomeContentActionResult = {
  success: boolean;
  message: string;
};

export async function saveHomeContentAction(
  input: HomeContentValues,
): Promise<HomeContentActionResult> {
  const parsed = homeContentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Revisá los campos marcados.',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: 'Tu sesión venció.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return {
      success: false,
      message: 'No se pudo verificar tu perfil.',
    };
  }

  if (profile?.role !== 'admin' || !profile.is_active) {
    return {
      success: false,
      message: 'No tenés permisos.',
    };
  }

  const values = parsed.data;

  const { data: currentSettings } = await supabase
    .from('home_page_settings')
    .select(
      `
        logo_desktop_path,
        logo_mobile_path,
        hero_desktop_path,
        hero_mobile_path
      `,
    )
    .eq('id', true)
    .maybeSingle();

  const { error: settingsError } = await supabase
    .from('home_page_settings')
    .upsert({
      id: true,

      promo_enabled: values.promoEnabled,
      promo_text: values.promoText,
      promo_icon: values.promoIcon,
      promo_url: values.promoUrl,
      promo_button_text: values.promoButtonText,
      promo_scroll: values.promoScroll,
      promo_speed: values.promoSpeed,
      promo_new_tab: values.promoNewTab,

      logo_enabled: values.logoEnabled,
      logo_desktop_url: values.logoDesktopUrl,
      logo_desktop_path: values.logoDesktopPath || null,
      logo_mobile_url: values.logoMobileUrl,
      logo_mobile_path: values.logoMobilePath || null,
      logo_alt: values.logoAlt,

      whatsapp_enabled: values.whatsappEnabled,
      whatsapp_text: values.whatsappText,
      whatsapp_url: values.whatsappUrl,

      hero_enabled: values.heroEnabled,
      hero_title: values.heroTitle,
      hero_subtitle: values.heroSubtitle,
      hero_description: values.heroDescription,
      hero_desktop_url: values.heroDesktopUrl,
      hero_desktop_path: values.heroDesktopPath || null,
      hero_mobile_url: values.heroMobileUrl,
      hero_mobile_path: values.heroMobilePath || null,
      hero_alt: values.heroAlt,
      hero_alignment: values.heroAlignment,
      hero_overlay: values.heroOverlay,
      hero_overlay_intensity: values.heroOverlayIntensity,

      services_enabled: values.servicesEnabled,
      services_title: values.servicesTitle,
      services_description: values.servicesDescription,

      mega_menu_enabled: values.megaMenuEnabled,
      mega_services_title: values.megaServicesTitle,
      mega_services_description:
        values.megaServicesDescription,

      updated_at: new Date().toISOString(),
    });

  if (settingsError) {
    return {
      success: false,
      message: settingsError.message,
    };
  }

  const relationalTables = [
    'home_navigation_items',
    'home_service_tags',
    'home_mega_columns',
    'home_mega_services',
    'home_global_buttons',
  ] as const;

  for (const table of relationalTables) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      return {
        success: false,
        message: deleteError.message,
      };
    }
  }

  if (values.navigation.length) {
    const { error } = await supabase
      .from('home_navigation_items')
      .insert(
        values.navigation.map((item) => ({
          name: item.name,
          url: item.url,
          link_type: item.linkType,
          target_id: item.targetId || null,
          new_tab: item.newTab,
          sort_order: item.sortOrder,
          is_active: item.isActive,
        })),
      );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  if (values.tags.length) {
    const { error } = await supabase
      .from('home_service_tags')
      .insert(
        values.tags.map((item) => ({
          label: item.label,
          icon: item.icon,
          sort_order: item.sortOrder,
          is_active: item.isActive,
        })),
      );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  if (values.megaServices.length) {
    const { error } = await supabase
      .from('home_mega_services')
      .insert(
        values.megaServices.map((item) => ({
          title: item.title,
          description: item.description,
          icon: item.icon,
          url: item.url,
          sort_order: item.sortOrder,
          is_active: item.isActive,
        })),
      );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  if (values.buttons.length) {
    const { error } = await supabase
      .from('home_global_buttons')
      .insert(
        values.buttons.map((item) => ({
          placement: item.placement,
          text: item.text,
          url: item.url,
          link_type: item.linkType,
          icon: item.icon,
          variant: item.variant,
          sort_order: item.sortOrder,
          is_active: item.isActive,
          new_tab: item.newTab,
        })),
      );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  for (const column of values.megaColumns) {
    const { data, error: columnError } = await supabase
      .from('home_mega_columns')
      .insert({
        title: column.title,
        icon: column.icon,
        category_id: column.categoryId || null,
        view_all_label: column.viewAllLabel,
        view_all_url: column.viewAllUrl,
        sort_order: column.sortOrder,
        is_active: column.isActive,
      })
      .select('id')
      .single();

    if (columnError) {
      return {
        success: false,
        message: columnError.message,
      };
    }

    if (column.productIds.length) {
      const { error: productsError } = await supabase
        .from('home_mega_products')
        .insert(
          column.productIds.map((productId, sortOrder) => ({
            column_id: data.id,
            product_id: productId,
            sort_order: sortOrder,
          })),
        );

      if (productsError) {
        return {
          success: false,
          message: productsError.message,
        };
      }
    }
  }

  for (const section of values.sections) {
    const { error: sectionError } = await supabase
      .from('home_sections_config')
      .upsert({
        section_key: section.key,
        title: section.title,
        sort_order: section.sortOrder,
        is_active: section.isActive,
      });

    if (sectionError) {
      return {
        success: false,
        message: sectionError.message,
      };
    }
  }

  const retainedPaths = new Set(
    [
      values.logoDesktopPath,
      values.logoMobilePath,
      values.heroDesktopPath,
      values.heroMobilePath,
    ].filter((path): path is string => Boolean(path)),
  );

  const removedPaths = currentSettings
    ? [
        currentSettings.logo_desktop_path,
        currentSettings.logo_mobile_path,
        currentSettings.hero_desktop_path,
        currentSettings.hero_mobile_path,
      ].filter(
        (path): path is string =>
          Boolean(path) && !retainedPaths.has(path),
      )
    : [];

  if (removedPaths.length) {
    const { error: storageError } = await supabase.storage
      .from('home-content-images')
      .remove(removedPaths);

    if (storageError) {
      return {
        success: false,
        message:
          'El contenido se guardó, pero no se pudieron eliminar algunas imágenes anteriores.',
      };
    }
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/pagina-inicio');

  return {
    success: true,
    message: 'Contenido actualizado correctamente.',
  };
}