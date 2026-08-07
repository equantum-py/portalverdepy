import { createClient } from "@/lib/supabase/server";
import type { HomeContentValues } from "./schema";

export const defaultHomeContent: HomeContentValues = {
  promoEnabled: true,
  promoText: "Césped Esmeralda desde Gs. 31.000 m² con instalación incluida",
  promoIcon: "🌱",
  promoUrl: "https://wa.me/595981077600",
  promoButtonText: "WhatsApp",
  promoScroll: true,
  promoSpeed: 24,
  promoNewTab: true,
  logoEnabled: true,
  logoDesktopUrl: "/images/logo-desktop.png",
  logoMobileUrl: "/images/logo-mobile.png",
  logoAlt: "Portal Verde",
  whatsappEnabled: true,
  heroDesktopUrl: "/images/banners/slide-2-desktop.webp",
  heroDesktopPath: "",
  heroMobileUrl: "/images/banners/slide-2-mobile.webp",
  heroMobilePath: "",
  heroShadowIntensity: 75,
  heroContentEnabled: true,
  heroContentDesktop: true,
  heroContentMobile: true,
  heroShowLabel: true,
  heroShowTitle: true,
  heroShowSubtitle: true,
  heroShowDescription: true,
  heroShowPrice: true,
  heroShowInstallationBadge: true,
  heroShowPrimaryButton: true,
  heroShowSecondaryButton: true,
  heroShowBenefits: true,
  servicesEnabled: true,
  servicesTitle: "Soluciones para transformar y mantener tus espacios verdes",
  servicesDescription:
    "Además de productos, ofrecemos servicios especializados en jardinería, césped y mantenimiento.",
  megaMenuEnabled: true,
  megaServicesTitle: "Servicios Portal Verde",
  megaServicesDescription: "Una solución completa para tu espacio",
  navigation: [
    { name: "Trabajos", url: "/trabajos", sortOrder: 0, isActive: true },
  ],
  tags: ["Empastado", "Jardinería", "Poda de árboles", "Mantenimiento"].map(
    (label, sortOrder) => ({ label, sortOrder, isActive: true }),
  ),
  megaColumns: [],
  megaServices: [
    {
      title: "Instalación de césped",
      description: "Preparación e instalación profesional.",
      icon: "Leaf",
      url: "/trabajos",
      sortOrder: 0,
      isActive: true,
    },
  ],
  sections: [
    { key: "hero", title: "Portada", sortOrder: 0, isActive: true },
    { key: "products-grass", title: "Césped", sortOrder: 1, isActive: true },
    { key: "services", title: "Servicios", sortOrder: 2, isActive: true },
    {
      key: "products-landscaping",
      title: "Paisajismo",
      sortOrder: 3,
      isActive: true,
    },
  ],
  buttons: [
    {
      placement: "services-primary",
      text: "Solicitar servicio por WhatsApp",
      url: "https://wa.me/595981077600",
      linkType: "whatsapp",
      icon: "WhatsApp",
      variant: "primary",
      sortOrder: 0,
      isActive: true,
      newTab: true,
    },
    {
      placement: "services-secondary",
      text: "Ver productos",
      url: "/shop",
      linkType: "internal",
      icon: "",
      variant: "secondary",
      sortOrder: 1,
      isActive: true,
      newTab: false,
    },
    {
      placement: "mega-work",
      text: "Ver trabajos realizados",
      url: "/trabajos",
      linkType: "internal",
      icon: "",
      variant: "primary",
      sortOrder: 0,
      isActive: true,
      newTab: false,
    },
    {
      placement: "mega-cta",
      text: "Preparar presupuesto",
      url: "/cart",
      linkType: "internal",
      icon: "",
      variant: "link",
      sortOrder: 0,
      isActive: true,
      newTab: false,
    },
  ],
};

export async function getHomeContent(): Promise<HomeContentValues> {
  try {
    const supabase = await createClient();
    const [settings, navigation, tags, services, buttons, columns, sections] =
      await Promise.all([
        supabase
          .from("home_page_settings")
          .select("*")
          .eq("id", true)
          .maybeSingle(),
        supabase.from("home_navigation_items").select("*").order("sort_order"),
        supabase.from("home_service_tags").select("*").order("sort_order"),
        supabase.from("home_mega_services").select("*").order("sort_order"),
        supabase.from("home_global_buttons").select("*").order("sort_order"),
        supabase
          .from("home_mega_columns")
          .select("*,home_mega_products(product_id,sort_order)")
          .order("sort_order"),
        supabase.from("home_sections_config").select("*").order("sort_order"),
      ]);
    if (!settings.data) return defaultHomeContent;
    const s = settings.data;
    return {
      ...defaultHomeContent,
      heroDesktopUrl: s.hero_desktop_url ?? defaultHomeContent.heroDesktopUrl,
      heroDesktopPath: s.hero_desktop_path ?? "",
      heroMobileUrl: s.hero_mobile_url ?? defaultHomeContent.heroMobileUrl,
      heroMobilePath: s.hero_mobile_path ?? "",
      heroShadowIntensity: s.hero_shadow_intensity ?? 75,
      heroContentEnabled: s.hero_content_enabled ?? true,
      heroContentDesktop: s.hero_content_desktop ?? true,
      heroContentMobile: s.hero_content_mobile ?? true,
      heroShowLabel: s.hero_show_label ?? true,
      heroShowTitle: s.hero_show_title ?? true,
      heroShowSubtitle: s.hero_show_subtitle ?? true,
      heroShowDescription: s.hero_show_description ?? true,
      heroShowPrice: s.hero_show_price ?? true,
      heroShowInstallationBadge: s.hero_show_installation_badge ?? true,
      heroShowPrimaryButton: s.hero_show_primary_button ?? true,
      heroShowSecondaryButton: s.hero_show_secondary_button ?? true,
      heroShowBenefits: s.hero_show_benefits ?? true,
      promoEnabled: s.promo_enabled,
      promoText: s.promo_text,
      promoIcon: s.promo_icon,
      promoUrl: s.promo_url,
      promoButtonText: s.promo_button_text,
      promoScroll: s.promo_scroll,
      promoSpeed: s.promo_speed,
      promoNewTab: s.promo_new_tab,
      logoEnabled: s.logo_enabled,
      logoDesktopUrl: s.logo_desktop_url,
      logoMobileUrl: s.logo_mobile_url,
      logoAlt: s.logo_alt,
      whatsappEnabled: s.whatsapp_enabled,
      servicesEnabled: s.services_enabled,
      servicesTitle: s.services_title,
      servicesDescription: s.services_description,
      megaMenuEnabled: s.mega_menu_enabled,
      megaServicesTitle: s.mega_services_title,
      megaServicesDescription: s.mega_services_description,
      navigation: (navigation.data ?? []).map((i) => ({
        name: i.name,
        url: i.url,
        sortOrder: i.sort_order,
        isActive: i.is_active,
      })),
      tags: (tags.data ?? []).map((i) => ({
        label: i.label,
        sortOrder: i.sort_order,
        isActive: i.is_active,
      })),
      megaColumns: (columns.data ?? []).map((i) => ({
        title: i.title,
        icon: i.icon,
        categoryId: i.category_id ?? "",
        viewAllLabel: i.view_all_label,
        viewAllUrl: i.view_all_url,
        sortOrder: i.sort_order,
        isActive: i.is_active,
        productIds: (i.home_mega_products ?? [])
          .sort(
            (a: { sort_order: number }, b: { sort_order: number }) =>
              a.sort_order - b.sort_order,
          )
          .map((p: { product_id: string }) => p.product_id),
      })),
      sections: (sections.data ?? []).map((i) => ({
        key: i.section_key,
        title: i.title,
        sortOrder: i.sort_order,
        isActive: i.is_active,
      })),
      megaServices: (services.data ?? []).map((i) => ({
        title: i.title,
        description: i.description,
        icon: i.icon,
        url: i.url,
        sortOrder: i.sort_order,
        isActive: i.is_active,
      })),
      buttons: (buttons.data ?? []).map((i) => ({
        placement: i.placement,
        text: i.text,
        url: i.url,
        linkType: i.link_type,
        icon: i.icon,
        variant: i.variant,
        sortOrder: i.sort_order,
        isActive: i.is_active,
        newTab: i.new_tab,
      })),
    };
  } catch {
    return defaultHomeContent;
  }
}
