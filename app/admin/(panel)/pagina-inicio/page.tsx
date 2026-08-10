import { HomeContentForm } from '@/components/admin/home-content/home-content-form';
import { getHomeContent } from '@/lib/home-content/public';
import { createClient } from '@/lib/supabase/server';

export default async function HomeContentPage() {
  const supabase = await createClient();

  const [content, categoriesResult] = await Promise.all([
    getHomeContent(),
    supabase
      .from('categories')
      .select('id,name,slug,is_active')
      .eq('is_active', true)
      .order('sort_order')
      .order('name'),
  ]);

  const categories = (categoriesResult.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));

  return (
    <HomeContentForm
      initialValues={content}
      categories={categories}
    />
  );
}
