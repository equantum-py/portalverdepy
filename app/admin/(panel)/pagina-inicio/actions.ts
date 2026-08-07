"use server";

import { revalidatePath } from "next/cache";
import {
  homeContentSchema,
  type HomeContentValues,
} from "@/lib/home-content/schema";
import { createClient } from "@/lib/supabase/server";

export async function saveHomeContentAction(input: HomeContentValues) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" || !profile.is_active) {
    return {
      success: false,
      message: "No tenés permisos.",
    };
  }

  const v = parsed.data;

  // Guardamos las rutas anteriores para poder eliminar
  // del Storage las imágenes reemplazadas.
  const { data: previousSettings } = await supabase
    .from("home_page_settings")
    .select("hero_desktop_path,hero_mobile_path")
    .eq("id", true)
    .maybeSingle();

  const { error } = await supabase
    .from("home_page_settings")
    .upsert({
      id: true,

      // Barra promocional
      promo_enabled: v.promoEnabled,
      promo_text: v.promoText,
      promo_icon: v.promoIcon,
      promo_url: v.promoUrl,
      promo_button_text: v.promoButtonText,
      promo_scroll: v.promoScroll,
      promo_speed: v.promoSpeed,
      promo_new_tab: v.promoNewTab,

      // Logo
      logo_enabled: v.logoEnabled,
      logo_desktop_url: v.logoDesktopUrl,
      logo_mobile_url: v.logoMobileUrl,
      logo_alt: v.logoAlt,

      // WhatsApp
      whatsapp_enabled: v.whatsappEnabled,

      // Hero general
      hero_enabled: v.heroEnabled,
      hero_title: v.heroTitle,
      hero_subtitle: v.heroSubtitle,
      hero_description: v.heroDescription,

      hero_desktop_url: v.heroDesktopUrl,
      hero_desktop_path: v.heroDesktopPath,
      hero_mobile_url: v.heroMobileUrl,
      hero_mobile_path: v.heroMobilePath,

      hero_alt: v.heroAlt,
      hero_alignment: v.heroAlignment,
      hero_overlay: v.heroOverlay,
      hero_overlay_intensity: v.heroOverlayIntensity,

      // Nueva configuración del contenido visual del Hero
      hero_shadow_intensity: v.heroShadowIntensity,
      hero_content_enabled: v.heroContentEnabled,
      hero_content_desktop: v.heroContentDesktop,
      hero_content_mobile: v.heroContentMobile,

      hero_show_label: v.heroShowLabel,
      hero_show_title: v.heroShowTitle,
      hero_show_subtitle: v.heroShowSubtitle,
      hero_show_description: v.heroShowDescription,
      hero_show_price: v.heroShowPrice,
      hero_show_installation_badge:
        v.heroShowInstallationBadge,
      hero_show_primary_button:
        v.heroShowPrimaryButton,
      hero_show_secondary_button:
        v.heroShowSecondaryButton,
      hero_show_benefits: v.heroShowBenefits,

      // Servicios
      services_enabled: v.servicesEnabled,
      services_title: v.servicesTitle,
      services_description: v.servicesDescription,

      // Mega menú
      mega_menu_enabled: v.megaMenuEnabled,
      mega_services_title: v.megaServicesTitle,
      mega_services_description:
        v.megaServicesDescription,

      updated_at: new Date().toISOString(),
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  // Limpiar relaciones actuales
  for (const table of [
    "home_navigation_items",
    "home_service_tags",
    "home_mega_columns",
    "home_mega_services",
    "home_global_buttons",
  ] as const) {
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

  // Navegación, etiquetas, servicios y botones
  const operations = [
    v.navigation.length &&
      supabase.from("home_navigation_items").insert(
        v.navigation.map((i) => ({
          name: i.name,
          url: i.url,
          sort_order: i.sortOrder,
          is_active: i.isActive,
        })),
      ),

    v.tags.length &&
      supabase.from("home_service_tags").insert(
        v.tags.map((i) => ({
          label: i.label,
          sort_order: i.sortOrder,
          is_active: i.isActive,
        })),
      ),

    v.megaServices.length &&
      supabase.from("home_mega_services").insert(
        v.megaServices.map((i) => ({
          title: i.title,
          description: i.description,
          icon: i.icon,
          url: i.url,
          sort_order: i.sortOrder,
          is_active: i.isActive,
        })),
      ),

    v.buttons.length &&
      supabase.from("home_global_buttons").insert(
        v.buttons.map((i) => ({
          placement: i.placement,
          text: i.text,
          url: i.url,
          link_type: i.linkType,
          icon: i.icon,
          variant: i.variant,
          sort_order: i.sortOrder,
          is_active: i.isActive,
          new_tab: i.newTab,
        })),
      ),
  ];

  for (const operation of operations) {
    if (operation) {
      const { error: relationError } =
        await operation;

      if (relationError) {
        return {
          success: false,
          message: relationError.message,
        };
      }
    }
  }

  // Columnas del mega menú
  for (const column of v.megaColumns) {
    const { data, error: columnError } =
      await supabase
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

    if (column.productIds.length) {
      const { error: productsError } =
        await supabase
          .from("home_mega_products")
          .insert(
            column.productIds.map(
              (productId, sortOrder) => ({
                column_id: data.id,
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

  // Configuración y orden de secciones
  for (const section of v.sections) {
    const { error: sectionError } =
      await supabase
        .from("home_sections_config")
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

  // Eliminar imágenes anteriores del Hero cuando fueron reemplazadas
  const activePaths = new Set(
    [v.heroDesktopPath, v.heroMobilePath].filter(Boolean),
  );

  const replacedPaths = [
    previousSettings?.hero_desktop_path,
    previousSettings?.hero_mobile_path,
  ].filter(
    (path): path is string =>
      Boolean(path) && !activePaths.has(path),
  );

  if (replacedPaths.length) {
    const { error: storageError } =
      await supabase.storage
        .from("home-content-images")
        .remove([...new Set(replacedPaths)]);

    if (storageError) {
      return {
        success: false,
        message:
          `El contenido se guardó, pero no se pudieron eliminar las imágenes anteriores: ${storageError.message}`,
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/pagina-inicio");

  return {
    success: true,
    message: "Contenido actualizado correctamente.",
  };
}