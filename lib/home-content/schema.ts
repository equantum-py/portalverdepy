import { z } from 'zod';

import {
  heroCarouselSettingsSchema,
  heroSlideSchema,
} from './hero-schema';

const navigationItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.'),
  url: z
    .string()
    .trim()
    .min(1, 'La URL es obligatoria.'),
  linkType: z.enum([
    'internal',
    'category',
    'product',
    'whatsapp',
    'external',
  ]),
  targetId: z.string(),
  newTab: z.boolean(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

const serviceTagSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'El texto es obligatorio.'),
  icon: z.string(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

const megaColumnSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio.'),
  icon: z.string(),
  categoryId: z.string(),
  viewAllLabel: z.string(),
  viewAllUrl: z.string(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  productIds: z.array(z.string()),
});

const megaServiceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio.'),
  description: z.string().trim(),
  icon: z.string(),
  url: z
    .string()
    .trim()
    .min(1, 'La URL es obligatoria.'),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

const globalButtonSchema = z.object({
  placement: z.string(),
  text: z
    .string()
    .trim()
    .min(1, 'El texto del botón es obligatorio.'),
  url: z
    .string()
    .trim()
    .min(1, 'La URL es obligatoria.'),
  linkType: z.enum([
    'internal',
    'external',
    'whatsapp',
    'anchor',
  ]),
  icon: z.string(),
  variant: z.string(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  newTab: z.boolean(),
});

const homeSectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const homeContentSchema = z.object({
  promoEnabled: z.boolean(),
  promoText: z
    .string()
    .trim()
    .min(1, 'El texto promocional es obligatorio.'),
  promoIcon: z.string().max(20),
  promoUrl: z.string(),
  promoButtonText: z.string(),
  promoScroll: z.boolean(),
  promoSpeed: z.number().int().min(5).max(120),
  promoNewTab: z.boolean(),

  logoEnabled: z.boolean(),
  logoDesktopUrl: z
    .string()
    .min(1, 'El logo de escritorio es obligatorio.'),
  logoDesktopPath: z.string(),
  logoMobileUrl: z
    .string()
    .min(1, 'El logo móvil es obligatorio.'),
  logoMobilePath: z.string(),
  logoAlt: z
    .string()
    .min(1, 'El texto alternativo es obligatorio.'),

  whatsappEnabled: z.boolean(),
  whatsappText: z.string(),
  whatsappUrl: z.string(),

  heroEnabled: z.boolean(),
  heroTitle: z
    .string()
    .min(1, 'El título de la portada es obligatorio.'),
  heroSubtitle: z.string(),
  heroDescription: z.string(),
  heroDesktopUrl: z.string(),
  heroDesktopPath: z.string(),
  heroMobileUrl: z.string(),
  heroMobilePath: z.string(),
  heroAlt: z.string(),
  heroAlignment: z.enum([
    'left',
    'center',
    'right',
  ]),
  heroOverlay: z.boolean(),
  heroOverlayIntensity: z
    .number()
    .int()
    .min(0)
    .max(90),
  heroShadowIntensity: z
    .number()
    .int()
    .min(0)
    .max(100),
  heroContentEnabled: z.boolean(),
  heroContentDesktop: z.boolean(),
  heroContentMobile: z.boolean(),
  heroShowLabel: z.boolean(),
  heroShowTitle: z.boolean(),
  heroShowSubtitle: z.boolean(),
  heroShowDescription: z.boolean(),
  heroShowPrice: z.boolean(),
  heroShowInstallationBadge: z.boolean(),
  heroShowPrimaryButton: z.boolean(),
  heroShowSecondaryButton: z.boolean(),
  heroShowBenefits: z.boolean(),

  carousel: heroCarouselSettingsSchema,
  heroSlides: z.array(heroSlideSchema),

  servicesEnabled: z.boolean(),
  servicesTitle: z
    .string()
    .min(1, 'El título de servicios es obligatorio.'),
  servicesDescription: z.string(),

  megaMenuEnabled: z.boolean(),
  megaServicesTitle: z.string(),
  megaServicesDescription: z.string(),

  navigation: z.array(navigationItemSchema),
  tags: z.array(serviceTagSchema),
  megaColumns: z.array(megaColumnSchema),
  megaServices: z.array(megaServiceSchema),
  buttons: z.array(globalButtonSchema),
  sections: z.array(homeSectionSchema),
});

export type HomeContentValues = z.infer<
  typeof homeContentSchema
>;
