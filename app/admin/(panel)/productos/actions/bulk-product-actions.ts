'use server';

import { revalidatePath } from 'next/cache';

import { PRODUCT_UNITS } from '@/lib/products/schema';
import { createProductSlug } from '@/lib/products/slug';
import { createClient } from '@/lib/supabase/server';

type ImportResult = {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  message: string;
};

type CsvRow = Record<string, string>;

const allowedUnits = new Set<string>(PRODUCT_UNITS);

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      cell = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);

  if (rows.length < 2) return [];

  const headers = rows[0].map((header) =>
    header.replace(/^\uFEFF/, '').trim().toLowerCase()
  );

  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  );
}

function parseBoolean(value: string, fallback = false) {
  if (!value) return fallback;
  return ['1', 'true', 'si', 'sí', 'yes', 'activo', 'active'].includes(
    value.trim().toLowerCase()
  );
}

function parseNumber(value: string, fallback = 0) {
  if (!value.trim()) return fallback;
  const normalized = value
    .replace(/\s/g, '')
    .replace(/Gs\.?/gi, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitList(value: string) {
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSpecifications(value: string) {
  return splitList(value)
    .map((item) => {
      const separator = item.indexOf(':');
      if (separator === -1) return null;
      return {
        key: item.slice(0, separator).trim(),
        value: item.slice(separator + 1).trim()
      };
    })
    .filter(
      (item): item is { key: string; value: string } =>
        Boolean(item?.key && item?.value)
    );
}

async function requireAdministrator() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error('Tu sesión venció. Volvé a iniciar sesión.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile?.is_active || profile.role !== 'admin') {
    throw new Error('No tenés permisos para importar productos.');
  }

  return { supabase, user };
}

export async function importProductsCsvAction(csvText: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    message: ''
  };

  try {
    const rows = parseCsv(csvText);
    if (!rows.length) {
      return { ...result, message: 'El CSV está vacío o no tiene filas de productos.' };
    }

    if (rows.length > 1000) {
      return { ...result, message: 'El máximo permitido por importación es de 1.000 productos.' };
    }

    const { supabase, user } = await requireAdministrator();
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (categoryError) throw new Error(`No se pudieron leer las categorías: ${categoryError.message}`);

    const categoryMap = new Map<string, string>();
    for (const category of categories ?? []) {
      categoryMap.set(category.name.toLowerCase(), category.id);
      categoryMap.set(category.slug.toLowerCase(), category.id);
    }

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const line = index + 2;

      try {
        const name = row.name?.trim();
        const slug = (row.slug?.trim() || createProductSlug(name || '')).toLowerCase();
        const categoryValue = row.category?.trim().toLowerCase();
        const categoryId = categoryValue ? categoryMap.get(categoryValue) : undefined;
        const price = parseNumber(row.price);
        const unit = row.unit?.trim() || 'unidad';

        if (!name) throw new Error('falta name');
        if (!slug) throw new Error('falta slug');
        if (!categoryId) throw new Error(`categoría no encontrada: ${row.category || '(vacía)'}`);
        if (price <= 0) throw new Error('price debe ser mayor a 0');
        if (!allowedUnits.has(unit)) {
          throw new Error(`unidad inválida: ${unit}. Usá: ${Array.from(allowedUnits).join(', ')}`);
        }

        const features = splitList(row.features || '');
        const recommendations = splitList(row.recommendations || '');
        const specifications = parseSpecifications(row.specifications || '');
        const seoKeywords = splitList((row.seo_keywords || '').replace(/,/g, '|'));

        const payload = {
          name,
          slug,
          category_id: categoryId,
          description: row.short_description?.trim() || row.description?.trim() || name,
          short_description: row.short_description?.trim() || row.description?.trim() || name,
          full_description: row.description?.trim() || row.short_description?.trim() || name,
          price,
          currency: (row.currency?.trim().toUpperCase() || 'PYG') === 'USD' ? 'USD' : 'PYG',
          unit,
          min_order_quantity: Math.max(1, parseNumber(row.min_order_quantity, 1)),
          promo_price: parseNumber(row.promo_price) > 0 ? parseNumber(row.promo_price) : null,
          image_url: row.image_url?.trim() || null,
          benefits: features,
          recommendations,
          is_offer: parseNumber(row.promo_price) > 0,
          is_featured: parseBoolean(row.is_featured),
          is_recommended: parseBoolean(row.is_featured),
          is_active: parseBoolean(row.is_active, false),
          in_stock: parseBoolean(row.in_stock, true),
          includes_installation: parseBoolean(row.includes_installation),
          seo_title: row.seo_title?.trim() || null,
          seo_description: row.seo_description?.trim() || null,
          seo_keywords: seoKeywords,
          main_image_alt: row.main_image_alt?.trim() || name,
          canonical_url: row.canonical_url?.trim() || null
        };

        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        let productId: string;

        if (existing) {
          const { error: updateError } = await supabase
            .from('products')
            .update(payload)
            .eq('id', existing.id);
          if (updateError) throw new Error(updateError.message);
          productId = existing.id;
          result.updated += 1;
        } else {
          const { data: created, error: insertError } = await supabase
            .from('products')
            .insert(payload)
            .select('id')
            .single();
          if (insertError || !created) throw new Error(insertError?.message || 'no se pudo crear');
          productId = created.id;
          result.created += 1;
        }

        for (const table of ['product_features', 'product_specifications', 'product_recommendations'] as const) {
          const { error: deleteError } = await supabase.from(table).delete().eq('product_id', productId);
          if (deleteError) throw new Error(deleteError.message);
        }

        if (features.length) {
          const { error: featuresError } = await supabase.from('product_features').insert(
            features.map((feature, orderIndex) => ({
              product_id: productId,
              feature_text: feature,
              order_index: orderIndex
            }))
          );
          if (featuresError) throw new Error(featuresError.message);
        }

        if (specifications.length) {
          const { error: specsError } = await supabase.from('product_specifications').insert(
            specifications.map((specification, orderIndex) => ({
              product_id: productId,
              spec_key: specification.key,
              spec_value: specification.value,
              order_index: orderIndex
            }))
          );
          if (specsError) throw new Error(specsError.message);
        }

        if (recommendations.length) {
          const { error: recommendationsError } = await supabase.from('product_recommendations').insert(
            recommendations.map((recommendation, orderIndex) => ({
              product_id: productId,
              recommendation_text: recommendation,
              order_index: orderIndex
            }))
          );
          if (recommendationsError) throw new Error(recommendationsError.message);
        }
      } catch (rowError) {
        result.skipped += 1;
        result.errors.push(
          `Fila ${line}: ${rowError instanceof Error ? rowError.message : 'error desconocido'}`
        );
      }
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'products.bulk_imported',
      entity_type: 'product',
      metadata: {
        created: result.created,
        updated: result.updated,
        skipped: result.skipped
      }
    });

    revalidatePath('/admin/productos');
    revalidatePath('/shop');
    revalidatePath('/');

    result.success = result.created + result.updated > 0;
    result.message = `Importación terminada: ${result.created} creados, ${result.updated} actualizados y ${result.skipped} omitidos.`;
    return result;
  } catch (error) {
    return {
      ...result,
      message: error instanceof Error ? error.message : 'No se pudo importar el archivo.'
    };
  }
}
