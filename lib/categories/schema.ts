import { z } from 'zod';

export const categoryImageSchema = z.object({
  imageUrl: z.string().url(),
  storagePath: z.string().min(1),
  fileSize: z.number().max(5 * 1024 * 1024),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
});

export type CategoryImage = z.infer<typeof categoryImageSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Ingresá un nombre.').max(100),
  slug: z.string().trim().min(2, 'Ingresá un slug.').max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usá minúsculas, números y guiones.'),
  description: z.string().trim().max(1000),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  mainImage: categoryImageSchema.nullable(),
  desktopBanner: categoryImageSchema.nullable(),
  mobileBanner: categoryImageSchema.nullable(),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(160),
  seoKeywords: z.string().trim().max(500),
  imageAlt: z.string().trim().max(160),
  canonicalUrl: z.union([z.literal(''), z.string().url('Ingresá una URL válida.')])
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
