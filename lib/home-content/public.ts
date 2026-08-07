import { createClient } from '@/lib/supabase/server';

import type { HomeContentValues } from './schema';

type MegaProductRelation = {
  product_id: string;
  sort_order: number;
};

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
  heroMobileUrl: '/images/banners/slide-2-desktop.webp',
  heroMobilePath: '',
  heroAlt:
    'Servicio profesional de jardinería y mantenimiento de césped',
  heroAlignment: 'left',
  heroOverlay: true,
  heroOverlayIntensity: 75,

  servicesEnabled: true,
  servicesTitle:
    'Soluciones para transformar y mantener tus espacios verdes',
  servicesDescription:
    'Además de productos, ofrecemos servicios especializados en jardinería, césped y mantenimiento.',

  megaMenuEnabled: true,
  megaServicesTitle: 'Servicios Portal Verde',
  megaServicesDescription:
    'Una solución completa para tu espacio',

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

  tags: [
    'Empastado',
    'Jardinería',
    'Poda de árboles',
    'Mantenimiento',
  ].map((label, sortOrder) => ({
    label,
    icon: 'Leaf',
    sortOrder,
    isActive: true,
  })),

  megaColumns: [],

  megaServices: [
    {
      title: 'Instalación de césped',
      description:
        'Preparación e instalación profesional.',
      icon: 'Leaf',
      url: '/trabajos',
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
    ] = await Promise.all([
      supabase
        .from('home_page_settings')
        .select('*')
        .eq('id', true)
        .maybeSingle(),

      supabase
        .from('home_navigation_items')
        .select('*')
        .order('sort_order'),

      supabase
        .from('home_service_tags')
        .select('*')
        .order('sort_order'),

      supabase
        .from('home_mega_services')
        .select('*')
        .order('sort_order'),

      supabase
        .from('home_global_buttons')
        .select('*')
        .order('sort_order'),

      supabase
        .from('home_mega_columns')
        .select(
          `
            *,
            home_mega_products(
              product_id,
              sort_order
            )
          `,
        )
        .order('sort_order'),

      supabase
        .from('home_sections_config')
        .select('*')
        .order('sort_order'),
    ]);

    if (!settings.data) {
      return defaultHomeContent;
    }

    const values = settings.data;

    return {
      ...defaultHomeContent,

      promoEnabled:
        values.promo_enabled ??
        defaultHomeContent.promoEnabled,
      promoText:
        values.promo_text ??
        defaultHomeContent.promoText,
      promoIcon:
        values.promo_icon ??
        defaultHomeContent.promoIcon,
      promoUrl:
        values.promo_url ??
        defaultHomeContent.promoUrl,
      promoButtonText:
        values.promo_button_text ??
        defaultHomeContent.promoButtonText,
      promoScroll:
        values.promo_scroll ??
        defaultHomeContent.promoScroll,
      promoSpeed:
        values.promo_speed ??
        defaultHomeContent.promoSpeed,
      promoNewTab:
        values.promo_new_tab ??
        defaultHomeContent.promoNewTab,

      logoEnabled:
        values.logo_enabled ??
        defaultHomeContent.logoEnabled,
      logoDesktopUrl:
        values.logo_desktop_url ??
        defaultHomeContent.logoDesktopUrl,
      logoDesktopPath:
        values.logo_desktop_path ?? '',
      logoMobileUrl:
        values.logo_mobile_url ??
        defaultHomeContent.logoMobileUrl,
      logoMobilePath:
        values.logo_mobile_path ?? '',
      logoAlt:
        values.logo_alt ??
        defaultHomeContent.logoAlt,

      whatsappEnabled:
        values.whatsapp_enabled ??
        defaultHomeContent.whatsappEnabled,
      whatsappText:
        values.whatsapp_text ??
        defaultHomeContent.whatsappText,
      whatsappUrl:
        values.whatsapp_url ??
        defaultHomeContent.whatsappUrl,

      heroEnabled:
        values.hero_enabled ??
        defaultHomeContent.heroEnabled,
      heroTitle:
        values.hero_title ??
        defaultHomeContent.heroTitle,
      heroSubtitle:
        values.hero_subtitle ??
        defaultHomeContent.heroSubtitle,
      heroDescription:
        values.hero_description ??
        defaultHomeContent.heroDescription,
      heroDesktopUrl:
        values.hero_desktop_url ??
        defaultHomeContent.heroDesktopUrl,
      heroDesktopPath:
        values.hero_desktop_path ?? '',
      heroMobileUrl:
        values.hero_mobile_url ??
        defaultHomeContent.heroMobileUrl,
      heroMobilePath:
        values.hero_mobile_path ?? '',
      heroAlt:
        values.hero_alt ??
        defaultHomeContent.heroAlt,
      heroAlignment:
        values.hero_alignment ??
        defaultHomeContent.heroAlignment,
      heroOverlay:
        values.hero_overlay ??
        defaultHomeContent.heroOverlay,
      heroOverlayIntensity:
        values.hero_overlay_intensity ??
        defaultHomeContent.heroOverlayIntensity,

      servicesEnabled:
        values.services_enabled ??
        defaultHomeContent.servicesEnabled,
      servicesTitle:
        values.services_title ??
        defaultHomeContent.servicesTitle,
      servicesDescription:
        values.services_description ??
        defaultHomeContent.servicesDescription,

      megaMenuEnabled:
        values.mega_menu_enabled ??
        defaultHomeContent.megaMenuEnabled,
      megaServicesTitle:
        values.mega_services_title ??
        defaultHomeContent.megaServicesTitle,
      megaServicesDescription:
        values.mega_services_description ??
        defaultHomeContent.megaServicesDescription,

      navigation: (navigation.data ?? []).map((item) => ({
        name: item.name,
        url: item.url,
        linkType: item.link_type ?? 'internal',
        targetId: item.target_id ?? '',
        newTab: item.new_tab ?? false,
        sortOrder: item.sort_order,
        isActive: item.is_active,
      })),

      tags: (tags.data ?? []).map((item) => ({
        label: item.label,
        icon: item.icon ?? 'Leaf',
        sortOrder: item.sort_order,
        isActive: item.is_active,
      })),

      megaColumns: (columns.data ?? []).map((column) => {
        const relatedProducts = (
          column.home_mega_products ?? []
        ) as MegaProductRelation[];

        return {
          title: column.title,
          icon: column.icon,
          categoryId: column.category_id ?? '',
          viewAllLabel: column.view_all_label,
          viewAllUrl: column.view_all_url,
          sortOrder: column.sort_order,
          isActive: column.is_active,
          productIds: relatedProducts
            .sort(
              (first, second) =>
                first.sort_order - second.sort_order,
            )
            .map((product) => product.product_id),
        };
      }),

      megaServices: (services.data ?? []).map(
        (item) => ({
          title: item.title,
          description: item.description,
          icon: item.icon,
          url: item.url,
          sortOrder: item.sort_order,
          isActive: item.is_active,
        }),
      ),

      sections: (sections.data ?? []).map(
        (item) => ({
          key: item.section_key,
          title: item.title,
          sortOrder: item.sort_order,
          isActive: item.is_active,
        }),
      ),

      buttons: (buttons.data ?? []).map((item) => ({
        placement: item.placement,
        text: item.text,
        url: item.url,
        linkType: item.link_type,
        icon: item.icon,
        variant: item.variant,
        sortOrder: item.sort_order,
        isActive: item.is_active,
        newTab: item.new_tab,
      })),
    };
  } catch {
    return defaultHomeContent;
  }
}
