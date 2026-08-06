import type { Product } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

type CategoryRelation =
  | {
      name: string;
      slug: string;
    }
  | {
      name: string;
      slug: string;
    }[]
  | null;

type ImageRelation = {
  image_url: string;
  alt_text: string | null;
  order_index: number | null;
  is_primary: boolean | null;
};

export async function getPublicProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      name,
      short_description,
      description,
      price,
      promo_price,
      image_url,
      unit,
      is_offer,
      is_new,
      is_featured,
      is_recommended,
      is_best_seller,
      includes_installation,
      in_stock,
      benefits,
      recommendations,
      related_product_slugs,
      categories (
        name,
        slug
      ),
      product_images (
        image_url,
        alt_text,
        order_index,
        is_primary
      )
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `No se pudo cargar el catálogo: ${error.message}`
    );
  }

  return (data ?? []).map((row) => {
    const categoryRelation =
      row.categories as CategoryRelation;

    const category = Array.isArray(categoryRelation)
      ? categoryRelation[0]
      : categoryRelation;

    const images = [
      ...((row.product_images ?? []) as ImageRelation[])
    ].sort(
      (first, second) =>
        Number(second.is_primary) -
          Number(first.is_primary) ||
        Number(first.order_index ?? 0) -
          Number(second.order_index ?? 0)
    );

    const primaryImage =
      images.find((image) => image.is_primary) ??
      images[0];

    const regularPrice = Number(row.price ?? 0);
    const promotionalPrice =
      row.promo_price === null
        ? null
        : Number(row.promo_price);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: category?.name ?? 'Sin categoría',
      categorySlug: category?.slug ?? '',
      description:
        row.short_description ??
        row.description ??
        '',
      price:
        promotionalPrice &&
        promotionalPrice > 0 &&
        promotionalPrice < regularPrice
          ? promotionalPrice
          : regularPrice,
      previousPrice:
        promotionalPrice &&
        promotionalPrice > 0 &&
        promotionalPrice < regularPrice
          ? regularPrice
          : undefined,
      image:
        primaryImage?.image_url ??
        row.image_url ??
        '/images/product-placeholder.webp',
      images: images.map((image) => ({
        imageUrl: image.image_url,
        altText: image.alt_text
      })),
      unit: row.unit ?? 'unidad',
      isOffer:
        Boolean(row.is_offer) ||
        Boolean(
          promotionalPrice &&
            promotionalPrice < regularPrice
        ),
      isNew: Boolean(row.is_new),
      isFeatured: Boolean(row.is_featured),
      isRecommended: Boolean(row.is_recommended),
      isBestSeller: Boolean(row.is_best_seller),
      includesInstallation: Boolean(
        row.includes_installation
      ),
      inStock: row.in_stock !== false,
      benefits: Array.isArray(row.benefits)
        ? row.benefits
        : [],
      recommendations: Array.isArray(
        row.recommendations
      )
        ? row.recommendations
        : [],
      relatedProductSlugs: Array.isArray(
        row.related_product_slugs
      )
        ? row.related_product_slugs
        : []
    } as Product;
  });
}
