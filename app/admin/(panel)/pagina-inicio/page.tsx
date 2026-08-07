import { HomeContentForm } from '@/components/admin/home-content/home-content-form';
import { getHomeContent } from '@/lib/home-content/public';
import { createClient } from '@/lib/supabase/server';

export default async function HomePageAdmin() {
  const supabase = await createClient();

  const [content, categories, products] = await Promise.all([
    getHomeContent(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ]);

  return (
    <HomeContentForm
      initialValues={content}
      categories={categories.data ?? []}
      products={products.data ?? []}
    />
  );
}