"use server";
import { revalidatePath } from "next/cache";
import {
  homeContentSchema,
  type HomeContentValues,
} from "@/lib/home-content/schema";
import { createClient } from "@/lib/supabase/server";
import {
  heroCarouselSettingsSchema,
  heroSlideSchema,
  type HeroCarouselSettings,
  type HeroSlide,
} from "@/lib/home-content/hero-schema";

export async function saveHomeContentAction(input: HomeContentValues) {
  const parsed = homeContentSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revisá los campos marcados." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Tu sesión venció." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin" || !profile.is_active)
    return { success: false, message: "No tenés permisos." };
  const v = parsed.data;
  const { data: previousSettings, error: previousSettingsError } =
    await supabase
      .from("home_page_settings")
      .select(
        "hero_desktop_url,hero_desktop_path,hero_mobile_url,hero_mobile_path",
      )
      .eq("id", true)
      .maybeSingle();
  if (previousSettingsError)
    return { success: false, message: previousSettingsError.message };

  const { error } = await supabase.from("home_page_settings").upsert({
    id: true,
    hero_desktop_url:
      v.heroDesktopUrl || previousSettings?.hero_desktop_url || null,
    hero_desktop_path:
      v.heroDesktopPath || previousSettings?.hero_desktop_path || null,
    hero_mobile_url:
      v.heroMobileUrl || previousSettings?.hero_mobile_url || null,
    hero_mobile_path:
      v.heroMobilePath || previousSettings?.hero_mobile_path || null,
    hero_shadow_intensity: v.heroShadowIntensity,
    hero_enabled: v.heroEnabled,
    hero_content_enabled: v.heroContentEnabled,
    hero_content_desktop: v.heroContentDesktop,
    hero_content_mobile: v.heroContentMobile,
    hero_show_label: v.heroShowLabel,
    hero_show_title: v.heroShowTitle,
    hero_show_subtitle: v.heroShowSubtitle,
    hero_show_description: v.heroShowDescription,
    hero_show_price: v.heroShowPrice,
    hero_show_installation_badge: v.heroShowInstallationBadge,
    hero_show_primary_button: v.heroShowPrimaryButton,
    hero_show_secondary_button: v.heroShowSecondaryButton,
    hero_show_benefits: v.heroShowBenefits,
    promo_enabled: v.promoEnabled,
    promo_text: v.promoText,
    promo_icon: v.promoIcon,
    promo_url: v.promoUrl,
    promo_button_text: v.promoButtonText,
    promo_scroll: v.promoScroll,
    promo_speed: v.promoSpeed,
    promo_new_tab: v.promoNewTab,
    logo_enabled: v.logoEnabled,
    logo_desktop_url: v.logoDesktopUrl,
    logo_mobile_url: v.logoMobileUrl,
    logo_alt: v.logoAlt,
    whatsapp_enabled: v.whatsappEnabled,
    services_enabled: v.servicesEnabled,
    services_title: v.servicesTitle,
    services_description: v.servicesDescription,
    mega_menu_enabled: v.megaMenuEnabled,
    mega_services_title: v.megaServicesTitle,
    mega_services_description: v.megaServicesDescription,
    updated_at: new Date().toISOString(),
  });
  if (error) return { success: false, message: error.message };
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
    if (deleteError) return { success: false, message: deleteError.message };
  }
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
      const { error: relationError } = await operation;
      if (relationError)
        return { success: false, message: relationError.message };
    }
  }
  for (const column of v.megaColumns) {
    const { data, error: columnError } = await supabase
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
    if (columnError) return { success: false, message: columnError.message };
    if (column.productIds.length) {
      const { error: productsError } = await supabase
        .from("home_mega_products")
        .insert(
          column.productIds.map((productId, sortOrder) => ({
            column_id: data.id,
            product_id: productId,
            sort_order: sortOrder,
          })),
        );
      if (productsError)
        return { success: false, message: productsError.message };
    }
  }
  for (const section of v.sections) {
    const { error: sectionError } = await supabase
      .from("home_sections_config")
      .upsert({
        section_key: section.key,
        title: section.title,
        sort_order: section.sortOrder,
        is_active: section.isActive,
      });
    if (sectionError) return { success: false, message: sectionError.message };
  }
  revalidatePath("/");
  revalidatePath("/admin/pagina-inicio");
  return { success: true, message: "Contenido actualizado correctamente." };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión venció." } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin" || !profile.is_active)
    return { error: "No tenés permisos." } as const;
  return { supabase } as const;
}

function slideRow(slide: HeroSlide) {
  return {
    name: slide.name,
    is_active: slide.isActive,
    sort_order: slide.sortOrder,
    desktop_url: slide.desktopUrl || null,
    desktop_path: slide.desktopPath || null,
    mobile_url: slide.mobileUrl || null,
    mobile_path: slide.mobilePath || null,
    alt_text: slide.altText,
    content_enabled: slide.contentEnabled,
    content_desktop: slide.contentDesktop,
    content_mobile: slide.contentMobile,
    show_label: slide.showLabel,
    label: slide.label || null,
    show_title: slide.showTitle,
    title: slide.title || null,
    show_subtitle: slide.showSubtitle,
    subtitle: slide.subtitle || null,
    show_description: slide.showDescription,
    description: slide.description || null,
    show_price: slide.showPrice,
    price_text: slide.priceText || null,
    show_installation_badge: slide.showInstallationBadge,
    installation_badge_text: slide.installationBadgeText || null,
    show_primary_button: slide.showPrimaryButton,
    primary_button_text: slide.primaryButtonText || null,
    primary_button_url: slide.primaryButtonUrl || null,
    primary_button_new_tab: slide.primaryButtonNewTab,
    show_secondary_button: slide.showSecondaryButton,
    secondary_button_text: slide.secondaryButtonText || null,
    secondary_button_url: slide.secondaryButtonUrl || null,
    secondary_button_new_tab: slide.secondaryButtonNewTab,
    show_benefits: slide.showBenefits,
    benefits: slide.benefits,
    alignment: slide.alignment,
    overlay_enabled: slide.overlayEnabled,
    overlay_intensity: slide.overlayIntensity,
    updated_at: new Date().toISOString(),
  };
}

function refreshHero() {
  revalidatePath("/");
  revalidatePath("/admin/pagina-inicio");
}

export async function createHeroSlideAction(input: HeroSlide) {
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Revisá la diapositiva.",
    };
  const auth = await requireAdmin();
  if ("error" in auth) return { success: false, message: auth.error };
  const { data, error } = await auth.supabase
    .from("home_hero_slides")
    .insert({ id: parsed.data.id, ...slideRow(parsed.data) })
    .select("id")
    .single();
  if (error) return { success: false, message: error.message };
  refreshHero();
  return { success: true, id: data.id, message: "Diapositiva creada." };
}

export async function updateHeroSlideAction(input: HeroSlide) {
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Revisá la diapositiva.",
    };
  const auth = await requireAdmin();
  if ("error" in auth) return { success: false, message: auth.error };
  const { data: previous } = await auth.supabase
    .from("home_hero_slides")
    .select("desktop_path,mobile_path")
    .eq("id", parsed.data.id)
    .single();
  const { error } = await auth.supabase
    .from("home_hero_slides")
    .update(slideRow(parsed.data))
    .eq("id", parsed.data.id);
  if (error) return { success: false, message: error.message };
  const replacedPaths = [
    previous?.desktop_path !== parsed.data.desktopPath
      ? previous?.desktop_path
      : null,
    previous?.mobile_path !== parsed.data.mobilePath
      ? previous?.mobile_path
      : null,
  ].filter(Boolean) as string[];
  if (replacedPaths.length) {
    const { data: references } = await auth.supabase
      .from("home_hero_slides")
      .select("desktop_path,mobile_path");
    const usedPaths = new Set(
      (references ?? [])
        .flatMap((slide) => [slide.desktop_path, slide.mobile_path])
        .filter(Boolean),
    );
    const unusedPaths = replacedPaths.filter((path) => !usedPaths.has(path));
    if (unusedPaths.length)
      await auth.supabase.storage
        .from("home-content-images")
        .remove(unusedPaths);
  }
  refreshHero();
  return { success: true, message: "Diapositiva guardada." };
}

export async function deleteHeroSlideAction(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { success: false, message: auth.error };
  const { data: slide, error: readError } = await auth.supabase
    .from("home_hero_slides")
    .select("desktop_path,mobile_path")
    .eq("id", id)
    .single();
  if (readError) return { success: false, message: readError.message };
  const { error } = await auth.supabase
    .from("home_hero_slides")
    .delete()
    .eq("id", id);
  if (error) return { success: false, message: error.message };
  const deletedPaths = [slide.desktop_path, slide.mobile_path].filter(
    Boolean,
  ) as string[];
  if (deletedPaths.length) {
    const { data: references } = await auth.supabase
      .from("home_hero_slides")
      .select("desktop_path,mobile_path");
    const usedPaths = new Set(
      (references ?? [])
        .flatMap((item) => [item.desktop_path, item.mobile_path])
        .filter(Boolean),
    );
    const unusedPaths = deletedPaths.filter((path) => !usedPaths.has(path));
    if (unusedPaths.length)
      await auth.supabase.storage
        .from("home-content-images")
        .remove(unusedPaths);
  }
  refreshHero();
  return { success: true, message: "Diapositiva eliminada." };
}

export async function reorderHeroSlidesAction(
  items: { id: string; sortOrder: number }[],
) {
  const auth = await requireAdmin();
  if ("error" in auth) return { success: false, message: auth.error };
  for (const item of items) {
    if (!Number.isInteger(item.sortOrder) || item.sortOrder < 0)
      return { success: false, message: "El orden no es válido." };
    const { error } = await auth.supabase
      .from("home_hero_slides")
      .update({ sort_order: item.sortOrder })
      .eq("id", item.id);
    if (error) return { success: false, message: error.message };
  }
  refreshHero();
  return { success: true, message: "Orden actualizado." };
}

export async function saveHeroCarouselSettingsAction(
  input: HeroCarouselSettings,
) {
  const parsed = heroCarouselSettingsSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: "El intervalo debe estar entre 3 y 30 segundos.",
    };
  const auth = await requireAdmin();
  if ("error" in auth) return { success: false, message: auth.error };
  const v = parsed.data;
  const { error } = await auth.supabase
    .from("home_page_settings")
    .update({
      hero_carousel_enabled: v.carouselEnabled,
      hero_carousel_autoplay: v.carouselAutoplay,
      hero_carousel_interval: v.carouselInterval,
      hero_carousel_manual_navigation: v.carouselManualNavigation,
      hero_carousel_show_arrows: v.carouselShowArrows,
      hero_carousel_show_dots: v.carouselShowDots,
      hero_carousel_pause_on_hover: v.carouselPauseOnHover,
      hero_carousel_loop: v.carouselLoop,
    })
    .eq("id", true);
  if (error) return { success: false, message: error.message };
  refreshHero();
  return { success: true, message: "Configuración del carrusel guardada." };
}
