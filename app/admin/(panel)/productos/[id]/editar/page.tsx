import { notFound, redirect } from 'next/navigation';

import { ProductForm } from '@/components/admin/products/product-form';
import type { ProductFormValues } from '@/lib/products/schema';
import { createClient } from '@/lib/supabase/server';

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
}

export default async function EditProductPage({
  params
}: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (
    !profile ||
    !profile.is_active ||
    profile.role !== 'admin'
  ) {
    redirect('/admin/productos');
  }

  const [
    productResult,
    categoriesResult,
    imagesResult,
    priceTiersResult,
    featuresResult,
    specificationsResult,
    recommendationsResult,
    availableProductsResult
  ] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        category_id,
        short_description,
        full_description,
        description,
        price,
        currency,
        unit,
        min_order_quantity,
        promo_price,
        promo_starts_at,
        promo_ends_at,
        is_active,
        is_featured,
        seo_title,
        seo_description,
        seo_keywords,
        main_image_alt,
        canonical_url,
        related_product_slugs
      `)
      .eq('id', id)
      .single(),

    supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),

    supabase
      .from('product_images')
      .select(`
        image_url,
        storage_path,
        alt_text,
        order_index,
        is_primary,
        file_size,
        mime_type
      `)
      .eq('product_id', id)
      .order('order_index', { ascending: true }),

    supabase
      .from('product_price_tiers')
      .select(`
        min_quantity,
        max_quantity,
        price_amount,
        is_promo,
        label,
        order_index
      `)
      .eq('product_id', id)
      .order('order_index', { ascending: true }),

    supabase
      .from('product_features')
      .select('feature_text, order_index')
      .eq('product_id', id)
      .order('order_index', { ascending: true }),

    supabase
      .from('product_specifications')
      .select('spec_key, spec_value, order_index')
      .eq('product_id', id)
      .order('order_index', { ascending: true }),

    supabase
      .from('product_recommendations')
      .select('recommendation_text, order_index')
      .eq('product_id', id)
      .order('order_index', { ascending: true }),

    supabase
      .from('products')
      .select('id, name, slug')
      .neq('id', id)
      .order('name', { ascending: true })
  ]);

  if (productResult.error || !productResult.data) {
    notFound();
  }

  if (categoriesResult.error) {
    throw new Error(
      `No se pudieron cargar las categorías: ${categoriesResult.error.message}`
    );
  }

  const product = productResult.data;

  const initialValues: ProductFormValues = {
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id,

    shortDescription:
      product.short_description ??
      product.description ??
      '',

    description:
      product.full_description ??
      product.description ??
      '',

    unit: product.unit as ProductFormValues['unit'],

    minOrderQuantity: Number(
      product.min_order_quantity ?? 1
    ),

    priceAmount: Number(product.price),

    currency:
      product.currency === 'USD' ? 'USD' : 'PYG',

    promoPrice:
      product.promo_price === null
        ? undefined
        : Number(product.promo_price),

    promoStartsAt: toDateTimeLocal(
      product.promo_starts_at
    ),

    promoEndsAt: toDateTimeLocal(
      product.promo_ends_at
    ),

    isActive: product.is_active,
    isFeatured: product.is_featured,

    images: (imagesResult.data ?? []).map(
      (image, index) => ({
        imageUrl: image.image_url,
        storagePath: image.storage_path ?? '',
        altText:
          image.alt_text ??
          product.main_image_alt ??
          product.name,
        orderIndex: image.order_index ?? index,
        isPrimary: image.is_primary,
        fileSize: Number(image.file_size ?? 1),
        mimeType:
          image.mime_type === 'image/png' ||
          image.mime_type === 'image/webp'
            ? image.mime_type
            : 'image/jpeg'
      })
    ),

    priceTiers: (priceTiersResult.data ?? []).map(
      (tier) => ({
        minQuantity: Number(tier.min_quantity),
        maxQuantity:
          tier.max_quantity === null
            ? undefined
            : Number(tier.max_quantity),
        priceAmount: Number(tier.price_amount),
        isPromo: tier.is_promo,
        label: tier.label ?? ''
      })
    ),

    features:
      featuresResult.data?.length
        ? featuresResult.data.map((feature) => ({
            value: feature.feature_text
          }))
        : [{ value: '' }],

    specifications:
      specificationsResult.data?.length
        ? specificationsResult.data.map(
            (specification) => ({
              key: specification.spec_key,
              value: specification.spec_value
            })
          )
        : [{ key: '', value: '' }],

    recommendations:
      recommendationsResult.data?.length
        ? recommendationsResult.data.map(
            (recommendation) => ({
              value:
                recommendation.recommendation_text
            })
          )
        : [{ value: '' }],

    relatedProductSlugs: Array.isArray(product.related_product_slugs)
      ? product.related_product_slugs.filter(
          (slug: unknown): slug is string => typeof slug === 'string'
        )
      : [],

    seoTitle: product.seo_title ?? '',
    seoDescription: product.seo_description ?? '',

    seoKeywords: Array.isArray(product.seo_keywords)
      ? product.seo_keywords.join(', ')
      : '',

    mainImageAlt: product.main_image_alt ?? '',
    canonicalUrl: product.canonical_url ?? ''
  };

  return (
    <ProductForm
      mode="edit"
      productId={id}
      categories={categoriesResult.data ?? []}
      availableProducts={availableProductsResult.data ?? []}
      initialValues={initialValues}
    />
  );
}
