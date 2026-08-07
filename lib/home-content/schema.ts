import { z } from 'zod';

const orderedItem = z.object({ name: z.string().trim().min(1), url: z.string().trim().min(1), linkType:z.enum(['internal','category','product','whatsapp','external']), targetId:z.string(), newTab:z.boolean(), sortOrder: z.number().int().min(0), isActive: z.boolean() });
const serviceItem = z.object({ title: z.string().trim().min(1), description: z.string().trim(), icon: z.string(), url: z.string().trim().min(1), sortOrder: z.number().int().min(0), isActive: z.boolean() });
const button = z.object({ placement: z.string(), text: z.string().trim().min(1), url: z.string().trim().min(1), linkType: z.enum(['internal','external','whatsapp','anchor']), icon: z.string(), variant: z.string(), sortOrder: z.number().int().min(0), isActive: z.boolean(), newTab: z.boolean() });

export const homeContentSchema = z.object({
  promoEnabled: z.boolean(), promoText: z.string().trim().min(1), promoIcon: z.string().max(20), promoUrl: z.string(), promoButtonText: z.string(), promoScroll: z.boolean(), promoSpeed: z.number().int().min(5).max(120), promoNewTab: z.boolean(),
  logoEnabled: z.boolean(), logoDesktopUrl: z.string().min(1), logoDesktopPath:z.string(), logoMobileUrl: z.string().min(1), logoMobilePath:z.string(), logoAlt: z.string().min(1), whatsappEnabled: z.boolean(), whatsappText:z.string(), whatsappUrl:z.string(),
  heroEnabled:z.boolean(),heroTitle:z.string().min(1),heroSubtitle:z.string(),heroDescription:z.string(),heroDesktopUrl:z.string().min(1),heroDesktopPath:z.string(),heroMobileUrl:z.string().min(1),heroMobilePath:z.string(),heroAlt:z.string(),heroAlignment:z.enum(['left','center','right']),heroOverlay:z.boolean(),heroOverlayIntensity:z.number().int().min(0).max(90),
  servicesEnabled: z.boolean(), servicesTitle: z.string().min(1), servicesDescription: z.string(), megaMenuEnabled: z.boolean(), megaServicesTitle: z.string(), megaServicesDescription: z.string(),
  navigation: z.array(orderedItem), tags: z.array(z.object({ label: z.string().min(1), icon:z.string(), sortOrder: z.number().int().min(0), isActive: z.boolean() })),
  megaColumns: z.array(z.object({title:z.string().min(1),icon:z.string(),categoryId:z.string(),viewAllLabel:z.string(),viewAllUrl:z.string(),sortOrder:z.number().int().min(0),isActive:z.boolean(),productIds:z.array(z.string())})),
  megaServices: z.array(serviceItem), buttons: z.array(button), sections: z.array(z.object({key:z.string(),title:z.string(),sortOrder:z.number().int().min(0),isActive:z.boolean()}))
});
export type HomeContentValues = z.infer<typeof homeContentSchema>;
