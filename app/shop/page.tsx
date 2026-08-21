import type { Metadata } from 'next';

import { CatalogClient } from '@/components/catalog-client';
import { DigitalNurseryCatalog } from '@/components/digital-nursery-catalog';
import { ServicesCatalog } from '@/components/services-catalog';
import { getPublicProducts } from '@/lib/products/catalog-products';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Catálogo de césped, plantas y paisajismo en Paraguay',
  description:
    'Explorá Césped Esmeralda, Pasto Kavaju, plantas, jardinería y soluciones de paisajismo para Limpio, Asunción y Gran Asunción.',
  alternates: { canonical: '/shop' },
  openGraph: {
    url: '/shop',
    title: 'Catálogo de césped, plantas y paisajismo | Portal Verde',
    description:
      'Césped Esmeralda, Pasto Kavaju, plantas y soluciones para jardines en Paraguay.'
  }
};

type ShopPageProps = {
  searchParams?: Promise<{ search?: string; category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) ?? {};
  const normalizedCategory = (params.category ?? '').trim().toLowerCase();

  if (normalizedCategory === 'mantenimiento de jardines' || normalizedCategory === 'mantenimiento de jardín' || normalizedCategory === 'servicios') {
    return <main className="container-shell py-4 sm:py-7 lg:py-10"><ServicesCatalog /></main>;
  }

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
