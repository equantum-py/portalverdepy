'use server';

import { revalidatePath } from 'next/cache';

import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/lib/categories/schema';
import { createClient } from '@/lib/supabase/server';

export type CategoryActionResult = {
  success: boolean;
  message: string;
  categoryId?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type RequiredRole = 'editor' | 'admin';

async function requireCategoryAccess(requiredRole: RequiredRole = 'editor') {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Tu sesión venció. Volvé a iniciar sesión.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new Error('No se pudo verificar tu perfil.');
  }

  const canEdit =
    profile?.is_active &&
    ['admin', 'editor'].includes(profile.role);

  const canDelete =
    profile?.is_active && profile.role === 'admin';

  if (
    (requiredRole === 'admin' && !canDelete) ||
    (requiredRole === 'editor' && !canEdit)
  ) {
    throw new Error(
      requiredRole === 'admin'
        ? 'Solo un administrador puede eliminar categorías.'
        : 'No tenés permisos para administrar categorías.',
    );
  }

  return { supabase, user };
}

function payload(values: CategoryFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    sort_order: values.sortOrder,
    is_active: values.isActive,
    is_featured: values.isFeatured,
    image_url: values.mainImage?.imageUrl ?? null,
    image_storage_path: values.mainImage?.storagePath ?? null,
    desktop_banner_url: values.desktopBanner?.imageUrl ?? null,
    desktop_banner_storage_path:
      values.desktopBanner?.storagePath ?? null,
    mobile_banner_url: values.mobileBanner?.imageUrl ?? null,
    mobile_banner_storage_path:
      values.mobileBanner?.storagePath ?? null,
    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
    seo_keywords: values.seoKeywords
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    image_alt: values.imageAlt || values.name,
    canonical_url: values.canonicalUrl || null,
    updated_at: new Date().toISOString(),
  };
}

function refresh() {
  revalidatePath('/admin');
  revalidatePath('/admin/categorias');
  revalidatePath('/shop');
  revalidatePath('/sitemap.xml');
  revalidatePath('/');
}

function imagePaths(values: CategoryFormValues) {
  return [
    values.mainImage?.storagePath,
    values.desktopBanner?.storagePath,
    values.mobileBanner?.storagePath,
  ].filter((path): path is string => Boolean(path));
}

export async function createCategoryAction(
  input: CategoryFormValues,
): Promise<CategoryActionResult> {
  try {
    const parsed = categoryFormSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Revisá los campos marcados.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { supabase, user } = await requireCategoryAccess();

    const { data, error } = await supabase
      .from('categories')
      .insert(payload(parsed.data))
      .select('id')
      .single();

    if (error) {
      const uploadedPaths = imagePaths(parsed.data);

      if (uploadedPaths.length) {
        await supabase.storage
          .from('category-images')
          .remove(uploadedPaths);
      }

      return {
        success: false,
        message:
          error.code === '23505'
            ? 'Ya existe una categoría con ese slug.'
            : error.message,
      };
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'category.created',
      entity_type: 'category',
      entity_id: data.id,
      metadata: { name: parsed.data.name, slug: parsed.data.slug },
    });

    refresh();

    return {
      success: true,
      message: 'Categoría creada correctamente.',
      categoryId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo crear la categoría.',
    };
  }
}

export async function updateCategoryAction(
  id: string,
  input: CategoryFormValues,
): Promise<CategoryActionResult> {
  try {
    const parsed = categoryFormSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Revisá los campos marcados.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { supabase, user } = await requireCategoryAccess();

    const { data: current, error: currentError } = await supabase
      .from('categories')
      .select(`
        name,
        slug,
        image_storage_path,
        desktop_banner_storage_path,
        mobile_banner_storage_path
      `)
      .eq('id', id)
      .single();

    if (currentError) {
      return { success: false, message: currentError.message };
    }

    const { error } = await supabase
      .from('categories')
      .update(payload(parsed.data))
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message:
          error.code === '23505'
            ? 'Ya existe una categoría con ese slug.'
            : error.message,
      };
    }

    const retainedPaths = new Set(imagePaths(parsed.data));
    const removedPaths = [
      current.image_storage_path,
      current.desktop_banner_storage_path,
      current.mobile_banner_storage_path,
    ].filter(
      (path): path is string =>
        Boolean(path) && !retainedPaths.has(path),
    );

    if (removedPaths.length) {
      await supabase.storage
        .from('category-images')
        .remove(removedPaths);
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'category.updated',
      entity_type: 'category',
      entity_id: id,
      metadata: {
        previous_name: current.name,
        name: parsed.data.name,
        previous_slug: current.slug,
        slug: parsed.data.slug,
      },
    });

    refresh();

    return {
      success: true,
      message: 'Categoría actualizada correctamente.',
      categoryId: id,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la categoría.',
    };
  }
}

export async function setCategoryFlagAction(
  id: string,
  field: 'is_active' | 'is_featured',
  value: boolean,
): Promise<CategoryActionResult> {
  try {
    const { supabase, user } = await requireCategoryAccess();

    const { error } = await supabase
      .from('categories')
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'category.flag_updated',
      entity_type: 'category',
      entity_id: id,
      metadata: { field, value },
    });

    refresh();

    return { success: true, message: 'Estado actualizado.' };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar.',
    };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<CategoryActionResult> {
  try {
    const { supabase, user } = await requireCategoryAccess('admin');

    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) throw countError;

    if (count) {
      return {
        success: false,
        message: `No se puede eliminar: tiene ${count} producto${
          count === 1 ? '' : 's'
        } asociado${count === 1 ? '' : 's'}.`,
      };
    }

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select(`
        name,
        slug,
        image_storage_path,
        desktop_banner_storage_path,
        mobile_banner_storage_path
      `)
      .eq('id', id)
      .single();

    if (categoryError) throw categoryError;

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    const paths = [
      category.image_storage_path,
      category.desktop_banner_storage_path,
      category.mobile_banner_storage_path,
    ].filter((path): path is string => Boolean(path));

    if (paths.length) {
      await supabase.storage
        .from('category-images')
        .remove(paths);
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'category.deleted',
      entity_type: 'category',
      entity_id: id,
      metadata: { name: category.name, slug: category.slug },
    });

    refresh();

    return { success: true, message: 'Categoría eliminada.' };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar.',
    };
  }
}
