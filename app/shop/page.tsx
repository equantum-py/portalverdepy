import type { Metadata } from 'next';

import { CatalogClient } from '@/components/catalog-client';
import { getPublicProducts } from '@/lib/products/catalog-products';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Explorá césped, paisajismo, plantas y soluciones para tu jardín en Portal Verde.'
};

type ShopPageProps = {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
};

export default async function ShopPage({
  searchParams
}: ShopPageProps) {
  const params = (await searchParams) ?? {};
  const products = await getPublicProducts();

  return (
    <main className="container-shell py-4 sm:py-7 lg:py-10">
      <CatalogClient
        initialProducts={products}
        initialSearch={params.search ?? ''}
        initialCategory={params.category ?? ''}
      />
    </main>
  );
}
