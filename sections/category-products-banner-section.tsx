import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

type CategoryProductsBannerSectionProps = {
  title: string;
  categorySlug: string;
  bannerDesktopUrl: string;
  bannerMobileUrl: string;
  products: Product[];
  showViewAll: boolean;
};

export function CategoryProductsBannerSection({
  title,
  categorySlug,
  bannerDesktopUrl,
  bannerMobileUrl,
  products,
  showViewAll,
}: CategoryProductsBannerSectionProps) {
  if (!products.length) return null;

  const categoryUrl = `/shop?category=${encodeURIComponent(title)}`;

  return (
    <section className="border-b border-border/70 py-4 last:border-none sm:py-6 lg:py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Productos destacados
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            {title}
          </h2>
        </div>

        {showViewAll ? (
          <Link
            href={categoryUrl}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(230px,0.72fr)_minmax(0,3fr)] xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,3fr)]">
        {(bannerDesktopUrl || bannerMobileUrl) ? (
          <Link
            href={categoryUrl}
            className="group relative block overflow-hidden rounded-2xl border border-border bg-brand-50 shadow-sm"
          >
            <div className="relative aspect-[16/7] lg:aspect-[4/5]">
              <picture>
                {bannerMobileUrl ? (
                  <source media="(max-width: 1023px)" srcSet={bannerMobileUrl} />
                ) : null}
                <Image
                  src={bannerDesktopUrl || bannerMobileUrl}
                  alt={`Banner ${title}`}
                  fill
                  sizes="(max-width: 1023px) 100vw, 320px"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </picture>
            </div>
          </Link>
        ) : null}

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
