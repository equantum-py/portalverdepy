import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

type ProductSectionProps = {
  title: string;
  products?: Product[];
};

export function ProductSection({
  title,
  products = []
}: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section className="border-b border-border/70 py-3 last:border-none sm:py-4 lg:py-3">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Productos destacados
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            {title}
          </h2>
        </div>

        <Link
          href={`/shop?category=${encodeURIComponent(title)}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
        >
          Ver más
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
