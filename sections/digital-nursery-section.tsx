import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { DigitalNurseryCard } from '@/components/digital-nursery-card';
import type { Product } from '@/lib/types';

type Props = {
  title: string;
  plants: Product[];
  limit?: number;
  showViewAll?: boolean;
};

export function DigitalNurserySection({
  title,
  plants,
  limit,
  showViewAll = true,
}: Props) {
  const visiblePlants = typeof limit === 'number' ? plants.slice(0, limit) : plants;

  if (!visiblePlants.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] border-b border-border/70 py-5 last:border-none sm:py-8 lg:py-10">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Vivero Digital
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            {title}
          </h2>
        </div>

        {showViewAll ? (
          <Link
            href="/shop?category=Plantas"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {visiblePlants.map((plant) => (
          <DigitalNurseryCard
            key={plant.id}
            item={{
              id: plant.id,
              name: plant.name,
              variant: plant.unit?.replace(/^Tamaño:\s*/i, '') ?? '',
              description: plant.description,
              imageUrl: plant.image,
              whatsappMessage: '',
            }}
          />
        ))}
      </div>
    </section>
  );
}
