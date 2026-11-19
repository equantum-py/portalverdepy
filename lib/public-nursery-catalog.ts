import type { DigitalNurseryPublicItem } from '@/components/digital-nursery-card';
import { createClient } from '@/lib/supabase/server';

const catalogColumns = 'id,name,variant,description,image_url,whatsapp_message';

export async function getPublicNurseryPlants(): Promise<DigitalNurseryPublicItem[]> {
  const supabase = await createClient();
  const query = (columns: string) => supabase
    .from('digital_nursery_items')
    .select(columns)
    .eq('category', 'Planta')
    .eq('is_active', true)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .returns<Array<{
      id: string;
      name: string;
      variant: string | null;
      description: string | null;
      image_url: string | null;
      whatsapp_message: string | null;
      public_price?: number | null;
      promotional_price?: number | null;
      promotion_enabled?: boolean;
    }>>();

  let result = await query(`${catalogColumns},public_price,promotional_price,promotion_enabled`);
  if (result.error?.code === '42703') {
    result = await query(catalogColumns);
  }

  return (result.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    variant: item.variant ?? '',
    description: item.description ?? '',
    imageUrl: item.image_url,
    whatsappMessage: item.whatsapp_message ?? '',
    prices: {
      normal: item.public_price ?? null,
      promotional: item.promotional_price ?? null,
      enabled: item.promotion_enabled ?? false
    }
  }));
}
