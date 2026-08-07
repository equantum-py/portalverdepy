import type { Category } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

export async function getPublicCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,slug,description,image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('No se pudieron cargar las categorías:', error.message);
    return [];
  }

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    image: category.image_url ?? undefined
  }));
}
