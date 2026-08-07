import { z } from "zod";

export const heroCarouselSettingsSchema = z.object({
  carouselEnabled: z.boolean(),
  carouselAutoplay: z.boolean(),
  carouselInterval: z.number().int().min(3000).max(30000),
  carouselManualNavigation: z.boolean(),
  carouselShowArrows: z.boolean(),
  carouselShowDots: z.boolean(),
  carouselPauseOnHover: z.boolean(),
  carouselLoop: z.boolean(),
});

export const heroSlideSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1, "Ingresá un nombre interno."),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(0),
    desktopUrl: z.string(),
    desktopPath: z.string(),
    mobileUrl: z.string(),
    mobilePath: z.string(),
    altText: z.string().trim().min(1),
    contentEnabled: z.boolean(),
    contentDesktop: z.boolean(),
    contentMobile: z.boolean(),
    showLabel: z.boolean(),
    label: z.string(),
    showTitle: z.boolean(),
    title: z.string(),
    showSubtitle: z.boolean(),
    subtitle: z.string(),
    showDescription: z.boolean(),
    description: z.string(),
    showPrice: z.boolean(),
    priceText: z.string(),
    showInstallationBadge: z.boolean(),
    installationBadgeText: z.string(),
    showPrimaryButton: z.boolean(),
    primaryButtonText: z.string(),
    primaryButtonUrl: z.string(),
    primaryButtonNewTab: z.boolean(),
    showSecondaryButton: z.boolean(),
    secondaryButtonText: z.string(),
    secondaryButtonUrl: z.string(),
    secondaryButtonNewTab: z.boolean(),
    showBenefits: z.boolean(),
    benefits: z.array(z.string().trim().min(1)),
    alignment: z.enum(["left", "center", "right"]),
    overlayEnabled: z.boolean(),
    overlayIntensity: z.number().int().min(0).max(90),
  })
  .superRefine((value, context) => {
    if (value.showTitle && !value.title.trim())
      context.addIssue({
        code: "custom",
        path: ["title"],
        message: "El título es obligatorio cuando está visible.",
      });
    for (const [enabled, url, path] of [
      [value.showPrimaryButton, value.primaryButtonUrl, "primaryButtonUrl"],
      [value.showSecondaryButton, value.secondaryButtonUrl, "secondaryButtonUrl"],
    ] as const) {
      if (enabled && !/^(\/|#|https?:\/\/)/.test(url))
        context.addIssue({
          code: "custom",
          path: [path],
          message: "Ingresá un enlace válido.",
        });
    }
  });

export type HeroCarouselSettings = z.infer<typeof heroCarouselSettingsSchema>;
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroSlideFormValues = HeroSlide;
