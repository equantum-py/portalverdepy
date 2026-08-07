import { redirect } from 'next/navigation';

import { ProductForm } from '@/components/admin/products/product-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewProductPage() {
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

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(
      `No se pudieron cargar las categorías: ${error.message}`
    );
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
    .order('name', { ascending: true });

  return (
    <ProductForm categories={categories ?? []} availableProducts={products ?? []} />
  );
}
