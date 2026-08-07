import { HomeContentEditor } from '@/components/admin/home-content/home-content-editor';
import { getHomeContent } from '@/lib/home-content/public';
import { createClient } from '@/lib/supabase/server';

export default async function HomeContentPage() {
  const supabase = await createClient();
  const [content, categories, products] = await Promise.all([
    getHomeContent(),
    supabase.from('categories').select('id,name').eq('is_active', true).order('name'),
    supabase.from('products').select('id,name').eq('is_active', true).order('name')
  ]);
  return <HomeContentEditor initialValues={content} categories={categories.data ?? []} products={products.data ?? []} />;
}
