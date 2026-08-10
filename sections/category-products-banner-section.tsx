'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

type Props = {
  title: string;
  categorySlug: string;
  bannerDesktopUrl: string;
  bannerMobileUrl: string;
  products: Product[];
  showViewAll: boolean;
  mobileColumns: 1 | 2;
  mobileSwipe: boolean;
  mobileShowProgress: boolean;
};

export function CategoryProductsBannerSection({
  title,
  categorySlug,
  bannerDesktopUrl,
  bannerMobileUrl,
  products,
  showViewAll,
  mobileColumns,
  mobileSwipe,
  mobileShowProgress,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  if (!products.length) return null;

  const categoryUrl = `/shop?category=${encodeURIComponent(categorySlug)}`;

  function scroll(direction: -1 | 1) {
    const element = scrollerRef.current;
    if (!element) return;

    const amount = Math.max(element.clientWidth * 0.9, 220);
    element.scrollBy({ left: amount * direction, behavior: 'smooth' });
  }

  function updateProgress() {
    const element = scrollerRef.current;
    if (!element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll <= 0) {
      setProgress(100);
      return;
    }

    setProgress(Math.min(100, Math.max(0, (element.scrollLeft / maxScroll) * 100)));
  }

  const mobileBasis = mobileColumns === 1
    ? 'basis-[92%] min-w-[92%]'
    : 'basis-[calc(50%-5px)] min-w-[calc(50%-5px)]';

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

      <div className="grid grid-cols-[112px_minmax(0,1fr)] items-stretch gap-2.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[274px_minmax(0,1fr)]">
        {(bannerDesktopUrl || bannerMobileUrl) ? (
          <Link
            href={categoryUrl}
            className="group relative block h-full min-h-0 overflow-hidden rounded-2xl border border-border bg-brand-50 shadow-sm"
          >
            <div className="relative h-full min-h-[180px] w-full sm:min-h-[290px] lg:min-h-[441px]">
              <picture>
                {bannerMobileUrl ? (
                  <source media="(max-width: 1023px)" srcSet={bannerMobileUrl} />
                ) : null}
                <Image
                  src={bannerDesktopUrl || bannerMobileUrl}
                  alt={`Banner ${title}`}
                  fill
                  sizes="(max-width: 639px) 112px, (max-width: 1023px) 180px, 274px"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </picture>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-brand-50" />
        )}

        <div className="relative min-w-0">
          <div
            ref={scrollerRef}
            onScroll={updateProgress}
            className={`flex h-full snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 sm:gap-4 lg:pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              mobileSwipe ? 'touch-pan-x' : 'touch-auto'
            }`}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={`${mobileBasis} snap-start sm:basis-[calc(50%-8px)] sm:min-w-[calc(50%-8px)] lg:basis-[calc(33.333%-11px)] lg:min-w-[calc(33.333%-11px)]`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Productos anteriores"
            className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white sm:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Productos siguientes"
            className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white sm:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {mobileShowProgress ? (
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200 lg:hidden">
              <div
                className="h-full rounded-full bg-brand-700 transition-[width] duration-150"
                style={{ width: `${Math.max(12, progress)}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
