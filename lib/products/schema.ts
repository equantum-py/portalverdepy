import { z } from 'zod';

export const PRODUCT_UNITS = [
  'unidad',
  'm²',
  'metro lineal',
  'docena',
  'kg',
  'servicio',
  'visita'
] as const;

const optionalNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  },
  z.number().positive().optional()
);

const nonNegativeNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  },
  z.number().nonnegative('El precio no puede ser negativo.')
);

const productImageUrlSchema = z
  .string()
  .trim()
  .min(1, 'La imagen debe tener una dirección válida.')
  .refine(
    (value) =>
      value.startsWith('/') ||
      value.startsWith('https://') ||
      value.startsWith('http://'),
    'La dirección de la imagen no es válida.'
  );

export const productImageSchema = z.object({
  imageUrl: productImageUrlSchema,
  storagePath: z.string().default(''),
  altText: z.string().default(''),
  orderIndex: z.number().int().nonnegative(),
  isPrimary: z.boolean(),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
});

export const productPriceTierSchema = z
  .object({
    minQuantity: z.coerce.number().positive('La cantidad desde debe ser mayor a cero.'),
    maxQuantity: optionalNumber,
    priceAmount: z.coerce.number().positive('El precio debe ser mayor a cero.'),
    isPromo: z.boolean().default(false),
    label: z.string().trim().default('')
  })
  .refine(
    (tier) => tier.maxQuantity === undefined || tier.maxQuantity >= tier.minQuantity,
    {
      message: 'La cantidad hasta no puede ser menor que la cantidad desde.',
      path: ['maxQuantity']
    }
  );

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(160),
    slug: z
      .string()
      .trim()
      .min(1, 'El slug es obligatorio.')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones.'),
    categoryId: z.string().uuid('Seleccioná una categoría válida.'),
    shortDescription: z.string().trim().min(1, 'La descripción corta es obligatoria.').max(500),
    description: z.string().trim().min(1, 'La descripción completa es obligatoria.'),
    unit: z.enum(PRODUCT_UNITS),
    minOrderQuantity: z.coerce.number().positive('La cantidad mínima debe ser mayor a cero.'),
    priceAmount: nonNegativeNumber,
    currency: z.enum(['PYG', 'USD']),
    promoPrice: optionalNumber,
    promoStartsAt: z.string().default(''),
    promoEndsAt: z.string().default(''),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    priceTiers: z.array(productPriceTierSchema).default([]),
    images: z.array(productImageSchema).max(12).default([]),
    features: z.array(z.object({ value: z.string().trim() })).default([]),
    specifications: z.array(z.object({ key: z.string().trim(), value: z.string().trim() })).default([]),
    recommendations: z.array(z.object({ value: z.string().trim() })).default([]),
    relatedProductSlugs: z.array(z.string().min(1)).max(12).default([]),
    seoTitle: z.string().trim().max(70).default(''),
    seoDescription: z.string().trim().max(180).default(''),
    seoKeywords: z.string().trim().default(''),
    mainImageAlt: z.string().trim().max(180).default(''),
    canonicalUrl: z.union([z.literal(''), z.string().url('La URL canonical no es válida.')]).default('')
  })
  .superRefine((product, context) => {
    if (product.priceAmount === 0 && product.unit !== 'servicio' && product.unit !== 'visita') {
      context.addIssue({
        code: 'custom',
        path: ['priceAmount'],
        message: 'El precio debe ser mayor a cero, salvo en servicios cotizables.'
      });
    }

    if (product.promoStartsAt && product.promoEndsAt && new Date(product.promoEndsAt) < new Date(product.promoStartsAt)) {
      context.addIssue({
        code: 'custom',
        path: ['promoEndsAt'],
        message: 'La fecha final no puede ser anterior a la fecha inicial.'
      });
    }

    product.specifications.forEach((specification, index) => {
      const hasKey = specification.key.length > 0;
      const hasValue = specification.value.length > 0;

      if (hasKey !== hasValue) {
        context.addIssue({
          code: 'custom',
          path: ['specifications', index, hasKey ? 'value' : 'key'],
          message: 'Completá tanto el nombre como el valor de la especificación.'
        });
      }
    });

    const tiers = [...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);

    for (let index = 0; index < tiers.length - 1; index += 1) {
      const current = tiers[index];
      const next = tiers[index + 1];

      if (current.maxQuantity === undefined || current.maxQuantity >= next.minQuantity) {
        context.addIssue({
          code: 'custom',
          path: ['priceTiers'],
          message: 'Las escalas de precio se superponen.'
        });
        break;
      }
    }
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
export type ProductImageDraft = z.infer<typeof productImageSchema>;
