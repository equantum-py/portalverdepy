import type { Metadata } from 'next';

import { CatalogClient } from '@/components/catalog-client';
import { DigitalNurseryCatalog } from '@/components/digital-nursery-catalog';
import { getPublicProducts } from '@/lib/products/catalog-products';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Explorá césped, paisajismo, plantas y soluciones para tu jardín en Portal Verde.'
};

type ShopPageProps = {
  searchParams?: Promise<{ search?: string; category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) ?? {};
  const normalizedCategory = (params.category ?? '').trim().toLowerCase();

  if (normalizedCategory === 'plantas' || normalizedCategory === 'planta') {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('digital_nursery_items')
      .select('id,name,variant,description,image_url,whatsapp_message')
      .eq('category', 'Planta')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    const items = error ? [] : (data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      variant: item.variant ?? '',
      description: item.description ?? '',
      imageUrl: item.image_url ?? '/images/product-placeholder.webp',
      whatsappMessage: item.whatsapp_message ?? ''
    }));

    return <main className="container-shell py-4 sm:py-7 lg:py-10"><DigitalNurseryCatalog items={items} /></main>;
  }

  const products = await getPublicProducts();
  return <main className="container-shell py-4 sm:py-7 lg:py-10"><CatalogClient initialProducts={products} initialSearch={params.search ?? ''} initialCategory={params.category ?? ''} /></main>;
}
