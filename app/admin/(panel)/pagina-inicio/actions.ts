"use server";

import { revalidatePath } from "next/cache";

import {
  homeContentSchema,
  type HomeContentValues,
} from "@/lib/home-content/schema";
import { createClient } from "@/lib/supabase/server";

export type HomeContentActionResult = {
  success: boolean;
  message: string;
};

type PreviousSettings = {
  logo_desktop_url: string | null;
  logo_desktop_path: string | null;
  logo_mobile_url: string | null;
  logo_mobile_path: string | null;
  hero_desktop_url: string | null;
  hero_desktop_path: string | null;
  hero_mobile_url: string | null;
  hero_mobile_path: string | null;
};

export async function saveHomeContentAction(
  input: HomeContentValues,
): Promise<HomeContentActionResult> {
  const parsed = homeContentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisá los campos marcados.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Tu sesión venció.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return {
      success: false,
      message: "No se pudo verificar tu perfil.",
    };
  }

  if (profile?.role !== "admin" || !profile.is_active) {
    return {
      success: false,
      message: "No tenés permisos.",
    };
  }

  const values = parsed.data;

  /*
   * Se leen las imágenes actuales antes del upsert.
   * Si el formulario llega con una URL o ruta vacía, se conserva
   * el valor existente para evitar borrar imágenes accidentalmente.
   */
  const {
    data: previousSettings,
    error: previousSettingsError,
  } = await supabase
    .from("home_page_settings")
    .select(
      [
        "logo_desktop_url",
        "logo_desktop_path",
        "logo_mobile_url",
        "logo_mobile_path",
        "hero_desktop_url",
        "hero_desktop_path",
        "hero_mobile_url",
        "hero_mobile_path",
      ].join(","),
    )
    .eq("id", true)
    .maybeSingle<PreviousSettings>();

  if (previousSettingsError) {
    return {
      success: false,
      message: previousSettingsError.message,
    };
  }

  const nextLogoDesktopUrl =
    values.logoDesktopUrl ||
    previousSettings?.logo_desktop_url ||
    null;

  const nextLogoDesktopPath =
    values.logoDesktopPath ||
    previousSettings?.logo_desktop_path ||
    null;

  const nextLogoMobileUrl =
    values.logoMobileUrl ||
    previousSettings?.logo_mobile_url ||
    null;

  const nextLogoMobilePath =
    values.logoMobilePath ||
    previousSettings?.logo_mobile_path ||
    null;

  const nextHeroDesktopUrl =
    values.heroDesktopUrl ||
    previousSettings?.hero_desktop_url ||
    null;

  const nextHeroDesktopPath =
    values.heroDesktopPath ||
    previousSettings?.hero_desktop_path ||
    null;

  const nextHeroMobileUrl =
    values.heroMobileUrl ||
    previousSettings?.hero_mobile_url ||
    null;

  const nextHeroMobilePath =
    values.heroMobilePath ||
    previousSettings?.hero_mobile_path ||
    null;

  const { error: settingsError } = await supabase
    .from("home_page_settings")
    .upsert({
      id: true,

      // Barra promocional
      promo_enabled: values.promoEnabled,
      promo_text: values.promoText,
      promo_icon: values.promoIcon,
      promo_url: values.promoUrl,
      promo_button_text: values.promoButtonText,
      promo_scroll: values.promoScroll,
      promo_speed: values.promoSpeed,
      promo_new_tab: values.promoNewTab,

      // Encabezado, logos y WhatsApp
      logo_enabled: values.logoEnabled,
      logo_desktop_url: nextLogoDesktopUrl,
      logo_desktop_path: nextLogoDesktopPath,
      logo_mobile_url: nextLogoMobileUrl,
      logo_mobile_path: nextLogoMobilePath,
      logo_alt: values.logoAlt,
      whatsapp_enabled: values.whatsappEnabled,
      whatsapp_text: values.whatsappText,
      whatsapp_url: values.whatsappUrl,

      // Portada principal
      hero_enabled: values.heroEnabled,
      hero_title: values.heroTitle,
      hero_subtitle: values.heroSubtitle,
      hero_description: values.heroDescription,
      hero_desktop_url: nextHeroDesktopUrl,
      hero_desktop_path: nextHeroDesktopPath,
      hero_mobile_url: nextHeroMobileUrl,
      hero_mobile_path: nextHeroMobilePath,
      hero_alt: values.heroAlt,
      hero_alignment: values.heroAlignment,
      hero_overlay: values.heroOverlay,
      hero_overlay_intensity: values.heroOverlayIntensity,
      hero_shadow_intensity: values.heroShadowIntensity,

      // Contenido superpuesto del Hero
      hero_content_enabled: values.heroContentEnabled,
      hero_content_desktop: values.heroContentDesktop,
      hero_content_mobile: values.heroContentMobile,
      hero_show_label: values.heroShowLabel,
      hero_show_title: values.heroShowTitle,
      hero_show_subtitle: values.heroShowSubtitle,
      hero_show_description: values.heroShowDescription,
      hero_show_price: values.heroShowPrice,
      hero_show_installation_badge:
        values.heroShowInstallationBadge,
      hero_show_primary_button:
        values.heroShowPrimaryButton,
      hero_show_secondary_button:
        values.heroShowSecondaryButton,
      hero_show_benefits: values.heroShowBenefits,

      // Servicios
      services_enabled: values.servicesEnabled,
      services_title: values.servicesTitle,
      services_description: values.servicesDescription,

      // Mega menú
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

  /*
   * Se reemplazan las relaciones configurables.
   * Primero se eliminan los registros anteriores.
   */
  const relationalTables = [
    "home_navigation_items",
    "home_service_tags",
    "home_mega_columns",
    "home_mega_services",
    "home_global_buttons",
  ] as const;

  for (const table of relationalTables) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .not("id", "is", null);

    if (deleteError) {
      return {
        success: false,
        message: deleteError.message,
      };
    }
  }

  if (values.navigation.length > 0) {
    const { error: navigationError } = await supabase
      .from("home_navigation_items")
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

    if (navigationError) {
      return {
        success: false,
        message: navigationError.message,
      };
    }
  }

  if (values.tags.length > 0) {
    const { error: tagsError } = await supabase
      .from("home_service_tags")
      .insert(
        values.tags.map((item) => ({
          label: item.label,
          icon: item.icon,
          sort_order: item.sortOrder,
          is_active: item.isActive,
        })),
      );

    if (tagsError) {
      return {
        success: false,
        message: tagsError.message,
      };
    }
  }

  if (values.megaServices.length > 0) {
    const { error: servicesError } = await supabase
      .from("home_mega_services")
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

    if (servicesError) {
      return {
        success: false,
        message: servicesError.message,
      };
    }
  }

  if (values.buttons.length > 0) {
    const { error: buttonsError } = await supabase
      .from("home_global_buttons")
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

    if (buttonsError) {
      return {
        success: false,
        message: buttonsError.message,
      };
    }
  }

  /*
   * Columnas del mega menú y productos vinculados.
   */
  for (const column of values.megaColumns) {
    const {
      data: createdColumn,
      error: columnError,
    } = await supabase
      .from("home_mega_columns")
      .insert({
        title: column.title,
        icon: column.icon,
        category_id: column.categoryId || null,
        view_all_label: column.viewAllLabel,
        view_all_url: column.viewAllUrl,
        sort_order: column.sortOrder,
        is_active: column.isActive,
      })
      .select("id")
      .single();

    if (columnError) {
      return {
        success: false,
        message: columnError.message,
      };
    }

    if (column.productIds.length > 0) {
      const { error: productsError } = await supabase
        .from("home_mega_products")
        .insert(
          column.productIds.map(
            (productId, sortOrder) => ({
              column_id: createdColumn.id,
              product_id: productId,
              sort_order: sortOrder,
            }),
          ),
        );

      if (productsError) {
        return {
          success: false,
          message: productsError.message,
        };
      }
    }
  }

  /*
   * Orden y estado de las secciones del Home.
   */
  for (const section of values.sections) {
    const { error: sectionError } = await supabase
      .from("home_sections_config")
      .upsert(
        {
          section_key: section.key,
          title: section.title,
          sort_order: section.sortOrder,
          is_active: section.isActive,
        },
        {
          onConflict: "section_key",
        },
      );

    if (sectionError) {
      return {
        success: false,
        message: sectionError.message,
      };
    }
  }

  /*
   * Limpieza segura de imágenes reemplazadas.
   * Solo se elimina una imagen anterior cuando existe una nueva ruta
   * diferente. Un valor vacío nunca provoca eliminación automática.
   */
  const replacedHeroPaths = [
    previousSettings?.hero_desktop_path &&
    nextHeroDesktopPath &&
    previousSettings.hero_desktop_path !==
      nextHeroDesktopPath
      ? previousSettings.hero_desktop_path
      : null,

    previousSettings?.hero_mobile_path &&
    nextHeroMobilePath &&
    previousSettings.hero_mobile_path !==
      nextHeroMobilePath
      ? previousSettings.hero_mobile_path
      : null,
  ].filter((path): path is string => Boolean(path));

  if (replacedHeroPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("home-content-images")
      .remove([...new Set(replacedHeroPaths)]);

    if (storageError) {
      return {
        success: false,
        message:
          `El contenido se guardó, pero no se pudieron eliminar las imágenes anteriores: ${storageError.message}`,
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pagina-inicio");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");

  return {
    success: true,
    message: "Contenido actualizado correctamente.",
  };
}