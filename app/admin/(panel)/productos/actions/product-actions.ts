'use server';

import { revalidatePath } from 'next/cache';

import {
  productFormSchema,
  type ProductFormValues
} from '@/lib/products/schema';
import { createProductSlug } from '@/lib/products/slug';
import { createClient } from '@/lib/supabase/server';

type ProductActionResult = {
  success: boolean;
  productId?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function requireAdministrator() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Tu sesión venció. Volvé a iniciar sesión.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    profile.role !== 'admin'
  ) {
    throw new Error(
      'No tenés permisos para administrar productos.'
    );
  }

  return {
    supabase,
    user
  };
}

function normalizeKeywords(value: string) {
  return value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function normalizeImages(values: ProductFormValues) {
  const images = values.images.map((image, index) => ({
    ...image,
    altText:
      image.altText ||
      values.mainImageAlt ||
      values.name,
    orderIndex: index
  }));

  const hasPrimary = images.some((image) => image.isPrimary);

  return images.map((image, index) => ({
    ...image,
    isPrimary:
      image.isPrimary ||
      (!hasPrimary && index === 0)
  }));
}

function buildProductPayload(values: ProductFormValues) {
  const images = normalizeImages(values);

  const primaryImage =
    images.find((image) => image.isPrimary) ??
    images[0] ??
    null;

  return {
    name: values.name,
    slug: values.slug,
    category_id: values.categoryId,

    description: values.shortDescription,
    short_description: values.shortDescription,
    full_description: values.description,

    price: values.priceAmount,
    currency: values.currency,
    unit: values.unit,
    min_order_quantity: values.minOrderQuantity,

    promo_price: values.promoPrice ?? null,
    promo_starts_at: values.promoStartsAt || null,
    promo_ends_at: values.promoEndsAt || null,

    image_url: primaryImage?.imageUrl ?? null,

    benefits: values.features.map((item) => item.value),
    recommendations: values.recommendations.map(
      (item) => item.value
    ),
    related_product_slugs: values.relatedProductSlugs,

    is_offer: Boolean(values.promoPrice),
    is_featured: values.isFeatured,
    is_recommended: values.isFeatured,
    is_active: values.isActive,
    in_stock: true,

    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
    seo_keywords: normalizeKeywords(values.seoKeywords),
    main_image_alt:
      values.mainImageAlt ||
      primaryImage?.altText ||
      values.name,
    canonical_url: values.canonicalUrl || null
  };
}

async function insertProductRelations(
  supabase: SupabaseClient,
  productId: string,
  values: ProductFormValues
) {
  const images = normalizeImages(values);

  const priceTiers = [...values.priceTiers].sort(
    (first, second) =>
      first.minQuantity - second.minQuantity
  );

  if (images.length) {
    const { error } = await supabase
      .from('product_images')
      .insert(
        images.map((image, index) => ({
          product_id: productId,
          image_url: image.imageUrl,
          storage_path: image.storagePath || null,
          alt_text:
            image.altText ||
            values.mainImageAlt ||
            values.name,
          order_index: index,
          is_primary: image.isPrimary,
          file_size: image.fileSize,
          mime_type: image.mimeType
        }))
      );

    if (error) {
      throw new Error(
        `No se pudieron guardar las imágenes: ${error.message}`
      );
    }
  }

  if (priceTiers.length) {
    const { error } = await supabase
      .from('product_price_tiers')
      .insert(
        priceTiers.map((tier, index) => ({
          product_id: productId,
          min_quantity: tier.minQuantity,
          max_quantity: tier.maxQuantity ?? null,
          price_amount: tier.priceAmount,
          is_promo: tier.isPromo,
          label: tier.label || null,
          order_index: index
        }))
      );

    if (error) {
      throw new Error(
        `No se pudieron guardar las escalas: ${error.message}`
      );
    }
  }

  const features = values.features.filter(
    (feature) => feature.value.trim().length > 0
  );

  if (features.length) {
    const { error } = await supabase
      .from('product_features')
      .insert(
        features.map((feature, index) => ({
          product_id: productId,
          feature_text: feature.value.trim(),
          order_index: index
        }))
      );

    if (error) {
      throw new Error(
        `No se pudieron guardar las características: ${error.message}`
      );
    }
  }

  const specifications = values.specifications.filter(
    (specification) =>
      specification.key.trim().length > 0 &&
      specification.value.trim().length > 0
  );

  if (specifications.length) {
    const { error } = await supabase
      .from('product_specifications')
      .insert(
        specifications.map((specification, index) => ({
          product_id: productId,
          spec_key: specification.key.trim(),
          spec_value: specification.value.trim(),
          order_index: index
        }))
      );

    if (error) {
      throw new Error(
        `No se pudieron guardar las especificaciones: ${error.message}`
      );
    }
  }

  const recommendations = values.recommendations.filter(
    (recommendation) =>
      recommendation.value.trim().length > 0
  );

  if (recommendations.length) {
    const { error } = await supabase
      .from('product_recommendations')
      .insert(
        recommendations.map((recommendation, index) => ({
          product_id: productId,
          recommendation_text:
            recommendation.value.trim(),
          order_index: index
        }))
      );

    if (error) {
      throw new Error(
        `No se pudieron guardar las recomendaciones: ${error.message}`
      );
    }
  }
}

async function deleteProductRelations(
  supabase: SupabaseClient,
  productId: string
) {
  const relationTables = [
    'product_images',
    'product_price_tiers',
    'product_features',
    'product_specifications',
    'product_recommendations'
  ] as const;

  for (const table of relationTables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('product_id', productId);

    if (error) {
      throw new Error(
        `No se pudieron sincronizar los datos relacionados: ${error.message}`
      );
    }
  }
}

async function cleanupStoragePaths(
  supabase: SupabaseClient,
  paths: string[]
) {
  const validPaths = Array.from(
    new Set(paths.filter(Boolean))
  );

  if (!validPaths.length) {
    return;
  }

  const { error } = await supabase.storage
    .from('product-images')
    .remove(validPaths);

  if (error) {
    console.error(
      'No se pudieron eliminar algunos archivos de Storage:',
      error.message
    );
  }
}

function revalidateProductPaths() {
  revalidatePath('/admin');
  revalidatePath('/admin/productos');
  revalidatePath('/shop');
  revalidatePath('/');
}

export async function createProductAction(
  input: ProductFormValues
): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Revisá los campos marcados.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const { supabase, user } =
      await requireAdministrator();

    const values = parsed.data;

    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', values.slug)
      .maybeSingle();

    if (existingProduct) {
      return {
        success: false,
        message: 'Ya existe un producto con ese slug.',
        fieldErrors: {
          slug: ['Ya existe un producto con ese slug.']
        }
      };
    }

    const { data: product, error: productError } =
      await supabase
        .from('products')
        .insert(buildProductPayload(values))
        .select('id')
        .single();

    if (productError || !product) {
      throw new Error(
        productError?.message ||
          'No se pudo crear el producto.'
      );
    }

    try {
      await insertProductRelations(
        supabase,
        product.id,
        values
      );
    } catch (relationError) {
      await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      await cleanupStoragePaths(
        supabase,
        values.images.map((image) => image.storagePath)
      );

      throw relationError;
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'product.created',
      entity_type: 'product',
      entity_id: product.id,
      metadata: {
        name: values.name,
        slug: values.slug
      }
    });

    revalidateProductPaths();

    return {
      success: true,
      productId: product.id,
      message: 'Producto creado correctamente.'
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el producto.'
    };
  }
}

export async function updateProductAction(
  productId: string,
  input: ProductFormValues
): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Revisá los campos marcados.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const { supabase, user } =
      await requireAdministrator();

    const values = parsed.data;

    const { data: product, error: productReadError } =
      await supabase
        .from('products')
        .select('id, name, slug')
        .eq('id', productId)
        .single();

    if (productReadError || !product) {
      throw new Error('El producto no existe.');
    }

    const { data: duplicatedSlug } = await supabase
      .from('products')
      .select('id')
      .eq('slug', values.slug)
      .neq('id', productId)
      .maybeSingle();

    if (duplicatedSlug) {
      return {
        success: false,
        message: 'Ya existe otro producto con ese slug.',
        fieldErrors: {
          slug: ['Ya existe otro producto con ese slug.']
        }
      };
    }

    const { data: currentImages } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', productId);

    const { error: updateError } = await supabase
      .from('products')
      .update(buildProductPayload(values))
      .eq('id', productId);

    if (updateError) {
      throw new Error(
        `No se pudo actualizar el producto: ${updateError.message}`
      );
    }

    await deleteProductRelations(supabase, productId);
    await insertProductRelations(
      supabase,
      productId,
      values
    );

    const retainedPaths = new Set(
      values.images
        .map((image) => image.storagePath)
        .filter(Boolean)
    );

    const removedPaths =
      currentImages
        ?.map((image) => image.storage_path)
        .filter(
          (path): path is string =>
            Boolean(path) && !retainedPaths.has(path)
        ) ?? [];

    await cleanupStoragePaths(supabase, removedPaths);

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'product.updated',
      entity_type: 'product',
      entity_id: productId,
      metadata: {
        previous_name: product.name,
        name: values.name,
        previous_slug: product.slug,
        slug: values.slug
      }
    });

    revalidateProductPaths();
    revalidatePath(`/product/${values.slug}`);
    revalidatePath(
      `/admin/productos/${productId}/editar`
    );

    return {
      success: true,
      productId,
      message: 'Producto actualizado correctamente.'
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el producto.'
    };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<ProductActionResult> {
  try {
    const { supabase, user } =
      await requireAdministrator();

    const { data: product, error: productError } =
      await supabase
        .from('products')
        .select('id, name, slug')
        .eq('id', productId)
        .single();

    if (productError || !product) {
      throw new Error('El producto no existe.');
    }

    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', productId);

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) {
      throw new Error(
        `No se pudo eliminar el producto: ${deleteError.message}`
      );
    }

    await cleanupStoragePaths(
      supabase,
      images
        ?.map((image) => image.storage_path)
        .filter((path): path is string => Boolean(path)) ??
        []
    );

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'product.deleted',
      entity_type: 'product',
      entity_id: productId,
      metadata: {
        name: product.name,
        slug: product.slug
      }
    });

    revalidateProductPaths();

    return {
      success: true,
      message: 'Producto eliminado correctamente.'
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el producto.'
    };
  }
}

async function createUniqueSlug(
  supabase: SupabaseClient,
  originalName: string
) {
  const baseSlug =
    createProductSlug(`${originalName}-copia`) ||
    `producto-copia-${Date.now()}`;

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function duplicateProductAction(
  productId: string
): Promise<ProductActionResult> {
  try {
    const { supabase, user } =
      await requireAdministrator();

    const [
      productResult,
      imagesResult,
      tiersResult,
      featuresResult,
      specificationsResult,
      recommendationsResult
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single(),

      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('order_index'),

      supabase
        .from('product_price_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('order_index'),

      supabase
        .from('product_features')
        .select('*')
        .eq('product_id', productId)
        .order('order_index'),

      supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', productId)
        .order('order_index'),

      supabase
        .from('product_recommendations')
        .select('*')
        .eq('product_id', productId)
        .order('order_index')
    ]);

    if (productResult.error || !productResult.data) {
      throw new Error('El producto no existe.');
    }

    const original = productResult.data;
    const newSlug = await createUniqueSlug(
      supabase,
      original.name
    );

    const productFields = { ...original };

    delete productFields.id;
    delete productFields.created_at;
    delete productFields.updated_at;

    const { data: duplicatedProduct, error } =
      await supabase
        .from('products')
        .insert({
          ...productFields,
          name: `${original.name} (copia)`,
          slug: newSlug,
          is_active: false,
          image_url: null
        })
        .select('id')
        .single();

    if (error || !duplicatedProduct) {
      throw new Error(
        error?.message ||
          'No se pudo duplicar el producto.'
      );
    }

    const newProductId = duplicatedProduct.id;

    if (imagesResult.data?.length) {
      const duplicatedImages = [];

      for (const image of imagesResult.data) {
        if (!image.storage_path) {
          duplicatedImages.push({
            product_id: newProductId,
            image_url: image.image_url,
            storage_path: null,
            alt_text: image.alt_text,
            order_index: image.order_index,
            is_primary: image.is_primary,
            file_size: image.file_size,
            mime_type: image.mime_type
          });

          continue;
        }

        const extension =
          image.storage_path.split('.').pop() || 'webp';

        const newStoragePath =
          `products/${newSlug}/${crypto.randomUUID()}.${extension}`;

        const { error: copyError } =
          await supabase.storage
            .from('product-images')
            .copy(image.storage_path, newStoragePath);

        if (copyError) {
          throw new Error(
            `No se pudo duplicar una imagen: ${copyError.message}`
          );
        }

        const { data: publicUrlData } =
          supabase.storage
            .from('product-images')
            .getPublicUrl(newStoragePath);

        duplicatedImages.push({
          product_id: newProductId,
          image_url: publicUrlData.publicUrl,
          storage_path: newStoragePath,
          alt_text: image.alt_text,
          order_index: image.order_index,
          is_primary: image.is_primary,
          file_size: image.file_size,
          mime_type: image.mime_type
        });
      }

      const { error: imageInsertError } = await supabase
        .from('product_images')
        .insert(duplicatedImages);

      if (imageInsertError) {
        throw new Error(imageInsertError.message);
      }

      const primaryImage = duplicatedImages.find(
        (image) => image.is_primary
      );

      if (primaryImage) {
        await supabase
          .from('products')
          .update({
            image_url: primaryImage.image_url
          })
          .eq('id', newProductId);
      }
    }

    if (tiersResult.data?.length) {
      await supabase
        .from('product_price_tiers')
        .insert(
          tiersResult.data.map((tier) => ({
            min_quantity: tier.min_quantity,
            max_quantity: tier.max_quantity,
            price_amount: tier.price_amount,
            is_promo: tier.is_promo,
            label: tier.label,
            order_index: tier.order_index,
            product_id: newProductId
          }))
        );
    }

    if (featuresResult.data?.length) {
      await supabase
        .from('product_features')
        .insert(
          featuresResult.data.map((feature) => ({
            feature_text: feature.feature_text,
            order_index: feature.order_index,
            product_id: newProductId
          }))
        );
    }

    if (specificationsResult.data?.length) {
      await supabase
        .from('product_specifications')
        .insert(
          specificationsResult.data.map((specification) => ({
            spec_key: specification.spec_key,
            spec_value: specification.spec_value,
            order_index: specification.order_index,
            product_id: newProductId
          }))
        );
    }

    if (recommendationsResult.data?.length) {
      await supabase
        .from('product_recommendations')
        .insert(
          recommendationsResult.data.map((recommendation) => ({
            recommendation_text:
              recommendation.recommendation_text,
            order_index: recommendation.order_index,
            product_id: newProductId
          }))
        );
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'product.duplicated',
      entity_type: 'product',
      entity_id: newProductId,
      metadata: {
        source_product_id: productId,
        source_name: original.name,
        duplicated_name: `${original.name} (copia)`,
        duplicated_slug: newSlug
      }
    });

    revalidateProductPaths();

    return {
      success: true,
      productId: newProductId,
      message:
        'Producto duplicado como borrador correctamente.'
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo duplicar el producto.'
    };
  }
}
