import { createClient } from '@/lib/supabase/server';

type CategoryRelation =
  | {
      id: string;
      name: string;
      slug: string;
    }
  | {
      id: string;
      name: string;
      slug: string;
    }[]
  | null;

type ProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  order_index: number | null;
  is_primary: boolean | null;
};

type ProductFeatureRow = {
  id: string;
  feature_text: string;
  order_index: number | null;
};

type ProductSpecificationRow = {
  id: string;
  spec_key: string;
  spec_value: string;
  order_index: number | null;
};

type ProductRecommendationRow = {
  id: string;
  recommendation_text: string;
  order_index: number | null;
};

type ProductPriceTierRow = {
  id: string;
  min_quantity: number;
  max_quantity: number | null;
  price_amount: number;
  is_promo: boolean | null;
  label: string | null;
  order_index: number | null;
};

function sortByOrderIndex<T extends { order_index: number | null }>(
  rows: T[]
): T[] {
  return [...rows].sort(
    (first, second) =>
      Number(first.order_index ?? 0) -
      Number(second.order_index ?? 0)
  );
}

export async function getPublicProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        id,
        image_url,
        alt_text,
        order_index,
        is_primary
      ),
      product_features (
        id,
        feature_text,
        order_index
      ),
      product_specifications (
        id,
        spec_key,
        spec_value,
        order_index
      ),
      product_recommendations (
        id,
        recommendation_text,
        order_index
      ),
      product_price_tiers (
        id,
        min_quantity,
        max_quantity,
        price_amount,
        is_promo,
        label,
        order_index
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('No se pudo cargar el producto:', error);
    return null;
  }

  const categoryRelation =
    data.categories as CategoryRelation;

  const category = Array.isArray(categoryRelation)
    ? categoryRelation[0] ?? null
    : categoryRelation;

  const images = [
    ...((data.product_images ?? []) as ProductImageRow[])
  ].sort(
    (first, second) =>
      Number(second.is_primary) -
        Number(first.is_primary) ||
      Number(first.order_index ?? 0) -
        Number(second.order_index ?? 0)
  );

  const features = sortByOrderIndex(
    (data.product_features ?? []) as ProductFeatureRow[]
  );

  const specifications = sortByOrderIndex(
    (data.product_specifications ??
      []) as ProductSpecificationRow[]
  );

  const recommendations = sortByOrderIndex(
    (data.product_recommendations ??
      []) as ProductRecommendationRow[]
  );

  const priceTiers = sortByOrderIndex(
    (data.product_price_tiers ??
      []) as ProductPriceTierRow[]
  );

  const regularPrice = Number(data.price ?? 0);

  const promotionalPrice =
    data.promo_price === null
      ? null
      : Number(data.promo_price);

  const hasValidPromotion = Boolean(
    promotionalPrice &&
      promotionalPrice > 0 &&
      promotionalPrice < regularPrice
  );

  return {
    ...data,

    category,
    categoryName: category?.name ?? 'Sin categoría',
    categorySlug: category?.slug ?? '',

    price: hasValidPromotion
      ? promotionalPrice
      : regularPrice,

    previousPrice: hasValidPromotion
      ? regularPrice
      : null,

    images: images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      altText:
        image.alt_text ??
        data.main_image_alt ??
        data.name,
      orderIndex: Number(image.order_index ?? 0),
      isPrimary: Boolean(image.is_primary)
    })),

    mainImage:
      images.find((image) => image.is_primary)
        ?.image_url ??
      images[0]?.image_url ??
      data.image_url ??
      '/images/product-placeholder.webp',

    features: features
      .map((feature) => feature.feature_text)
      .filter(Boolean),

    specifications: specifications
      .map((specification) => ({
        key: specification.spec_key,
        value: specification.spec_value
      }))
      .filter(
        (specification) =>
          specification.key && specification.value
      ),

    recommendations: recommendations
      .map(
        (recommendation) =>
          recommendation.recommendation_text
      )
      .filter(Boolean),

    priceTiers: priceTiers.map((tier) => ({
      id: tier.id,
      minQuantity: Number(tier.min_quantity),
      maxQuantity:
        tier.max_quantity === null
          ? null
          : Number(tier.max_quantity),
      priceAmount: Number(tier.price_amount),
      isPromo: Boolean(tier.is_promo),
      label: tier.label ?? ''
    })),

    relatedProductSlugs: Array.isArray(
      data.related_product_slugs
    )
      ? data.related_product_slugs.filter(
          (value: unknown): value is string =>
            typeof value === 'string' &&
            value.length > 0
        )
      : []
  };
}

export async function getRelatedPublicProducts(
  slugs: string[]
) {
  if (!slugs.length) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
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
    .in('slug', slugs)
    .eq('is_active', true);

  if (error) {
    console.error(
      'No se pudieron cargar productos relacionados:',
      error
    );
    return [];
  }

  return data ?? [];
}
