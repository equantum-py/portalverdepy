import type { Metadata } from 'next';

import { DigitalNurseryCatalog } from '@/components/digital-nursery-catalog';
import { siteConfig } from '@/lib/site-config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Plantas en Paraguay | Vivero Digital',
  description:
    'Explorá la variedad de plantas de Portal Verde. Encontrá plantas ornamentales para interior y exterior y consultá disponibilidad por WhatsApp en Limpio, Asunción y Gran Asunción.',
  alternates: {
    canonical: '/plantas',
  },
  openGraph: {
    title: 'Plantas en Paraguay | Vivero Digital | Portal Verde',
    description:
      'Descubrí nuestra variedad de plantas ornamentales y consultá disponibilidad, tamaños y recomendaciones por WhatsApp.',
    url: `${siteConfig.url}/plantas`,
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlantasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('digital_nursery_items')
    .select('id,name,variant,description,image_url,whatsapp_message')
    .eq('category', 'Planta')
    .eq('is_active', true)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const items = error
    ? []
    : (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        variant: item.variant ?? '',
        description: item.description ?? '',
        imageUrl: item.image_url ?? '/images/product-placeholder.webp',
        whatsappMessage: item.whatsapp_message ?? '',
      }));

  return (
    <main className="container-shell py-4 sm:py-7 lg:py-10">
      <DigitalNurseryCatalog items={items} />
    </main>
  );
}
