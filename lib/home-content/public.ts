import { createClient } from '@/lib/supabase/server';

import type { HomeContentValues } from './schema';


export const defaultHomeContent: HomeContentValues = {
  promoEnabled: true,
  promoText:
    'Césped Esmeralda desde Gs. 31.000 m² con instalación incluida',
  promoIcon: '🌱',
  promoUrl: 'https://wa.me/595981077600',
  promoButtonText: 'WhatsApp',
  promoScroll: true,
  promoSpeed: 24,
  promoNewTab: true,

  logoEnabled: true,
  logoDesktopUrl: '/images/logo-desktop.png',
  logoDesktopPath: '',
  logoMobileUrl: '/images/logo-mobile.png',
  logoMobilePath: '',
  logoAlt: 'Portal Verde',

  whatsappEnabled: true,
  whatsappText: 'Consultar por WhatsApp',
  whatsappUrl: 'https://wa.me/595981077600',

  heroEnabled: true,
  heroTitle:
    'Transformamos tu espacio en un jardín que se disfruta',
  heroSubtitle: 'Instalación profesional garantizada',
  heroDescription:
    'Venta e instalación de césped natural con asesoramiento profesional en Asunción y Gran Asunción.',
  heroDesktopUrl: '/images/banners/slide-2-desktop.webp',
  heroDesktopPath: '',
  heroMobileUrl: '/images/banners/slide-2-mobile.webp',
  heroMobilePath: '',
  heroAlt:
    'Servicio profesional de jardinería y mantenimiento de césped',
  heroAlignment: 'left',
  heroOverlay: true,
  heroOverlayIntensity: 75,

  // Controles visuales agregados por complete-product-management.
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
  carousel: {
    carouselEnabled: true,
    carouselAutoplay: true,
    carouselInterval: 5000,
    carouselManualNavigation: true,
    carouselShowArrows: true,
    carouselShowDots: true,
    carouselPauseOnHover: true,
    carouselLoop: true,
  },
  heroSlides: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Diapositiva principal",
      isActive: true,
      sortOrder: 0,
      desktopUrl: "/images/banners/slide-2-desktop.webp",
      desktopPath: "",
      mobileUrl: "/images/banners/slide-2-mobile.webp",
      mobilePath: "",
      altText: "Portal Verde",
      contentEnabled: true,
      contentDesktop: true,
      contentMobile: true,
      showLabel: true,
      label: "Instalación profesional garantizada",
      showTitle: true,
      title: "Transformamos tu espacio en un jardín que se disfruta",
      showSubtitle: true,
      subtitle: "Césped natural de primera calidad",
      showDescription: true,
      description:
        "Venta e instalación de césped natural con asesoramiento profesional en Asunción y Gran Asunción.",
      showPrice: true,
      priceText: "Gs. 31.000 m²",
      showInstallationBadge: true,
      installationBadgeText: "Instalación incluida",
      showPrimaryButton: true,
      primaryButtonText: "Solicitar presupuesto",
      primaryButtonUrl: "https://wa.me/595981077600",
      primaryButtonNewTab: true,
      showSecondaryButton: true,
      secondaryButtonText: "Ver catálogo",
      secondaryButtonUrl: "/shop",
      secondaryButtonNewTab: false,
      showBenefits: true,
      benefits: [
        "Asesoramiento personalizado",
        "Trabajo garantizado",
        "Atención profesional",
      ],
      alignment: "left",
      overlayEnabled: true,
      overlayIntensity: 75,
    },
  ],
  servicesEnabled: true,
  servicesTitle: "Soluciones para transformar y mantener tus espacios verdes",
  servicesDescription:
    "Además de productos, ofrecemos servicios especializados en jardinería, césped y mantenimiento.",
  megaMenuEnabled: true,
  megaServicesTitle: "Servicios Portal Verde",
  megaServicesDescription: "Una solución completa para tu espacio",
  navigation: [
    {
      name: 'Trabajos',
      url: '/trabajos',
      linkType: 'internal',
      targetId: '',
      newTab: false,
      sortOrder: 0,
      isActive: true,
    },
  ],
  tags: ["Empastado", "Jardinería", "Poda de árboles", "Mantenimiento"].map(
    (label, sortOrder) => ({
      label,
      icon: 'Leaf',
      sortOrder,
      isActive: true,
    }),
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
    {
      key: 'hero',
      title: 'Portada',
      sortOrder: 0,
      isActive: true,
    },
    {
      key: 'products-grass',
      title: 'Césped',
      sortOrder: 1,
      isActive: true,
    },
    {
      key: 'services',
      title: 'Servicios',
      sortOrder: 2,
      isActive: true,
    },
    {
      key: 'products-landscaping',
      title: 'Paisajismo',
      sortOrder: 3,
      isActive: true,
    },
  ],

  buttons: [
    {
      placement: 'services-primary',
      text: 'Solicitar servicio por WhatsApp',
      url: 'https://wa.me/595981077600',
      linkType: 'whatsapp',
      icon: 'WhatsApp',
      variant: 'primary',
      sortOrder: 0,
      isActive: true,
      newTab: true,
    },
    {
      placement: 'services-secondary',
      text: 'Ver productos',
      url: '/shop',
      linkType: 'internal',
      icon: '',
      variant: 'secondary',
      sortOrder: 1,
      isActive: true,
      newTab: false,
    },
    {
      placement: 'mega-work',
      text: 'Ver trabajos realizados',
      url: '/trabajos',
      linkType: 'internal',
      icon: '',
      variant: 'primary',
      sortOrder: 0,
      isActive: true,
      newTab: false,
    },
    {
      placement: 'mega-cta',
      text: 'Preparar presupuesto',
      url: '/cart',
      linkType: 'internal',
      icon: '',
      variant: 'link',
      sortOrder: 0,
      isActive: true,
      newTab: false,
    },
  ],
};

export async function getHomeContent(): Promise<HomeContentValues> {
  try {
    const supabase = await createClient();
    const [
      settings,
      navigation,
      tags,
      services,
      buttons,
      columns,
      sections,
      heroSlides,
    ] = await Promise.all([
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
      supabase.from("home_hero_slides").select("*").order("sort_order"),
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
      heroEnabled:
        s.hero_enabled ?? defaultHomeContent.heroEnabled,
      heroTitle:
        s.hero_title ?? defaultHomeContent.heroTitle,
      heroSubtitle:
        s.hero_subtitle ?? defaultHomeContent.heroSubtitle,
      heroDescription:
        s.hero_description ?? defaultHomeContent.heroDescription,
      heroAlt:
        s.hero_alt ?? defaultHomeContent.heroAlt,
      heroAlignment:
        s.hero_alignment ?? defaultHomeContent.heroAlignment,
      heroOverlay:
        s.hero_overlay ?? defaultHomeContent.heroOverlay,
      heroOverlayIntensity:
        s.hero_overlay_intensity ??
        defaultHomeContent.heroOverlayIntensity,
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
      carousel: {
        carouselEnabled: s.hero_carousel_enabled ?? true,
        carouselAutoplay: s.hero_carousel_autoplay ?? true,
        carouselInterval: s.hero_carousel_interval ?? 5000,
        carouselManualNavigation: s.hero_carousel_manual_navigation ?? true,
        carouselShowArrows: s.hero_carousel_show_arrows ?? true,
        carouselShowDots: s.hero_carousel_show_dots ?? true,
        carouselPauseOnHover: s.hero_carousel_pause_on_hover ?? true,
        carouselLoop: s.hero_carousel_loop ?? true,
      },
      heroSlides: heroSlides.data?.length
        ? heroSlides.data.map((slide) => ({
            id: slide.id,
            name: slide.name,
            isActive: slide.is_active,
            sortOrder: slide.sort_order,
            desktopUrl: slide.desktop_url ?? "",
            desktopPath: slide.desktop_path ?? "",
            mobileUrl: slide.mobile_url ?? "",
            mobilePath: slide.mobile_path ?? "",
            altText: slide.alt_text,
            contentEnabled: slide.content_enabled,
            contentDesktop: slide.content_desktop,
            contentMobile: slide.content_mobile,
            showLabel: slide.show_label,
            label: slide.label ?? "",
            showTitle: slide.show_title,
            title: slide.title ?? "",
            showSubtitle: slide.show_subtitle,
            subtitle: slide.subtitle ?? "",
            showDescription: slide.show_description,
            description: slide.description ?? "",
            showPrice: slide.show_price,
            priceText: slide.price_text ?? "",
            showInstallationBadge: slide.show_installation_badge,
            installationBadgeText: slide.installation_badge_text ?? "",
            showPrimaryButton: slide.show_primary_button,
            primaryButtonText: slide.primary_button_text ?? "",
            primaryButtonUrl: slide.primary_button_url ?? "",
            primaryButtonNewTab: slide.primary_button_new_tab,
            showSecondaryButton: slide.show_secondary_button,
            secondaryButtonText: slide.secondary_button_text ?? "",
            secondaryButtonUrl: slide.secondary_button_url ?? "",
            secondaryButtonNewTab: slide.secondary_button_new_tab,
            showBenefits: slide.show_benefits,
            benefits: Array.isArray(slide.benefits) ? slide.benefits : [],
            alignment: slide.alignment,
            overlayEnabled: slide.overlay_enabled,
            overlayIntensity: slide.overlay_intensity,
          }))
        : defaultHomeContent.heroSlides,
      promoEnabled: s.promo_enabled,
      promoText: s.promo_text,
      promoIcon: s.promo_icon,
      promoUrl: s.promo_url,
      promoButtonText: s.promo_button_text,
      promoScroll: s.promo_scroll,
      promoSpeed: s.promo_speed,
      promoNewTab: s.promo_new_tab,
      logoEnabled: s.logo_enabled,
      logoDesktopUrl:
        s.logo_desktop_url ?? defaultHomeContent.logoDesktopUrl,
      logoDesktopPath: s.logo_desktop_path ?? '',
      logoMobileUrl:
        s.logo_mobile_url ?? defaultHomeContent.logoMobileUrl,
      logoMobilePath: s.logo_mobile_path ?? '',
      logoAlt:
        s.logo_alt ?? defaultHomeContent.logoAlt,
      whatsappEnabled:
        s.whatsapp_enabled ?? defaultHomeContent.whatsappEnabled,
      whatsappText:
        s.whatsapp_text ?? defaultHomeContent.whatsappText,
      whatsappUrl:
        s.whatsapp_url ?? defaultHomeContent.whatsappUrl,
      servicesEnabled: s.services_enabled,
      servicesTitle: s.services_title,
      servicesDescription: s.services_description,
      megaMenuEnabled: s.mega_menu_enabled,
      megaServicesTitle: s.mega_services_title,
      megaServicesDescription: s.mega_services_description,
      navigation: (navigation.data ?? []).map((i) => ({
        name: i.name,
        url: i.url,
        linkType: i.link_type ?? 'internal',
        targetId: i.target_id ?? '',
        newTab: i.new_tab ?? false,
        sortOrder: i.sort_order,
        isActive: i.is_active,
      })),
      tags: (tags.data ?? []).map((i) => ({
        label: i.label,
        icon: i.icon ?? 'Leaf',
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
